import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "missing sessionId" }, { status: 400 });

  // ログインユーザーの確認
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // service role でセッションとメッセージを取得（RLSバイパス）
  const { data: sess } = await supabaseAdmin
    .from("chat_sessions")
    .select("id, status, user_id, user_email")
    .eq("id", sessionId)
    .single();

  if (!sess) return NextResponse.json({ error: "not found" }, { status: 404 });

  // セッションが本人のものか確認
  if (sess.user_id && sess.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: messages } = await supabaseAdmin
    .from("chat_messages")
    .select("id, role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ status: sess.status, messages: messages ?? [] });
}
