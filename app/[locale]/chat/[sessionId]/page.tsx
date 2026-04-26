import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Message = { id?: string; role: string; content: string };

export default async function ChatResumePage({ params }: { params: Promise<{ locale: string; sessionId: string }> }) {
  const { locale, sessionId } = await params;

  const { data: sess } = await supabase
    .from("chat_sessions")
    .select("id, status")
    .eq("id", sessionId)
    .single();

  if (!sess) notFound();

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const msgs: Message[] = messages ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fce8f8,#ede8ff,#e8f0ff)", padding: "24px 16px", fontFamily: "'Hiragino Sans','Yu Gothic',sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <a href={`/${locale}`} style={{ background: "none", border: "none", color: "#9b6ed4", cursor: "pointer", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>← トップへ</a>
        </div>
        <div style={{ background: "white", borderRadius: 20, padding: "20px 16px", boxShadow: "0 4px 20px rgba(155,110,212,0.12)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", borderRadius: 12, padding: "12px 16px", color: "white", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/toolio_icon.png" alt="toolio" style={{ width: 32, height: 32, borderRadius: 8 }} />
            toolio サポート
          </div>
          {msgs.map((m, i) => (
            m.role === "separator" ? (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#c4a0f5)" }} />
                <span style={{ fontSize: 11, color: "#9b6ed4", fontWeight: 700 }}>👤 ここから担当者との会話</span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#c4a0f5,transparent)" }} />
              </div>
            ) : (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
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
          ))}
          {sess.status === "active" || sess.status === "waiting" ? (
            <p style={{ textAlign: "center", fontSize: 12, color: "#9b6ed4", marginTop: 8 }}>担当者が対応中です。toolioアプリからメッセージを送れます。</p>
          ) : sess.status === "done" ? (
            <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 8 }}>このチャットは終了しました。</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
