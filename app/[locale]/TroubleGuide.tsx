"use client";
import { useState } from "react";
import { BrandIcon } from "../../components/BrandIcon";

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const categories = [
    {
      label: "サービスについて",
      faqs: [
        { q: "toolioとはどんなサービスですか？", a: "toolioは、海外で日本語を学ぶ子どもたちのための教材プラットフォームです。ひらがな・カタカナ・漢字・算数など、さまざまな教材を印刷してすぐ使える形でご提供しています。" },
        { q: "無料で使えますか？", a: "はい、一部の教材は無料でご利用いただけます。無料アカウントを作成すると、お気に入り保存・ダウンロード履歴などの機能もご利用いただけます。" },
        { q: "どんな人向けのサービスですか？", a: "主に海外の日本語補習校・国際校・日本語学校の先生、および海外在住の日本語を学ぶお子さんをお持ちの保護者の方を対象としています。" },
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
        { q: "教材はどのような形式で提供されますか？", a: "教材はPDF形式でご提供します。ダウンロードして印刷してお使いいただけます。" },
        { q: "教材を印刷して配布してもいいですか？", a: "担当するクラスや家族内での教育目的での配布はOKです。ただし、第三者への販売・無制限の配布・ウェブ上への再掲載はお断りしています。" },
        { q: "対象年齢はありますか？", a: "教材によって対象年齢が異なります。各教材のページに対象年齢・対象レベルを記載しています。" },
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
        { q: "推奨ブラウザはありますか？", a: "Chrome・Safari・Firefox・Edgeの最新バージョンを推奨しています。" },
      ],
    },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column" as const }}>
      <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>よくある質問</h2>
      </div>
      <div style={{ padding: "36px 48px 64px", display: "flex", flexDirection: "column" as const, gap: 32 }}>
        {categories.map((cat) => (
          <div key={cat.label}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#b07de0", letterSpacing: 1, marginBottom: 12 }}>{cat.label}</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {cat.faqs.map((faq, i) => {
                const key = `${cat.label}-${i}`;
                const open = openIndex === key;
                return (
                  <div key={key} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 12, overflow: "hidden" }}>
                    <button onClick={() => setOpenIndex(open ? null : key)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" as const, gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#444", lineHeight: 1.5 }}>{faq.q}</span>
                      <span style={{ fontSize: 16, color: "#c9a0f0", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>›</span>
                    </button>
                    {open && (
                      <div style={{ padding: "0 20px 16px", fontSize: 13, color: "#777", lineHeight: 1.8, borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
                        <div style={{ paddingTop: 12 }}>{faq.a}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export { FaqSection };
