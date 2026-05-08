"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";
import { ProcessingOverlay, SuccessOverlay } from "../../components/ProcessingOverlay";
import { BrandIcon } from "../../components/BrandIcon";
import { useAuth } from "./AuthContext";

type Props = {
  mat: { id: string; title: string };
  cardInfo?: { brand: string; last4: string };
  onSuccess: () => void;
  onClose: () => void;
};

const PROCESSING_MESSAGES = ["支払い処理中...", "もう少しで完了します", "セキュアに処理中です"];

export default function PurchaseConfirmModal({ mat, cardInfo: cardInfoProp, onSuccess, onClose }: Props) {
  const router = useRouter();
  const { loadProfile } = useAuth();
  const [cardInfo, setCardInfo] = useState<{ brand: string; last4: string } | null>(cardInfoProp ?? null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cardInfoProp) return;
    const fetchCard = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/stripe/payment-method", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await res.json();
      if (data.brand && data.last4) setCardInfo({ brand: data.brand, last4: data.last4 });
    };
    fetchCard();
  }, [cardInfoProp]);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/stripe/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: mat.id,
          userId: session.user.id,
          email: session.user.email,
        }),
      });
      const data = await res.json();
      if (data.success || data.error === "ALREADY_PURCHASED") {
        setSuccess(true);
      } else if (data.error === "決済に失敗しました") {
        setError("決済に失敗しました。カード情報をご確認のうえ再度お試しください。");
      } else if (data.error === "Internal Server Error") {
        setError("サーバーエラーが発生しました。しばらく経ってから再度お試しください。");
      } else {
        setError(`購入に失敗しました（${data.error ?? 'Unknown error'}）。もう一度お試しください。`);
      }
    } catch {
      setError("通信エラーが発生しました。接続を確認してから再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const modalInner = () => {
    if (loading) {
      return <ProcessingOverlay messages={PROCESSING_MESSAGES} />;
    }

    if (success) {
      return (
        <>
          <SuccessOverlay label={`「${mat.title}」を購入しました。\n今すぐダウンロードできます。`} />
          <button
            onClick={() => { loadProfile(); router.refresh(); onSuccess(); }}
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

        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
          <BrandIcon name="sparkle" size={40} color="#e49bfd" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 6 }}>教材を購入する</div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 28 }}>購入後すぐにダウンロードできます。</div>

        <div style={{ background: "#f8f6ff", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>購入する教材</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>{mat.title}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "0.5px solid #eee", borderBottom: "0.5px solid #eee", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 2 }}>お支払い総額</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#333" }}>¥300</div>
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
          onClick={handlePay}
          style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
        >
          今すぐ¥300を支払う
        </button>
        <div style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 12 }}>
          「今すぐ支払う」を押すと、上記の金額がカードに請求されます。
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
