import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://admin.nihongo-tool.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const { sessionId, message } = await req.json();

  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404, headers: CORS_HEADERS });

  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role: "staff",
    content: message,
  });

  await supabase
    .from("chat_sessions")
    .update({ status: "active" })
    .eq("id", sessionId);

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
