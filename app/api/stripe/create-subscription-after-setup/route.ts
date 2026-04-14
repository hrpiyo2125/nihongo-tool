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
    const { userId, setupIntentId } = await req.json();

    // SetupIntentからpriceIdとpaymentMethodを取得
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    const priceId = setupIntent.metadata?.price_id;
    const paymentMethodId = setupIntent.payment_method as string;

    if (!priceId || !paymentMethodId) {
      return NextResponse.json({ error: "Invalid setup intent" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No customer" }, { status: 404 });
    }

    // デフォルト支払い方法に設定
    await stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // サブスク作成
    const subscription = await stripe.subscriptions.create({
      customer: profile.stripe_customer_id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: { user_id: userId },
    });

    if (subscription.status === "active") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "登録に失敗しました" }, { status: 400 });

  } catch (error) {
    console.error("Subscription after setup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}