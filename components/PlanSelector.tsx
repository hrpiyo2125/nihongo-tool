"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";
import dynamic from "next/dynamic";


const CheckoutModal = dynamic(() => import("./CheckoutModal"), { ssr: false });
const PlanConfirmModal = dynamic(() => import("./PlanConfirmModal"), { ssr: false });
const PlanStartModal = dynamic(() => import("./PlanStartModal"), { ssr: false });

const UNIT_PRICE = 350;

const plans = [
  {
    key: "free",
    name: "無料",
    price: null,
    priceId: null,
    color: "#5580cc",
    border: "#c0d4ff",
    bg: "#f0f5ff",
    featured: false,
  },
  {
    key: "light",
    name: "ライト",
    price: 500,
    priceId: process.env.NEXT_PUBLIC_STRIPE_LIGHT_PRICE_ID ?? null,
    color: "#7a50b0",
    border: "#ddc8ff",
    bg: "#fdf8ff",
    featured: false,
  },
  {
    key: "standard",
    name: "スタンダード",
    price: 980,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID ?? null,
    color: "#7a50b0",
    border: "#c9a0f0",
    bg: "#fdf8ff",
    featured: true,
  },
  {
    key: "premium",
    name: "プレミアム",
    price: 1480,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID ?? null,
    color: "#c44a88",
    border: "#f4b9b9",
    bg: "#fff8fd",
    featured: false,
  },
];

// 各featureがどのプランからOKか
const features = [
  { label: "お気に入り",       from: "free" },
  { label: "DL履歴",           from: "free" },
  { label: "都度購入",         from: "light" },
  { label: "無料教材",         from: "free" },
  { label: "ライト教材",       from: "light" },
  { label: "スタンダード教材", from: "standard" },
  { label: "プレミアム教材",   from: "premium" },
];

const planOrder = ["free", "light", "standard", "premium"];

function isFeatureAvailable(featureFrom: string, planKey: string) {
  return planOrder.indexOf(planKey) >= planOrder.indexOf(featureFrom);
}

type Props = {
  currentPlan?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  onSubscribed?: () => void;
};

