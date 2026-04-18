import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_MAP: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_LIGHT_PRICE_ID!]: "light",
  [process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID!]: "standard",
  [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!]: "premium",
};

export async function POST(req: NextRequest) {
  try {
    const { userId, priceId } = await req.json();

    // Supabaseを1回だけ呼ぶ
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_customer_id) {
      // 顧客未登録 = カードなし（新規カード入力フローへ）
      return NextResponse.json({ requiresPaymentMethod: true });
    }

    const customerId = profile.stripe_customer_id;

    // Stripeからカード情報取得
    let paymentMethods: Stripe.ApiList<Stripe.PaymentMethod>;
    try {
      paymentMethods = await stripe.paymentMethods.list({ customer: customerId, type: "card" });
    } catch (e: any) {
      if (e?.code === "resource_missing") {
        // StripeにCustomerが存在しない → Supabaseをリセットしてエラーを返す
        await supabase.from("profiles").update({ stripe_customer_id: null, stripe_subscription_id: null }).eq("id", userId);
        return NextResponse.json({ error: "stripe_customer_missing" }, { status: 404 });
      }
      throw e;
    }

    if (paymentMethods.data.length === 0) {
      return NextResponse.json({ requiresPaymentMethod: true });
    }

    const paymentMethodId = paymentMethods.data[0].id;

    // 既存サブスクがあればプラン変更（retrieve 1回）
    if (profile.stripe_subscription_id) {
      try {
        const existingSub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
        if (existingSub.status === "active" || existingSub.status === "trialing") {
          const updatedSub = await stripe.subscriptions.update(existingSub.id, {
            items: [{ id: existingSub.items.data[0].id, price: priceId }],
            proration_behavior: "always_invoice",
          });
          const newPlan = PLAN_MAP[priceId] ?? "light";
          await supabase.from("profiles").update({ plan: newPlan, stripe_subscription_id: updatedSub.id }).eq("id", userId);
          return NextResponse.json({ success: true });
        }
      } catch (e: any) {
        if (e?.code !== "resource_missing") throw e;
        // Stripeにサブスクが存在しない → 新規作成へ
        await supabase.from("profiles").update({ stripe_subscription_id: null }).eq("id", userId);
      }
    }

    // 新規サブスク作成
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: { userId },
    });

    if (subscription.status === "active") {
      const newPlan = PLAN_MAP[priceId] ?? "light";
      await supabase.from("profiles").update({ plan: newPlan, stripe_subscription_id: subscription.id }).eq("id", userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "登録に失敗しました" }, { status: 400 });

  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
