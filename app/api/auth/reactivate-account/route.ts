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

  const { error } = await supabase
    .from('profiles')
    .update({
      status: 'active',
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('[reactivate-account] error:', error)
    return NextResponse.json({ error: '再開に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
