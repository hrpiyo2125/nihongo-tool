import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "missing sessionId" }, { status: 400 });

  const { data: sess } = await supabase
    .from("chat_sessions")
    .select("id, status, user_id, user_email")
    .eq("id", sessionId)
    .single();

  if (!sess) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ status: sess.status, messages: messages ?? [] });
}
