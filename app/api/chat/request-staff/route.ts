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
const ADMIN_SITE_URL = process.env.ADMIN_SITE_URL ?? "https://admin.nihongo-tool.com";

export async function POST(req: NextRequest) {
  const { sessionId, userEmail, userId } = await req.json();

  // userIdがあればauth.usersからemailを補完
  let resolvedEmail = userEmail;
  if (!resolvedEmail && userId) {
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    resolvedEmail = user?.email ?? null;
  }

  let sid = sessionId;
  if (!sid) {
    const { data } = await supabase
      .from("chat_sessions")
      .insert({ topic: "担当者チャット", status: "waiting", user_email: resolvedEmail, user_id: userId ?? null })
      .select("id")
      .single();
    sid = data?.id;
  } else {
    await supabase
      .from("chat_sessions")
      .update({ status: "waiting", user_email: resolvedEmail, user_id: userId ?? null })
      .eq("id", sid);
  }

  const adminUrl = `${ADMIN_SITE_URL}/chat/${sid}`;

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: "【toolio】チャット対応のご依頼が届きました",
    html: `
      <p>ユーザーから担当者への連絡依頼がありました。</p>
      <p><strong>ユーザーメールアドレス：</strong>${userEmail}</p>
      <p><strong>セッションID：</strong>${sid}</p>
      <p>以下のリンクからチャット履歴を確認して返信してください。</p>
      <a href="${adminUrl}" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#f4b9b9,#e49bfd);color:white;border-radius:20px;text-decoration:none;font-weight:700;">チャットに返信する</a>
      <br /><br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  });

  return NextResponse.json({ ok: true, sessionId: sid });
}
