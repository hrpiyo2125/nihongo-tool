import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const locale = searchParams.get('locale') ?? 'ja'
  return NextResponse.redirect(`${origin}/${locale}`)
}
