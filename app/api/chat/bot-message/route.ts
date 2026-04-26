import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { sessionId, content } = await req.json();
  if (!sessionId || !content) return NextResponse.json({ ok: false }, { status: 400 });

  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role: "bot",
    content,
  });

  return NextResponse.json({ ok: true });
}
