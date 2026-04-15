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
      // 既存のCustomerIDが有効か確認
      try {
        await stripe.customers.retrieve(profile.stripe_customer_id);
        customerId = profile.stripe_customer_id;
      } catch (e: any) {
        if (e?.code === "resource_missing") {
          // StripeにCustomerが存在しない → Supabaseをリセットして新規作成
          await supabase.from("profiles").update({ stripe_customer_id: null }).eq("id", userId);
          const customer = await stripe.customers.create({ email, metadata: { user_id: userId } });
          customerId = customer.id;
          await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
        } else {
          throw e;
        }
      }
    } else {
      const customer = await stripe.customers.create({ email, metadata: { user_id: userId } });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      metadata: { user_id: userId, price_id: priceId },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    });

  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}