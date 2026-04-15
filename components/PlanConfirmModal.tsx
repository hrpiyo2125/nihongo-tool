"use client";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase";

const PLAN_LABELS: Record<string, string> = {
  light: "ライト",
  standard: "スタンダード",
  premium: "プレミアム",
};

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  light: 500,
  standard: 980,
  premium: 1480,
};

const PRICE_IDS: Record<string, string> = {
  light: process.env.NEXT_PUBLIC_STRIPE_LIGHT_PRICE_ID!,
  standard: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID!,
  premium: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!,
};

type Props = {
  plan: string;
  onSuccess: () => void;
  onClose: () => void;
};

export default function PlanConfirmModal({ plan, onSuccess, onClose }: Props) {
  const [cardInfo, setCardInfo] = useState<{ brand: string; last4: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
 
  useEffect(() => {
    const fetchCard = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/stripe/payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await res.json();
      if (data.brand && data.last4) setCardInfo({ brand: data.brand, last4: data.last4 });
    };
    fetchCard();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/stripe/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
          priceId: PRICE_IDS[plan],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error ?? "登録に失敗しました。");
      }
    } catch {
      setError("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 400, padding: "48px 32px", textAlign: "center", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 8 }}>
            登録が完了しました！
          </div>
          <div style={{ fontSize: 13, color: "#999", marginBottom: 8, lineHeight: 1.8 }}>
            {PLAN_LABELS[plan]}プランへようこそ。<br />今すぐすべての教材が使えます。
          </div>
          <div style={{ fontSize: 12, color: "#bbb", marginBottom: 32 }}>
            本日より有効です。
          </div>
          <button
            onClick={onSuccess}
            style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
          >
            教材を見る →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 480, padding: "36px 32px", position: "relative", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.06)", border: "none", cursor: "pointer", fontSize: 14, color: "#666" }}>✕</button>

        <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 6 }}>プランに登録する</div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 28 }}>登録後すぐにすべての教材が使えます。</div>

        <div style={{ background: "#f8f6ff", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>登録するプラン</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>{PLAN_LABELS[plan]}プラン</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "0.5px solid #eee", borderBottom: "0.5px solid #eee", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 2 }}>月額料金</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#333" }}>¥{PLAN_PRICES[plan].toLocaleString()}<span style={{ fontSize: 13, fontWeight: 400, color: "#999" }}>/月</span></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 2 }}>支払い方法</div>
            {cardInfo ? (
              <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>
                {cardInfo.brand.toUpperCase()} •••• {cardInfo.last4}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#bbb" }}>読み込み中...</div>
            )}
          </div>
        </div>

        {error && <div style={{ fontSize: 12, color: "#e44", marginBottom: 12, textAlign: "center" }}>{error}</div>}

        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: loading ? "#ccc" : "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "処理中..." : `今すぐ¥${PLAN_PRICES[plan].toLocaleString()}で登録する`}
        </button>
        <div style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 12 }}>
          いつでもマイページからキャンセルできます。
        </div>
      </div>
    </div>
  );
}