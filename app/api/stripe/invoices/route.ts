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

    const [profileRes, purchasesRes] = await Promise.all([
      supabase.from('profiles').select('stripe_customer_id').eq('id', userId).single(),
      supabase.from('purchases').select('id, material_id, amount, created_at, stripe_payment_intent_id').eq('user_id', userId).order('created_at', { ascending: false }),
    ])

    // Stripe invoices (subscription billing)
    let stripeItems: {
      id: string; created: number; amount_paid: number; status: string;
      hosted_invoice_url: string | null; invoice_pdf: string | null; type: 'subscription'; material_id: null;
    }[] = []

    if (profileRes.data?.stripe_customer_id) {
      const invoiceList = await stripe.invoices.list({
        customer: profileRes.data.stripe_customer_id,
        limit: 48,
      })
      stripeItems = invoiceList.data.map((inv) => ({
        id: inv.id,
        created: inv.created,
        amount_paid: inv.amount_paid,
        status: inv.status ?? 'unknown',
        hosted_invoice_url: inv.hosted_invoice_url ?? null,
        invoice_pdf: inv.invoice_pdf ?? null,
        type: 'subscription' as const,
        material_id: null,
      }))
    }

    // Single purchase items
    const purchaseItems = (purchasesRes.data ?? []).map((p) => ({
      id: `purchase_${p.id}`,
      created: Math.floor(new Date(p.created_at).getTime() / 1000),
      amount_paid: p.amount ?? 300,
      status: 'paid',
      hosted_invoice_url: null,
      invoice_pdf: null,
      type: 'purchase' as const,
      material_id: p.material_id as string,
    }))

    const all = [...stripeItems, ...purchaseItems].sort((a, b) => b.created - a.created)

    return NextResponse.json({ invoices: all })

  } catch (error) {
    console.error('invoices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
