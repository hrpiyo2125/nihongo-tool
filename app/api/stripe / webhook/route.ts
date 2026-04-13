import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id ?? session.metadata?.userId
      const type = session.metadata?.type

      // 追加購入（addon）の場合のみここで処理
      if (type === 'addon' && userId) {
        const quantity = parseInt(session.metadata?.quantity ?? '5')
        const now = new Date()
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

        const { data: existing } = await supabase
          .from('download_counts')
          .select('count')
          .eq('user_id', userId)
          .eq('year_month', yearMonth)
          .single()

        const currentCount = existing?.count ?? 0

        await supabase
          .from('download_counts')
          .upsert({
            user_id: userId,
            year_month: yearMonth,
            count: Math.max(0, currentCount - quantity),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,year_month'
          })
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice & {
  subscription: string;
}
const subscriptionId = invoice.subscription
      if (!subscriptionId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = subscription.metadata?.userId
      const priceId = subscription.items.data[0]?.price.id

      if (userId && priceId) {
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            price_id: priceId,
            status: 'active',
          }, {
            onConflict: 'user_id'
          })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}