import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LINE_API = "https://api.line.me/v2/bot/message/reply";
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!;
const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;

// ── Types ──────────────────────────────────────────────────────────────────

type State =
  | "idle"
  | "request_level"
  | "request_type"
  | "request_detail"
  | "request_confirm"
  | "feedback_kind"
  | "feedback_detail"
  | "feedback_confirm"
  | "other_detail"
  | "other_confirm";

interface ConvData {
  levels?: string[];
  types?: string[];
  detail?: string;
  feedbackKind?: string;
  category?: string;
}

// ── Signature verification ─────────────────────────────────────────────────

function verify(body: string, signature: string): boolean {
  const digest = createHmac("sha256", CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return digest === signature;
}

// ── LINE reply helpers ─────────────────────────────────────────────────────

async function reply(replyToken: string, messages: object[]) {
  await fetch(LINE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}

function text(msg: string) {
  return { type: "text", text: msg };
}

function quickReply(msg: string, items: { label: string; data: string }[]) {
  return {
    type: "text",
    text: msg,
    quickReply: {
      items: items.map(({ label, data }) => ({
        type: "action",
        action: { type: "postback", label, data, displayText: label },
      })),
    },
  };
}

// ── State helpers ──────────────────────────────────────────────────────────

async function getConv(lineUserId: string): Promise<{ state: State; data: ConvData }> {
  const { data } = await supabase
    .from("line_conversations")
    .select("state, data")
    .eq("line_user_id", lineUserId)
    .single();
  return data ?? { state: "idle", data: {} };
}

async function setConv(lineUserId: string, state: State, data: ConvData) {
  await supabase.from("line_conversations").upsert(
    { line_user_id: lineUserId, state, data, updated_at: new Date().toISOString() },
    { onConflict: "line_user_id" }
  );
}

// ── Multi-select state helpers ─────────────────────────────────────────────

const LEVEL_OPTIONS = ["入門（ひらがな・カタカナ）", "初級（N5・N4）", "中級（N3・N2）", "上級（N1）"];
const TYPE_OPTIONS = ["文法", "語彙", "読解", "聴解", "会話", "漢字"];
const DONE_DATA = "__done__";

function buildMultiSelectMessage(
  msg: string,
  options: string[],
  selected: string[],
  postbackPrefix: string
) {
  const items = options.map((opt) => ({
    label: (selected.includes(opt) ? "✅ " : "") + opt,
    data: `${postbackPrefix}:${opt}`,
  }));
  items.push({ label: "→ 次へ進む", data: DONE_DATA });
  return quickReply(msg, items);
}

// ── Save to Supabase chat system ───────────────────────────────────────────

async function saveRequest(lineUserId: string, data: ConvData) {
  const content = [
    `【LINEからのリクエスト】`,
    `日本語レベル: ${data.levels?.join("、") ?? "未選択"}`,
    `教材の種類: ${data.types?.join("、") ?? "未選択"}`,
    `リクエスト内容: ${data.detail ?? ""}`,
  ].join("\n");

  const { data: session } = await supabase
    .from("chat_sessions")
    .insert({ topic: "教材のリクエスト", status: "bot", user_email: null })
    .select("id")
    .single();

  if (session) {
    await supabase.from("chat_messages").insert([
      { session_id: session.id, role: "user", content },
      {
        session_id: session.id,
        role: "bot",
        content:
          "リクエストを受け付けました。ありがとうございます！今後の教材制作に活かしてまいります。",
      },
    ]);
  }
}

async function saveFeedback(lineUserId: string, data: ConvData) {
  const content = [
    `【LINEからのフィードバック】`,
    `種類: ${data.feedbackKind ?? ""}`,
    `内容: ${data.detail ?? ""}`,
  ].join("\n");

  const { data: session } = await supabase
    .from("chat_sessions")
    .insert({ topic: "フィードバック", status: "bot", user_email: null })
    .select("id")
    .single();

  if (session) {
    await supabase.from("chat_messages").insert([
      { session_id: session.id, role: "user", content },
      {
        session_id: session.id,
        role: "bot",
        content: "フィードバックを受け付けました。ありがとうございます！",
      },
    ]);
  }
}

async function saveOther(lineUserId: string, data: ConvData) {
  const content = [`【LINEからのお問い合わせ】`, `内容: ${data.detail ?? ""}`].join("\n");

  const { data: session } = await supabase
    .from("chat_sessions")
    .insert({ topic: "その他", status: "bot", user_email: null })
    .select("id")
    .single();

  if (session) {
    await supabase.from("chat_messages").insert([
      { session_id: session.id, role: "user", content },
      {
        session_id: session.id,
        role: "bot",
        content: "お問い合わせを受け付けました。確認次第ご連絡いたします。",
      },
    ]);
  }
}

// ── Main conversation handler ──────────────────────────────────────────────

async function handleMessage(
  replyToken: string,
  lineUserId: string,
  messageText: string
) {
  const conv = await getConv(lineUserId);
  const { state, data } = conv;

  // どの状態でも「最初から」で idle に戻す
  if (messageText === "最初から") {
    await setConv(lineUserId, "idle", {});
    await reply(replyToken, [
      text("わかりました。最初からやり直します。"),
      buildCategoryMenu(),
    ]);
    return;
  }

  if (state === "idle") {
    await reply(replyToken, [buildCategoryMenu()]);
    return;
  }

  if (state === "request_detail") {
    const newData = { ...data, detail: messageText };
    await setConv(lineUserId, "request_confirm", newData);
    await reply(replyToken, [
      text(
        `確認します。\n\n日本語レベル: ${newData.levels?.join("、")}\n教材の種類: ${newData.types?.join("、")}\nリクエスト内容: ${newData.detail}\n\nこの内容で送信しますか？`
      ),
      quickReply("送信しますか？", [
        { label: "✉️ 送信する", data: "confirm:yes" },
        { label: "✖️ キャンセル", data: "confirm:no" },
      ]),
    ]);
    return;
  }

  if (state === "feedback_detail") {
    const newData = { ...data, detail: messageText };
    await setConv(lineUserId, "feedback_confirm", newData);
    await reply(replyToken, [
      text(
        `確認します。\n\n種類: ${newData.feedbackKind}\n内容: ${newData.detail}\n\nこの内容で送信しますか？`
      ),
      quickReply("送信しますか？", [
        { label: "✉️ 送信する", data: "confirm:yes" },
        { label: "✖️ キャンセル", data: "confirm:no" },
      ]),
    ]);
    return;
  }

  if (state === "other_detail") {
    const newData = { ...data, detail: messageText };
    await setConv(lineUserId, "other_confirm", newData);
    await reply(replyToken, [
      text(`確認します。\n\n内容: ${newData.detail}\n\nこの内容で送信しますか？`),
      quickReply("送信しますか？", [
        { label: "✉️ 送信する", data: "confirm:yes" },
        { label: "✖️ キャンセル", data: "confirm:no" },
      ]),
    ]);
    return;
  }

  // テキストメッセージが想定外の状態で来た場合
  await reply(replyToken, [
    text("メニューから選択してください。"),
    buildCategoryMenu(),
  ]);
}

async function handlePostback(
  replyToken: string,
  lineUserId: string,
  postbackData: string
) {
  const conv = await getConv(lineUserId);
  const { state, data } = conv;

  // カテゴリ選択
  if (postbackData === "category:request") {
    await setConv(lineUserId, "request_level", { levels: [] });
    await reply(replyToken, [
      buildMultiSelectMessage(
        "日本語レベルを選択してください（複数選択可）。\n選び終わったら「次へ進む」を押してください。",
        LEVEL_OPTIONS,
        [],
        "level"
      ),
    ]);
    return;
  }

  if (postbackData === "category:feedback") {
    await setConv(lineUserId, "feedback_kind", {});
    await reply(replyToken, [
      quickReply("フィードバックの種類を選んでください。", [
        { label: "教材への感想", data: "feedback_kind:教材への感想" },
        { label: "機能の要望", data: "feedback_kind:機能の要望" },
        { label: "不具合の報告", data: "feedback_kind:不具合の報告" },
        { label: "その他", data: "feedback_kind:その他" },
      ]),
    ]);
    return;
  }

  if (postbackData === "category:other") {
    await setConv(lineUserId, "other_detail", {});
    await reply(replyToken, [text("お問い合わせ内容をテキストで入力してください。")]);
    return;
  }

  // レベル選択（多選択）
  if (postbackData.startsWith("level:") && state === "request_level") {
    const opt = postbackData.replace("level:", "");
    const current = data.levels ?? [];
    const newLevels = current.includes(opt)
      ? current.filter((l) => l !== opt)
      : [...current, opt];
    const newData = { ...data, levels: newLevels };
    await setConv(lineUserId, "request_level", newData);
    await reply(replyToken, [
      buildMultiSelectMessage(
        `選択中: ${newLevels.length > 0 ? newLevels.join("、") : "なし"}\n\nほかにも選択できます。終わったら「次へ進む」を押してください。`,
        LEVEL_OPTIONS,
        newLevels,
        "level"
      ),
    ]);
    return;
  }

  // 教材の種類選択（多選択）
  if (postbackData.startsWith("type:") && state === "request_type") {
    const opt = postbackData.replace("type:", "");
    const current = data.types ?? [];
    const newTypes = current.includes(opt)
      ? current.filter((t) => t !== opt)
      : [...current, opt];
    const newData = { ...data, types: newTypes };
    await setConv(lineUserId, "request_type", newData);
    await reply(replyToken, [
      buildMultiSelectMessage(
        `選択中: ${newTypes.length > 0 ? newTypes.join("、") : "なし"}\n\nほかにも選択できます。終わったら「次へ進む」を押してください。`,
        TYPE_OPTIONS,
        newTypes,
        "type"
      ),
    ]);
    return;
  }

  // 「次へ進む」
  if (postbackData === DONE_DATA) {
    if (state === "request_level") {
      const newData = { ...data, types: [] };
      await setConv(lineUserId, "request_type", newData);
      await reply(replyToken, [
        buildMultiSelectMessage(
          "教材の種類を選択してください（複数選択可）。\n選び終わったら「次へ進む」を押してください。",
          TYPE_OPTIONS,
          [],
          "type"
        ),
      ]);
      return;
    }
    if (state === "request_type") {
      await setConv(lineUserId, "request_detail", data);
      await reply(replyToken, [text("リクエスト内容を自由にテキストで入力してください。")]);
      return;
    }
  }

  // フィードバック種類選択
  if (postbackData.startsWith("feedback_kind:") && state === "feedback_kind") {
    const kind = postbackData.replace("feedback_kind:", "");
    await setConv(lineUserId, "feedback_detail", { feedbackKind: kind });
    await reply(replyToken, [text("詳しい内容をテキストで入力してください。")]);
    return;
  }

  // 確認（送信 or キャンセル）
  if (postbackData === "confirm:yes") {
    if (state === "request_confirm") {
      await saveRequest(lineUserId, data);
      await setConv(lineUserId, "idle", {});
      await reply(replyToken, [
        text(
          "リクエストを送信しました！\nありがとうございます🌸 いただいた内容を参考に今後の教材制作に活かしてまいります。"
        ),
      ]);
      return;
    }
    if (state === "feedback_confirm") {
      await saveFeedback(lineUserId, data);
      await setConv(lineUserId, "idle", {});
      await reply(replyToken, [
        text("フィードバックを送信しました！\nありがとうございます。今後の改善に役立てます。"),
      ]);
      return;
    }
    if (state === "other_confirm") {
      await saveOther(lineUserId, data);
      await setConv(lineUserId, "idle", {});
      await reply(replyToken, [
        text("お問い合わせを送信しました！\n内容を確認次第、ご連絡いたします。"),
      ]);
      return;
    }
  }

  if (postbackData === "confirm:no") {
    await setConv(lineUserId, "idle", {});
    await reply(replyToken, [
      text("キャンセルしました。"),
      buildCategoryMenu(),
    ]);
    return;
  }

  // 想定外
  await reply(replyToken, [text("メニューから選択してください。"), buildCategoryMenu()]);
}

function buildCategoryMenu() {
  return quickReply("ご用件を選択してください。", [
    { label: "📚 教材のリクエスト", data: "category:request" },
    { label: "💬 フィードバック", data: "category:feedback" },
    { label: "❓ その他・お問い合わせ", data: "category:other" },
  ]);
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  if (!verify(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);

  for (const event of body.events ?? []) {
    const replyToken: string = event.replyToken;
    const lineUserId: string = event.source?.userId;

    if (!lineUserId) continue;

    if (event.type === "follow") {
      await setConv(lineUserId, "idle", {});
      await reply(replyToken, [
        text(
          "toolioの公式LINEへようこそ！👋\n教材のリクエスト、フィードバック、お問い合わせなどをこちらで受け付けています。"
        ),
        buildCategoryMenu(),
      ]);
      continue;
    }

    if (event.type === "message" && event.message?.type === "text") {
      await handleMessage(replyToken, lineUserId, event.message.text);
      continue;
    }

    if (event.type === "postback") {
      await handlePostback(replyToken, lineUserId, event.postback?.data ?? "");
      continue;
    }
  }

  return NextResponse.json({ ok: true });
}
