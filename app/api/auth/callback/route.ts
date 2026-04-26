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

      return NextResponse.redirect(`${origin}/${locale}`)
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/auth`)
}
