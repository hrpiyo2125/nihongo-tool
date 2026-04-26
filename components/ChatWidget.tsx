"use client";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AuthModal from "@/components/AuthModal";

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
  role: "bot" | "user" | "staff" | "separator";
  content: string;
};

type Phase = "loading" | "requireLogin" | "topic" | "ai" | "retry" | "materialRequest" | "staffConfirm" | "waiting" | "done" | "live";

export default function ChatWidget({ initialSessionId }: { initialSessionId?: string }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiReplied, setAiReplied] = useState(false);
  const [fromFreeText, setFromFreeText] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  // 初期化：ログイン確認 → アクティブセッション検索
  async function init() {
    setPhase("loading");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPhase("requireLogin"); return; }
      setAuthUser(user);

      const sid = initialSessionId ?? null;
      if (sid) {
        setSessionId(sid);
        await loadMessages(sid);
        return;
      }

      // user_idでwaitingまたはactiveなセッションを検索
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("id, status")
        .eq("user_id", user.id)
        .or("status.eq.waiting,status.eq.active")
        .order("created_at", { ascending: false })
        .limit(1);

      if (sessions?.[0]) {
        setSessionId(sessions[0].id);
        await loadMessages(sessions[0].id);
      } else {
        setPhase("topic");
      }
    } catch {
      setPhase("topic");
    }
  }

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase, open]);

  // Realtime購読
  useEffect(() => {
    if (!sessionId || (phase !== "live" && phase !== "waiting" && phase !== "done")) return;
    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const msg = payload.new as { role: string; content: string; id: string };
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          if (msg.role === "staff") {
            setPhase((cur) => cur === "waiting" ? "live" : cur);
            const withSeparator = prev.some((m) => m.role === "separator")
              ? prev
              : [...prev, { role: "separator" as const, content: "ここから担当者との会話" }];
            return [...withSeparator, { id: msg.id, role: "staff", content: msg.content }];
          }
          return [...prev, { id: msg.id, role: msg.role as Message["role"], content: msg.content }];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId, phase]);

  // doneポーリング
  useEffect(() => {
    if (!sessionId || (phase !== "live" && phase !== "waiting")) return;
    const timer = setInterval(async () => {
      const { data } = await supabase.from("chat_sessions").select("status").eq("id", sessionId).single();
      if (data?.status === "done") setPhase("done");
    }, 5000);
    return () => clearInterval(timer);
  }, [sessionId, phase]);

  async function loadMessages(sid: string) {
    try {
      const { data: sess } = await supabase.from("chat_sessions").select("status").eq("id", sid).single();
      const { data } = await supabase.from("chat_messages").select("id, role, content").eq("session_id", sid).order("created_at");
      if (data) {
        const hasStaff = data.some((m) => m.role === "staff");
        if (hasStaff) {
          const firstStaffIdx = data.findIndex((m) => m.role === "staff");
          const withSeparator = [
            ...data.slice(0, firstStaffIdx),
            { role: "separator" as const, content: "ここから担当者との会話" },
            ...data.slice(firstStaffIdx),
          ];
          setMessages(withSeparator as Message[]);
        } else {
          setMessages(data as Message[]);
        }
      }
      const status = sess?.status;
      if (status === "done") setPhase("done");
      else if (status === "waiting") setPhase("waiting");
      else if (status === "active") setPhase("live");
      else setPhase("live");
    } catch {
      setPhase("topic");
    }
  }

  function botMsg(content: string) {
    setMessages((prev) => [...prev, { role: "bot", content }]);
  }

  function clearInput() {
    flushSync(() => setInput(""));
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
    }
  }

  async function askAI(topic: string, userMessage: string, isFreeText = false) {
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setPhase("ai");
    setAiReplied(false);
    setFromFreeText(isFreeText);
    setLoading(true);
    botMsg("少々お待ちください...");

    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        topic,
        userMessage,
        userId: authUser?.id,
        userEmail: authUser?.email,
      }),
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    setMessages((prev) => [
      ...prev.filter((m) => m.content !== "少々お待ちください..."),
      { role: "bot", content: data.reply },
    ]);
    setLoading(false);
    setTimeout(() => setAiReplied(true), 1500);
  }

  async function handleTopic(topic: string) {
    if (topic === "教材のリクエスト") {
      setMessages((prev) => [...prev, { role: "user", content: topic }]);
      botMsg("どのような教材をご希望ですか？内容を入力してください。");
      setPhase("materialRequest");
      return;
    }
    if (topic === "その他") {
      setMessages((prev) => [...prev, { role: "user", content: topic }]);
      botMsg("どのようなことでしょうか？下の入力欄に自由にご記入ください。");
      setPhase("ai");
      return;
    }
    await askAI(topic, topic, false);
  }

  const STAFF_KEYWORDS = ["担当者", "人と話したい", "スタッフ", "オペレーター", "直接話", "電話", "人に聞きたい", "人に相談", "サポート担当", "担当に"];

  async function handleSend() {
    const content = input.trim();
    if (!content || loading) return;
    clearInput();

    if (phase === "live" || phase === "waiting") {
      await fetch("/api/chat/live-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userMessage: content }),
      });
      return;
    }

    if (STAFF_KEYWORDS.some((kw) => content.includes(kw))) {
      setMessages((prev) => [...prev, { role: "user", content }]);
      botMsg("現在大変混み合っております。担当者に繋がりしだいメールにてご連絡いたします。");
      setPhase("staffConfirm");
      return;
    }

    setAiReplied(false);
    await askAI("その他", content, true);
  }

  async function handleMaterialSend() {
    const content = input.trim();
    if (!content || loading) return;
    clearInput();
    setLoading(true);

    await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        topic: "教材のリクエスト",
        userMessage: content,
        userId: authUser?.id,
        userEmail: authUser?.email,
      }),
    });

    setMessages((prev) => [...prev, { role: "user", content }]);
    botMsg("リクエストありがとうございます！いただいた内容を参考に、今後の教材制作に活かしてまいります。引き続きtoolioをよろしくお願いします🌸");
    setPhase("done");
    setLoading(false);
  }

  // メール入力不要 - ログイン済みのemailを自動使用
  async function handleRequestStaff() {
    setLoading(true);
    const res = await fetch("/api/chat/request-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        userId: authUser?.id,
        userEmail: authUser?.email,
      }),
    });
    const data = await res.json();
    if (data.sessionId) setSessionId(data.sessionId);
    setLoading(false);
    botMsg(`${authUser?.email} に担当者からご連絡します。チャットを閉じても大丈夫です。`);
    setPhase("waiting");
  }

  function reset() {
    setPhase("topic");
    setMessages([]);
    setSessionId(null);
    clearInput();
    setAiReplied(false);
    setFromFreeText(false);
  }

  const outlineBtn = (color = "#9b6ed4"): React.CSSProperties => ({
    padding: "9px 14px", borderRadius: 20, border: `1.5px solid ${color}`,
    background: "white", color, cursor: "pointer", fontSize: 13,
    fontWeight: 600, textAlign: "left" as const, width: "100%",
  });

  const isInputActive = input.trim().length > 0 && !loading;

  return (
    <>
      {showAuthModal && (
        <AuthModal
          initialMode="login"
          reason="chat"
          onClose={() => setShowAuthModal(false)}
          onLoggedIn={() => { setShowAuthModal(false); init(); }}
        />
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="チャットを開く"
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(155,110,212,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            <path d="M8 10h8M8 14h5" strokeWidth="1.6"/>
          </svg>
        )}
      </button>

      {open && (
        <div style={{ position: "fixed", bottom: 92, right: 24, zIndex: 9998, width: 340, height: 520, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(155,110,212,0.25)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif" }}>

          <div style={{ background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", padding: "12px 16px", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/toolio_icon.png" alt="toolio" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>toolio サポート</div>
              <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.9, letterSpacing: 0.3 }}>お気軽にご相談ください</div>
            </div>
          </div>

          {/* メッセージエリア */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>

            {/* ローディング */}
            {phase === "loading" && (
              <p style={{ textAlign: "center", color: "#bbb", fontSize: 13, marginTop: 40 }}>読み込み中...</p>
            )}

            {/* ログイン未済 */}
            {phase === "requireLogin" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 40, padding: "0 8px" }}>
                <div style={{ fontSize: 32 }}>🔒</div>
                <p style={{ fontSize: 13, color: "#555", textAlign: "center", lineHeight: 1.7, margin: 0 }}>
                  チャットをご利用いただくには<br />ログイン・新規登録が必要です。
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{ padding: "10px 28px", borderRadius: 20, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
                >
                  ログイン / 新規登録
                </button>
              </div>
            )}

            {phase !== "loading" && phase !== "requireLogin" && (
              <>
                {messages.length === 0 && (
                  <Bubble role="bot">こんにちは！どのようなことでお困りですか？</Bubble>
                )}

                {messages.map((m, i) =>
                  m.role === "separator" ? (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#c4a0f5)" }} />
                      <span style={{ fontSize: 11, color: "#9b6ed4", fontWeight: 700, whiteSpace: "nowrap" }}>👤 {m.content}</span>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#c4a0f5,transparent)" }} />
                    </div>
                  ) : (
                    <Bubble key={i} role={m.role}>{m.content}</Bubble>
                  )
                )}

                {phase === "ai" && aiReplied && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>この回答で解決しましたか？</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ ...outlineBtn("#22c55e"), flex: 1 }} onClick={() => {
                        botMsg("お役に立てて良かったです！またいつでもご相談ください。");
                        setAiReplied(false);
                        setPhase("done");
                      }}>✅ はい</button>
                      <button style={{ ...outlineBtn("#f43f5e"), flex: 1 }} onClick={() => {
                        botMsg("別のカテゴリで再度お調べするか、担当者にお繋ぎすることもできます。");
                        setAiReplied(false);
                        setPhase("retry");
                      }}>❌ いいえ</button>
                    </div>
                  </div>
                )}

                {phase === "staffConfirm" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button style={outlineBtn("#7a50b0")} onClick={handleRequestStaff} disabled={loading}>
                      {loading ? "送信中..." : "📧 担当者とのチャットを希望する"}
                    </button>
                    <button style={outlineBtn("#9b6ed4")} onClick={() => {
                      botMsg("AIチャットに戻ります。他にご質問があればどうぞ。");
                      setPhase("retry");
                    }}>💬 AIチャットに戻る</button>
                  </div>
                )}

                {phase === "retry" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {TOPICS.map((t) => (
                      <button key={t} style={outlineBtn()} onClick={() => handleTopic(t)}>{t}</button>
                    ))}
                    <button style={outlineBtn("#7a50b0")} onClick={() => {
                      botMsg("現在大変混み合っております。担当者に繋がりしだいメールにてご連絡いたします。");
                      setPhase("staffConfirm");
                    }}>👤 担当者に繋ぐ</button>
                  </div>
                )}

                {phase === "done" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button style={{ padding: "10px 0", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }} onClick={() => { reset(); setOpen(false); }}>チャットを閉じる</button>
                    <button style={{ ...outlineBtn("#bbb"), textAlign: "center" as const }} onClick={reset}>新しい質問をする</button>
                  </div>
                )}
              </>
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

          {/* 入力バー */}
          {(phase === "topic" || phase === "ai" || phase === "retry" || phase === "waiting" || phase === "live") && (
            <div style={{ padding: "10px 12px", borderTop: "0.5px solid rgba(200,170,240,0.2)", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0, background: "white" }}>
              <textarea
                ref={inputRef}
                rows={1}
                placeholder={phase === "live" || phase === "waiting" ? "メッセージを入力..." : "自由に質問できます..."}
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
                disabled={!isInputActive}
                style={{ padding: "9px 16px", borderRadius: 20, border: "none", background: isInputActive ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "#e5e5e5", color: isInputActive ? "white" : "#bbb", cursor: isInputActive ? "pointer" : "default", fontSize: 13, fontWeight: 700, flexShrink: 0, transition: "background 0.2s" }}
              >
                送信
              </button>
            </div>
          )}

          {/* 教材リクエスト専用フォーム */}
          {phase === "materialRequest" && (
            <div style={{ padding: "12px 14px", borderTop: "0.5px solid rgba(200,170,240,0.2)", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, background: "#fdf8ff" }}>
              <p style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, margin: 0 }}>📝 リクエスト内容を記入してください</p>
              <textarea
                rows={3}
                placeholder="例：ひらがな練習プリント（年長向け）"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ padding: "10px 13px", borderRadius: 12, border: "1.5px solid rgba(155,110,212,0.4)", fontSize: 13, resize: "none", outline: "none", lineHeight: 1.6, background: "white" }}
              />
              <button
                onClick={handleMaterialSend}
                disabled={!input.trim() || loading}
                style={{ padding: "10px 0", borderRadius: 20, border: "none", background: input.trim() ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "#e5e5e5", color: input.trim() ? "white" : "#bbb", cursor: input.trim() ? "pointer" : "default", fontSize: 13, fontWeight: 700, transition: "background 0.2s" }}
              >
                {loading ? "送信中..." : "送信する"}
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
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6 }}>
      {!isUser && (isStaff ? (
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#a3c0ff,#7aadff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/toolio_icon.png" alt="toolio" style={{ width: 26, height: 26, borderRadius: 8, objectFit: "cover", flexShrink: 0, marginBottom: 2 }} />
      ))}
      <div style={{
        maxWidth: "78%", padding: "9px 13px",
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
