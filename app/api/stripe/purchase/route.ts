import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getOrCreateStripeCustomer } from "../../../../lib/stripe-customer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { materialId, userId, email } = await req.json();

    // すでに購入済みか確認
    const { data: existing } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("material_id", materialId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "ALREADY_PURCHASED" }, { status: 400 });
    }

    const customerId = await getOrCreateStripeCustomer(supabase, userId, email);

    // 支払い方法を確認
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    if (paymentMethods.data.length === 0) {
      return NextResponse.json({ requiresPaymentMethod: true });
    }

    // 支払い方法があれば即決済
    const paymentMethod = paymentMethods.data[0];
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 300,
      currency: "jpy",
      customer: customerId,
      payment_method: paymentMethod.id,
      confirm: true,
      off_session: true,
      metadata: { user_id: userId, material_id: materialId },
    });

    if (paymentIntent.status === "succeeded" || paymentIntent.status === "processing") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "決済に失敗しました" }, { status: 400 });

  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}