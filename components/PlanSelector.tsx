"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";
import dynamic from "next/dynamic";
import { ProcessingOverlay, SuccessOverlay } from "./ProcessingOverlay";


const CheckoutModal = dynamic(() => import("./CheckoutModal"), { ssr: false });
const PlanConfirmModal = dynamic(() => import("./PlanConfirmModal"), { ssr: false });
const PlanStartModal = dynamic(() => import("./PlanStartModal"), { ssr: false });


const PLAN_STYLE: Record<string, { color: string; border: string; bg: string; featured: boolean; priceId: string | null; period: string }> = {
  free:    { color: "#5580cc", border: "#c0d4ff", bg: "#f0f5ff", featured: false, priceId: null, period: "" },
  weekly:  { color: "#7a50b0", border: "#ddc8ff", bg: "#fdf8ff", featured: false, priceId: process.env.NEXT_PUBLIC_STRIPE_WEEKLY_PRICE_ID ?? null, period: "/週" },
  monthly: { color: "#c44a88", border: "#f4b9b9", bg: "#fff8fd", featured: true,  priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? null, period: "/月" },
};

const FALLBACK_PLANS = [
  { key: "free",    name: "toolio free",             price: null },
  { key: "weekly",  name: "toolio weekly unlimited", price: 498 },
  { key: "monthly", name: "toolio monthly unlimited", price: 1480 },
];

const FALLBACK_FEATURES: { label: string; from: string; freeNote?: string; paidNote?: string }[] = [];

const planOrder = ["free", "weekly", "monthly"];

function isFeatureAvailable(featureFrom: string, planKey: string) {
  return planOrder.indexOf(planKey) >= planOrder.indexOf(featureFrom);
}

type Props = {
  currentPlan?: string;
  requiredPlan?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  onSubscribed?: () => void;
  isPendingDeletion?: boolean;
};

type Plan = { key: string; name: string; price: number | null; priceId: string | null; color: string; border: string; bg: string; featured: boolean };
type Feature = { label: string; from: string; freeNote?: string; paidNote?: string };

