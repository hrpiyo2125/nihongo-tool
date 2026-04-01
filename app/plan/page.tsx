"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

const plans = [
  {
    key: "free",
    name: "Free",
    price: 0,
    priceId: null,
    color: "#888",
    bg: "white",
    border: "#eee",
    featured: false,
    features: [
      { text: "無料教材ダウンロード", ok: true },
      { text: "お気に入り5件まで", ok: true },
      { text: "サブスク限定教材", ok: false },
      { text: "体系的カリキュラム", ok: false },
      { text: "お気に入り無制限", ok: false },
      { text: "毎月新教材追加", ok: false },
      { text: "先行リリース教材", ok: false },
    ],
  },
  {
    key: "light",
    name: "Light",
    price: 980,
    priceId: "price_1THEnBGhqjyGHGfCXxb9uRNa",
    color: "#7a50b0",
    bg: "#fdf8ff",
    border: "#ddc8ff",
    featured: false,
    features: [
      { text: "無料教材ダウンロード", ok: true },
      { text: "お気に入り5件まで", ok: true },
      { text: "サブスク限定教材", ok: true },
      { text: "体系的カリキュラム", ok: false },
      { text: "お気に入り無制限", ok: false },
      { text: "毎月新教材追加", ok: true },
      { text: "先行リリース教材", ok: false },
    ],
  },
  {
    key: "standard",
    name: "Standard",
    price: 1980,
    priceId: "price_1THEo4GhqjyGHGfCt2x1xP3t",
    color: "#7a50b0",
    bg: "#fdf8ff",
    border: "#c9a0f0",
    featured: true,
    features: [
      { text: "無料教材ダウンロード", ok: true },
      { text: "お気に入り無制限", ok: true },
      { text: "サブスク限定教材", ok: true },
      { text: "体系的カリキュラム", ok: true },
      { text: "お気に入り無制限", ok: true },
      { text: "毎月新教材追加", ok: true },
      { text: "先行リリース教材", ok: false },
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: 3980,
    priceId: "price_1THEofGhqjyGHGfC6yPrXrrr",
    color: "#c44a88",
    bg: "#fff8fd",
    border: "#f4b9b9",
    featured: false,
    features: [
      { text: "無料教材ダウンロード", ok: true },
      { text: "お気に入り無制限", ok: true },
      { text: "サブスク限定教材", ok: true },
      { text: "体系的カリキュラム", ok: true },
      { text: "お気に入り無制限", ok: true },
      { text: "毎月新教材追加", ok: true },
      { text: "先行リリース教材", ok: true },
    ],
  },
];

export default function PlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!plan.priceId) return;
    setLoading(plan.key);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth?mode=login&reason=plan");
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: plan.priceId,
        userId: user.id,
        email: user.email,
      }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("決済の開始に失敗しました。もう一度お試しください。");
    }
    setLoading(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif",
      background: "linear-gradient(160deg, #fce8f8 0%, #ede8ff 50%, #e8f0ff 100%)",
      padding: "48px 16px 80px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <button onClick={() => router.back()} style={{
          border: "none", background: "transparent", cursor: "pointer",
          fontSize: 13, color: "#bbb", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 4, margin: "0 auto 16px",
        }}>
          ‹ 戻る
        </button>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#333", marginBottom: 8 }}>
          プランを選ぶ
        </div>
        <div style={{ fontSize: 13, color: "#999" }}>
          いつでもキャンセル可能。まずは無料から始められます。
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        maxWidth: 900,
        margin: "0 auto 40px",
      }}>
        {plans.map((plan) => (
          <div key={plan.key} style={{
            background: plan.bg,
            border: `${plan.featured ? 2 : 1}px solid ${plan.border}`,
            borderRadius: 20,
            padding: "24px 16px",
            position: "relative",
            boxShadow: plan.featured ? "0 8px 32px rgba(180,130,210,0.18)" : "none",
            transform: plan.featured ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.2s",
          }}>
            {plan.featured && (
              <div style={{
                position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
                color: "white", fontSize: 11, fontWeight: 700,
                padding: "3px 14px", borderRadius: 12, whiteSpace: "nowrap",
              }}>
                おすすめ
              </div>
            )}

            <div style={{ fontSize: 15, fontWeight: 800, color: plan.color, marginBottom: 8 }}>
              {plan.name}
            </div>

            <div style={{ marginBottom: 20 }}>
              {plan.price === 0 ? (
                <span style={{ fontSize: 26, fontWeight: 800, color: "#888" }}>無料</span>
              ) : (
                <>
                  <span style={{ fontSize: 26, fontWeight: 800, color: plan.color }}>
                    ¥{plan.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, color: "#bbb" }}>/月</span>
                </>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                    background: f.ok
                      ? plan.featured
                        ? "linear-gradient(135deg,#f4b9b9,#e49bfd)"
                        : "#e0d0f8"
                      : "#f0f0f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {f.ok ? (
                      <svg width="9" height="9" viewBox="0 0 10 10">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                      </svg>
                    ) : (
                      <svg width="8" height="8" viewBox="0 0 10 10">
                        <path d="M3 5h4" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: f.ok ? "#444" : "#ccc", lineHeight: 1.4 }}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            {plan.key === "free" ? (
              <button onClick={() => router.push("/")} style={{
                width: "100%", height: 40, borderRadius: 20, border: "1px solid #eee",
                background: "white", color: "#aaa", fontSize: 12, fontWeight: 600,
                cursor: "pointer",
              }}>
                無料で使う
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
                  color: "white", fontSize: 12, fontWeight: 700,
                  cursor: loading === plan.key ? "not-allowed" : "pointer",
                  opacity: loading === plan.key ? 0.7 : 1,
                }}
              >
                {loading === plan.key ? "処理中..." : "始める →"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "#ccc" }}>
        クレジットカードで安全に決済。いつでもキャンセル可能です。
      </div>
    </div>
  );
}