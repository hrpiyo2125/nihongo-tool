import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/ja'

  if (code) {
    const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            pendingCookies.push(...cookiesToSet)
          },
        },
      }
    )

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const agreedAt = searchParams.get('agreed_at')
      if (agreedAt && sessionData.user) {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )
        const { data: existingProfile } = await admin
          .from('profiles')
          .select('agreed_at')
          .eq('id', sessionData.user.id)
          .single()
        if (!existingProfile?.agreed_at) {
          await admin.from('profiles').upsert({ id: sessionData.user.id, agreed_at: agreedAt })
        }
      }
      const response = NextResponse.redirect(`${origin}${next}`)
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, { ...options, maxAge: 60 * 60 * 24 * 365 })
      })
      return response
    }
  }

  return NextResponse.redirect(`${origin}/ja`)
}
