import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] })
    }

    const invoiceList = await stripe.invoices.list({
      customer: profile.stripe_customer_id,
      limit: 24,
    })

    const invoices = invoiceList.data.map((inv) => ({
      id: inv.id,
      created: inv.created,
      amount_paid: inv.amount_paid,
      status: inv.status,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
    }))

    return NextResponse.json({ invoices })

  } catch (error) {
    console.error('invoices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}