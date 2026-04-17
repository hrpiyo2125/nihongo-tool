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
    const { userId, email, priceId } = await req.json();

    const customerId = await getOrCreateStripeCustomer(supabase, userId, email);

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    if (paymentMethods.data.length === 0) {
      return NextResponse.json({ requiresPaymentMethod: true });
    }

    const paymentMethodId = paymentMethods.data[0].id;

    // Supabaseに保存済みのサブスクIDを優先して使う（stripe.subscriptions.list呼び出しを省略）
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", userId)
      .single();

    if (profile?.stripe_subscription_id) {
      try {
        const existingSub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
        if (existingSub.status === "active" || existingSub.status === "trialing") {
          const updatedSub = await stripe.subscriptions.update(existingSub.id, {
            items: [{ id: existingSub.items.data[0].id, price: priceId }],
            proration_behavior: "always_invoice",
          });
          const planMap: Record<string, string> = {
            [process.env.NEXT_PUBLIC_STRIPE_LIGHT_PRICE_ID!]: "light",
            [process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID!]: "standard",
            [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!]: "premium",
          };
          const newPlan = planMap[priceId] ?? "light";
          await supabase.from("profiles").update({
            plan: newPlan,
            stripe_subscription_id: updatedSub.id,
          }).eq("id", userId);
          return NextResponse.json({ success: true });
        }
      } catch {
        // サブスクが存在しない場合は新規作成へ
      }
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: { user_id: userId },
    });

    if (subscription.status === "active") {
      const planMap: Record<string, string> = {
        [process.env.NEXT_PUBLIC_STRIPE_LIGHT_PRICE_ID!]: "light",
        [process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID!]: "standard",
        [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!]: "premium",
      };
      const newPlan = planMap[priceId] ?? "light";
      await supabase
        .from("profiles")
        .update({
          plan: newPlan,
          stripe_subscription_id: subscription.id,
        })
        .eq("id", userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "登録に失敗しました" }, { status: 400 });

  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}