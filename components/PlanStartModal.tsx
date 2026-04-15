"use client";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase";

type Props = {
  planName: string;
  price: number;
  mode?: "subscribe" | "change" | "new-card" | "cancel";
  currentPeriodEnd?: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export default function PlanStartModal({ planName, price, mode, currentPeriodEnd, onConfirm, onClose }: Props) {
  const isCancel = mode === "cancel";
  const showCard = mode === "change" || mode === "subscribe";

  const [cardInfo, setCardInfo] = useState<{ brand: string; last4: string } | null>(null);

  useEffect(() => {
    if (!showCard) return;
    const fetchCard = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/stripe/payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = res.ok ? await res.json() : {};
      if (data.brand && data.last4) setCardInfo({ brand: data.brand, last4: data.last4 });
    };
    fetchCard();
  }, [showCard]);

  const periodEndText = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 400, padding: "40px 32px", textAlign: "center", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>{isCancel ? "🔄" : "✨"}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 8 }}>
          {isCancel ? "無料プランに戻しますか？" : `${planName}プランを始めますか？`}
        </div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: showCard ? 16 : 32, lineHeight: 1.8 }}>
          {isCancel
            ? `現在のプランは${periodEndText ?? "現在の期間終了日"}まで引き続きご利用いただけます。期間終了後、自動的に無料プランへ移行します。`
            : `月額 ¥${price.toLocaleString()} で、いつでもキャンセルできます。`}
        </div>

        {showCard && (
          <div style={{ background: "#f8f6ff", borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#aaa" }}>お支払いカード</div>
            {cardInfo ? (
              <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>
                {cardInfo.brand.toUpperCase()} •••• {cardInfo.last4}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#bbb" }}>読み込み中...</div>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: isCancel ? "linear-gradient(135deg,#a3c0ff,#7aa0f0)" : "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
          >
            {isCancel ? "無料プランに戻す" : "はい、始めます"}
          </button>
          <button
            onClick={onClose}
            style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "transparent", color: "#bbb", fontSize: 13, cursor: "pointer" }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}