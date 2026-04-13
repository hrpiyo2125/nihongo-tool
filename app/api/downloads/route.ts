import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  light: 10,
  standard: 20,
  premium: Infinity,
}

function getCurrentYearMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function createSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function GET(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createSupabaseClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const yearMonth = getCurrentYearMonth()

  const { data, error } = await supabase
    .from('download_counts')
    .select('count')
    .eq('user_id', user.id)
    .eq('year_month', yearMonth)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const count = data?.count ?? 0
  return NextResponse.json({ count, yearMonth })
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createSupabaseClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const limit = PLAN_LIMITS[plan] ?? 3
  const yearMonth = getCurrentYearMonth()

  const { data: existing } = await supabase
    .from('download_counts')
    .select('count')
    .eq('user_id', user.id)
    .eq('year_month', yearMonth)
    .single()

  const currentCount = existing?.count ?? 0

  if (currentCount >= limit) {
    return NextResponse.json(
      { error: 'LIMIT_EXCEEDED', count: currentCount, limit },
      { status: 403 }
    )
  }

  const { error } = await supabase
    .from('download_counts')
    .upsert({
      user_id: user.id,
      year_month: yearMonth,
      count: currentCount + 1,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,year_month'
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    count: currentCount + 1,
    limit,
    remaining: limit === Infinity ? null : limit - (currentCount + 1)
  })
}