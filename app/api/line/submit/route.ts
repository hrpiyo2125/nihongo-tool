import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { topic, summary } = await req.json();

  if (!topic || !summary) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: session, error } = await supabase
    .from("chat_sessions")
    .insert({ topic, status: "bot", user_email: null })
    .select("id")
    .single();

  if (error || !session) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }

  await supabase.from("chat_messages").insert([
    { session_id: session.id, role: "user", content: `【LINEから】\n${summary}` },
    { session_id: session.id, role: "bot", content: "受け付けました。ありがとうございます！" },
  ]);

  return NextResponse.json({ ok: true });
}
