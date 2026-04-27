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

export default function ChatWidget({ initialSessionId, mode = "widget", locale }: { initialSessionId?: string; mode?: "widget" | "page"; locale?: string }) {
  const isPage = mode === "page";
  const [open, setOpen] = useState(isPage || !!initialSessionId);
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

  const SESSION_KEY = "chat_session_id";
  const MESSAGES_KEY = "chat_messages";
  const PHASE_KEY = "chat_phase";

  function setCookie(value: string) {
    document.cookie = `${SESSION_KEY}=${encodeURIComponent(value)}; max-age=${30 * 86400}; path=/`;
  }
  function getCookie(): string | null {
    const m = document.cookie.match(/(?:^|; )chat_session_id=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function deleteCookie() {
    document.cookie = `${SESSION_KEY}=; max-age=0; path=/`;
  }

  async function init() {
    setPhase("loading");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user ?? null);

      // メール通知リンク経由（ログイン不要で履歴を読み込む）
      if (initialSessionId) {
        await loadMessages(initialSessionId);
        return;
      }

      if (!user) { setPhase("requireLogin"); return; }

      const savedSessionId = getCookie();
      const savedMessages = localStorage.getItem(MESSAGES_KEY);
      const savedPhase = localStorage.getItem(PHASE_KEY) as Phase | null;

      if (savedSessionId) {
        await loadMessages(savedSessionId);
        return;
      }

      setPhase("topic");
    } catch {
      setPhase("topic");
    }
  }

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (sessionId) setCookie(sessionId);
  }, [sessionId]);

  useEffect(() => {
    const saveablePhases: Phase[] = ["ai", "retry", "staffConfirm", "waiting", "live", "done", "materialRequest"];
    if (messages.length > 0 && saveablePhases.includes(phase)) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
      localStorage.setItem(PHASE_KEY, phase);
    }
  }, [messages, phase]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase, open]);

  // sessionIdがある間は常にポーリング（どのフェーズでも担当者メッセージ・他端末からのメッセージを反映）
  const seenStaffIdsRef = useRef<Set<string>>(new Set());
  const seenUserIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!sessionId || phase === "loading" || phase === "done") return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/session?sessionId=${sessionId}`);
        if (!res.ok) return;
        const json = await res.json();
        const { status, messages: fetched } = json as { status: string; messages: Message[] };

        const newStaff = (fetched as Message[]).filter(
          (m) => m.role === "staff" && m.id && !seenStaffIdsRef.current.has(m.id)
        );
        const newUser = (fetched as Message[]).filter(
          (m) => m.role === "user" && m.id && !seenUserIdsRef.current.has(m.id)
        );

        if (newStaff.length > 0) {
          newStaff.forEach((m) => m.id && seenStaffIdsRef.current.add(m.id));
          setPhase((cur) => cur === "waiting" ? "live" : cur);
          setMessages((prev) => {
            const withSeparator = prev.some((m) => m.role === "separator")
              ? prev
              : [...prev, { role: "separator" as const, content: "ここから担当者との会話" }];
            return [...withSeparator, ...newStaff];
          });
        }

        if (newUser.length > 0) {
          newUser.forEach((m) => m.id && seenUserIdsRef.current.add(m.id));
          setMessages((prev) => {
            let updated = [...prev];
            for (const m of newUser) {
              const existingIdx = updated.findIndex((p) => !p.id && p.role === "user" && p.content === m.content);
              if (existingIdx >= 0) {
                // 楽観的追加済みメッセージをDB版（id付き）で置き換え
                updated[existingIdx] = m;
              } else if (!updated.some((p) => p.id === m.id)) {
                // 別端末から送られた新規メッセージを追加
                updated = [...updated, m];
              }
            }
            return updated;
          });
        }

        if (status === "done") setPhase("done");
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(timer);
  }, [sessionId, phase]);

  async function loadMessages(sid: string) {
    try {
      const res = await fetch(`/api/chat/session?sessionId=${sid}`);
      if (!res.ok) {
        deleteCookie();
        localStorage.removeItem(MESSAGES_KEY);
        localStorage.removeItem(PHASE_KEY);
        setPhase("topic");
        return;
      }
      const json = await res.json();
      const { status, messages: data } = json;
      // メッセージなし → トピック選択
      if (!data || data.length === 0) {
        deleteCookie();
        localStorage.removeItem(MESSAGES_KEY);
        localStorage.removeItem(PHASE_KEY);
        setPhase("topic");
        return;
      }

      // 有効なセッションのみsessionIdをセット（CookieとlocalStorageに保存される）
      setSessionId(sid);

      // 既存メッセージのIDをseenに登録してポーリングによる重複追加を防ぐ
      (data as Message[]).forEach((m) => {
        if (m.id && m.role === "staff") seenStaffIdsRef.current.add(m.id);
        if (m.id && m.role === "user") seenUserIdsRef.current.add(m.id);
      });

      const hasStaff = data.some((m: Message) => m.role === "staff");
      if (hasStaff) {
        const firstStaffIdx = data.findIndex((m: Message) => m.role === "staff");
        const withSeparator = [
          ...data.slice(0, firstStaffIdx),
          { role: "separator" as const, content: "ここから担当者との会話" },
          ...data.slice(firstStaffIdx),
        ];
        setMessages(withSeparator as Message[]);
      } else {
        setMessages(data as Message[]);
      }

      if (status === "done") setPhase("done");
      else if (status === "waiting") setPhase("waiting");
      else if (status === "active") setPhase("live");
      else setPhase("ai");
    } catch {
      deleteCookie();
      setPhase("topic");
    }
  }

  function botMsg(content: string, save = false, sid?: string) {
    setMessages((prev) => [...prev, { role: "bot", content }]);
    const targetId = sid ?? sessionId;
    if (save && targetId) {
      fetch("/api/chat/bot-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: targetId, content }),
      });
    }
  }

  function saveUserMsg(content: string, sid?: string) {
    const targetId = sid ?? sessionId;
    if (!targetId) return;
    fetch("/api/chat/bot-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: targetId, content, role: "user" }),
    });
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

  async function saveTopicMessage(topic: string, botReply: string) {
    if (sessionId) {
      saveUserMsg(topic);
      botMsg(botReply, true);
    } else {
      // セッション未作成 → create-sessionでユーザーメッセージ保存
      const res = await fetch("/api/chat/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, userMessage: topic, userId: authUser?.id, userEmail: authUser?.email }),
      });
      const d = await res.json();
      if (d.sessionId) {
        setSessionId(d.sessionId);
        // botの質問プロンプトも保存
        await fetch("/api/chat/bot-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: d.sessionId, content: botReply }),
        });
      }
      botMsg(botReply);
    }
  }

  async function handleTopic(topic: string) {
    if (topic === "教材のリクエスト") {
      setMessages((prev) => [...prev, { role: "user", content: topic }]);
      await saveTopicMessage(topic, "どのような教材をご希望ですか？内容を入力してください。");
      setPhase("materialRequest");
      return;
    }
    if (topic === "その他") {
      setMessages((prev) => [...prev, { role: "user", content: topic }]);
      await saveTopicMessage(topic, "どのようなことでしょうか？下の入力欄に自由にご記入ください。");
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

    if (phase === "live") {
      setMessages((prev) => [...prev, { role: "user", content }]);
      const res = await fetch("/api/chat/live-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userMessage: content }),
      });
      const data = await res.json();
      if (data.id) seenUserIdsRef.current.add(data.id);
      return;
    }

    if (phase === "waiting") {
      setMessages((prev) => [...prev, { role: "user", content }]);
      setLoading(true);
      setMessages((prev) => [...prev, { role: "bot", content: "少々お待ちください..." }]);
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, topic: "その他", userMessage: content, userId: authUser?.id, userEmail: authUser?.email }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev.filter((m) => m.content !== "少々お待ちください..."),
        { role: "bot", content: data.reply },
      ]);
      setLoading(false);
      return;
    }

    if (STAFF_KEYWORDS.some((kw) => content.includes(kw))) {
      setMessages((prev) => [...prev, { role: "user", content }]);
      if (!sessionId) {
        // セッション未作成の場合、OpenAIなしでセッションとユーザーメッセージだけ保存
        fetch("/api/chat/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: "担当者リクエスト", userMessage: content, userId: authUser?.id, userEmail: authUser?.email }),
        }).then((r) => r.json()).then((d) => { if (d.sessionId) setSessionId(d.sessionId); });
      } else {
        saveUserMsg(content);
      }
      botMsg("現在大変混み合っております。担当者に繋がりしだいメールにてご連絡いたします。", true);
      setPhase("staffConfirm");
      return;
    }

    setAiReplied(false);
    await askAI("その他", content, true);
  }

  async function handleMaterialSend() {
    const content = input.trim();
    if (!content || loading) return;
    setLoading(true);

    const res = await fetch("/api/chat/message", {
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
    const data = await res.json();
    if (data.sessionId) setSessionId(data.sessionId);

    setMessages((prev) => [...prev, { role: "user", content }]);
    botMsg(data.reply);
    setPhase("done");
    clearInput();
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
    botMsg(data.confirmMsg ?? "担当者からご連絡します。チャットを閉じても大丈夫です。");
    setPhase("waiting");
  }

  function reset(clearStorage = false) {
    if (clearStorage) {
      deleteCookie();
      localStorage.removeItem(MESSAGES_KEY);
      localStorage.removeItem(PHASE_KEY);
    }
    seenStaffIdsRef.current = new Set();
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

  const chatPanel = (
    <div style={isPage
      ? { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", fontFamily: "'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif" }
      : { position: "fixed", bottom: 92, right: 24, zIndex: 9998, width: 340, height: 520, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(155,110,212,0.25)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif" }
    }>

          {isPage && (
            <div style={{ padding: "16px 16px 0" }}>
              <a href={`/${locale ?? "ja"}`} style={{ color: "#9b6ed4", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>← トップへ</a>
            </div>
          )}
          <div style={{ background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", padding: "12px 16px", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0, display: "flex", alignItems: "center", gap: 10, marginTop: isPage ? 12 : 0, borderRadius: isPage ? 12 : 0 }}>
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
                <Bubble role="bot">こんにちは！どのようなことでお困りですか？</Bubble>

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
                        saveUserMsg("✅ はい（解決しました）");
                        botMsg("お役に立てて良かったです！またいつでもご相談ください。", true);
                        setAiReplied(false);
                        setPhase("done");
                      }}>✅ はい</button>
                      <button style={{ ...outlineBtn("#f43f5e"), flex: 1 }} onClick={() => {
                        saveUserMsg("❌ いいえ（解決しませんでした）");
                        botMsg("別のカテゴリで再度お調べするか、担当者にお繋ぎすることもできます。", true);
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
                      saveUserMsg("💬 AIチャットに戻る");
                      botMsg("AIチャットに戻ります。他にご質問があればどうぞ。", true);
                      setPhase("retry");
                    }}>💬 AIチャットに戻る</button>
                  </div>
                )}

                {phase === "waiting" && (
                  <>
                    <style>{`@keyframes toolio-pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12, background: "#f5f0ff", border: "1.5px solid #c4a0f5", animation: "toolio-pulse 2s ease-in-out infinite" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#9b6ed4", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#7a50b0", fontWeight: 600 }}>担当者への接続を予約済み — 引き続き質問できます</span>
                    </div>
                  </>
                )}

                {phase === "retry" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {TOPICS.map((t) => (
                      <button key={t} style={outlineBtn()} onClick={() => handleTopic(t)}>{t}</button>
                    ))}
                    <button style={outlineBtn("#7a50b0")} onClick={() => {
                      saveUserMsg("👤 担当者に繋ぐ");
                      botMsg("現在大変混み合っております。担当者に繋がりしだいメールにてご連絡いたします。", true);
                      setPhase("staffConfirm");
                    }}>👤 担当者に繋ぐ</button>
                  </div>
                )}

                {phase === "done" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {isPage ? (
                      <a href={`/${locale ?? "ja"}`} style={{ display: "block", padding: "10px 0", borderRadius: 20, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, fontSize: 13, textAlign: "center", textDecoration: "none" }}>トップへ戻る</a>
                    ) : (
                      <>
                        <button style={{ padding: "10px 0", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }} onClick={() => { reset(true); setOpen(false); }}>チャットを閉じる</button>
                        <button style={{ ...outlineBtn("#bbb"), textAlign: "center" as const }} onClick={() => reset(true)}>新しい質問をする</button>
                      </>
                    )}
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
  );

  if (isPage) {
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
        <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fce8f8,#ede8ff,#e8f0ff)", padding: "16px", display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", flex: 1, display: "flex", flexDirection: "column", background: "white", borderRadius: 20, boxShadow: "0 4px 20px rgba(155,110,212,0.12)", overflow: "hidden" }}>
            {chatPanel}
          </div>
        </div>
      </>
    );
  }

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
      {open && chatPanel}
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
