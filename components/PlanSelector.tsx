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
  onSubscribed?: () => void;
};

export default function PlanSelector({ currentPlan = "free", onSubscribed }: Props) {
  const router = useRouter();
  const [monthlyCount, setMonthlyCount] = useState<number>(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<{ planName: string; clientSecret: string; setupIntentId?: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<"light" | "standard" | "premium" | null>(null);
  const [startPlan, setStartPlan] = useState<{ key: "light" | "standard" | "premium"; name: string; price: number } | null>(null);

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
      setStartPlan({ key: plan.key as "light" | "standard" | "premium", name: plan.name, price: plan.price! });
    } else {
      setLoading(plan.key);
      const subRes = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId, userId: user.id, email: user.email }),
      });
      const subData = await subRes.json();
      if (subData.clientSecret) {
        setLoading(null);
        setCheckoutModal({ planName: plan.name, clientSecret: subData.clientSecret, setupIntentId: subData.setupIntentId });
      } else if (subData.requiresPaymentMethod) {
        alert("カードを登録してください。");
      } else {
        alert("決済の開始に失敗しました。もう一度お試しください。");
      }
      setLoading(null);
    }
  };
  return (
    <>
      {checkoutModal && (
        <CheckoutModal
          planName={checkoutModal.planName}
          clientSecret={checkoutModal.clientSecret}
          setupIntentId={checkoutModal.setupIntentId}
          onSuccess={() => { setCheckoutModal(null); onSubscribed?.(); }}
          onClose={() => setCheckoutModal(null)}
        />
      )}
      {startPlan && (
        <PlanStartModal
          planName={startPlan.name}
          price={startPlan.price}
          onConfirm={() => { setStartPlan(null); setConfirmPlan(startPlan.key); }}
          onClose={() => setStartPlan(null)}
        />
      )}
      {confirmPlan && (
        <PlanConfirmModal
          plan={confirmPlan}
          onSuccess={() => { setConfirmPlan(null); onSubscribed?.(); }}
          onClose={() => setConfirmPlan(null)}
        />
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
                      ) : plan.key === "free" ? (
                        <div style={{ fontSize: 10, color: "#ccc", padding: "8px 0" }}>－</div>
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