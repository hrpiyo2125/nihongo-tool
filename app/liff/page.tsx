"use client";
import { useEffect, useState } from "react";
import RequestForm from "@/components/RequestForm";

export default function LiffPage() {
  const [liffReady, setLiffReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) { setError("LIFF IDが設定されていません"); return; }

    import("@line/liff").then(({ default: liff }) => {
      liff.init({ liffId })
        .then(() => setLiffReady(true))
        .catch((e: Error) => setError(e.message));
    });
  }, []);

  async function handleSubmit(topic: string, summary: string) {
    await fetch("/api/line/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, summary }),
    });

    const { default: liff } = await import("@line/liff");
    if (liff.isInClient()) {
      await liff.sendMessages([{
        type: "text",
        text: `【${topic}】の送信が完了しました✅\n\n${summary}`,
      }]);
      liff.closeWindow();
    }
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, fontFamily: "'Hiragino Sans','Yu Gothic',sans-serif" }}>
        <p style={{ color: "#c0392b", fontSize: 13 }}>{error}</p>
      </div>
    );
  }

  if (!liffReady) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Hiragino Sans','Yu Gothic',sans-serif" }}>
        <p style={{ color: "#aaa", fontSize: 13 }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fce8f8,#ede8ff,#e8f0ff)", fontFamily: "'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/toolio_icon_circle.png" alt="toolio" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.2 }}>リクエスト・フィードバック</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>toolio</div>
        </div>
      </div>

      {/* フォーム */}
      <div style={{ maxWidth: 480, margin: "0 auto", background: "white", minHeight: "calc(100vh - 64px)" }}>
        <RequestForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
