import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendUpgradeEmail, sendDowngradeEmail, sendAdminAlertEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_TO_PRICE: Record<string, string> = {
  light: process.env.NEXT_PUBLIC_STRIPE_LIGHT_PRICE_ID!,
  standard: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID!,
  premium: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!,
}

const PLAN_RANK: Record<string, number> = {
  free: 0,
  light: 1,
  standard: 2,
  premium: 3,
}

export async function POST(req: NextRequest) {
  try {
    const { userId, newPlan } = await req.json()

    if (!userId || !newPlan) {
      return NextResponse.json({ error: 'userId and newPlan are required' }, { status: 400 })
    }

    if (!PLAN_TO_PRICE[newPlan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Supabaseから現在のプランを取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_subscription_id, plan')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!profile.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }

    if (profile.plan === newPlan) {
      return NextResponse.json({ error: 'Already on this plan' }, { status: 400 })
    }

    const isUpgrade = PLAN_RANK[newPlan] > PLAN_RANK[profile.plan]
    const newPriceId = PLAN_TO_PRICE[newPlan]

    // 現在のサブスクを取得・ステータス確認
    let subscription: Stripe.Subscription
    try {
      subscription = await stripe.subscriptions.retrieve(
        profile.stripe_subscription_id
      )
    } catch (stripeError: any) {
      if (stripeError?.code === 'resource_missing') {
        await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: null,
            plan: 'free',
            plan_status: 'active',
            cancel_at_period_end: false,
            current_period_end: null,
          })
          .eq('id', userId)
        await sendAdminAlertEmail({ userId, event: 'change-plan: resource_missing' })
        return NextResponse.json({ error: 'subscription_reset' }, { status: 400 })
      }
      throw stripeError
    }

    // incomplete_expired など無効なサブスクの場合はリセット
    if (['incomplete_expired', 'canceled', 'unpaid'].includes(subscription.status)) {
      await supabase
        .from('profiles')
        .update({
          stripe_subscription_id: null,
          plan: 'free',
          plan_status: 'active',
          cancel_at_period_end: false,
          current_period_end: null,
        })
        .eq('id', userId)
      await sendAdminAlertEmail({ userId, event: 'change-plan: incomplete_expired' })
      return NextResponse.json({ error: 'subscription_reset', message: 'サブスクリプションをリセットしました。再度登録をお願いします。' }, { status: 400 })
    }

    const subscriptionItemId = subscription.items.data[0].id

    if (isUpgrade) {
      // アップグレード：即時変更・proration あり
      await stripe.subscriptions.update(profile.stripe_subscription_id, {
        items: [{ id: subscriptionItemId, price: newPriceId }],
        proration_behavior: 'create_prorations',
      })

      const upgradeCustomer = await stripe.customers.retrieve(subscription.customer as string)
      const upgradeEmail = (upgradeCustomer as any).email
      if (upgradeEmail) {
        await sendUpgradeEmail({
          to: upgradeEmail,
          planLabel: newPlan === 'light' ? 'Lightプラン' : newPlan === 'standard' ? 'Standardプラン' : 'Premiumプラン',
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
        })
      }

    } else {
      // ダウングレード：期間終了後に変更
      await stripe.subscriptions.update(profile.stripe_subscription_id, {
        items: [{ id: subscriptionItemId, price: newPriceId }],
        proration_behavior: 'none',
        billing_cycle_anchor: 'unchanged' as any,
      })

      const downgradeCustomer = await stripe.customers.retrieve(subscription.customer as string)
      const downgradeEmail = (downgradeCustomer as any).email
      if (downgradeEmail) {
        await sendDowngradeEmail({
          to: downgradeEmail,
          newPlanLabel: newPlan === 'light' ? 'Lightプラン' : newPlan === 'standard' ? 'Standardプラン' : 'Premiumプラン',
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      isUpgrade,
      newPlan,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })

  } catch (error: any) {
    console.error('change-plan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }}
