import ChatWidget from "@/components/ChatWidget";

export default async function ChatResumePage({ params }: { params: Promise<{ locale: string; sessionId: string }> }) {
  const { locale, sessionId } = await params;
  return (
    <div style={{ minHeight: "100vh", background: "#f8f4f4" }}>
      <div style={{ padding: "16px 20px" }}>
        <a href={`/${locale}`} style={{ fontSize: 13, color: "#9b6ed4", textDecoration: "none", fontWeight: 600 }}>
          ← toolio トップへ
        </a>
      </div>
      <ChatWidget initialSessionId={sessionId} />
    </div>
  );
}
