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

    // freeへの変更 = 解約予約
    if (newPlan === 'free') {
      const { data: freeProfile, error: freeProfileError } = await supabase
        .from('profiles')
        .select('stripe_subscription_id')
        .eq('id', userId)
        .single()

      if (freeProfileError || !freeProfile?.stripe_subscription_id) {
        return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
      }

      await stripe.subscriptions.update(freeProfile.stripe_subscription_id, {
        cancel_at_period_end: true,
      })

      const updatedSub = await stripe.subscriptions.retrieve(freeProfile.stripe_subscription_id)

      const periodEnd = (updatedSub as any).current_period_end
        ? new Date((updatedSub as any).current_period_end * 1000).toISOString()
        : null

      await supabase
        .from('profiles')
        .update({
          cancel_at_period_end: true,
          current_period_end: periodEnd,
        })
        .eq('id', userId)

      return NextResponse.json({
        success: true,
        isUpgrade: false,
        newPlan: 'free',
        currentPeriodEnd: periodEnd,
      })
    }

    if (!PLAN_TO_PRICE[newPlan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

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

    let subscription: Stripe.Subscription
    try {
      subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
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
      await sendAdminAlertEmail({ userId, event: 'change-plan: invalid_status' })
      return NextResponse.json({ error: 'subscription_reset', message: 'サブスクリプションをリセットしました。再度登録をお願いします。' }, { status: 400 })
    }

    const subscriptionItemId = subscription.items.data[0].id
    const periodEnd = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000).toISOString()
      : null

    if (isUpgrade) {
      await stripe.subscriptions.update(profile.stripe_subscription_id, {
        items: [{ id: subscriptionItemId, price: newPriceId }],
        proration_behavior: 'create_prorations',
      })

      await supabase
        .from('profiles')
        .update({ plan: newPlan, plan_status: 'active', cancel_at_period_end: false })
        .eq('id', userId)

      const customer = await stripe.customers.retrieve(subscription.customer as string)
      const email = (customer as any).email
      if (email) {
        await sendUpgradeEmail({
          to: email,
          planLabel: newPlan === 'light' ? 'Lightプラン' : newPlan === 'standard' ? 'Standardプラン' : 'Premiumプラン',
          currentPeriodEnd: periodEnd,
        })
      }

    } else {
      await stripe.subscriptions.update(profile.stripe_subscription_id, {
        items: [{ id: subscriptionItemId, price: newPriceId }],
        proration_behavior: 'none',
        billing_cycle_anchor: 'unchanged' as any,
      })

      await supabase
        .from('profiles')
        .update({ plan: newPlan, plan_status: 'active' })
        .eq('id', userId)

      const customer = await stripe.customers.retrieve(subscription.customer as string)
      const email = (customer as any).email
      if (email) {
        await sendDowngradeEmail({
          to: email,
          newPlanLabel: newPlan === 'light' ? 'Lightプラン' : newPlan === 'standard' ? 'Standardプラン' : 'Premiumプラン',
          currentPeriodEnd: periodEnd,
        })
      }
    }

    return NextResponse.json({
      success: true,
      isUpgrade,
      newPlan,
      currentPeriodEnd: periodEnd,
    })

  } catch (error: any) {
    console.error('change-plan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}