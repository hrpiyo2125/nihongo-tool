import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

// Supabaseはservice_roleキーを使う（RLSをバイパスするため）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const priceToplan: Record<string, string> = {
  "price_1THEnBGhqjyGHGfCXxb9uRNa": "light",
  "price_1THEo4GhqjyGHGfCt2x1xP3t": "standard",
  "price_1THEofGhqjyGHGfC6yPrXrrr": "premium",
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const customerId = session.customer as string;

    // subscriptionのpriceIdを取得
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const priceId = subscription.items.data[0].price.id;
    const plan = priceToplan[priceId] ?? "free";

    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        plan,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // customerIdからuserを特定
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (data) {
      await supabase.from("profiles").update({
        plan: "free",
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      }).eq("id", data.id);
    }
  }

  return NextResponse.json({ received: true });
}