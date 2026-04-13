import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, email } = await req.json();

    // Customerを作成（またはメールで既存検索）
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer: Stripe.Customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email, metadata: { userId } });
    }

    // Subscriptionを作成（incomplete状態で）
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { userId, priceId },
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice & {
  payment_intent: Stripe.PaymentIntent;
};
const paymentIntent = invoice.payment_intent;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: "決済の開始に失敗しました" }, { status: 500 });
  }
}