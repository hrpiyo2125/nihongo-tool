"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useParams } from "next/navigation";

type Message = { id: string; role: string; content: string; created_at: string };

export default function AdminChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [session, setSession] = useState<{ user_email: string; status: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`admin:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function load() {
    const [{ data: sess }, { data: msgs }] = await Promise.all([
      supabase.from("chat_sessions").select("user_email, status").eq("id", sessionId).single(),
      supabase.from("chat_messages").select("*").eq("session_id", sessionId).order("created_at"),
    ]);
    if (sess) setSession(sess);
    if (msgs) setMessages(msgs);
  }

  async function handleSend() {
    const content = reply.trim();
    if (!content || sending) return;
    setReply("");
    setSending(true);
    await fetch("/api/chat/staff-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: content }),
    });
    setSending(false);
  }

  async function handleNotify() {
    if (!confirm(`${session?.user_email} にチャット開始メールを送信しますか？`)) return;
    setNotifying(true);
    await fetch("/api/chat/notify-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    setNotifying(false);
    alert("メールを送信しました。");
  }

  async function handleComplete() {
    if (!confirm("対応を完了しますか？ユーザーにお礼メッセージが送信されます。")) return;
    setSending(true);
    await fetch("/api/chat/staff-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: "ご利用ありがとうございました。またいつでもお気軽にご相談ください。" }),
    });
    await supabase.from("chat_sessions").update({ status: "done" }).eq("id", sessionId);
    setSession((s) => s ? { ...s, status: "done" } : s);
    setSending(false);
  }

  const roleLabel: Record<string, string> = { bot: "Bot", user: "ユーザー", staff: "担当者（あなた）" };
  const roleBg: Record<string, string> = {
    bot: "#f5f0ff",
    user: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
    staff: "#f0f7ff",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f4f4", fontFamily: "'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 640, background: "white", borderRadius: 20, boxShadow: "0 4px 24px rgba(155,110,212,0.12)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", padding: "16px 24px", color: "white" }}>
          <p style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>管理者チャット返信</p>
          {session && <p style={{ fontSize: 12, margin: "4px 0 0", opacity: 0.85 }}>ユーザー: {session.user_email} · ステータス: {session.status}</p>}
        </div>

        {/* アクションボタン */}
        <div style={{ padding: "12px 20px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", display: "flex", gap: 10 }}>
          <button
            onClick={handleNotify}
            disabled={notifying}
            style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "1.5px solid #9b6ed4", background: "white", color: "#9b6ed4", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
          >
            {notifying ? "送信中..." : "📧 チャット開始メールを送る"}
          </button>
          <button
            onClick={handleComplete}
            disabled={sending || session?.status === "done"}
            style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", background: session?.status === "done" ? "#e5e5e5" : "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: session?.status === "done" ? "#bbb" : "white", fontWeight: 700, cursor: session?.status === "done" ? "default" : "pointer", fontSize: 13 }}
          >
            {session?.status === "done" ? "対応完了済み" : "✅ 対応完了"}
          </button>
        </div>

        <div style={{ height: 380, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m) => (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <span style={{ fontSize: 10, color: "#bbb", marginBottom: 2 }}>{roleLabel[m.role] ?? m.role}</span>
              <div style={{
                maxWidth: "80%",
                padding: "9px 13px",
                borderRadius: 12,
                background: roleBg[m.role] ?? "#eee",
                color: m.role === "user" ? "white" : "#333",
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: "12px 20px 20px", borderTop: "0.5px solid rgba(200,170,240,0.2)", display: "flex", gap: 10 }}>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="返信を入力..."
            rows={3}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(200,170,240,0.5)", fontSize: 13, resize: "none", outline: "none" }}
          />
          <button
            onClick={handleSend}
            disabled={sending}
            style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13, alignSelf: "flex-end" }}
          >
            {sending ? "送信中" : "送信"}
          </button>
        </div>
      </div>
    </div>
  );
}
