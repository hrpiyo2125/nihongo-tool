"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Message = { id?: string; role: string; content: string };
type Status = "waiting" | "active" | "done" | "loading";

const SESSION_COOKIE = "chat_session_id";

function setCookie(value: string) {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(value)}; max-age=${30 * 86400}; path=/`;
}

export default function ChatResumePage() {
  const params = useParams();
  const locale = params.locale as string;
  const sessionId = params.sessionId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  async function fetchSession() {
    const res = await fetch(`/api/chat/session?sessionId=${sessionId}`);
    if (!res.ok) return;
    const json = await res.json();
    const { status: s, messages: msgs } = json as { status: string; messages: Message[] };

    const newStaff = (msgs as Message[]).filter(
      (m) => m.role === "staff" && m.id && !seenIdsRef.current.has(m.id!)
    );
    newStaff.forEach((m) => m.id && seenIdsRef.current.add(m.id));

    setMessages(msgs ?? []);
    setStatus(s === "done" ? "done" : s === "active" ? "active" : "waiting");
  }

  useEffect(() => {
    setCookie(sessionId);
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ポーリング（waiting/activeのとき）
  useEffect(() => {
    if (status === "done" || status === "loading") return;
    const timer = setInterval(fetchSession, 3000);
    return () => clearInterval(timer);
  }, [status, sessionId]);

  async function handleSend() {
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content }]);
    await fetch("/api/chat/live-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userMessage: content }),
    });
    setSending(false);
  }

  const canSend = status === "waiting" || status === "active";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fce8f8,#ede8ff,#e8f0ff)", padding: "24px 16px", fontFamily: "'Hiragino Sans','Yu Gothic',sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 20 }}>
          <a href={`/${locale}`} style={{ color: "#9b6ed4", cursor: "pointer", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>← トップへ</a>
        </div>

        <div style={{ background: "white", borderRadius: 20, boxShadow: "0 4px 20px rgba(155,110,212,0.12)", display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          {/* ヘッダー */}
          <div style={{ background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", borderRadius: "20px 20px 0 0", padding: "12px 16px", color: "white", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/toolio_icon.png" alt="toolio" style={{ width: 32, height: 32, borderRadius: 8 }} />
            toolio サポート
          </div>

          {/* メッセージ一覧 */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {status === "loading" && (
              <p style={{ textAlign: "center", color: "#bbb", fontSize: 13, marginTop: 40 }}>読み込み中...</p>
            )}

            {messages.map((m, i) =>
              m.role === "separator" ? (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#c4a0f5)" }} />
                  <span style={{ fontSize: 11, color: "#9b6ed4", fontWeight: 700 }}>👤 ここから担当者との会話</span>
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#c4a0f5,transparent)" }} />
                </div>
              ) : (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6 }}>
                  {m.role !== "user" && (
                    m.role === "staff" ? (
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#a3c0ff,#7aadff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/toolio_icon.png" alt="toolio" style={{ width: 26, height: 26, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    )
                  )}
                  <div style={{
                    maxWidth: "80%", padding: "9px 13px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user" ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : m.role === "staff" ? "#f0f7ff" : "#f5f0ff",
                    color: m.role === "user" ? "white" : "#333", fontSize: 13, lineHeight: 1.6,
                    whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const,
                  }}>
                    {m.role === "staff" && <span style={{ fontSize: 11, color: "#7a9fd4", fontWeight: 700, display: "block", marginBottom: 2 }}>担当者</span>}
                    {m.content}
                  </div>
                </div>
              )
            )}

            {status === "done" && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 8 }}>このチャットは終了しました。</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* 入力欄 */}
          {canSend && (
            <div style={{ padding: "10px 12px", borderTop: "0.5px solid rgba(200,170,240,0.2)", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0, background: "white", borderRadius: "0 0 20px 20px" }}>
              <textarea
                rows={1}
                placeholder="メッセージを入力..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); handleSend(); }
                }}
                style={{ flex: 1, padding: "9px 13px", borderRadius: 20, border: "1px solid rgba(200,170,240,0.5)", fontSize: 13, resize: "none", outline: "none", lineHeight: 1.5, overflow: "hidden", maxHeight: 96 }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                style={{ padding: "9px 16px", borderRadius: 20, border: "none", background: input.trim() && !sending ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "#e5e5e5", color: input.trim() && !sending ? "white" : "#bbb", cursor: input.trim() && !sending ? "pointer" : "default", fontSize: 13, fontWeight: 700, flexShrink: 0, transition: "background 0.2s" }}
              >
                送信
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
