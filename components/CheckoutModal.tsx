"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ProcessingOverlay, SuccessOverlay } from "./ProcessingOverlay";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({
  planName,
  setupIntentId,
  onSuccess,
  onClose,
}: {
  planName: string;
  setupIntentId?: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: `${window.location.origin}/?success=true` },
      redirect: "if_required",
    });

    if (error) {
      setError(error.message ?? "決済に失敗しました");
      setLoading(false);
      return;
    }

    if (setupIntent && setupIntentId) {
      const supabase = (await import("../lib/supabase")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const res = await fetch("/api/stripe/create-subscription-after-setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id, setupIntentId }),
        });
        const data = await res.json();
        if (!data.success) {
          setError("サブスク登録に失敗しました。");
          setLoading(false);
          return;
        }
      }
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <div style={{ position: "relative", ...(loading ? { height: 200, overflow: "hidden" } : {}) }}>
      {/* loading中はオーバーレイで覆う。PaymentElementは常にマウント維持 */}
      {loading && (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "white", borderRadius: 12 }}>
          <ProcessingOverlay messages={["支払い処理中...", "もう少しで完了します", "カード情報を確認しています", "プランを準備しています"]} />
        </div>
      )}

      {!ready && !loading && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#bbb", fontSize: 13 }}>
          読み込み中...
        </div>
      )}
      <div style={{ marginBottom: 24, display: ready ? "block" : "none" }}>
        <PaymentElement onReady={() => setReady(true)} options={{ wallets: { link: "never" } }} />
      </div>

      {error && (
        <div style={{ color: "#e44", fontSize: 12, marginBottom: 12, padding: "8px 12px", background: "#fff0f0", borderRadius: 8 }}>
          {error}
        </div>
      )}

      {ready && !loading && (
        <button
          onClick={handleSubmit}
          disabled={!stripe}
          style={{
            width: "100%", height: 44, borderRadius: 22, border: "none",
            background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
            color: "white", fontSize: 14, fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {planName}プランを始める
        </button>
      )}

      {!loading && (
        <button
          onClick={onClose}
          style={{
            width: "100%", height: 36, marginTop: 8, borderRadius: 18,
            border: "none", background: "transparent", color: "#bbb",
            fontSize: 12, cursor: "pointer",
          }}
        >
          キャンセル
        </button>
      )}
    </div>
  );
}

export default function CheckoutModal({
  planName,
  clientSecret,
  setupIntentId,
  onSuccess,
  onClose,
}: {
  planName: string;
  clientSecret: string;
  setupIntentId?: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [succeeded, setSucceeded] = useState(false);

  return (
    <div
      onClick={succeeded ? undefined : onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        zIndex: 1000, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 24, padding: "32px 24px",
          width: "100%", maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {succeeded ? (
          <>
            <SuccessOverlay label={`${planName}プランへようこそ。\n${planName}プランまでの教材がすぐにご利用いただけます。`} />
            <button
              onClick={onSuccess}
              style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 8 }}
            >
              教材を見る →
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 4, textAlign: "center" }}>
              {planName}プランへ登録
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#e49bfd",
                    borderRadius: "12px",
                    fontFamily: "'Hiragino Sans', 'Yu Gothic', sans-serif",
                  },
                },
              }}
            >
              <CheckoutForm
                planName={planName}
                setupIntentId={setupIntentId}
                onSuccess={() => setSucceeded(true)}
                onClose={onClose}
              />
            </Elements>
          </>
        )}
      </div>
    </div>
  );
}
