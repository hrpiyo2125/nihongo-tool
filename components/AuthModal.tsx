"use client";

import { useState, useCallback, useRef } from "react";
import { useLocale } from "next-intl";
import { createClient } from "../lib/supabase";
import { Turnstile } from "@marsidev/react-turnstile";
import { TermsContent, PrivacyContent } from "../app/[locale]/LegalPagesContent";

export type AuthModalMode = "signup" | "login" | "reset-request";

type Props = {
  initialMode?: AuthModalMode;
  reason?: string;
  onClose: () => void;
  onLoggedIn?: () => void;
};

export default function AuthModal({ initialMode = "signup", reason, onClose, onLoggedIn }: Props) {
  const locale = useLocale();
  const [view, setView] = useState<"signup" | "login" | "reset-request">(initialMode);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const captchaTokenRef = useRef<string | null>(null);
  const handleCaptchaSuccess = useCallback((token: string) => { captchaTokenRef.current = token; }, []);
  const [agreedGoogle, setAgreedGoogle] = useState(false);
  const [agreedEmail, setAgreedEmail] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  const supabase = createClient();

  const switchView = (v: "signup" | "login" | "reset-request") => {
    setView(v);
    setStep(1);
    setError("");
    setMessage("");
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("お名前を入力してください"); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email || !password) { setError("メールアドレスとパスワードを入力してください"); return; }
    if (password.length < 8) { setError("パスワードは8文字以上で入力してください"); return; }
    setLoading(true);

    if (view === "login") {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email, password, options: { captchaToken: captchaTokenRef.current ?? undefined },
      });
      if (signInError) {
        setError("メールアドレスまたはパスワードが間違っています");
        setLoading(false);
        return;
      }
      if (signInData.user) {
        const { data: profile } = await supabase.from("profiles").select("status").eq("id", signInData.user.id).single();
        if (profile?.status === "deleted") {
          window.location.href = `/${locale}/welcome-back`;
          return;
        }
      }
      onLoggedIn?.();
      onClose();
    } else {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/${locale}&type=signup`,
          captchaToken: captchaTokenRef.current ?? undefined,
        },
      });
      if (signUpError) {
        setError("登録に失敗しました。もう一度お試しください");
        setLoading(false);
        return;
      }
      if (signUpData.user) {
        if ((signUpData.user.identities ?? []).length === 0) {
          setError("このメールアドレスはすでに登録されています。");
          setLoading(false);
          return;
        }
        const { data: existingProfile } = await supabase.from("profiles").select("status").eq("id", signUpData.user.id).single();
        if (existingProfile?.status === "deleted") {
          window.location.href = `/${locale}/welcome-back`;
          return;
        }
        await supabase.from("profiles").upsert({ id: signUpData.user.id, full_name: name.trim(), status: "active", agreed_at: new Date().toISOString() });
      }
      setMessage("確認メールを送信しました。メールのリンクをクリックして登録を完了してください。");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    if (view === "signup" && !agreedGoogle) return;
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}`,
        queryParams: { prompt: 'select_account' },
      },
    });
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) { setError("メールアドレスを入力してください"); return; }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/auth/reset-password`,
    });
    if (resetError) {
      setError("パスワードのリセットができませんでした。Googleで登録した場合は「Googleで続ける」からログインしてください。");
    } else {
      setMessage("パスワードリセット用のメールを送信しました。メールをご確認ください。");
    }
    setLoading(false);
  };

  const makeAgreeCheckbox = (checked: boolean, toggle: () => void) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "12px 0 8px", cursor: "pointer" }} onClick={toggle}>
      <div style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
        border: checked ? "none" : "1.5px solid rgba(200,180,230,0.7)",
        background: checked ? "linear-gradient(135deg,#e49bfd,#a3c0ff)" : "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
        <span style={{ color: "#9b6ed4", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
          onClick={(e) => { e.stopPropagation(); setLegalModal("terms"); }}>利用規約</span>
        および
        <span style={{ color: "#9b6ed4", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
          onClick={(e) => { e.stopPropagation(); setLegalModal("privacy"); }}>プライバシーポリシー</span>
        に同意する
      </span>
    </div>
  );

  const StepIndicator = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
      {[1, 2].map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: step >= s ? "linear-gradient(135deg,#e49bfd,#a3c0ff)" : "rgba(200,180,230,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700,
            color: step >= s ? "white" : "#c0a8e0",
            transition: "all 0.2s",
          }}>{s}</div>
          <span style={{ fontSize: 11, color: step >= s ? "#7a50b0" : "#c0a8e0", fontWeight: step === s ? 700 : 400 }}>
            {s === 1 ? "お名前" : "メール・パスワード"}
          </span>
          {s < 2 && <div style={{ width: 16, height: 1, background: step > s ? "#c0a8e0" : "rgba(200,180,230,0.3)" }} />}
        </div>
      ))}
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 44, borderRadius: 10,
    border: "0.5px solid rgba(200,180,230,0.5)", padding: "0 14px",
    fontSize: 13, color: "#333", background: "rgba(255,255,255,0.9)",
    outline: "none", marginBottom: 8, boxSizing: "border-box",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 400,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          borderRadius: 20, border: "0.5px solid rgba(200,180,230,0.4)",
          boxShadow: "0 8px 40px rgba(180,130,210,0.2)",
          padding: "32px 36px 28px",
          position: "relative",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(0,0,0,0.06)", border: "none",
            cursor: "pointer", fontSize: 13, color: "#888",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>

        {/* ロゴ */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/toolio_logo.png" alt="toolio" style={{ height: 36, width: "auto", objectFit: "contain" }} />
        </div>

        {/* ========== パスワードリセット申請ビュー ========== */}
        {view === "reset-request" && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#7a50b0", marginBottom: 8 }}>パスワードをお忘れの方</h2>
            <p style={{ fontSize: 12, color: "#b090c8", marginBottom: 20, lineHeight: 1.6 }}>
              登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
            </p>

            {message ? (
              <div style={{ fontSize: 12, color: "#3a8a5a", padding: "10px 14px", background: "#edfff4", borderRadius: 8, border: "0.5px solid #b0e8c8", lineHeight: 1.7 }}>
                {message}
              </div>
            ) : (
              <form onSubmit={handleResetRequest}>
                <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus style={inputStyle} />
                {error && <div style={{ fontSize: 11, color: "#c44a88", marginBottom: 10, padding: "6px 10px", background: "#fff0f6", borderRadius: 6 }}>{error}</div>}
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
              <span onClick={() => switchView("login")} style={{ fontSize: 12, color: "#9b6ed4", cursor: "pointer" }}>
                ← ログインに戻る
              </span>
            </div>
          </>
        )}

        {/* ========== ログイン / 新規登録ビュー ========== */}
        {view !== "reset-request" && (
          <>
            {/* Googleボタン */}
            {view === "signup" && makeAgreeCheckbox(agreedGoogle, () => setAgreedGoogle(v => !v))}
            <button onClick={handleGoogle} disabled={loading} style={{
              width: "100%", height: 44, borderRadius: 10,
              border: "0.5px solid rgba(0,0,0,0.12)",
              background: (view === "signup" && !agreedGoogle) ? "#f5f5f5" : "white",
              cursor: (loading || (view === "signup" && !agreedGoogle)) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontSize: 13, fontWeight: 600,
              color: (view === "signup" && !agreedGoogle) ? "#bbb" : "#333",
              marginBottom: 14, transition: "all 0.15s",
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0, opacity: (view === "signup" && !agreedGoogle) ? 0.35 : 1 }}>
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
              Googleで続ける
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: "0.5px", background: "rgba(0,0,0,0.1)" }} />
              <span style={{ fontSize: 11, color: "#ccc" }}>またはメールアドレスで</span>
              <div style={{ flex: 1, height: "0.5px", background: "rgba(0,0,0,0.1)" }} />
            </div>

            {/* モード切替タブ */}
            <div style={{ display: "flex", background: "#f5f0ff", borderRadius: 24, padding: 3, marginBottom: 20, gap: 2 }}>
              {(["signup", "login"] as const).map((m) => (
                <button key={m} onClick={() => switchView(m)} style={{
                  flex: 1, padding: "8px 0", border: "none", borderRadius: 20, cursor: "pointer",
                  fontSize: 13, fontWeight: view === m ? 700 : 500,
                  background: view === m ? "white" : "transparent",
                  color: view === m ? "#7a50b0" : "#b090c8",
                  boxShadow: view === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}>
                  {m === "signup" ? "新規登録" : "ログイン"}
                </button>
              ))}
            </div>

            {/* 新規登録 STEP 1 */}
            {view === "signup" && step === 1 && (
              <>
                <StepIndicator />
                <div style={{ fontSize: 13, color: "#7a50b0", fontWeight: 600, marginBottom: 14 }}>
                  はじめに、お名前を教えてください 👋
                </div>
                <form onSubmit={handleNextStep}>
                  <input type="text" placeholder="お名前（例：田中はるな）" value={name} onChange={(e) => setName(e.target.value)} autoFocus style={inputStyle} />
                  {error && <div style={{ fontSize: 11, color: "#c44a88", marginBottom: 10, padding: "6px 10px", background: "#fff0f6", borderRadius: 6 }}>{error}</div>}
                  <button type="submit" style={{
                    width: "100%", height: 46, borderRadius: 24, border: "none",
                    background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
                    color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 8,
                  }}>次へ →</button>
                </form>
              </>
            )}

            {/* 新規登録 STEP 2 */}
            {view === "signup" && step === 2 && (
              <>
                <StepIndicator />
                <button onClick={() => { setStep(1); setError(""); }} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, color: "#b090c8", marginBottom: 12, padding: 0,
                  display: "flex", alignItems: "center", gap: 4,
                }}>← 戻る</button>
                <div style={{ fontSize: 13, color: "#7a50b0", fontWeight: 600, marginBottom: 4 }}>{name} さん、ようこそ！ 🎉</div>
                <div style={{ fontSize: 12, color: "#b090c8", marginBottom: 16 }}>メールアドレスとパスワードを設定してください</div>
                {message && (
                  <div style={{ fontSize: 12, color: "#3a8a5a", marginBottom: 12, padding: "10px 14px", background: "#edfff4", borderRadius: 8, border: "0.5px solid #b0e8c8", lineHeight: 1.7 }}>
                    {message}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus style={inputStyle} />
                  <input type="password" placeholder="パスワード（8文字以上）" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                  {error && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: "#c44a88", padding: "6px 10px", background: "#fff0f6", borderRadius: 6, marginBottom: 8 }}>{error}</div>
                      <span onClick={() => switchView("login")} style={{ fontSize: 11, color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>→ ログインはこちら</span>
                    </div>
                  )}
                  {makeAgreeCheckbox(agreedEmail, () => setAgreedEmail(v => !v))}
                  <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} onSuccess={handleCaptchaSuccess} options={{ appearance: "interaction-only" }} />
                  <button type="submit" disabled={loading || !agreedEmail} style={{
                    width: "100%", height: 46, borderRadius: 24, border: "none",
                    background: (loading || !agreedEmail) ? "#e0d0f0" : "linear-gradient(135deg,#f4b9b9,#e49bfd)",
                    color: "white", fontSize: 14, fontWeight: 700,
                    cursor: (loading || !agreedEmail) ? "not-allowed" : "pointer", marginTop: 8, transition: "opacity 0.15s",
                  }}>
                    {loading ? "処理中..." : "無料で始める →"}
                  </button>
                </form>
              </>
            )}

            {/* ログイン */}
            {view === "login" && (
              <>
                {message && (
                  <div style={{ fontSize: 12, color: "#3a8a5a", marginBottom: 12, padding: "10px 14px", background: "#edfff4", borderRadius: 8, border: "0.5px solid #b0e8c8", lineHeight: 1.7 }}>
                    {message}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                  <input type="password" placeholder="パスワード（8文字以上）" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                  {error && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: "#c44a88", padding: "6px 10px", background: "#fff0f6", borderRadius: 6, marginBottom: 8 }}>{error}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span onClick={() => switchView("signup")} style={{ fontSize: 11, color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>→ 新規登録はこちら</span>
                        <span onClick={() => switchView("reset-request")} style={{ fontSize: 11, color: "#b090c8", cursor: "pointer" }}>→ パスワードをお忘れの方</span>
                      </div>
                    </div>
                  )}
                  <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} onSuccess={handleCaptchaSuccess} options={{ appearance: "interaction-only" }} />
                  <button type="submit" disabled={loading} style={{
                    width: "100%", height: 46, borderRadius: 24, border: "none",
                    background: loading ? "#e0d0f0" : "linear-gradient(135deg,#f4b9b9,#e49bfd)",
                    color: "white", fontSize: 14, fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.15s",
                  }}>
                    {loading ? "処理中..." : "ログイン"}
                  </button>
                </form>
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <span onClick={() => switchView("reset-request")} style={{ fontSize: 11, color: "#b090c8", cursor: "pointer" }}>
                    パスワードをお忘れの方はこちら
                  </span>
                </div>
              </>
            )}

            {/* モード切替リンク */}
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#b090c8" }}>
              {view === "login" ? (
                <>アカウントをお持ちでない方は<span onClick={() => switchView("signup")} style={{ color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>新規登録</span></>
              ) : (
                <>すでにアカウントをお持ちの方は<span onClick={() => switchView("login")} style={{ color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>ログイン</span></>
              )}
            </div>

          </>
        )}
      </div>

      {/* 利用規約・プライバシーポリシー モーダル */}
      {legalModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setLegalModal(null)}
        >
          <div
            style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: "sticky", top: 0, background: "white", borderRadius: "20px 20px 0 0", borderBottom: "0.5px solid rgba(200,180,230,0.3)", padding: "16px 20px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setLegalModal(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#b090c8", lineHeight: 1 }}>×</button>
            </div>
            {legalModal === "terms"
              ? <TermsContent onBack={() => setLegalModal(null)} compact />
              : <PrivacyContent onBack={() => setLegalModal(null)} compact />
            }
          </div>
        </div>
      )}
    </div>
  );
}
