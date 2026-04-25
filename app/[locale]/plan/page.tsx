import Link from "next/link";

const plans = [
  {
    key: "free",
    name: "無料プラン",
    price: null,
    description: "まずは試してみたい方に。無料登録だけで基本機能をお使いいただけます。",
    features: [
      "お気に入り登録（最大5件）",
      "ダウンロード履歴（最大5件）",
      "無料教材のダウンロード",
    ],
  },
  {
    key: "light",
    name: "ライトプラン",
    price: 500,
    description: "教材を単品で購入しながら使いたい方に。お気に入りやDL履歴も無制限になります。",
    features: [
      "お気に入り登録（無制限）",
      "ダウンロード履歴（無制限）",
      "無料教材のダウンロード",
      "ライト教材のダウンロード",
      "おすすめ教材表示",
      "単品購入機能",
    ],
  },
  {
    key: "standard",
    name: "スタンダードプラン",
    price: 980,
    description: "最もよく選ばれるプラン。スタンダード教材まで月額で使い放題になります。",
    features: [
      "ライトプランの全機能",
      "スタンダード教材のダウンロード",
    ],
    featured: true,
  },
  {
    key: "premium",
    name: "プレミアムプラン",
    price: 1480,
    description: "全教材・全機能を使い放題。最大限活用したい方のためのプランです。",
    features: [
      "スタンダードプランの全機能",
      "プレミアム教材のダウンロード",
      "新着教材へのいち早いアクセス",
    ],
  },
];

export default function PlanPage() {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif", background: "#f8f4f4" }}>
      <div style={{ padding: "48px 0 36px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 80%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#bbb", textDecoration: "none", marginBottom: 24 }}>
          ← ホームに戻る
        </Link>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 10 }}>Pricing</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          料金プラン
        </h1>
        <p style={{ fontSize: 13, color: "#bbb", marginTop: 10 }}>用途に合わせてお選びください。いつでも変更・解約できます。</p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 48 }}>
          {plans.map((plan) => (
            <div
              key={plan.key}
              style={{
                background: plan.featured ? "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(228,155,253,0.12))" : "white",
                border: plan.featured ? "1.5px solid rgba(200,170,240,0.6)" : "0.5px solid rgba(200,170,240,0.25)",
                borderRadius: 18,
                padding: "28px 24px",
                position: "relative",
              }}
            >
              {plan.featured && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  おすすめ
                </div>
              )}
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#444", marginBottom: 8 }}>{plan.name}</h2>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#7a50b0", marginBottom: 4 }}>
                {plan.price ? <>¥{plan.price.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 500, color: "#aaa" }}>/月</span></> : "無料"}
              </div>
              <p style={{ fontSize: 12, color: "#888", lineHeight: 1.7, marginBottom: 16 }}>{plan.description}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: 13, color: "#666", padding: "5px 0", display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: "#c9a0f0", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ background: "white", borderRadius: 16, border: "0.5px solid rgba(200,170,240,0.2)", padding: "28px 32px", marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#444", marginBottom: 16 }}>よくある質問</h2>
          <dl>
            <dt style={{ fontSize: 14, fontWeight: 600, color: "#555", marginBottom: 4 }}>いつでも解約できますか？</dt>
            <dd style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16, marginLeft: 0 }}>はい。マイページからいつでもプランの変更・解約が可能です。解約後も次回更新日まではサービスをご利用いただけます。</dd>
            <dt style={{ fontSize: 14, fontWeight: 600, color: "#555", marginBottom: 4 }}>支払い方法は？</dt>
            <dd style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16, marginLeft: 0 }}>クレジットカード（Visa / Mastercard / American Express / JCB）でのお支払いに対応しています。決済はStripeを通じて安全に処理されます。</dd>
            <dt style={{ fontSize: 14, fontWeight: 600, color: "#555", marginBottom: 4 }}>返金はできますか？</dt>
            <dd style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginLeft: 0 }}>サービスの性質上、原則として返金はいたしかねます。ご不明な点は事前にお問い合わせください。</dd>
          </dl>
        </div>

        <div style={{ textAlign: "center" }}>
          <Link href="/" style={{ display: "inline-block", fontSize: 14, padding: "12px 40px", borderRadius: 24, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", textDecoration: "none", fontWeight: 700 }}>
            プランを選んで始める →
          </Link>
        </div>
      </div>
    </div>
  );
}
