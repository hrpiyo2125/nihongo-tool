"use client"
import Link from "next/link";

type FAQ = { q: string; a: string };
type Category = { label: string; faqs: FAQ[] };

const categories: Category[] = [
  {
    label: "サービスについて",
    faqs: [
      { q: "toolioとはどんなサービスですか？", a: "toolioは、海外で日本語を学ぶ子どもたちのための教材プラットフォームです。ひらがな・カタカナ・漢字・算数など、さまざまな教材を印刷してすぐ使える形でご提供しています。先生や保護者の方がすぐに授業や家庭学習に取り入れられるよう、使い方ガイドも一緒にご用意しています。" },
      { q: "無料で使えますか？", a: "はい、一部の教材は無料でご利用いただけます。無料アカウントを作成すると、お気に入り保存・ダウンロード履歴などの機能もご利用いただけます。さらに多くの教材・体系的なカリキュラムをご利用いただくには、サブスクリプションプランへの登録をお勧めします。" },
      { q: "どんな人向けのサービスですか？", a: "主に海外の日本語補習校・国際校・日本語学校の先生、および海外在住の日本語を学ぶお子さんをお持ちの保護者の方を対象としています。日本語を母語としない環境で育つ子どもたちが、楽しく日本語を学べる教材を提供しています。" },
    ],
  },
  {
    label: "アカウント・登録",
    faqs: [
      { q: "アカウント登録は必要ですか？", a: "一部の教材は登録なしでご覧いただけますが、ダウンロード・お気に入り保存などの機能にはアカウント登録（無料）が必要です。メールアドレスだけで簡単に登録できます。" },
      { q: "登録に費用はかかりますか？", a: "無料アカウントの登録は完全無料です。有料のサブスクリプションプランへの加入は任意です。" },
      { q: "アカウントを削除したい場合はどうすればいいですか？", a: "マイページのアカウント設定から削除できます。削除の際、保存したお気に入りやダウンロード履歴はすべて削除されます。ご不明な点はチャットよりお問い合わせください。" },
    ],
  },
  {
    label: "教材について",
    faqs: [
      { q: "教材はどのような形式で提供されますか？", a: "教材はPDF形式でご提供します。ダウンロードして印刷してお使いいただけます。印刷した教材は、個人の学習目的・教室内での教育目的に限りご使用いただけます。" },
      { q: "教材を印刷して配布してもいいですか？", a: "担当するクラスや家族内での教育目的での配布はOKです。ただし、第三者への販売・無制限の配布・ウェブ上への再掲載はお断りしています。詳しくは利用規約をご確認ください。" },
      { q: "対象年齢はありますか？", a: "教材によって対象年齢が異なります。各教材のページに対象年齢・対象レベルを記載しています。主に就学前〜小学校低学年を対象とした教材が中心ですが、幅広いレベルの教材を順次追加予定です。" },
      { q: "リクエストした教材は作ってもらえますか？", a: "現在、個別のリクエストには対応しておりません。ただし、お問い合わせフォームからご要望をお送りいただくと、今後の教材制作の参考にさせていただきます。" },
    ],
  },
  {
    label: "プラン・料金",
    faqs: [
      { q: "サブスクリプションプランの違いは何ですか？", a: "無料プランでは一部の教材をご利用いただけます。ライトプラン（月額500円）では単品購入・ライト教材が利用可能になります。スタンダードプラン（月額980円）ではスタンダード教材まで、プレミアムプラン（月額1,480円）では全教材・全機能がご利用いただけます。" },
      { q: "いつでも無料プランに変更できますか？", a: "はい、いつでもマイページから無料プランに変更できます。変更後も次回更新日までは引き続きサービスをご利用いただけます。" },
      { q: "返金はできますか？", a: "サービスの性質上、原則として返金はいたしかねます。ご不明な点は事前にチャットよりお問い合わせください。" },
    ],
  },
  {
    label: "技術・動作環境",
    faqs: [
      { q: "スマートフォンでも使えますか？", a: "はい、スマートフォン・タブレット・PCでご利用いただけます。ただし、PDFのダウンロード・印刷にはPCのご利用をお勧めします。" },
      { q: "推奨ブラウザはありますか？", a: "Chrome・Safari・Firefox・Edgeの最新バージョンを推奨しています。古いバージョンのブラウザでは一部機能が正常に動作しない場合があります。" },
    ],
  },
];

export default function FAQPage() {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif", background: "#f8f4f4" }}>
      <div style={{ padding: "48px 0 36px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 80%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#bbb", textDecoration: "none", marginBottom: 24 }}>
          ← ホームに戻る
        </Link>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 10 }}>Support</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          よくある質問
        </h1>
        <p style={{ fontSize: 13, color: "#bbb", marginTop: 10 }}>Frequently Asked Questions</p>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
        {categories.map((cat) => (
          <section key={cat.label} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#7a50b0", marginBottom: 12, paddingLeft: 4 }}>{cat.label}</h2>
            <div style={{ background: "white", borderRadius: 16, border: "0.5px solid rgba(200,170,240,0.2)", overflow: "hidden" }}>
              {cat.faqs.map((faq) => (
                <details key={faq.q} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                  <summary style={{ padding: "18px 24px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14, listStyle: "none", fontSize: 14, fontWeight: 600, color: "#444", lineHeight: 1.6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#a3c0ff", flexShrink: 0, paddingTop: 1 }}>Q.</span>
                    <span style={{ flex: 1 }}>{faq.q}</span>
                  </summary>
                  <div style={{ padding: "4px 24px 20px 52px", fontSize: 14, color: "#666", lineHeight: 1.9 }}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div style={{ marginTop: 40, background: "linear-gradient(135deg,rgba(244,185,185,0.1),rgba(228,155,253,0.1))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 16, padding: "28px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#555", marginBottom: 8 }}>解決しない場合はお気軽にご連絡ください</div>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 20, lineHeight: 1.7 }}>画面右下のチャットからお気軽にご連絡ください。</div>
          <button
            onClick={() => { (window as any).$crisp?.push(['do', 'chat:open']) }}
            style={{ display: "inline-block", fontSize: 13, padding: "10px 32px", borderRadius: 20, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}
          >
            チャットで問い合わせる →
          </button>
        </div>
      </div>
    </div>
  );
}
