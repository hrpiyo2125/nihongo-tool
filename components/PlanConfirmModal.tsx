"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";
import { ProcessingOverlay, SuccessOverlay } from "./ProcessingOverlay";
import { BrandIcon } from "./BrandIcon";

const PLAN_LABELS: Record<string, string> = {
  free: "toolio free",
  weekly: "toolio weekly unlimited",
  monthly: "toolio monthly unlimited",
};

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  weekly: 498,
  monthly: 1480,
};

const PRICE_IDS: Record<string, string> = {
  weekly: process.env.NEXT_PUBLIC_STRIPE_WEEKLY_PRICE_ID!,
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
};

const PROCESSING_MESSAGES = [
  "支払い処理中...",
  "もう少しで完了します",
  "プランを準備しています",
  "セキュアに処理中です",
];

type Props = {
  plan: string;
  mode?: "subscribe" | "change";
  keepCancellation?: boolean | null;
  cardInfo?: { brand: string; last4: string };
  onSuccess: () => void;
  onClose: () => void;
  onSubscriptionReset?: () => void;
};

export default function PlanConfirmModal({ plan, mode = "subscribe", keepCancellation = null, cardInfo: cardInfoProp, onSuccess, onClose, onSubscriptionReset }: Props) {
  const router = useRouter();
  const [cardInfo, setCardInfo] = useState<{ brand: string; last4: string } | null>(cardInfoProp ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (cardInfoProp) return;
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
  }, [cardInfoProp]);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (mode === "change") {
        const res = await fetch("/api/stripe/change-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id, newPlan: plan, ...(keepCancellation !== null ? { keepCancellation } : {}) }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess(true);
        } else if (data.error === "subscription_reset") {
          onSubscriptionReset?.();
        } else if (data.error === "No active subscription") {
          setError("有効なサブスクリプションが見つかりません。再ログインしてからお試しください。");
        } else if (data.error === "Already on this plan") {
          setError("すでにこのプランをご利用中です。");
        } else if (data.error === "Invalid plan") {
          setError("無効なプランが指定されました。ページを再読み込みしてからお試しください。");
        } else {
          setError(`プラン変更に失敗しました（${data.error ?? 'Unknown error'}）。もう一度お試しください。`);
        }
      } else {
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
        } else if (data.error === "stripe_customer_missing") {
          onSubscriptionReset?.();
        } else {
          setError(`登録に失敗しました（${data.error ?? 'Unknown error'}）。もう一度お試しください。`);
        }
      }
    } catch {
      setError("通信エラーが発生しました。接続を確認してから再度お試しください。");
    } finally {
      if (!success) setLoading(false);
    }
  };

  const modalInner = () => {
    if (loading) {
      return <ProcessingOverlay messages={PROCESSING_MESSAGES} />;
    }



    if (success) {
      return (
        <>
          <SuccessOverlay
            label={`${PLAN_LABELS[plan] ?? plan}へようこそ。\nサブスク限定の教材が無制限でご利用いただけます。`}
          />
          <button
            onClick={() => { router.refresh(); onSuccess(); }}
            style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 8 }}
          >
            教材を見る →
          </button>
        </>
      );
    }

    return (
      <>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.06)", border: "none", cursor: "pointer", fontSize: 14, color: "#666" }}>✕</button>

        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><BrandIcon name="sparkle" size={40} color="#e49bfd" /></div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 6 }}>プランに登録する</div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 28 }}>登録後すぐに全教材が使えます。</div>

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
          style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
        >
          今すぐ¥{PLAN_PRICES[plan].toLocaleString()}で登録する
        </button>
        <div style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 12 }}>
          いつでもプランを変更できます。
        </div>
      </>
    );
  };

  return (
    <div
      onClick={loading || success ? undefined : (e) => { e.stopPropagation(); onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 480, padding: "36px 32px", position: "relative", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}
      >
        {modalInner()}
      </div>
    </div>
  );
}
