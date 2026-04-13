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
    const { materialId, materialTitle } = await req.json();

    // ユーザー認証確認
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // すでに購入済みか確認
    const { data: existing } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("material_id", materialId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "ALREADY_PURCHASED" }, { status: 400 });
    }

    // Stripe PaymentIntent作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 350,
      currency: "jpy",
      metadata: {
        user_id: user.id,
        material_id: materialId,
      },
      description: `toolio 教材単品購入: ${materialTitle}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}