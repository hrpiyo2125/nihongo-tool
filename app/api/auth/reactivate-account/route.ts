import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  let userId: string
  try {
    const body = await req.json()
    userId = body.userId
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  // Stripe のキャンセル予約も取り消す
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_subscription_id) {
    try {
      await stripe.subscriptions.update(profile.stripe_subscription_id, {
        cancel_at_period_end: false,
      })
    } catch (e: any) {
      console.error('[reactivate-account] stripe error:', e?.message)
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      status: 'active',
      deleted_at: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('[reactivate-account] error:', error)
    return NextResponse.json({ error: '再開に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
