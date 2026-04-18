import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const maxDuration = 15

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

  console.log('[delete-account] soft delete start', userId)

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_subscription_id) {
    try {
      await stripe.subscriptions.update(profile.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
      console.log('[delete-account] stripe subscription set to cancel_at_period_end')
    } catch (e: any) {
      console.error('[delete-account] stripe cancel error:', e?.message)
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      status: 'deleted',
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('[delete-account] profile update error:', error)
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  }

  console.log('[delete-account] soft delete done', userId)
  return NextResponse.json({ success: true })
}
