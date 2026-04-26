import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { topic, userMessage, userId, userEmail } = await req.json();

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ topic: topic ?? "その他", status: "bot", user_id: userId ?? null, user_email: userEmail ?? null })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("chat_messages").insert({
    session_id: data.id,
    role: "user",
    content: userMessage,
  });

  return NextResponse.json({ sessionId: data.id });
}
