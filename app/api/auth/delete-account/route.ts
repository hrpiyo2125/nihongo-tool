import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  let userId: string
  try {
    const body = await req.json()
    userId = body.userId
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  console.log('[delete-account] Starting deletion for userId:', userId)

  // 関連テーブルを削除（FK制約でauth削除が失敗しないよう先に削除）
  const tables = [
    { table: 'favorites', col: 'user_id' },
    { table: 'download_history', col: 'user_id' },
    { table: 'purchases', col: 'user_id' },
  ]
  for (const { table, col } of tables) {
    const { error } = await supabase.from(table).delete().eq(col, userId)
    if (error) {
      console.warn(`[delete-account] Warning deleting from ${table}:`, error.message)
      // 続行（テーブルが存在しない・行がない場合もある）
    } else {
      console.log(`[delete-account] Deleted from ${table}`)
    }
  }

  // profilesはauth削除のCASCADEに任せる（先に消すと問題が出る場合がある）
  // auth ユーザーを削除（service roleが必要）
  console.log('[delete-account] Calling auth.admin.deleteUser...')
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
  if (deleteError) {
    console.error('[delete-account] auth.admin.deleteUser failed:', deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  console.log('[delete-account] Successfully deleted userId:', userId)
  return NextResponse.json({ success: true })
}
