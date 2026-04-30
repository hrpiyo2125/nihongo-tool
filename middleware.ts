import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { createServerClient } from '@supabase/ssr'

const handleI18nRouting = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const intlResponse = handleI18nRouting(request)
  const response = intlResponse ?? NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              maxAge: 60 * 60 * 24 * 365, // 1年間保持
            })
          })
        },
      },
    }
  )

  // セッションを自動更新（compromised token検出はOFFのため安全）
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*|sitemap\\.xml|robots\\.txt).*)']
}
