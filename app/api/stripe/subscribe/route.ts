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
    const { userId, email, priceId } = await req.json();

    let customerId: string;
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({ email, metadata: { user_id: userId } });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    if (paymentMethods.data.length === 0) {
      return NextResponse.json({ requiresPaymentMethod: true });
    }

    const paymentMethodId = paymentMethods.data[0].id;

    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    if (existingSubscriptions.data.length > 0) {
      return NextResponse.json({ error: "ALREADY_SUBSCRIBED" }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: { user_id: userId },
    });

    if (subscription.status === "active") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "登録に失敗しました" }, { status: 400 });

  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}