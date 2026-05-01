import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '../../../lib/rateLimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(`err:${ip}`, 20, 60_000)) {
    return NextResponse.json({}, { status: 429 })
  }

  try {
    const body = await req.json()
    const { type, message, stack, url, userId } = body

    if (!type || !message) {
      return NextResponse.json({}, { status: 400 })
    }

    await supabase.from('error_logs').insert({
      type: String(type).slice(0, 100),
      message: String(message).slice(0, 1000),
      stack: stack ? String(stack).slice(0, 5000) : null,
      url: url ? String(url).slice(0, 500) : null,
      user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
      user_id: userId ? String(userId).slice(0, 100) : null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({}, { status: 500 })
  }
}
