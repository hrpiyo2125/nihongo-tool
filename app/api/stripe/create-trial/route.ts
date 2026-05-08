import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendTrialStartEmail } from '@/lib/email'
import { getOrCreateStripeCustomer } from '../../../../lib/stripe-customer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 })
    }

    // すでにトライアル済みか確認
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan, trial_end')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // トライアル済みチェック（trial_endが存在する場合は過去にトライアルしている）
    if (profile.trial_end) {
      return NextResponse.json({ error: 'Trial already used' }, { status: 400 })
    }

    // すでに有料プランの場合はトライアル不可
    if (profile.plan !== 'free') {
      return NextResponse.json({ error: 'Already on a paid plan' }, { status: 400 })
    }

    // Stripe顧客の取得または作成
    const customerId = await getOrCreateStripeCustomer(supabase, userId, email)

    // トライアルサブスクを作成（クレカなし・14日間・ライトプラン）
    const trialEnd = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.NEXT_PUBLIC_STRIPE_WEEKLY_PRICE_ID! }],
      trial_end: trialEnd,
      payment_settings: {
        save_default_payment_method: 'off',
      },
      metadata: { userId },
    })

    // Supabaseを更新
    await supabase
      .from('profiles')
      .update({
        plan: 'light',
        plan_status: 'trialing',
        stripe_subscription_id: subscription.id,
        trial_end: new Date(trialEnd * 1000).toISOString(),
        current_period_end: new Date(trialEnd * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    await sendTrialStartEmail({
      to: email,
      trialEnd: new Date(trialEnd * 1000).toISOString(),
    })

    return NextResponse.json({
      success: true,
      trialEnd: new Date(trialEnd * 1000).toISOString(),
    })

  } catch (error) {
    console.error('create-trial error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}