export default function PlanSelector({ currentPlan = "free", cancelAtPeriodEnd = false, currentPeriodEnd = null, onSubscribed }: Props) {
  const router = useRouter();
  const [monthlyCount, setMonthlyCount] = useState<number>(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<{ planKey: string; planName: string; clientSecret: string; setupIntentId?: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<string | null>(null);
  const [startPlan, setStartPlan] = useState<{ key: string; name: string; price: number; mode: "subscribe" | "change" | "new-card" | "cancel" } | null>(null);
  const [subscriptionResetModal, setSubscriptionResetModal] = useState(false);
  const [successPlan, setSuccessPlan] = useState<{ name: string; mode: "change" | "cancel"; currentPeriodEnd?: string | null } | null>(null);
  const [confirmMode, setConfirmMode] = useState<"subscribe" | "change">("subscribe");
  const [cancellationChoiceForPlan, setCancellationChoiceForPlan] = useState<{ key: string; name: string; price: number } | null>(null);
  const [keepCancellation, setKeepCancellation] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchMonthlyPurchases = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("purchases")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .gte("purchased_at", startOfMonth.toISOString());
      setMonthlyCount(count ?? 0);
    };
    fetchMonthlyPurchases();
  }, []);

  const monthlyCost = monthlyCount * UNIT_PRICE;

  const getSavingText = (planKey: string, price: number) => {
    if (monthlyCount === 0) {
      const breakEven = Math.ceil(price / UNIT_PRICE);
      return `月${breakEven}本以上でお得`;
    }
    const saving = monthlyCost - price;
    if (saving > 0) return `今月だったら ¥${saving.toLocaleString()} 節約できます`;
    const breakEven = Math.ceil(price / UNIT_PRICE);
    return `月${breakEven}本以上からおすすめ`;
  };

  const isPositiveSaving = (price: number) => {
    if (monthlyCount === 0) return false;
    return monthlyCost - price > 0;
  };
  const handleChangePlan = async (newPlanKey: string) => {
    setLoading(newPlanKey)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth?mode=login'); setLoading(null); return }
    try {
      const res = await fetch('/api/stripe/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, newPlan: newPlanKey }),
      })
      const data = await res.json()
      if (data.success) {
        const planName = plans.find(p => p.key === newPlanKey)?.name ?? "無料"
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

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!plan.priceId) return;
    setLoading(plan.key);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth?mode=login&reason=plan"); setLoading(null); return; }

    const res = await fetch("/api/stripe/payment-method", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const cardData = res.ok ? await res.json() : {};
    setLoading(null);

    if (cardData.brand && cardData.last4) {
      setStartPlan({ key: plan.key, name: plan.name, price: plan.price!, mode: "subscribe" });
    } else {
      setStartPlan({ key: plan.key, name: plan.name, price: plan.price!, mode: "new-card" });
    }
  };
  return (
    <>

      {successPlan && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 400, padding: "48px 32px", textAlign: "center", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{successPlan.mode === "cancel" ? "👋" : "🎉"}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 8 }}>
              {successPlan.mode === "cancel" ? "解約を受け付けました" : "プランを変更しました！"}
            </div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 32, lineHeight: 1.8 }}>
              {successPlan.mode === "cancel"
                ? `${successPlan.currentPeriodEnd ? new Date(successPlan.currentPeriodEnd).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }) : "現在の期間終了日"}まで現在のプランをご利用いただけます。期間終了後は自動的に無料プランへ移行します。引き続きtoolioをお楽しみください。`
                : `${successPlan.name}プランへ変更しました。引き続きtoolioをお楽しみください。`}
            </div>
            <button
              onClick={() => { setSuccessPlan(null); onSubscribed?.(); }}
              style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
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
        お支払い情報に問題が発生したため、現在のプランがFreeプランに戻っています。これまでのご請求に変更はありません。プランの再登録は新たなご契約となりますが、二重請求にはなりませんのでご安心ください。引き続きご利用いただくには、プランページから希望のプランを選択して再度ご登録をお願いします。差額が発生する場合は、個別にご連絡の上、適切に対応いたします。
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
          onSuccess={() => { setCheckoutModal(null); setSuccessPlan({ name: checkoutModal.planName, mode: "change" }); }}
          onClose={() => setCheckoutModal(null)}
        />
      )}
      {startPlan && (
        <PlanStartModal
          planName={startPlan.name}
          price={startPlan.price}
          mode={startPlan.mode === "cancel" ? "cancel" : startPlan.mode === "new-card" ? "new-card" : "subscribe"}
          onConfirm={async () => {
            const plan = startPlan;
            setStartPlan(null);
            if (plan.mode === "cancel") {
              handleChangePlan("free");
            } else if (plan.mode === "change") {
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
                setCheckoutModal({ planKey: plan.key, planName: plan.name, clientSecret: subData.clientSecret, setupIntentId: subData.setupIntentId });
              } else {
                alert("決済の開始に失敗しました。もう一度お試しください。");
              }
              setLoading(null);
            } else {
              setConfirmMode("subscribe");
              setConfirmPlan(plan.key);
            }
          }}
          onClose={() => setStartPlan(null)}
        />
      )}
      {confirmPlan && (
        <PlanConfirmModal
          plan={confirmPlan}
          mode={confirmMode}
          keepCancellation={keepCancellation}
          onSuccess={() => { setConfirmPlan(null); setKeepCancellation(null); onSubscribed?.(); }}
          onClose={() => { setConfirmPlan(null); setKeepCancellation(null); }}
        />
      )}

      {cancellationChoiceForPlan && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 440, padding: "36px 32px", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 12 }}>解約予約について</div>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.9, marginBottom: 24 }}>
              現在、<strong>{currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }) : "現在の期間終了日"}</strong>に解約予約が設定されています。<br />
              <strong>{cancellationChoiceForPlan.name}プラン</strong>に変更する場合、解約予約はどうしますか？
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
                解約予約を取り消してプランを変更する
              </button>
              <button
                onClick={() => {
                  setKeepCancellation(true);
                  setStartPlan({ key: cancellationChoiceForPlan.key, name: cancellationChoiceForPlan.name, price: cancellationChoiceForPlan.price, mode: "change" });
                  setCancellationChoiceForPlan(null);
                }}
                style={{ padding: "14px", borderRadius: 12, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                解約予約を維持したままプランを変更する
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

        {/* 今月の使い方サマリー */}
        {monthlyCount > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #fdf4ff, #f0ebff)",
            border: "1px solid #e8d8ff",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>あなたの今月の使い方　</span>
              <span style={{ fontSize: 13, color: "#666" }}>
                単品購入 {monthlyCount}本 = <strong style={{ color: "#7a50b0" }}>¥{monthlyCost.toLocaleString()}</strong>
              </span>
            </div>
          </div>
        )}

        {/* 比較テーブル */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                {/* 空白セル */}
                <th style={{ width: "16%", padding: "8px 0" }} />
                {plans.map((plan) => {
                  const isCurrent = plan.key === currentPlan;
                  const positive = plan.price !== null && isPositiveSaving(plan.price);
                  const savingText = plan.price !== null ? getSavingText(plan.key, plan.price) : null;

                  return (
                    <th key={plan.key} onClick={() => setSelectedPlan(selectedPlan === plan.key ? null : plan.key)} style={{ width: "18%", padding: "0 6px 12px", textAlign: "center", verticalAlign: "bottom", cursor: "pointer" }}>
                      {/* 吹き出し */}
                      {savingText && (
                        <div style={{
                          background: positive ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "#f0f0f0",
                          color: positive ? "white" : "#999",
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: 8,
                          marginBottom: 6,
                          lineHeight: 1.4,
                          position: "relative",
                        }}>
                          {savingText}
                          <div style={{
                            position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
                            width: 0, height: 0,
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: `5px solid ${positive ? "#e49bfd" : "#f0f0f0"}`,
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
                        <div style={{ fontSize: 12, fontWeight: 800, color: plan.color, marginBottom: 4 }}>
                          {plan.name}
                        </div>
                        <div>
                          {plan.price === null ? (
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#aaa" }}>無料</span>
                          ) : (
                            <>
                              <span style={{ fontSize: 16, fontWeight: 800, color: plan.color }}>¥{plan.price.toLocaleString()}</span>
                              <span style={{ fontSize: 9, color: "#bbb" }}>/月</span>
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
                  }}>
                    {feature.label}
                  </td>
                  {plans.map((plan) => {
                    const ok = isFeatureAvailable(feature.from, plan.key);
                    const isCurrent = plan.key === currentPlan;
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
                          fontSize: 10, fontWeight: 700, cursor: "pointer", opacity: 0.8,
                        }}>このまま使う →</button>
                      ) : plan.key === "free" && isPaid ? (
                        <button
                          onClick={(() => setStartPlan({ key: "free", name: "無料", price: 0, mode: "cancel" }))}
                          style={{
                            width: "100%", height: 40, borderRadius: 20, border: "none",
                            background: "linear-gradient(135deg,#a3c0ff,#7aa0f0)",
                            color: "white", fontSize: 10, fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          始める →
                        </button>
                      ) : plan.key === "free" ? (
                        <div style={{ fontSize: 10, color: "#ccc", padding: "8px 0" }}>－</div>
                      ) : isPaid && isUpgrade ? (
                        <button
                          onClick={() => setStartPlan({ key: plan.key, name: plan.name, price: plan.price!, mode: "change" })}
                          style={{
                            width: "100%", height: 40, borderRadius: 20, border: "none",
                            background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
                            color: "white", fontSize: 10, fontWeight: 700,
                            cursor: "pointer",
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
                            cursor: "pointer",
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
                            cursor: loading === plan.key ? "not-allowed" : "pointer",
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
        </div>

        <div style={{ textAlign: "center", fontSize: 10, color: "#ccc", marginTop: 16 }}>
          クレジットカードで安全に決済。いつでもキャンセル可能です。
        </div>
      </div>
    </>
  );
}