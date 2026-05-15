import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

const LINE_REPLY_API = "https://api.line.me/v2/bot/message/reply";
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!;
const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID!;

function verify(body: string, signature: string): boolean {
  const digest = createHmac("sha256", CHANNEL_SECRET).update(body).digest("base64");
  return digest === signature;
}

async function replyWithForm(replyToken: string) {
  const liffUrl = `https://liff.line.me/${LIFF_ID}`;
  console.log("[LINE webhook] LIFF_ID:", LIFF_ID, "liffUrl:", liffUrl);

  await fetch(LINE_REPLY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: "flex",
          altText: "toolioへのリクエスト・お問い合わせ",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              spacing: "md",
              contents: [
                {
                  type: "text",
                  text: "toolio",
                  size: "xs",
                  color: "#9b6ed4",
                  weight: "bold",
                },
                {
                  type: "text",
                  text: "リクエスト・お問い合わせ",
                  size: "lg",
                  weight: "bold",
                  color: "#333333",
                  wrap: true,
                },
                {
                  type: "text",
                  text: "教材のリクエスト、フィードバック、その他のお問い合わせはこちらからどうぞ。",
                  size: "sm",
                  color: "#888888",
                  wrap: true,
                },
              ],
            },
            footer: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "button",
                  action: {
                    type: "uri",
                    label: "フォームを開く",
                    uri: liffUrl,
                  },
                  style: "primary",
                  color: "#e49bfd",
                  height: "sm",
                },
              ],
            },
          },
        },
      ],
    }),
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  if (!verify(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);

  console.log("[LINE webhook] events:", JSON.stringify(body.events));

  for (const event of body.events ?? []) {
    const replyToken: string = event.replyToken;
    if (!replyToken) continue;

    if (event.type === "follow" || event.type === "message") {
      try {
        await replyWithForm(replyToken);
      } catch (e) {
        console.error("[LINE webhook] replyWithForm error:", e);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
