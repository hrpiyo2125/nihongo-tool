"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/supabase";

export default function ResetRequestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      setError("送信に失敗しました。もう一度お試しください");
    } else {
      setMessage("パスワードリセット用のメールを送信しました。メールをご確認ください。");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #fce8f8 0%, #ede8ff 50%, #e8f0ff 100%)",
      fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: 400, margin: "0 16px",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        borderRadius: 20, border: "0.5px solid rgba(200,180,230,0.4)",
        boxShadow: "0 8px 40px rgba(180,130,210,0.12)",
        padding: "32px 36px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/toolio_logo.png" alt="toolio" style={{ height: 36, width: "auto" }} />
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#7a50b0", marginBottom: 8 }}>
          パスワードをお忘れの方
        </h2>
        <p style={{ fontSize: 12, color: "#b090c8", marginBottom: 20, lineHeight: 1.6 }}>
          登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
        </p>

        {message && (
          <div style={{ fontSize: 12, color: "#3a8a5a", marginBottom: 16, padding: "10px 14px", background: "#edfff4", borderRadius: 8, border: "0.5px solid #b0e8c8", lineHeight: 1.7 }}>
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              style={{
                width: "100%", height: 44, borderRadius: 10,
                border: "0.5px solid rgba(200,180,230,0.5)", padding: "0 14px",
                fontSize: 13, color: "#333", background: "rgba(255,255,255,0.9)",
                outline: "none", marginBottom: 8, boxSizing: "border-box",
              }}
            />

            {error && (
              <div style={{ fontSize: 11, color: "#c44a88", marginBottom: 10, padding: "6px 10px", background: "#fff0f6", borderRadius: 6 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", height: 46, borderRadius: 24, border: "none",
              background: loading ? "#e0d0f0" : "linear-gradient(135deg,#f4b9b9,#e49bfd)",
              color: "white", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", marginTop: 8,
            }}>
              {loading ? "送信中..." : "リセットメールを送る"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <a href="/auth" style={{ fontSize: 12, color: "#9b6ed4", textDecoration: "none" }}>
            ← ログインに戻る
          </a>
        </div>
      </div>
    </div>
  );
}