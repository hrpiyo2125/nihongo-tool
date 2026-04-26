import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "toolio <noreply@nihongo-tool.com>";
const ADMIN_EMAIL = "support@nihongo-tool.com";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nihongo-tool.com";

export async function POST(req: NextRequest) {
  const { sessionId, userEmail } = await req.json();

  await supabase
    .from("chat_sessions")
    .update({ status: "waiting", user_email: userEmail })
    .eq("id", sessionId);

  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role: "bot",
    content: `担当者への連絡を受け付けました。${userEmail} にご連絡します。チャットを閉じても大丈夫です。`,
  });

  const adminUrl = `${BASE_URL}/ja/admin/chat/${sessionId}`;

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: "【toolio】チャット対応のご依頼が届きました",
    html: `
      <p>ユーザーから担当者への連絡依頼がありました。</p>
      <p><strong>ユーザーメールアドレス：</strong>${userEmail}</p>
      <p><strong>セッションID：</strong>${sessionId}</p>
      <p>以下のリンクからチャット履歴を確認して返信してください。</p>
      <a href="${adminUrl}" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#f4b9b9,#e49bfd);color:white;border-radius:20px;text-decoration:none;font-weight:700;">チャットに返信する</a>
      <br /><br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
