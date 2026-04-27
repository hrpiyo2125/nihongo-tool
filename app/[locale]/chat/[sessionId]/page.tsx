import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function ChatResumePage({ params }: { params: Promise<{ locale: string; sessionId: string }> }) {
  const { locale, sessionId } = await params;

  const { data: sess } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (!sess) notFound();

  return <ChatWidget initialSessionId={sessionId} mode="page" locale={locale} />;
}
