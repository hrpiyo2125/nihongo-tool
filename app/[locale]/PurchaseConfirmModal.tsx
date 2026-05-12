"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "../../lib/supabase";
import { ProcessingOverlay, SuccessOverlay } from "../../components/ProcessingOverlay";
import { BrandIcon } from "../../components/BrandIcon";
import { useAuth } from "./AuthContext";

type Props = {
  mat: { id: string; title: string };
  cardInfo?: { brand: string; last4: string };
  onSuccess: () => void | Promise<void>;
  onClose: () => void;
};

// Processing messages are set inside component after translation hook

export default function PurchaseConfirmModal({ mat, cardInfo: cardInfoProp, onSuccess, onClose }: Props) {
  const router = useRouter();
  const { loadProfile } = useAuth();
  const tp = useTranslations("purchase");
  const PROCESSING_MESSAGES = [tp("processing_1"), tp("processing_2"), tp("processing_3")];
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
        setError(tp("error_payment"));
      } else if (data.error === "Internal Server Error") {
        setError(tp("error_server"));
      } else {
        setError(tp("error_generic"));
      }
    } catch {
      setError(tp("error_network"));
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
          <SuccessOverlay label={`「${mat.title}」${tp("success_label")}`} />
          <button
            onClick={async () => { await onSuccess(); loadProfile(); router.refresh(); }}
            style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 8 }}
          >
            {tp("view_material")}
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
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 6 }}>{tp("title")}</div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 28 }}>{tp("subtitle")}</div>

        <div style={{ background: "#f8f6ff", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>{tp("material_label")}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>{mat.title}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "0.5px solid #eee", borderBottom: "0.5px solid #eee", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 2 }}>{tp("total")}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#333" }}>¥300</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 2 }}>{tp("payment_method")}</div>
            {cardInfo ? (
              <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>
                {cardInfo.brand.toUpperCase()} •••• {cardInfo.last4}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#bbb" }}>{tp("loading_card")}</div>
            )}
          </div>
        </div>

        {error && <div style={{ fontSize: 12, color: "#e44", marginBottom: 12, textAlign: "center" }}>{error}</div>}

        <button
          onClick={handlePay}
          style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
        >
          {tp("pay_now")}
        </button>
        <div style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 12 }}>
          {tp("pay_disclaimer")}
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
