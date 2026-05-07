"use client";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AuthModal from "@/components/AuthModal";
import { useIsMobile } from "@/app/[locale]/useIsMobile";

function IconLock({ size = 28, color = "#9b6ed4" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="3" ry="3"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
}
function IconCheck({ size = 14, color = "#22c55e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconX({ size = 14, color = "#f43f5e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function IconMail({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <polyline points="2,4 12,13 22,4"/>
    </svg>
  );
}
function IconChat({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}
function IconUser({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
function IconSparkle({ size = 13, color = "#9b6ed4" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
}
function IconAlert({ size = 16, color = "#c0392b" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconPencil({ size = 14, color = "#9b6ed4" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

const TOPICS = [
  "料金について",
  "プラン変更について",
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
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const isMobile = useIsMobile();
  const [aiReplied, setAiReplied] = useState(false);
  const [fromFreeText, setFromFreeText] = useState(false);
  const [staffTypingAt, setStaffTypingAt] = useState<string | null>(null);
  const [staffLastReadAt, setStaffLastReadAt] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionIdRef = useRef<string | null>(null);
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
    sessionIdRef.current = sessionId;
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
        const { status, messages: fetched, staffTypingAt: typingAt, staffLastReadAt: readAt } = json as { status: string; messages: Message[]; staffTypingAt?: string; staffLastReadAt?: string };
        if (typingAt !== undefined) setStaffTypingAt(typingAt ?? null);
        if (readAt !== undefined) setStaffLastReadAt(readAt ?? null);

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
      const { status, messages: data, staffLastReadAt: readAt } = json;
      if (readAt) setStaffLastReadAt(readAt);
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
        // セッション未作成の場合、await して sessionIdRef を確実に更新してから staffConfirm へ
        const r = await fetch("/api/chat/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: "担当者リクエスト", userMessage: content, userId: authUser?.id, userEmail: authUser?.email }),
        });
        const d = await r.json();
        if (d.sessionId) { sessionIdRef.current = d.sessionId; setSessionId(d.sessionId); }
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
    // fire-and-forget create-session が完了していない可能性があるため ref で最新値を取得
    const currentSessionId = sessionIdRef.current;
    const res = await fetch("/api/chat/request-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: currentSessionId,
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
      seenStaffIdsRef.current = new Set();
      seenUserIdsRef.current = new Set();
      setMessages([]);
    } else {
      // 履歴を残したまま新しい会話の区切り線を追加
      setMessages((prev) => prev.length > 0
        ? [...prev, { role: "separator" as const, content: "新しい会話" }]
        : []
      );
    }
    setPhase("topic");
    setSessionId(null);
    clearInput();
    setAiReplied(false);
    setFromFreeText(false);
    setShowCloseConfirm(false);
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
      : isMobile
        ? { position: "fixed", top: 16, bottom: 164, right: 16, left: 16, zIndex: 9998, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(155,110,212,0.25)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif" }
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
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>toolio サポート</div>
              <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.9, letterSpacing: 0.3 }}>お気軽にご相談ください</div>
            </div>
            <button
              onClick={() => reset(false)}
              style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 12, color: "white", fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}
            >新しい質問をする</button>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", background: "#f5f0ff" }}><IconLock size={28} color="#9b6ed4" /></div>
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

                {messages.map((m, i) => {
                  if (m.role === "separator") {
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#c4a0f5)" }} />
                        <span style={{ fontSize: 11, color: "#9b6ed4", fontWeight: 700, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>{m.content === "新しい会話" ? <IconSparkle size={11} color="#9b6ed4" /> : <IconUser size={11} color="#9b6ed4" />} {m.content}</span>
                        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#c4a0f5,transparent)" }} />
                      </div>
                    );
                  }
                  const isLastUserMsg = m.role === "user" && messages.slice(i + 1).every(n => n.role !== "user");
                  const isRead = isLastUserMsg && !!staffLastReadAt;
                  return (
                    <div key={i}>
                      <Bubble role={m.role}>{m.content}</Bubble>
                      {isRead && (
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
                          <span style={{ fontSize: 10, color: "#9b6ed4" }}>既読</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {(() => {
                  const isStaffTyping = phase === "live" && staffTypingAt
                    ? (Date.now() - new Date(staffTypingAt).getTime()) < 6000
                    : false;
                  const showDots = loading || isStaffTyping;
                  return showDots ? (
                    <>
                      <style>{`
                        @keyframes toolio-dot{0%,80%,100%{opacity:0.2;transform:scale(0.8)}40%{opacity:1;transform:scale(1)}}
                      `}</style>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 16, background: "#f5f0ff", alignSelf: "flex-start", maxWidth: "80%" }}>
                        {(phase === "live" || isStaffTyping) && <span style={{ fontSize: 11, color: "#7a50b0", marginRight: 2 }}>担当者が入力しています</span>}
                        {[0, 1, 2].map(i => (
                          <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#9b6ed4", display: "inline-block", animation: `toolio-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                        ))}
                      </div>
                    </>
                  ) : null;
                })()}

                {phase === "ai" && aiReplied && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>この回答で解決しましたか？</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ ...outlineBtn("#22c55e"), flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => {
                        saveUserMsg("はい（解決しました）");
                        botMsg("お役に立てて良かったです！またいつでもご相談ください。", true);
                        setAiReplied(false);
                        setPhase("done");
                      }}><IconCheck size={14} color="#22c55e" /> はい</button>
                      <button style={{ ...outlineBtn("#f43f5e"), flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => {
                        saveUserMsg("いいえ（解決しませんでした）");
                        botMsg("別のカテゴリで再度お調べするか、担当者にお繋ぎすることもできます。", true);
                        setAiReplied(false);
                        setPhase("retry");
                      }}><IconX size={14} color="#f43f5e" /> いいえ</button>
                    </div>
                  </div>
                )}

                {phase === "staffConfirm" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button style={{ ...outlineBtn("#7a50b0"), display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={handleRequestStaff} disabled={loading}>
                      {loading ? "送信中..." : <><IconMail size={14} color="#7a50b0" /> 担当者とのチャットを希望する</>}
                    </button>
                    <button style={{ ...outlineBtn("#9b6ed4"), display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => {
                      saveUserMsg("AIチャットに戻る");
                      botMsg("AIチャットに戻ります。他にご質問があればどうぞ。", true);
                      setPhase("retry");
                    }}><IconChat size={14} color="#9b6ed4" /> AIチャットに戻る</button>
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
                    <button style={{ ...outlineBtn("#7a50b0"), display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => {
                      saveUserMsg("担当者に繋ぐ");
                      botMsg("現在大変混み合っております。担当者に繋がりしだいメールにてご連絡いたします。", true);
                      setPhase("staffConfirm");
                    }}><IconUser size={14} color="#7a50b0" /> 担当者に繋ぐ</button>
                  </div>
                )}

                {phase === "done" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", margin: "4px 0 0" }}>このチャットは終了しました。<br />※ チャット履歴は30日間保持されます。</p>
                    {isPage ? (
                      <a href={`/${locale ?? "ja"}`} style={{ display: "block", padding: "10px 0", borderRadius: 20, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, fontSize: 13, textAlign: "center", textDecoration: "none" }}>トップへ戻る</a>
                    ) : (
                      <>
                        {showCloseConfirm ? (
                          <div style={{ background: "#fff8f0", border: "1.5px solid #f4b9b9", borderRadius: 14, padding: "14px 14px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
                            <p style={{ fontSize: 13, color: "#c0392b", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 6 }}><IconAlert size={15} color="#c0392b" /> チャット履歴を削除しますか？</p>
                            <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.7 }}>
                              この操作を行うと、チャット履歴が即座に削除されます。<br />
                              <span style={{ color: "#aaa" }}>（削除しない場合は30日後に自動削除されます）</span>
                            </p>
                            <button style={{ padding: "9px 0", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }} onClick={() => { setShowCloseConfirm(false); reset(true); setOpen(false); }}>削除して閉じる</button>
                            <button style={{ ...outlineBtn("#9b6ed4"), textAlign: "center" as const }} onClick={() => setShowCloseConfirm(false)}>閉じずに戻る</button>
                          </div>
                        ) : (
                          <>
                            <button style={{ padding: "10px 0", borderRadius: 20, border: "none", background: "#fee2e2", color: "#c0392b", fontWeight: 700, cursor: "pointer", fontSize: 13 }} onClick={() => setShowCloseConfirm(true)}>チャット履歴を削除する</button>
                            <button style={{ padding: "10px 0", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }} onClick={() => setOpen(false)}>チャットを閉じる</button>
                          </>
                        )}
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
                aria-label="送信"
                style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: isInputActive ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "#e5e5e5", color: isInputActive ? "white" : "#bbb", cursor: isInputActive ? "pointer" : "default", flexShrink: 0, transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          )}

          {/* 教材リクエスト専用フォーム */}
          {phase === "materialRequest" && (
            <div style={{ padding: "12px 14px", borderTop: "0.5px solid rgba(200,170,240,0.2)", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, background: "#fdf8ff" }}>
              <p style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 5 }}><IconPencil size={13} color="#9b6ed4" /> リクエスト内容を記入してください</p>
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
        style={{ position: "fixed", bottom: isMobile ? 96 : 24, right: 24, zIndex: 9999, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(155,110,212,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
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
