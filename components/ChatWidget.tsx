"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";

const TOPICS = [
  "料金について",
  "解約について",
  "退会について",
  "使い方について",
  "教材のリクエスト",
  "その他",
];

const STAFF_KEYWORDS = [
  "担当者", "スタッフ", "人間", "繋い", "つない", "サポート", "直接", "電話", "メール", "連絡",
];

type Message = {
  id?: string;
  role: "bot" | "user" | "staff";
  content: string;
};

type Phase =
  | "topic"
  | "loading"
  | "chat"
  | "resolved"
  | "email"
  | "waiting"
  | "live";

export default function ChatWidget({ initialSessionId }: { initialSessionId?: string }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>(initialSessionId ? "live" : "topic");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [resolved, setResolved] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (initialSessionId) {
      setOpen(true);
      loadMessages(initialSessionId);
    }
  }, [initialSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!sessionId || phase !== "live") return;
    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const msg = payload.new as { role: string; content: string; id: string };
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, { id: msg.id, role: msg.role as Message["role"], content: msg.content }];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId, phase]);

  async function loadMessages(sid: string) {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, role, content")
      .eq("session_id", sid)
      .order("created_at");
    if (data) setMessages(data as Message[]);
    setPhase("live");
  }

  function addBotMsg(content: string) {
    setMessages((prev) => [...prev, { role: "bot", content }]);
  }

  function wantsStaff(text: string) {
    return STAFF_KEYWORDS.some((kw) => text.includes(kw));
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || sending) return;
    setInput("");

    // liveフェーズ（担当者チャット）
    if (phase === "live") {
      setMessages((prev) => [...prev, { role: "user", content }]);
      await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, topic: "担当者チャット", userMessage: content }),
      });
      return;
    }

    // 担当者希望の検出（どのフェーズでも）
    if (wantsStaff(content)) {
      setMessages((prev) => [...prev, { role: "user", content }]);
      setPhase("chat"); // topicボタンを消す
      addBotMsg("担当者へのご連絡を承ります。メールアドレスを入力してください。");
      setPhase("email");
      return;
    }

    // 通常のAI返答（topicボタンをすぐ消すためにphaseを先に変更）
    setMessages((prev) => [...prev, { role: "user", content }]);
    setPhase("chat");
    setSending(true);
    addBotMsg("少々お待ちください...");

    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, topic: "その他", userMessage: content }),
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.content !== "少々お待ちください...");
      return [...filtered, { role: "bot", content: data.reply }];
    });
    setPhase("chat");
    setResolved(null);
    setSending(false);
  }

  async function handleTopic(topic: string) {
    setMessages((prev) => [...prev, { role: "user", content: topic }]);
    setPhase("chat");
    setSending(true);
    addBotMsg("少々お待ちください...");

    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, topic, userMessage: topic }),
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.content !== "少々お待ちください...");
      return [...filtered, { role: "bot", content: data.reply }];
    });
    setPhase("chat");
    setResolved(null);
    setSending(false);
  }

  async function handleResolved(yes: boolean) {
    setResolved(yes);
    if (yes) {
      addBotMsg("お役に立てて良かったです！またいつでもご相談ください。");
      setPhase("resolved");
    } else {
      addBotMsg("解決しなかった場合は、引き続き質問するか、担当者に繋ぐこともできます。");
      setPhase("chat");
    }
  }

  async function handleRequestStaff() {
    addBotMsg("担当者へのご連絡を承ります。メールアドレスを入力してください。");
    setPhase("email");
  }

  async function handleEmailSubmit() {
    if (!email || !sessionId) return;
    setSending(true);
    await fetch("/api/chat/request-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userEmail: email }),
    });
    setSending(false);
    addBotMsg(`担当者への連絡を受け付けました。${email} にご連絡します。チャットを閉じても大丈夫です。`);
    setPhase("waiting");
  }

  const showTopicButtons = phase === "topic";
  const showResolvedButtons = phase === "chat" && resolved === null && messages.some((m) => m.role === "bot" && m.content !== "少々お待ちください...");
  const showStaffButton = phase === "chat";
  const showEmailInput = phase === "email";
  const showInput = phase !== "email" && phase !== "waiting" && phase !== "resolved";

  const primaryBtn: React.CSSProperties = {
    padding: "10px 20px",
    borderRadius: 20,
    border: "none",
    background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
    color: "white",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    width: "100%",
  };

  const outlineBtn = (color = "#9b6ed4"): React.CSSProperties => ({
    padding: "9px 14px",
    borderRadius: 20,
    border: `1.5px solid ${color}`,
    background: "white",
    color,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    textAlign: "left" as const,
    width: "100%",
  });

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(155,110,212,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
        aria-label="チャットを開く"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 92,
            right: 24,
            zIndex: 9998,
            width: 340,
            height: 520,
            background: "white",
            borderRadius: 20,
            boxShadow: "0 8px 32px rgba(155,110,212,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", padding: "14px 20px", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            toolio サポート
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && (
              <Bubble role="bot">こんにちは！どのようなことでお困りですか？</Bubble>
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>{m.content}</Bubble>
            ))}

            {/* 解決確認ボタン */}
            {showResolvedButtons && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>この回答で解決しましたか？</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...outlineBtn("#22c55e"), flex: 1 }} onClick={() => handleResolved(true)}>✅ はい</button>
                  <button style={{ ...outlineBtn("#f43f5e"), flex: 1 }} onClick={() => handleResolved(false)}>❌ いいえ</button>
                </div>
              </div>
            )}

            {/* 担当者ボタン */}
            {showStaffButton && resolved === false && (
              <button style={outlineBtn("#7a50b0")} onClick={handleRequestStaff}>
                👤 担当者に繋ぐ
              </button>
            )}

            {/* メール入力 */}
            {showEmailInput && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                  style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(200,170,240,0.5)", fontSize: 13, outline: "none" }}
                />
                <button style={primaryBtn} onClick={handleEmailSubmit} disabled={sending}>
                  {sending ? "送信中..." : "送信する"}
                </button>
              </div>
            )}

            {/* 最初に戻る */}
            {phase === "resolved" && (
              <button style={outlineBtn()} onClick={() => { setPhase("topic"); setMessages([]); setSessionId(null); setResolved(null); }}>
                最初に戻る
              </button>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Topic buttons (topicフェーズのみ) */}
          {showTopicButtons && (
            <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 6, borderTop: "0.5px solid rgba(200,170,240,0.15)", flexShrink: 0 }}>
              {TOPICS.map((t) => (
                <button key={t} style={outlineBtn()} onClick={() => handleTopic(t)}>{t}</button>
              ))}
            </div>
          )}

          {/* Input bar (LINE風・常時表示) */}
          {showInput && (
            <div style={{ padding: "10px 12px", borderTop: "0.5px solid rgba(200,170,240,0.2)", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0, background: "white" }}>
              <textarea
                ref={inputRef}
                rows={1}
                placeholder={phase === "live" ? "メッセージを入力..." : "自由に質問できます..."}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                    if (inputRef.current) inputRef.current.style.height = "auto";
                  }
                }}
                style={{
                  flex: 1,
                  padding: "9px 13px",
                  borderRadius: 20,
                  border: "1px solid rgba(200,170,240,0.5)",
                  fontSize: 13,
                  resize: "none",
                  outline: "none",
                  lineHeight: 1.5,
                  overflow: "hidden",
                  maxHeight: 96,
                }}
              />
              <button
                onClick={() => { handleSend(); if (inputRef.current) inputRef.current.style.height = "auto"; }}
                disabled={!input.trim() || sending}
                style={{
                  padding: "9px 16px",
                  borderRadius: 20,
                  border: "none",
                  background: input.trim() ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "#e5e5e5",
                  color: input.trim() ? "white" : "#bbb",
                  cursor: input.trim() ? "pointer" : "default",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                送信
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Bubble({ role, children }: { role: Message["role"]; children: React.ReactNode }) {
  const isUser = role === "user";
  const isStaff = role === "staff";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: "82%",
          padding: "9px 13px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser
            ? "linear-gradient(135deg,#f4b9b9,#e49bfd)"
            : isStaff
            ? "#f0f7ff"
            : "#f5f0ff",
          color: isUser ? "white" : "#333",
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {isStaff && <span style={{ fontSize: 11, color: "#7a9fd4", fontWeight: 700, display: "block", marginBottom: 2 }}>担当者</span>}
        {children}
      </div>
    </div>
  );
}
