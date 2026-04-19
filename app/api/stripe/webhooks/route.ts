import { NextRequest, NextResponse } from 'next/server'
import {
  sendCancelEmail,
  sendDowngradedToFreeEmail,
  sendPaymentFailedEmail,
  sendTrialEndingSoonEmail,
} from '@/lib/email'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// priceId → plan名のマッピング
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_LIGHT_PRICE_ID!]: 'light',
  [process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID!]: 'standard',
  [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!]: 'premium',
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  switch (event.type) {

    // ─── 単品購入 ───────────────────────────────────────────
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const { user_id, material_id } = paymentIntent.metadata

      if (user_id && material_id) {
        const { error } = await supabase.from('purchases').insert({
          user_id,
          material_id,
          stripe_payment_intent_id: paymentIntent.id,
        })
        if (error) {
          console.error('purchases insert error:', error)
          return NextResponse.json({ error: 'DB error' }, { status: 500 })
        }
      }
      break
    }

    // ─── サブスク決済成功 ────────────────────────────────────
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription: string
      }
      const subscriptionId = invoice.subscription
      if (!subscriptionId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = subscription.metadata?.userId
      const priceId = subscription.items.data[0]?.price.id
      const plan = PRICE_TO_PLAN[priceId] ?? 'free'

      if (userId) {
        await supabase
          .from('profiles')
          .update({
            plan,
            plan_status: 'active',
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            cancel_at_period_end: false,
            current_period_end: subscription.items.data[0]?.current_period_end
              ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
              : null,
            payment_failed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      }
      break
    }

    // ─── サブスク更新（プラン変更・キャンセル予約など）──────────
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      if (!userId) break

      const priceId = subscription.items.data[0]?.price.id
      const plan = PRICE_TO_PLAN[priceId] ?? 'free'
      const status = subscription.status
      const cancelAtPeriodEnd = subscription.cancel_at_period_end
      const cancelAt = subscription.cancel_at // 特定日付指定のキャンセル
      const isCanceling = cancelAtPeriodEnd || !!cancelAt

      // 解約メール重複送信防止のため、現在のSupabase状態を確認
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('cancel_at_period_end')
        .eq('id', userId)
        .single()

      const isNewCancellation = isCanceling && !currentProfile?.cancel_at_period_end

      // current_period_end: cancel_at が設定されていればその日付を優先
      const periodEnd = cancelAt
        ? new Date(cancelAt * 1000).toISOString()
        : subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : null

      if (isCanceling) {
        // planも更新（解約予約中のプラン変更に対応）
        await supabase
          .from('profiles')
          .update({
            plan,
            cancel_at_period_end: true,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        // 新規解約のみメール送信（APIルートからの解約はAPIが送信するため重複防止）
        if (isNewCancellation) {
          const customerData = await stripe.customers.retrieve(subscription.customer as string)
          const email = (customerData as any).email
          const { data: profile } = await supabase
            .from('profiles')
            .select('current_period_end')
            .eq('id', userId)
            .single()
          if (email) {
            await sendCancelEmail({
              to: email,
              currentPeriodEnd: profile?.current_period_end ?? null,
            })
          }
        }
      } else {
        // プラン変更（解約なし）：planも更新
        await supabase
          .from('profiles')
          .update({
            plan,
            plan_status: status,
            cancel_at_period_end: false,
            current_period_end: subscription.items.data[0]?.current_period_end
              ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      }

      break
    }

    // ─── サブスク終了（期間終了・free降格）──────────────────────
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      if (!userId) break

      // 退会予約中（pending_deletion）だった場合は完全削除へ移行
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', userId)
        .single()

      const isPendingDeletion = currentProfile?.status === 'pending_deletion'

      const updateData: Record<string, any> = {
        plan: 'free',
        plan_status: 'canceled',
        stripe_subscription_id: null,
        cancel_at_period_end: false,
        current_period_end: null,
        trial_end: null,
        payment_failed_at: null,
        updated_at: new Date().toISOString(),
      }
      if (isPendingDeletion) {
        updateData.status = 'deleted'
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

      if (!isPendingDeletion) {
        const deletedCustomer = await stripe.customers.retrieve(subscription.customer as string)
        const deletedEmail = (deletedCustomer as any).email
        if (deletedEmail) {
          await sendDowngradedToFreeEmail({ to: deletedEmail })
        }
      }

      break
    }

    // ─── 決済失敗 ────────────────────────────────────────────
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription: string
      }
      const subscriptionId = invoice.subscription
      if (!subscriptionId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = subscription.metadata?.userId
      if (!userId) break

      // 初回失敗時のみ payment_failed_at をセット（猶予期間の起点）
      const { data: profile } = await supabase
        .from('profiles')
        .select('payment_failed_at')
        .eq('id', userId)
        .single()

      if (!profile?.payment_failed_at) {
        await supabase
          .from('profiles')
          .update({
            plan_status: 'past_due',
            payment_failed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      }

      const failedCustomer = await stripe.customers.retrieve(subscription.customer as string)
      const failedEmail = (failedCustomer as any).email
      if (failedEmail) {
        await sendPaymentFailedEmail({ to: failedEmail })
      }

      break
    }

    // ─── トライアル終了3日前 ──────────────────────────────────
    case 'customer.subscription.trial_will_end': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      if (!userId) break

      const trialCustomer = await stripe.customers.retrieve(subscription.customer as string)
      const trialEmail = (trialCustomer as any).email
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null
      if (trialEmail) {
        await sendTrialEndingSoonEmail({
          to: trialEmail,
          trialEnd,
        })
      }

      break
    }

  }

  return NextResponse.json({ received: true })
}