export default function PlanSelector({ currentPlan = "free", requiredPlan, cancelAtPeriodEnd = false, currentPeriodEnd = null, onSubscribed, isPendingDeletion = false }: Props) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>(
    FALLBACK_PLANS.map(p => ({ ...p, ...PLAN_STYLE[p.key] }))
  );
  const [features, setFeatures] = useState<Feature[]>(FALLBACK_FEATURES);
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<{ planName: string; clientSecret: string; setupIntentId?: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<string | null>(null);
  const [startPlan, setStartPlan] = useState<{ key: string; name: string; price: number; mode: "subscribe" | "change" | "new-card" | "cancel"; cardInfo?: { brand: string; last4: string } } | null>(null);
  const [confirmCardInfo, setConfirmCardInfo] = useState<{ brand: string; last4: string } | null>(null);
  const [subscriptionResetModal, setSubscriptionResetModal] = useState(false);
  const [successPlan, setSuccessPlan] = useState<{ name: string; mode: "change" | "cancel"; currentPeriodEnd?: string | null } | null>(null);
  const [confirmMode, setConfirmMode] = useState<"subscribe" | "change">("subscribe");
  const [cancellationChoiceForPlan, setCancellationChoiceForPlan] = useState<{ key: string; name: string; price: number } | null>(null);
  const [keepCancellation, setKeepCancellation] = useState<boolean | null>(null);
  const [showFreeDowngradeNotice, setShowFreeDowngradeNotice] = useState(false);
  const [notionLoading, setNotionLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notion/plans")
      .then(r => r.json())
      .then(({ plans: notionPlans, features: notionFeatures }) => {
        if (Array.isArray(notionPlans) && notionPlans.length > 0) {
          setPlans(notionPlans.map((p: any) => ({
            key: p.key,
            name: p.displayName || p.key,
            price: (p.key === "free" || p.key === "toolio free" || p.price === 0) ? null : p.price,
            ...PLAN_STYLE[p.key],
          })));
        }
        if (Array.isArray(notionFeatures) && notionFeatures.length > 0) {
          setFeatures(notionFeatures.map((f: any) => ({
            label: f.label,
            from: f.fromPlan,
            freeNote: f.freeNote || undefined,
            paidNote: f.paidNote || undefined,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setNotionLoading(false));
  }, []);

  const handleChangePlan = async (newPlanKey: string) => {
    setLoading(newPlanKey)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); setLoading(null); return }
    try {
      const res = await fetch('/api/stripe/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, newPlan: newPlanKey }),
      })
      const data = await res.json()
      if (data.success) {
        const planName = plans.find(p => p.key === newPlanKey)?.name ?? "toolio free"
        const mode = newPlanKey === "free" ? "cancel" : "change"
        setSuccessPlan({ name: planName, mode, currentPeriodEnd: data.currentPeriodEnd })
      } else if (data.error === 'subscription_reset') {
        setSubscriptionResetModal(true)
      } else {
        alert('プラン変更に失敗しました。もう一度お試しください。')
      }
    } catch {
      alert('エラーが発生しました。')
    } finally {
      setLoading(null)
    }
  }

  const handleSubscribe = async (plan: Plan) => {
    if (!plan.priceId) return;
    setLoading(plan.key);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); setLoading(null); return; }

    const res = await fetch("/api/stripe/payment-method", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const cardData = res.ok ? await res.json() : {};
    setLoading(null);

    if (cardData.brand && cardData.last4) {
      setStartPlan({ key: plan.key, name: plan.name, price: plan.price!, mode: "subscribe", cardInfo: { brand: cardData.brand, last4: cardData.last4 } });
    } else {
      setStartPlan({ key: plan.key, name: plan.name, price: plan.price!, mode: "new-card" });
    }
  };
  return (
    <>

      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: "0 16px 64px rgba(0,0,0,0.2)", overflow: "hidden" }}>
            <ProcessingOverlay messages={["処理中...", "もう少しで完了します", "データを更新しています"]} />
          </div>
        </div>
      )}

      {successPlan && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 400, padding: "48px 32px", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}>
            <SuccessOverlay
              label={successPlan.mode === "cancel"
                ? `${successPlan.currentPeriodEnd ? new Date(successPlan.currentPeriodEnd).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }) : "現在の期間終了日"}まで\n現在のプランをご利用いただけます。`
                : `${successPlan.name}プランへ変更しました。`}
            />
            <button
              onClick={() => { setSuccessPlan(null); onSubscribed?.(); router.refresh(); }}
              style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 8 }}
            >
              確認する →
            </button>
          </div>
        </div>
      )}

      {subscriptionResetModal && (
  <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "white", borderRadius: 16, padding: "36px 40px", maxWidth: 460, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 16 }}>プランについてご確認ください</div>
      <div style={{ fontSize: 13, color: "#666", lineHeight: 2, marginBottom: 28 }}>
        お支払い情報に問題が発生したため、現在のプランが toolio free に戻っています。これまでのご請求に変更はありません。プランの再登録は新たなご契約となりますが、二重請求にはなりませんのでご安心ください。引き続きご利用いただくには、プランページから希望のプランを選択して再度ご登録をお願いします。差額が発生する場合は、個別にご連絡の上、適切に対応いたします。
      </div>
      <button
        onClick={() => { setSubscriptionResetModal(false); window.location.reload(); }}
        style={{ width: "100%", padding: "12px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
      >
        プランを確認する →
      </button>
    </div>
  </div>
)}
      {checkoutModal && (
        <CheckoutModal
          planName={checkoutModal.planName}
          clientSecret={checkoutModal.clientSecret}
          setupIntentId={checkoutModal.setupIntentId}
          onSuccess={() => { setCheckoutModal(null); onSubscribed?.(); router.refresh(); }}
          onClose={() => setCheckoutModal(null)}
        />
      )}
      {startPlan && (
        <PlanStartModal
          planName={startPlan.name}
          price={startPlan.price}
          mode={startPlan.mode === "cancel" ? "cancel" : startPlan.mode === "new-card" ? "new-card" : "subscribe"}
          cardInfo={startPlan.cardInfo}
          onConfirm={async (resolvedCardInfo) => {
            const plan = startPlan;
            setStartPlan(null);
            if (plan.mode === "cancel") {
              setShowFreeDowngradeNotice(true);
            } else if (plan.mode === "change") {
              setConfirmCardInfo(resolvedCardInfo ?? null);
              setConfirmMode("change");
              setConfirmPlan(plan.key);
            } else if (plan.mode === "new-card") {
              setLoading(plan.key);
              const supabase = createClient();
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;
              const subRes = await fetch("/api/stripe/create-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId: plans.find(p => p.key === plan.key)?.priceId, userId: user.id, email: user.email }),
              });
              const subData = await subRes.json();
              if (subData.clientSecret) {
                setLoading(null);
                setCheckoutModal({ planName: plan.name, clientSecret: subData.clientSecret, setupIntentId: subData.setupIntentId });
              } else {
                alert("決済の開始に失敗しました。もう一度お試しください。");
              }
              setLoading(null);
            } else {
              setConfirmCardInfo(resolvedCardInfo ?? null);
              setConfirmMode("subscribe");
              setConfirmPlan(plan.key);
            }
          }}
          onClose={() => setStartPlan(null)}
        />
      )}
      {showFreeDowngradeNotice && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 400, padding: "36px 28px", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 16 }}>変更前にご確認ください</div>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.9, marginBottom: 20 }}>
              toolio free では、お気に入り登録とダウンロード履歴の表示は最大5件までとなります。
              <div style={{ margin: "10px 0 10px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div>・お気に入り</div>
                <div>・DL履歴</div>
              </div>
              現在の登録・履歴データは削除されません。再度サブスクプランにアップグレードいただくと、すべての履歴が復活します。
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => { setShowFreeDowngradeNotice(false); handleChangePlan("free"); }}
                style={{ padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#a3c0ff,#7aa0f0)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                了解して toolio free に変更する
              </button>
              <button
                onClick={() => setShowFreeDowngradeNotice(false)}
                style={{ padding: "14px", borderRadius: 12, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmPlan && (
        <PlanConfirmModal
          plan={confirmPlan}
          mode={confirmMode}
          keepCancellation={keepCancellation}
          cardInfo={confirmCardInfo ?? undefined}
          onSuccess={() => { setConfirmPlan(null); setKeepCancellation(null); setConfirmCardInfo(null); onSubscribed?.(); router.refresh(); }}
          onClose={() => { setConfirmPlan(null); setKeepCancellation(null); setConfirmCardInfo(null); }}
          onSubscriptionReset={() => { setConfirmPlan(null); setKeepCancellation(null); setConfirmCardInfo(null); setSubscriptionResetModal(true); }}
        />
      )}

      {cancellationChoiceForPlan && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 440, padding: "36px 32px", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 12 }}>{isPendingDeletion ? "退会予約について" : "無料プランへの変更予約について"}</div>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.9, marginBottom: 24 }}>
              現在、<strong>{currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }) : "現在の期間終了日"}</strong>に{isPendingDeletion ? "退会予約" : "無料プランへの変更予約"}が設定されています。<br />
              <strong>{cancellationChoiceForPlan.name}プラン</strong>に変更する場合、{isPendingDeletion ? "退会予約" : "変更予約"}はどうしますか？
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => {
                  setKeepCancellation(false);
                  setStartPlan({ key: cancellationChoiceForPlan.key, name: cancellationChoiceForPlan.name, price: cancellationChoiceForPlan.price, mode: "change" });
                  setCancellationChoiceForPlan(null);
                }}
                style={{ padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                {isPendingDeletion ? "退会予約を取り消してプランを変更する" : "変更予約を取り消してプランを変更する"}
              </button>
              <button
                onClick={() => {
                  setKeepCancellation(true);
                  setStartPlan({ key: cancellationChoiceForPlan.key, name: cancellationChoiceForPlan.name, price: cancellationChoiceForPlan.price, mode: "change" });
                  setCancellationChoiceForPlan(null);
                }}
                style={{ padding: "14px", borderRadius: 12, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                {isPendingDeletion ? "退会予約を維持したままプランを変更する" : "変更予約を維持したままプランを変更する"}
              </button>
              <button
                onClick={() => setCancellationChoiceForPlan(null)}
                style={{ padding: "10px", borderRadius: 12, border: "none", background: "transparent", color: "#bbb", fontSize: 12, cursor: "pointer" }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
      

      <div style={{ fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif" }}>

        {/* 比較テーブル */}
        <div style={{ overflowX: "auto" }}>
        {notionLoading ? (
          <div style={{ padding: "8px 0" }}>
            <style>{`@keyframes sk-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            {/* ヘッダー行スケルトン */}
            <div style={{ display: "grid", gridTemplateColumns: "16% repeat(3, 1fr)", gap: 8, marginBottom: 8 }}>
              <div />
              {[0,1,2].map(i => (
                <div key={i} style={{ height: 80, borderRadius: 12, background: "linear-gradient(90deg,#f0ecfa 25%,#e4ddf5 50%,#f0ecfa 75%)", backgroundSize: "200% 100%", animation: "sk-shimmer 1.6s infinite" }} />
              ))}
            </div>
            {/* 機能行スケルトン */}
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "16% repeat(3, 1fr)", gap: 8, marginBottom: 6 }}>
                <div style={{ height: 36, borderRadius: 8, background: "linear-gradient(90deg,#f0ecfa 25%,#e4ddf5 50%,#f0ecfa 75%)", backgroundSize: "200% 100%", animation: "sk-shimmer 1.6s infinite" }} />
                {[0,1,2].map(j => (
                  <div key={j} style={{ height: 36, borderRadius: 8, background: "linear-gradient(90deg,#f8f6fc 25%,#f0ecfa 50%,#f8f6fc 75%)", backgroundSize: "200% 100%", animation: `sk-shimmer 1.6s ${i * 0.1}s infinite` }} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <table style={{ width: "100%", minWidth: 620, borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                {/* 空白セル */}
                <th style={{ width: "16%", padding: "8px 0" }} />
                {plans.map((plan) => {
                  const isCurrent = plan.key === currentPlan;

                  // 吹き出し文言を決定
                  let bubbleText: string | null = null;
                  if (requiredPlan && requiredPlan !== "free") {
                    if (plan.key === "weekly") {
                      bubbleText = "この教材がすぐに使えます";
                    } else if (plan.key === "monthly") {
                      bubbleText = "weekly より月500円お得";
                    }
                  }

                  return (
                    <th key={plan.key} onClick={() => setSelectedPlan(selectedPlan === plan.key ? null : plan.key)} style={{ width: "18%", padding: "14px 6px 12px", textAlign: "center", verticalAlign: "bottom", cursor: "pointer" }}>
                      {/* 吹き出し */}
                      {bubbleText && (
                        <div style={{
                          background: plan.key === requiredPlan ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "#f0f0f0",
                          color: plan.key === requiredPlan ? "white" : "#999",
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: 8,
                          marginBottom: 6,
                          lineHeight: 1.4,
                          position: "relative",
                          whiteSpace: "nowrap",
                        }}>
                          {bubbleText}
                          <div style={{
                            position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
                            width: 0, height: 0,
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: `5px solid ${plan.key === requiredPlan ? "#e49bfd" : "#f0f0f0"}`,
                          }} />
                        </div>
                      )}

                      {/* プラン名・バッジ */}
                      <div style={{
                        background: plan.bg,
                        border: `${plan.featured ? 2 : 1}px solid ${isCurrent ? plan.color : plan.border}`,
                        borderRadius: "12px 12px 0 0",
                        padding: "14px 8px 10px",
                        position: "relative",
                      }}>
                        {plan.featured && !isCurrent && (
                          <div style={{
                            position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                            background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
                            color: "white", fontSize: 9, fontWeight: 700,
                            padding: "2px 10px", borderRadius: 8, whiteSpace: "nowrap",
                          }}>おすすめ</div>
                        )}
                        {isCurrent && (
                          <div style={{
                            position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                            background: "linear-gradient(135deg,#a3c0ff,#e49bfd)",
                            color: "white", fontSize: 9, fontWeight: 700,
                            padding: "2px 10px", borderRadius: 8, whiteSpace: "nowrap",
                          }}>現在</div>
                        )}
                        <div style={{ fontSize: 12, fontWeight: 800, color: plan.color, marginBottom: 4, whiteSpace: "nowrap" }}>
                          {plan.name}
                        </div>
                        <div>
                          {plan.price === null ? (
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#aaa" }}>¥0</span>
                          ) : (
                            <>
                              <span style={{ fontSize: 16, fontWeight: 800, color: plan.color }}>¥{plan.price.toLocaleString()}</span>
                              <span style={{ fontSize: 9, color: "#bbb" }}>{PLAN_STYLE[plan.key]?.period ?? "/月"}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {features.map((feature, fi) => (
                <tr key={feature.label} style={{ background: fi % 2 === 0 ? "#fafafa" : "white", cursor: "pointer" }}>
                  <td style={{
                    padding: "14px 12px",
                    fontSize: 11,
                    color: "#555",
                    fontWeight: 600,
                    borderBottom: "1px solid #e0d8f0",
                    borderRight: "1px solid #e0d8f0",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}>
                    {feature.label}
                  </td>
                  {plans.map((plan) => {
                    const ok = isFeatureAvailable(feature.from, plan.key);
                    const subText = ok && feature.freeNote
                      ? plan.key === "free" ? feature.freeNote : feature.paidNote
                      : null;
                    return (
                      <td key={plan.key} onClick={() => setSelectedPlan(selectedPlan === plan.key ? null : plan.key)} style={{
                        textAlign: "center",
                        padding: "10px 6px",
                        borderBottom: "1px solid #ede8ff",
                        borderRight: "1px solid #ede8ff",
                        background: selectedPlan === plan.key ? `${plan.bg}cc` : "transparent",
                        transition: "background 0.2s ease",
                        cursor: "pointer",
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%", margin: "0 auto",
                          background: ok
                          ? plan.featured
                            ? "linear-gradient(135deg,#e879a0,#9b59d4)"
                            : plan.key === "free"
                            ? "#a3c0ff"
                            : "#9b6ed4"
                          : "#e8e8e8",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {ok ? (
                            <svg width="9" height="9" viewBox="0 0 10 10">
                              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                            </svg>
                          ) : (
                            <svg width="8" height="8" viewBox="0 0 10 10">
                              <path d="M3 5h4" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )}
                        </div>
                        {subText && (
                          <div style={{ fontSize: 9, color: plan.key === "free" ? "#aaa" : "#9b6ed4", marginTop: 4, fontWeight: 600, whiteSpace: "nowrap" }}>{subText}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* ボタン行 */}
              <tr>
                <td />
                {plans.map((plan) => {
                  const isCurrent = plan.key === currentPlan;
                  const currentRank = planOrder.indexOf(currentPlan);
                  const planRank = planOrder.indexOf(plan.key);
                  const isUpgrade = planRank > currentRank;
                  const isDowngrade = planRank < currentRank && plan.key !== "free";
                  const isPaid = currentPlan !== "free";

                  return (
                    <td key={plan.key} style={{
                      padding: "12px 6px",
                      background: selectedPlan === plan.key ? plan.bg : "transparent",
                      borderRadius: "0 0 12px 12px",
                      textAlign: "center",
                      transition: "background 0.2s ease",
                    }}>
                      {isCurrent ? (
                        <button onClick={() => onSubscribed?.()} style={{
                          width: "100%", height: 32, borderRadius: 16,
                          border: `1px solid ${plan.color}`,
                          background: "white", color: plan.color,
                          fontSize: 10, fontWeight: 700, cursor: "pointer", opacity: 0.8, whiteSpace: "nowrap",
                        }}>このまま使う →</button>
                      ) : plan.key === "free" && isPaid && cancelAtPeriodEnd ? (
                        <button
                          disabled
                          style={{
                            width: "100%", height: 40, borderRadius: 20, border: "none",
                            background: "linear-gradient(135deg,#a3c0ff,#7aa0f0)",
                            color: "white", fontSize: 9, fontWeight: 700,
                            cursor: "not-allowed", opacity: 0.65,
                            lineHeight: 1.4, padding: "4px 6px", whiteSpace: "nowrap",
                          }}
                        >
                          {isPendingDeletion ? "退会予約済み" : "変更予約済み"}<br />
                          <span style={{ fontSize: 8, fontWeight: 500, opacity: 0.9 }}>
                            {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("ja-JP", { month: "long", day: "numeric" }) + (isPendingDeletion ? "に退会" : "から無料プランへ") : ""}
                          </span>
                        </button>
                      ) : plan.key === "free" && isPaid ? (
                        <button
                          onClick={(() => setStartPlan({ key: "free", name: "toolio free", price: 0, mode: "cancel" }))}
                          style={{
                            width: "100%", height: 40, borderRadius: 20, border: "none",
                            background: "linear-gradient(135deg,#a3c0ff,#7aa0f0)",
                            color: "white", fontSize: 10, fontWeight: 700,
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          始める →
                        </button>
                      ) : plan.key === "free" ? (
                        <div style={{ fontSize: 10, color: "#ccc", padding: "8px 0" }}>－</div>
                      ) : isPaid && isUpgrade ? (
                        <button
                          onClick={() => {
                            if (cancelAtPeriodEnd) {
                              setCancellationChoiceForPlan({ key: plan.key, name: plan.name, price: plan.price! });
                            } else {
                              setStartPlan({ key: plan.key, name: plan.name, price: plan.price!, mode: "change" });
                            }
                          }}
                          style={{
                            width: "100%", height: 40, borderRadius: 20, border: "none",
                            background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
                            color: "white", fontSize: 10, fontWeight: 700,
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          始める →
                        </button>
                      ) : isPaid && isDowngrade ? (
                        <button
                          onClick={() => {
                            if (cancelAtPeriodEnd) {
                              setCancellationChoiceForPlan({ key: plan.key, name: plan.name, price: plan.price! });
                            } else {
                              setStartPlan({ key: plan.key, name: plan.name, price: plan.price!, mode: "change" });
                            }
                          }}
                          style={{
                            width: "100%", height: 40, borderRadius: 20, border: "none",
                            background: "linear-gradient(135deg,#e0d0f8,#c9a0f0)",
                            color: "white", fontSize: 10, fontWeight: 700,
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          始める →
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(plan)}
                          disabled={loading === plan.key}
                          style={{
                            width: "100%", height: 40, borderRadius: 20, border: "none",
                            background: plan.featured
                              ? "linear-gradient(135deg,#f4b9b9,#e49bfd)"
                              : "linear-gradient(135deg,#e0d0f8,#c9a0f0)",
                            color: "white", fontSize: 10, fontWeight: 700,
                            cursor: loading === plan.key ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                            opacity: loading === plan.key ? 0.7 : 1,
                          }}
                        >
                          {loading === plan.key ? "処理中..." : "始める →"}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        )}
        </div>

        <div style={{ textAlign: "center", fontSize: 10, color: "#ccc", marginTop: 16 }}>
          クレジットカードで安全に決済。いつでもプランを変更できます。
        </div>
      </div>
    </>
  );
}