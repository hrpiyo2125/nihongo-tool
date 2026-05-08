"use client";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase";
import { BrandIcon } from "./BrandIcon";

type Props = {
  matTitle: string;
  cardInfo?: { brand: string; last4: string };
  onConfirm: (cardInfo?: { brand: string; last4: string }) => void;
  onClose: () => void;
};

export default function PurchaseStartModal({ matTitle: _matTitle, cardInfo: cardInfoProp, onConfirm, onClose }: Props) {
  const [cardInfo, setCardInfo] = useState<{ brand: string; last4: string } | null>(cardInfoProp ?? null);

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
      const data = res.ok ? await res.json() : {};
      if (data.brand && data.last4) setCardInfo({ brand: data.brand, last4: data.last4 });
    };
    fetchCard();
  }, [cardInfoProp]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 400, padding: "40px 32px", textAlign: "center", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
          <BrandIcon name="sparkle" size={44} color="#e49bfd" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 8 }}>
          この教材を購入しますか？
        </div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 16, lineHeight: 1.8 }}>
          ¥300 の1回払いです。購入後すぐにダウンロードできます。
        </div>

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

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => onConfirm(cardInfo ?? undefined)}
            style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
          >
            はい、購入します
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
