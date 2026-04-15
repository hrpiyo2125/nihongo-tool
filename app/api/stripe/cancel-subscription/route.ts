import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendCancelEmail } from '@/lib/email'


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Supabaseからサブスクリプションを取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_subscription_id, plan, current_period_end')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!profile.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }

    // Stripeでキャンセル予約（期間終了まで使える）
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      { cancel_at_period_end: true }
    )

    // Supabaseを更新
    await supabase
      .from('profiles')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    const customer = await stripe.customers.retrieve(subscription.customer as string)
    const email = (customer as any).email
    if (email) {
      await sendCancelEmail({
        to: email,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })

  } catch (error) {
    console.error('cancel-subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}