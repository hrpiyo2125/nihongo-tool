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

// フロー:
// topic → (ボタン/自由入力) → ai → (はい) → done
//                                 → (いいえ) → retry → (ボタン/自由入力) → ai
//                                                    → (担当者に繋ぐ) → email → waiting
// topic → (教材リクエスト) → materialRequest → done
// live: 担当者とのリアルタイムチャット
type Phase = "topic" | "ai" | "retry" | "materialRequest" | "email" | "waiting" | "done" | "live";

export default function ChatWidget({ initialSessionId }: { initialSessionId?: string }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>(initialSessionId ? "live" : "topic");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (initialSessionId) { setOpen(true); loadMessages(initialSessionId); }
  }, [initialSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  // Realtimeサブスクリプション（liveフェーズのみ）
  useEffect(() => {
    if (!sessionId || phase !== "live") return;
    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const msg = payload.new as { role: string; content: string; id: string };
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, { id: msg.id, role: msg.role as Message["role"], content: msg.content }]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId, phase]);

  async function loadMessages(sid: string) {
    const { data } = await supabase.from("chat_messages").select("id, role, content").eq("session_id", sid).order("created_at");
    if (data) setMessages(data as Message[]);
    setPhase("live");
  }

  function botMsg(content: string) {
    setMessages((prev) => [...prev, { role: "bot", content }]);
  }

  // トピックボタンを押したとき
  async function handleTopic(topic: string) {
    if (topic === "教材のリクエスト") {
      setMessages((prev) => [...prev, { role: "user", content: topic }]);
      botMsg("どのような教材をご希望ですか？内容を自由にご入力ください。");
      setPhase("materialRequest");
      return;
    }
    await askAI(topic, topic);
  }

  // AI問い合わせ共通処理
  async function askAI(topic: string, userMessage: string) {
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setPhase("ai");
    setLoading(true);
    botMsg("少々お待ちください...");

    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, topic, userMessage }),
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    setMessages((prev) => [...prev.filter((m) => m.content !== "少々お待ちください..."), { role: "bot", content: data.reply }]);
    setLoading(false);
  }

  // 自由入力の送信
  async function handleSend() {
    const content = input.trim();
    if (!content || loading) return;
    setInput("");
    resetInputHeight();

    if (phase === "live") {
      setMessages((prev) => [...prev, { role: "user", content }]);
      await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, topic: "担当者チャット", userMessage: content }),
      });
      return;
    }

    await askAI("その他", content);
  }

  // 教材リクエスト送信
  async function handleMaterialSend() {
    const content = input.trim();
    if (!content || loading) return;
    setInput("");
    resetInputHeight();
    setMessages((prev) => [...prev, { role: "user", content }]);
    setLoading(true);

    await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, topic: "教材のリクエスト", userMessage: content }),
    });

    botMsg("リクエストありがとうございます！いただいた内容を参考に、今後の教材制作に活かしてまいります。引き続きtoolioをよろしくお願いします🌸");
    setPhase("done");
    setLoading(false);
  }

  // メール送信
  async function handleEmailSubmit() {
    if (!email || !sessionId) return;
    setLoading(true);
    await fetch("/api/chat/request-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userEmail: email }),
    });
    setLoading(false);
    botMsg(`ありがとうございます。${email} に担当者からご連絡します。チャットを閉じても大丈夫です。`);
    setPhase("waiting");
  }

  function resetInputHeight() {
    if (inputRef.current) inputRef.current.style.height = "auto";
  }

  function reset() {
    setPhase("topic");
    setMessages([]);
    setSessionId(null);
    setEmail("");
    setInput("");
  }

  // スタイル
  const outlineBtn = (color = "#9b6ed4"): React.CSSProperties => ({
    padding: "9px 14px", borderRadius: 20, border: `1.5px solid ${color}`,
    background: "white", color, cursor: "pointer", fontSize: 13,
    fontWeight: 600, textAlign: "left" as const, width: "100%",
  });

  const sendBtn = (active: boolean): React.CSSProperties => ({
    padding: "9px 16px", borderRadius: 20, border: "none",
    background: active ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "#e5e5e5",
    color: active ? "white" : "#bbb", cursor: active ? "pointer" : "default",
    fontSize: 13, fontWeight: 700, flexShrink: 0, transition: "background 0.2s",
  });

  const inputBar = (
    placeholder: string,
    onSend: () => void,
  ) => (
    <div style={{ padding: "10px 12px", borderTop: "0.5px solid rgba(200,170,240,0.2)", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0, background: "white" }}>
      <textarea
        ref={inputRef}
        rows={1}
        placeholder={placeholder}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
        }}
        style={{ flex: 1, padding: "9px 13px", borderRadius: 20, border: "1px solid rgba(200,170,240,0.5)", fontSize: 13, resize: "none", outline: "none", lineHeight: 1.5, overflow: "hidden", maxHeight: 96 }}
      />
      <button onClick={onSend} disabled={!input.trim() || loading} style={sendBtn(!!input.trim() && !loading)}>
        送信
      </button>
    </div>
  );

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="チャットを開く"
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(155,110,212,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* チャットウィンドウ */}
      {open && (
        <div style={{ position: "fixed", bottom: 92, right: 24, zIndex: 9998, width: 340, height: 520, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(155,110,212,0.25)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif" }}>

          {/* ヘッダー */}
          <div style={{ background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", padding: "14px 20px", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            toolio サポート
          </div>

          {/* メッセージエリア */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>

            {/* 最初の挨拶 */}
            {messages.length === 0 && (
              <Bubble role="bot">こんにちは！どのようなことでお困りですか？</Bubble>
            )}

            {messages.map((m, i) => <Bubble key={i} role={m.role}>{m.content}</Bubble>)}

            {/* aiフェーズ: 解決確認 */}
            {phase === "ai" && !loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>この回答で解決しましたか？</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...outlineBtn("#22c55e"), flex: 1 }} onClick={() => {
                    botMsg("お役に立てて良かったです！またいつでもご相談ください。");
                    setPhase("done");
                  }}>✅ はい</button>
                  <button style={{ ...outlineBtn("#f43f5e"), flex: 1 }} onClick={() => {
                    botMsg("別のカテゴリで再度お調べするか、担当者にお繋ぎすることもできます。");
                    setPhase("retry");
                  }}>❌ いいえ</button>
                </div>
              </div>
            )}

            {/* retryフェーズ: カテゴリ再選択 + 担当者ボタン */}
            {phase === "retry" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {TOPICS.map((t) => (
                  <button key={t} style={outlineBtn()} onClick={() => handleTopic(t)}>{t}</button>
                ))}
                <button style={outlineBtn("#7a50b0")} onClick={() => {
                  botMsg("メールアドレスを入力してください。担当者からご連絡します。");
                  setPhase("email");
                }}>👤 担当者に繋ぐ</button>
              </div>
            )}

            {/* emailフェーズ: メール入力 */}
            {phase === "email" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                  style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(200,170,240,0.5)", fontSize: 13, outline: "none" }}
                />
                <button
                  onClick={handleEmailSubmit}
                  disabled={!email || loading}
                  style={{ padding: "10px 20px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
                >
                  {loading ? "送信中..." : "送信する"}
                </button>
              </div>
            )}

            {/* doneフェーズ: 最初に戻る */}
            {phase === "done" && (
              <button style={outlineBtn()} onClick={reset}>最初に戻る</button>
            )}

            <div ref={bottomRef} />
          </div>

          {/* topicフェーズ: カテゴリボタン */}
          {phase === "topic" && (
            <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 6, borderTop: "0.5px solid rgba(200,170,240,0.15)", flexShrink: 0 }}>
              {TOPICS.map((t) => (
                <button key={t} style={outlineBtn()} onClick={() => handleTopic(t)}>{t}</button>
              ))}
            </div>
          )}

          {/* 入力バー: topic/ai/liveフェーズで表示 */}
          {(phase === "topic" || phase === "ai" || phase === "live") && inputBar(
            phase === "live" ? "メッセージを入力..." : "自由に質問できます...",
            handleSend,
          )}

          {/* 教材リクエスト入力バー */}
          {phase === "materialRequest" && inputBar("リクエスト内容を入力...", handleMaterialSend)}
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
      <div style={{
        maxWidth: "82%", padding: "9px 13px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : isStaff ? "#f0f7ff" : "#f5f0ff",
        color: isUser ? "white" : "#333", fontSize: 13, lineHeight: 1.6,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {isStaff && <span style={{ fontSize: 11, color: "#7a9fd4", fontWeight: 700, display: "block", marginBottom: 2 }}>担当者</span>}
        {children}
      </div>
    </div>
  );
}
