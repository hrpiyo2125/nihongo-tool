import ChatWidget from "@/components/ChatWidget";

export default async function ChatResumePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return (
    <div style={{ minHeight: "100vh", background: "#f8f4f4" }}>
      <ChatWidget initialSessionId={sessionId} />
    </div>
  );
}
