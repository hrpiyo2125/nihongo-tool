import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { SITE_KNOWLEDGE } from "@/lib/chatKnowledge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { sessionId, topic, userMessage, userId, userEmail } = await req.json();

  let sid = sessionId;

  if (!sid) {
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ topic, status: "bot", user_id: userId ?? null, user_email: userEmail ?? null })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    sid = data.id;
  }

  await supabase.from("chat_messages").insert({
    session_id: sid,
    role: "user",
    content: userMessage,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SITE_KNOWLEDGE },
      { role: "user", content: `カテゴリ：${topic}\n質問：${userMessage}` },
    ],
  });

  const reply = completion.choices[0].message.content ?? "申し訳ありません、回答を生成できませんでした。";

  await supabase.from("chat_messages").insert({
    session_id: sid,
    role: "bot",
    content: reply,
  });

  return NextResponse.json({ sessionId: sid, reply });
}
