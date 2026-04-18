import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 15 // Vercel関数の最大実行時間(秒)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ])
}

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

  console.log('[delete-account] start', userId)

  // 関連テーブルを並列削除（高速化）
  await Promise.allSettled([
    supabase.from('favorites').delete().eq('user_id', userId),
    supabase.from('download_history').delete().eq('user_id', userId),
    supabase.from('purchases').delete().eq('user_id', userId),
    supabase.from('profiles').delete().eq('id', userId),
  ])

  console.log('[delete-account] tables cleared, deleting auth user...')

  // auth.admin.deleteUser の代わりにSupabase管理REST APIを直接呼ぶ（タイムアウト制御のため）
  try {
    const res = await withTimeout(
      fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        },
      }),
      10000
    )

    if (!res.ok) {
      const body = await res.text()
      console.error('[delete-account] admin delete failed:', res.status, body)
      return NextResponse.json({ error: `削除に失敗しました (${res.status})` }, { status: 500 })
    }
  } catch (e: any) {
    console.error('[delete-account] error:', e?.message)
    return NextResponse.json({ error: e?.message ?? '削除に失敗しました' }, { status: 500 })
  }

  console.log('[delete-account] done', userId)
  return NextResponse.json({ success: true })
}
