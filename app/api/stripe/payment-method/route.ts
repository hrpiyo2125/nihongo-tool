import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No customer" }, { status: 404 });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: "card",
    });

    if (paymentMethods.data.length === 0) {
      return NextResponse.json({ error: "No payment method" }, { status: 404 });
    }

    const card = paymentMethods.data[0].card;
    return NextResponse.json({
      brand: card?.brand ?? "card",
      last4: card?.last4 ?? "••••",
    });

  } catch (error) {
    console.error("Payment method error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}