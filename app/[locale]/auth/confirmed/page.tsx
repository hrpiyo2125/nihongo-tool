"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

function ConfirmedInner() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const isOk = status === "ok";

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #fce8f8 0%, #ede8ff 50%, #e8f0ff 100%)",
    }}>
      <div style={{
        width: "100%", maxWidth: 400, margin: "0 16px",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderRadius: 20, border: "0.5px solid rgba(200,180,230,0.4)",
        boxShadow: "0 8px 40px rgba(180,130,210,0.12)",
        padding: "40px 36px 32px",
        textAlign: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/toolio_logo.png" alt="toolio" style={{ height: 36, width: "auto" }} />
        </div>

        {isOk ? (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(228,155,253,0.35)",
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#7a50b0", marginBottom: 10 }}>
              メール認証が完了しました！
            </h1>
            <p style={{ fontSize: 13, color: "#b090c8", lineHeight: 1.7, marginBottom: 28 }}>
              ようこそ、toolioへ！<br />
              下のボタンからサービスをお楽しみください。
            </p>
            <a href={`/${locale}`} style={{
              display: "block", width: "100%", height: 46, borderRadius: 24,
              background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
              color: "white", fontSize: 14, fontWeight: 700,
              textDecoration: "none", lineHeight: "46px",
              boxSizing: "border-box",
            }}>
              toolioをはじめる →
            </a>
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg,#e8d0ff,#d0c0f0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(180,140,220,0.25)",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4M12 17h.01" stroke="#9b6ed4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#9b6ed4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#7a50b0", marginBottom: 10 }}>
              リンクが無効です
            </h1>
            <p style={{ fontSize: 13, color: "#b090c8", lineHeight: 1.7, marginBottom: 28 }}>
              このリンクはすでに使用済みか、有効期限が切れています。<br />
              再度登録するか、ログインをお試しください。
            </p>
            <a href={`/${locale}/auth?mode=signup`} style={{
              display: "block", width: "100%", height: 46, borderRadius: 24,
              background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
              color: "white", fontSize: 14, fontWeight: 700,
              textDecoration: "none", lineHeight: "46px",
              marginBottom: 12,
              boxSizing: "border-box",
            }}>
              新規登録ページへ
            </a>
            <a href={`/${locale}/auth?mode=login`} style={{
              display: "block", fontSize: 12, color: "#9b6ed4", textDecoration: "none",
            }}>
              ログインはこちら
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense>
      <ConfirmedInner />
    </Suspense>
  );
}
