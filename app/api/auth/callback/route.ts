import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const locale = searchParams.get('locale') ?? 'ja'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', data.user.id)
        .single()

      if (profile?.status === 'deleted') {
        return NextResponse.redirect(`${origin}/${locale}/welcome-back`)
      }

      if (!profile) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || '',
          status: 'active',
        })
      }

      const { access_token, refresh_token, expires_in, token_type } = data.session
      const hash = `access_token=${access_token}&refresh_token=${refresh_token}&token_type=${token_type}&expires_in=${expires_in}`
      return NextResponse.redirect(`${origin}/${locale}#${hash}`)
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/auth`)
}
