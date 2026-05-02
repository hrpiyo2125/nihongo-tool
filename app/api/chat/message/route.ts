import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { getMaterials, getFAQs, getAnnouncements, getTextContents } from "@/lib/notion";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function buildSystemPrompt(): Promise<string> {
  const [textContents, faqs, announcements, materials] = await Promise.all([
    getTextContents(),
    getFAQs(),
    getAnnouncements(),
    getMaterials(),
  ]);

  const textSection = Object.entries(textContents)
    .map(([title, body]) => `## ${title}\n${body}`)
    .join('\n\n');

  const faqSection = faqs.length > 0
    ? '## よくある質問\n' + faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : '';

  const announcementSection = announcements.length > 0
    ? '## お知らせ（最新順）\n' + announcements.map((a) => `・${a.title}${a.body ? `\n${a.body}` : ''}`).join('\n\n')
    : '';

  const materialSection = materials.length > 0
    ? '## 教材一覧\n' + materials.map((m) =>
        `・${m.title}（${m.requiredPlan}プラン）${m.description ? ` — ${m.description}` : ''}`
      ).join('\n')
    : '';

  return `あなたはtoolioのサポートスタッフです。以下のサイト情報をもとに、ユーザーの質問に日本語で丁寧に回答してください。
回答は簡潔にまとめ、箇条書きを使って読みやすくしてください。

${textSection}

${faqSection}

${announcementSection}

${materialSection}`.trim();
}

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

  let reply: string;

  if (topic === "教材のリクエスト") {
    reply = "リクエストありがとうございます！いただいた内容を参考に、今後の教材制作に活かしてまいります。引き続きtoolioをよろしくお願いします🌸";
  } else {
    const systemPrompt = await buildSystemPrompt();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `カテゴリ：${topic}\n質問：${userMessage}` },
      ],
    });
    reply = completion.choices[0].message.content ?? "申し訳ありません、回答を生成できませんでした。";
  }

  await supabase.from("chat_messages").insert({
    session_id: sid,
    role: "bot",
    content: reply,
  });

  return NextResponse.json({ sessionId: sid, reply });
}
