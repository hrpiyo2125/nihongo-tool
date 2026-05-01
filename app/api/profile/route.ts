import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '../../../lib/rateLimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!rateLimit(user.id, 60, 60_000)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
  }

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || '',
      status: 'active',
    })
    profile = { id: user.id }
  }

  if (profile.status === 'deleted') {
    return NextResponse.json({ deleted: true })
  }

  return NextResponse.json(profile)
}
