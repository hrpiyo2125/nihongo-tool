import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/ja'
  const type = searchParams.get('type')
  const supabaseError = searchParams.get('error')

  // Supabaseがエラーを返した場合（2回タップ・期限切れなど）
  if (supabaseError && type === 'signup') {
    return NextResponse.redirect(`${origin}${next}/auth/confirmed?status=error`)
  }

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

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (type === 'reset') {
      if (error) {
        return NextResponse.redirect(`${origin}${next}?error=invalid`)
      }
      const response = NextResponse.redirect(`${origin}${next}`)
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, { ...options, maxAge: 60 * 60 * 24 * 365 })
      })
      return response
    }

    if (type === 'signup') {
      const status = error ? 'error' : 'ok'
      const response = NextResponse.redirect(`${origin}${next}/auth/confirmed?status=${status}`)
      if (!error) {
        pendingCookies.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, { ...options, maxAge: 60 * 60 * 24 * 365 })
        })
      }
      return response
    }

    if (error) {
      return NextResponse.redirect(`${origin}/ja`)
    }
    const response = NextResponse.redirect(`${origin}${next}`)
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, { ...options, maxAge: 60 * 60 * 24 * 365 })
    })
    return response
  }

  return NextResponse.redirect(`${origin}/ja`)
}
