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

type Message = {
  id?: string;
  role: "bot" | "user" | "staff";
  content: string;
};

type Phase =
  | "closed"
  | "topic"
  | "freeInput"
  | "loading"
  | "replied"
  | "resolved"
  | "retry"
  | "email"
  | "waiting"
  | "live";

export default function ChatWidget({ initialSessionId }: { initialSessionId?: string }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>(initialSessionId ? "live" : "topic");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [email, setEmail] = useState("");
  const [liveInput, setLiveInput] = useState("");
  const [freeInput, setFreeInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
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

  async function handleTopic(topic: string) {
    if (topic === "その他") {
      setMessages([{ role: "user", content: topic }]);
      addBotMsg("どのようなことでしょうか？自由にご入力ください。");
      setPhase("freeInput");
      return;
    }
    await sendMessage(topic, topic);
  }

  async function handleFreeInputSend() {
    if (!freeInput.trim()) return;
    const content = freeInput.trim();
    setFreeInput("");
    await sendMessage("その他", content, [
      { role: "user", content: "その他" },
      { role: "bot", content: "どのようなことでしょうか？自由にご入力ください。" },
      { role: "user", content },
    ]);
  }

  async function sendMessage(topic: string, userMessage: string, initialMessages?: Message[]) {
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages(initialMessages ?? [userMsg]);
    setPhase("loading");
    if (!initialMessages) addBotMsg("少々お待ちください...");

    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, topic, userMessage }),
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.content !== "少々お待ちください...");
      if (initialMessages) {
        return [...filtered, { role: "bot", content: data.reply }];
      }
      return [userMsg, { role: "bot", content: data.reply }];
    });
    setPhase("replied");
  }

  async function handleResolved(yes: boolean) {
    if (yes) {
      addBotMsg("お役に立てて良かったです！またいつでもご相談ください。");
      setPhase("resolved");
    } else {
      setPhase("retry");
    }
  }

  async function handleRetryTopic(topic: string) {
    if (topic === "その他") {
      setMessages((prev) => [...prev, { role: "user", content: topic }]);
      addBotMsg("どのようなことでしょうか？自由にご入力ください。");
      setPhase("freeInput");
      return;
    }
    setMessages((prev) => [...prev, { role: "user", content: topic }]);
    setPhase("loading");
    addBotMsg("少々お待ちください...");

    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, topic, userMessage: topic }),
    });
    const data = await res.json();
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.content !== "少々お待ちください...");
      return [...filtered, { role: "bot", content: data.reply }];
    });
    setPhase("replied");
  }

  async function handleRequestStaff() {
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

  async function handleLiveSend() {
    if (!liveInput.trim() || !sessionId) return;
    const content = liveInput.trim();
    setLiveInput("");
    setMessages((prev) => [...prev, { role: "user", content }]);
    await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, topic: "担当者チャット", userMessage: content }),
    });
  }

  const btnStyle = (color = "#9b6ed4"): React.CSSProperties => ({
    padding: "10px 16px",
    borderRadius: 20,
    border: `1.5px solid ${color}`,
    background: "white",
    color,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    textAlign: "left",
    width: "100%",
  });

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
            maxHeight: 520,
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
          <div
            style={{
              background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)",
              padding: "14px 20px",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            toolio サポート
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && phase === "topic" && (
              <Bubble role="bot">
                こんにちは！どのようなことでお困りですか？
              </Bubble>
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>{m.content}</Bubble>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Controls */}
          <div style={{ padding: "10px 14px 16px", display: "flex", flexDirection: "column", gap: 8, borderTop: "0.5px solid rgba(200,170,240,0.2)" }}>
            {phase === "topic" && (
              <>
                {TOPICS.map((t) => (
                  <button key={t} style={btnStyle()} onClick={() => handleTopic(t)}>{t}</button>
                ))}
              </>
            )}

            {phase === "freeInput" && (
              <>
                <textarea
                  rows={3}
                  placeholder="お困りの内容を自由にご入力ください..."
                  value={freeInput}
                  onChange={(e) => setFreeInput(e.target.value)}
                  style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(200,170,240,0.5)", fontSize: 13, resize: "none", outline: "none" }}
                />
                <button style={primaryBtn} onClick={handleFreeInputSend} disabled={!freeInput.trim()}>
                  送信する
                </button>
              </>
            )}

            {phase === "loading" && (
              <p style={{ color: "#bbb", fontSize: 12, textAlign: "center" }}>AIが回答を生成中です...</p>
            )}

            {phase === "replied" && (
              <>
                <p style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 2 }}>この回答で解決しましたか？</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...btnStyle("#22c55e"), flex: 1 }} onClick={() => handleResolved(true)}>✅ はい</button>
                  <button style={{ ...btnStyle("#f43f5e"), flex: 1 }} onClick={() => handleResolved(false)}>❌ いいえ</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input
                    type="text"
                    placeholder="追加で質問があればどうぞ..."
                    value={liveInput}
                    onChange={(e) => setLiveInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && liveInput.trim()) {
                        const content = liveInput.trim();
                        setLiveInput("");
                        setMessages((prev) => [...prev, { role: "user", content }]);
                        setPhase("loading");
                        const res = await fetch("/api/chat/message", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ sessionId, topic: "追加質問", userMessage: content }),
                        });
                        const data = await res.json();
                        setMessages((prev) => [...prev.filter(m => m.content !== "少々お待ちください..."), { role: "bot", content: data.reply }]);
                        setPhase("replied");
                      }
                    }}
                    style={{ flex: 1, padding: "9px 13px", borderRadius: 20, border: "1px solid rgba(200,170,240,0.4)", fontSize: 12, outline: "none" }}
                  />
                  <button
                    onClick={async () => {
                      if (!liveInput.trim()) return;
                      const content = liveInput.trim();
                      setLiveInput("");
                      setMessages((prev) => [...prev, { role: "user", content }]);
                      setPhase("loading");
                      const res = await fetch("/api/chat/message", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId, topic: "追加質問", userMessage: content }),
                      });
                      const data = await res.json();
                      setMessages((prev) => [...prev.filter(m => m.content !== "少々お待ちください..."), { role: "bot", content: data.reply }]);
                      setPhase("replied");
                    }}
                    style={{ padding: "9px 14px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                  >
                    送信
                  </button>
                </div>
              </>
            )}

            {phase === "retry" && (
              <>
                <p style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 2 }}>別のカテゴリを選ぶか、担当者に繋ぎます。</p>
                {TOPICS.map((t) => (
                  <button key={t} style={btnStyle()} onClick={() => handleRetryTopic(t)}>{t}</button>
                ))}
                <button style={{ ...btnStyle("#7a50b0"), marginTop: 4 }} onClick={handleRequestStaff}>
                  👤 担当者に繋ぐ
                </button>
              </>
            )}

            {phase === "email" && (
              <>
                <p style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>メールアドレスを入力してください。担当者からご連絡します。</p>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(200,170,240,0.5)",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <button style={primaryBtn} onClick={handleEmailSubmit} disabled={sending}>
                  {sending ? "送信中..." : "送信する"}
                </button>
              </>
            )}

            {phase === "waiting" && (
              <p style={{ fontSize: 12, color: "#888", textAlign: "center" }}>
                担当者からのメールをお待ちください。チャットを閉じても大丈夫です。
              </p>
            )}

            {phase === "live" && (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="メッセージを入力..."
                  value={liveInput}
                  onChange={(e) => setLiveInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLiveSend()}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 20,
                    border: "1px solid rgba(200,170,240,0.5)",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleLiveSend}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 20,
                    border: "none",
                    background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  送信
                </button>
              </div>
            )}

            {phase === "resolved" && (
              <button style={btnStyle()} onClick={() => { setPhase("topic"); setMessages([]); setSessionId(null); }}>
                最初に戻る
              </button>
            )}
          </div>
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
