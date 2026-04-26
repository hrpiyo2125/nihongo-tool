"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";

type Message = { id?: string; role: string; content: string };

export default function ChatResumePage() {
  const params = useParams();
  const locale = params.locale as string;
  const sessionId = params.sessionId as string;

  const [phase, setPhase] = useState<"loading" | "login" | "chat">("loading");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionStatus, setSessionStatus] = useState("");

  const supabase = createClient();

  async function loadChat() {
    const res = await fetch(`/api/chat/session?sessionId=${sessionId}`);
    if (!res.ok) { window.location.href = `/${locale}`; return; }
    const { status, messages: data } = await res.json();
    setMessages(data ?? []);
    setSessionStatus(status);
    setPhase("chat");
  }

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadChat();
    } else {
      setPhase("login");
    }
  }

  useEffect(() => { checkAuth(); }, []);

  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#fce8f8,#ede8ff,#e8f0ff)" }}>
        <p style={{ color: "#b090c8", fontSize: 14 }}>読み込み中...</p>
      </div>
    );
  }

  if (phase === "login") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fce8f8,#ede8ff,#e8f0ff)" }}>
        <AuthModal
          initialMode="login"
          reason="chat"
          onClose={() => { window.location.href = `/${locale}`; }}
          onLoggedIn={() => loadChat()}
        />
      </div>
    );
  }

  // chat phase
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fce8f8,#ede8ff,#e8f0ff)", padding: "24px 16px", fontFamily: "'Hiragino Sans','Yu Gothic',sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <button onClick={() => window.location.href = `/${locale}`} style={{ background: "none", border: "none", color: "#9b6ed4", cursor: "pointer", fontSize: 13 }}>← トップへ</button>
          <span style={{ fontSize: 13, color: "#bbb" }}>チャット履歴</span>
        </div>
        <div style={{ background: "white", borderRadius: 20, padding: "20px 16px", boxShadow: "0 4px 20px rgba(155,110,212,0.12)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", borderRadius: 12, padding: "12px 16px", color: "white", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/toolio_icon.png" alt="toolio" style={{ width: 32, height: 32, borderRadius: 8 }} />
            toolio サポート
          </div>
          {messages.map((m, i) => (
            m.role === "separator" ? (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#c4a0f5)" }} />
                <span style={{ fontSize: 11, color: "#9b6ed4", fontWeight: 700 }}>👤 ここから担当者との会話</span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#c4a0f5,transparent)" }} />
              </div>
            ) : (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "9px 13px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role === "user" ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : m.role === "staff" ? "#f0f7ff" : "#f5f0ff",
                  color: m.role === "user" ? "white" : "#333", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const,
                }}>
                  {m.role === "staff" && <span style={{ fontSize: 11, color: "#7a9fd4", fontWeight: 700, display: "block", marginBottom: 2 }}>担当者</span>}
                  {m.content}
                </div>
              </div>
            )
          ))}
          {sessionStatus === "active" || sessionStatus === "waiting" ? (
            <p style={{ textAlign: "center", fontSize: 12, color: "#9b6ed4", marginTop: 8 }}>担当者が対応中です。toolioアプリからメッセージを送れます。</p>
          ) : sessionStatus === "done" ? (
            <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 8 }}>このチャットは終了しました。</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
