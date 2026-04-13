import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ライト以上のみ購入可能
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.plan === 'free') {
    return NextResponse.json(
      { error: 'ライトプラン以上のみ追加購入できます' },
      { status: 403 }
    )
  }

  const session = await stripe.checkout.sessions.create({
    customer: profile.stripe_customer_id ?? undefined,
    customer_email: profile.stripe_customer_id ? undefined : user.email,
    mode: 'payment',
    line_items: [
      {
        price: process.env.STRIPE_ADDON_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nihongo-tool.com'}/ja?addon=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nihongo-tool.com'}/ja?addon=cancel`,
    metadata: {
      user_id: user.id,
      type: 'addon',
      quantity: '5',
    },
  })

  return NextResponse.json({ url: session.url })
}