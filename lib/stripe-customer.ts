import Stripe from "stripe";
import { SupabaseClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * ユーザーのStripe顧客IDを取得または新規作成する。
 * - Supabaseに保存済みIDがあればStripeで存在確認してから返す
 * - 削除済み or 未登録なら新規作成してSupabaseに保存
 * - 重複顧客を防ぐため、作成前にStripeをメールで検索する
 */
export async function getOrCreateStripeCustomer(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) {
    try {
      const existing = await stripe.customers.retrieve(profile.stripe_customer_id);
      if (!(existing as Stripe.DeletedCustomer).deleted) {
        return profile.stripe_customer_id;
      }
    } catch (e: any) {
      if (e?.code !== "resource_missing") throw e;
    }
    // 削除済み → IDをリセットして新規作成へ
    await supabase.from("profiles").update({ stripe_customer_id: null }).eq("id", userId);
  }

  // Stripeにメールで重複がないか確認
  const existing = await stripe.customers.search({
    query: `email:"${email}" AND metadata["user_id"]:"${userId}"`,
    limit: 1,
  });
  if (existing.data.length > 0) {
    const customerId = existing.data[0].id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
    return customerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });
  await supabase.from("profiles").update({ stripe_customer_id: customer.id }).eq("id", userId);
  return customer.id;
}
