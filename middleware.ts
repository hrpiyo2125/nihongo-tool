import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { routing } from './i18n/routing'

const handleI18nRouting = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッショントークンのリフレッシュ（これがないと1回目のログイン後にサーバー側がセッションを認識できない）
  await supabase.auth.getUser()

  const i18nResponse = handleI18nRouting(request)

  // Supabaseがセットしたセッションクッキーをi18nレスポンスにコピー
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...rest }) => {
    i18nResponse.cookies.set(name, value, rest)
  })

  return i18nResponse
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*|sitemap\\.xml|robots\\.txt).*)']
}
