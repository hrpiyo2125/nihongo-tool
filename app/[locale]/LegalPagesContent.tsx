"use client";
import { useState } from "react";

const HERO_BG = "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)";
const GRAD_TEXT: React.CSSProperties = { background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" };

function PageShell({ title, children, compact }: { title: string; children: React.ReactNode; compact?: boolean }) {
  if (compact) {
    return <div style={{ padding: "24px 20px 56px" }}>{children}</div>;
  }
  return (
    <div>
      <div style={{ padding: "60px 48px 40px", background: HERO_BG, borderRadius: "16px 16px 0 0" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 0, ...GRAD_TEXT }}>{title}</h2>
      </div>
      <div style={{ padding: "32px 48px 56px" }}>{children}</div>
    </div>
  );
}

// ===== プライバシーポリシー =====
const privacySections = [
  { title: "収集する情報", content: `toolio（以下「当サービス」）は、以下の情報を収集することがあります。\n\n・アカウント登録時にご提供いただく情報（メールアドレス・氏名など）\n・Googleアカウントでログインされた場合、Google社より提供される情報（メールアドレス・名前・プロフィール画像）\n・ご利用状況に関する情報（ダウンロード履歴・お気に入りなど）\n・デバイス情報・アクセスログ・IPアドレス\n・お支払いに関する情報（決済代行会社を通じて処理されます）\n・マイページで任意にご入力いただいた情報（居住地・職業・利用目的など）` },
  { title: "情報の利用目的", content: `収集した情報は以下の目的に使用します。\n\n・サービスの提供・運営・改善\n・お問い合わせへの対応\n・サービスに関するご案内の送付\n・利用規約への違反行為の検知・対応\n・統計データの作成（個人を特定しない形式）` },
  { title: "第三者への提供・外部サービスへのデータ預託", content: `当サービスは、以下の場合を除き、お客様の個人情報を第三者に提供しません。\n\n・お客様の同意がある場合\n・法令に基づく場合\n・人の生命・身体・財産を保護するために必要な場合\n\n【外部サービスへのデータ預託】\n当サービスは、サービス運営のために以下の外部サービスに個人情報の一部を預託しています。各社のプライバシーポリシーに従い管理されます。\n\n・Supabase社（認証・データベース管理）\n・Stripe社（決済処理）\n・Resend社（メール送信）` },
  { title: "Cookieの使用", content: `当サービスはCookieを使用することがあります。Cookieはブラウザの設定により無効にすることができますが、一部機能がご利用いただけなくなる場合があります。` },
  { title: "データの保存期間", content: `当サービスは、サービス提供に必要な期間、お客様の個人情報を保存します。\n\n・アカウント情報：退会後30日以内に削除します\n・ダウンロード履歴・お気に入り：退会と同時に削除します\n・お問い合わせ履歴：対応完了後1年間保存した後、削除します\n・決済情報：Stripe社の規定に従い管理されます\n\nなお、法令により保存が義務付けられている情報については、法令の定める期間保存します。` },
  { title: "子どものプライバシー", content: `当サービスは子どもの日本語学習を支援するサービスですが、アカウント登録・契約の主体は保護者または教師など成人の方を想定しています。\n\n・13歳未満のお子様の個人情報を保護者の同意なく収集することはありません\n・保護者の管理のもとでのご利用を推奨します\n・お子様の個人情報の削除をご希望の場合は、support@nihongo-tool.com までご連絡ください` },
  { title: "セキュリティ", content: `当サービスは、お客様の個人情報の安全管理のために適切な措置を講じます。ただし、インターネット上の通信において完全な安全を保証することはできません。` },
  { title: "国際的なデータ移転", content: `当サービスのデータは主に日本国内および当サービスが利用する外部サービス（Supabase・Stripe等）のサーバーで管理されます。\n\n海外からご利用の場合、お客様の個人情報が国境を越えて移転される場合があります。EUおよびEEA在住のお客様については、GDPRの定める範囲で適切に対応します。詳細はsupport@nihongo-tool.comまでお問い合わせください。` },
  { title: "個人情報の開示・訂正・削除", content: `お客様は、ご自身の個人情報の開示・訂正・削除を求めることができます。ご要望はsupport@nihongo-tool.comまでお問い合わせください。` },
  { title: "プライバシーポリシーの変更", content: `本ポリシーは予告なく変更される場合があります。重要な変更がある場合はサービス上でお知らせします。` },
  { title: "お問い合わせ", content: `本ポリシーに関するお問い合わせは、support@nihongo-tool.com までご連絡ください。` },
];

export function PrivacyContent({ onBack, compact }: { onBack: () => void; compact?: boolean }) {
  return (
    <PageShell title="プライバシーポリシー" compact={compact}>
      <p style={{ fontSize: 14, color: "#888", lineHeight: 1.9, marginBottom: 40, background: "#fafafa", borderRadius: 12, padding: "20px 24px", border: "0.5px solid rgba(200,170,240,0.2)" }}>
        toolio（nihongo-tool.com、以下「当サービス」）は、お客様の個人情報の保護を重要と考え、以下のプライバシーポリシーに従って個人情報を適切に取り扱います。
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {privacySections.map((s, i) => (
          <div key={s.title} style={{ background: "#fafafa", borderRadius: 14, border: "0.5px solid rgba(200,170,240,0.2)", padding: "24px 28px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#7a50b0", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", borderRadius: "50%", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
              {s.title}
            </h3>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 2, whiteSpace: "pre-line", margin: 0 }}>{s.content}</p>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#ccc", marginTop: 40 }}>制定日：2026年●月●日　／　最終更新日：2026年●月●日</p>
    </PageShell>
  );
}

// ===== 利用規約 =====
const termsSections = [
  { title: "サービスの概要", content: `toolio（以下「当サービス」）は、国内外で日本語を学ぶ子どもたちのための教材プラットフォームです。海外在住の継承語家庭のお子様、および日本国内の外国籍の日本語学習者など、様々な環境で日本語を学ぶ子どもたちを支援することを目的としています。教材のダウンロード・閲覧・印刷などの機能を提供します。当サービスは学校の先生・日本語教室の先生・保護者を主な対象としています。` },
  { title: "利用登録・未成年の利用", content: `当サービスの一部機能は無料アカウントの登録が必要です。登録にあたり正確な情報をご提供ください。虚偽の情報を登録した場合、アカウントを停止することがあります。\n\n18歳未満の方がご利用になる場合は、保護者の同意を得た上でご登録ください。保護者の方がお子様に代わって登録・利用することを推奨します。` },
  { title: "禁止事項", content: `以下の行為を禁止します。\n\n・当サービスのコンテンツを無断で複製・転載・再配布すること\n・当サービスを通じて第三者に教材を販売・譲渡すること\n・当サービスのシステムに不正アクセスを試みること\n・他の利用者または第三者の権利を侵害する行為\n・当サービスの教材・イラストのデザイン・構成・コンセプトを模倣した教材の作成・配布・販売\n・当サービスのコンテンツをAI・機械学習の学習データとして使用すること\n・その他、当サービスが不適切と判断する行為` },
  { title: "コンテンツの利用範囲", content: `当サービスの教材は、個人的な学習目的および担当クラス・担当生徒への教育目的に限り利用できます。\n\n【印刷・配布について】\n・担当する生徒・クラスへの配布は可能です\n・学校全体・他の先生・他のクラスへの共有・配布は禁止です\n・印刷した教材の有償配布・販売は禁止です\n・大量印刷・業務用途での利用は禁止です\n\n【オンライン授業について】\n・担当生徒とのオンライン授業での画面共有は可能です\n・授業の録画・配信・録画データの共有は禁止です\n\n著作権は当サービスに帰属します。商業目的での利用はいかなる形でも禁止します。` },
  { title: "著作権・知的財産権", content: `当サービスに掲載されている教材・テキスト・イラスト・画像・デザイン・ロゴ等の一切のコンテンツの著作権・知的財産権は、当サービス（toolio）に帰属します。\n\n・著作者名（toolio）の表示を削除・改変することを禁止します\n・コンテンツの全部または一部を当サービスの許可なく使用することを禁止します\n・本規約で明示的に許可された範囲以外の利用は一切禁止します` },
  { title: "イラストの保護", content: `当サービスのイラストは全て手描きによるオリジナル作品です。以下の行為を厳しく禁止します。\n\n・イラストを教材PDFから単体で抽出・切り出して使用すること\n・イラストを加工・改変して使用・配布すること\n・イラストをトレース・模写して自己の作品として公開すること\n・イラストを参考にした二次創作・派生作品の公開・配布\n・イラストをSNS・ブログ・YouTube等のメディアに無断掲載すること\n・イラストをAI・機械学習の学習データとして使用すること\n\n違反を発見した場合、削除要請および法的措置を取ることがあります。` },
  { title: "教材の模倣禁止", content: `当サービスの教材は全てオリジナルコンテンツです。会員は当サービスの教材のデザイン・構成・コンセプト・世界観を模倣した教材を作成し、配布・販売・公開することを禁止します。\n\n当サービスのコンテンツに着想を得た制作物の商業利用についても同様に禁止します。` },
  { title: "紹介・引用時のルール", content: `当サービスの教材を紹介・引用する場合は、以下の条件を全て満たす必要があります。\n\n① サービス名「toolio」を明記すること\n② 元ページのURL（https://nihongo-tool.com）をリンク形式で掲載すること\n③ 引用は必要最小限にとどめ、教材全体の転載はしないこと\n\nリンクのない引用・無断転載・SNSへの無断投稿は禁止します。` },
  { title: "アカウントの管理", content: `アカウントは登録者本人のみがご利用いただけます。\n\n・他者へのアカウントの貸与・共有・譲渡は禁止です\n・1アカウントは1名での利用を原則とします\n・アカウントの不正利用が確認された場合、予告なくアカウントを停止することがあります\n・アカウントに関する一切の責任は登録者本人が負うものとします` },
  { title: "プランと利用権限", content: `当サービスは以下の4つのプランを提供しており、プランによってアクセスできる教材の範囲が異なります。\n\n【プラン一覧】\n・無料プラン（無料）\n　→ 無料教材のダウンロード・お気に入り・ダウンロード履歴\n\n・ライトプラン（月額500円・税込）\n　→ 無料プランの機能 ＋ ライト教材のダウンロード ＋ 都次購入\n\n・スタンダードプラン（月額980円・税込）\n　→ ライトプランの機能 ＋ スタンダード教材のダウンロード\n\n・プレミアムプラン（月額1,480円・税込）\n　→ スタンダードプランの機能 ＋ プレミアム教材のダウンロード` },
  { title: "サブスクリプション・都度購入", content: `有料プランは月次サブスクリプション形式です。無料プランへの変更はマイページからいつでも行えます。変更後は次回更新日までサービスをご利用いただけます。料金の返金は原則として行っておりません。\n\n【都度購入】\nライトプラン以上のご利用者は、対象教材を1点あたり350円（税込）で単品購入することも可能です。購入した教材はサブスクリプションの有無に関わらずダウンロード可能ですが、本規約に定める利用範囲の制限は引き続き適用されます。` },
  { title: "サービスの変更・停止・終了", content: `当サービスは予告なくコンテンツの追加・変更・削除を行うことがあります。システムメンテナンスや不可抗力によりサービスが停止する場合があります。\n\nサービスを終了する場合は、可能な限り事前にお知らせします。サービス終了に伴う返金・データの提供義務は負いません。` },
  { title: "免責事項・損害賠償", content: `当サービスは、提供するコンテンツの正確性・完全性を保証するものではありません。当サービスの利用により生じた損害について、当サービスは責任を負いません。\n\n当サービスに起因する損害賠償責任が生じた場合、その上限額はお客様が当該月に支払われたサブスクリプション料金を上限とします。` },
  { title: "国際利用について", content: `当サービスは日本国内法に準拠して運営されています。国内外からご利用いただけますが、海外からご利用の場合は、お客様自身の責任において現地の法令を確認の上ご利用ください。当サービスは現地法令への適合を保証しません。` },
  { title: "違反時の対応", content: `本規約に違反する行為が確認された場合、当サービスは以下の措置を取ることがあります。\n\n・警告の通知\n・コンテンツの削除要請\n・アカウントの一時停止または永久停止\n・法的措置（著作権侵害・不正競争防止法違反等）` },
  { title: "準拠法・管轄", content: `本規約は日本法に準拠します。当サービスに関する紛争については、横浜地方裁判所を第一審の専属的合意管轄裁判所とします。` },
  { title: "規約の変更", content: `当サービスは本規約を予告なく変更することがあります。重要な変更の場合はサービス上でお知らせします。変更後も継続してご利用いただいた場合、変更後の規約に同意したものとみなします。` },
  { title: "お問い合わせ", content: `本規約に関するお問い合わせは、support@nihongo-tool.com までご連絡ください。` },
];

export function TermsContent({ onBack, compact }: { onBack: () => void; compact?: boolean }) {
  return (
    <PageShell title="利用規約" compact={compact}>
      <p style={{ fontSize: 14, color: "#888", lineHeight: 1.9, marginBottom: 40, background: "#fafafa", borderRadius: 12, padding: "20px 24px", border: "0.5px solid rgba(200,170,240,0.2)" }}>
        本利用規約（以下「本規約」）は、toolioが提供するサービス（nihongo-tool.com）の利用条件を定めるものです。ご利用いただく前に必ずお読みください。
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {termsSections.map((s, i) => (
          <div key={s.title} style={{ background: "#fafafa", borderRadius: 14, border: "0.5px solid rgba(200,170,240,0.2)", padding: "24px 28px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#7a50b0", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", borderRadius: "50%", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
              第{i + 1}条　{s.title}
            </h3>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 2, whiteSpace: "pre-line", margin: 0 }}>{s.content}</p>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#ccc", marginTop: 40 }}>制定日：2026年●月●日　／　最終更新日：2026年4月16日</p>
    </PageShell>
  );
}

// ===== 特定商取引法 =====
const tokushohoRows = [
  { label: "販売事業者名", value: "toolio" },
  { label: "運営責任者", value: "倉持はるな" },
  { label: "所在地", value: "請求があった場合、遅滞なく開示します" },
  { label: "電話番号", value: "請求があった場合、遅滞なく開示します" },
  { label: "メールアドレス", value: "support@nihongo-tool.com" },
  { label: "販売URL", value: "https://nihongo-tool.com" },
  { label: "販売価格", value: "各プランページに表示する金額（税込）" },
  { label: "販売価格以外の費用", value: "インターネット接続料金・通信費はお客様負担となります" },
  { label: "支払方法", value: "クレジットカード決済（Visa・Mastercard・American Express・JCB）" },
  { label: "支払時期", value: "サブスクリプション登録時に初回課金。以降、月次または年次で自動更新" },
  { label: "サービス提供時期", value: "お支払い完了後、即時ご利用いただけます" },
  { label: "返品・プラン変更について", value: "サービスの性質上、原則として返金はいたしかねます。無料プランへの変更はマイページよりいつでも可能です。変更後は次回更新日まで引き続きご利用いただけます。" },
  { label: "動作環境", value: "最新バージョンのChrome・Safari・Firefox・Edgeを推奨します" },
];

export function TokushohoContent({ onBack, compact }: { onBack: () => void; compact?: boolean }) {
  return (
    <PageShell title="特定商取引法に基づく表記" compact={compact}>
      <div style={{ background: "white", borderRadius: 16, border: "0.5px solid rgba(200,170,240,0.2)", overflow: "hidden", maxWidth: 640, margin: "0 auto" }}>
        {tokushohoRows.map((row, i) => (
          <div key={row.label} style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "200px 1fr", borderBottom: i < tokushohoRows.length - 1 ? "0.5px solid rgba(0,0,0,0.05)" : "none" }}>
            <div style={{ padding: compact ? "14px 16px 4px" : "18px 20px", background: "rgba(228,155,253,0.06)", fontSize: 13, fontWeight: 700, color: "#9b6ed4", display: "flex", alignItems: "flex-start" }}>
              {row.label}
            </div>
            <div style={{ padding: compact ? "4px 16px 14px" : "18px 24px", fontSize: 14, color: "#555", lineHeight: 1.8 }}>
              {row.value}
            </div>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#ccc", marginTop: 40 }}>最終更新日：2026年●月●日</p>
    </PageShell>
  );
}

// ===== よくある質問 =====
const faqCategories = [
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

export function FaqContent({ onBack, compact }: { onBack: () => void; compact?: boolean }) {
  return (
    <PageShell title="よくある質問" compact={compact}>
      {faqCategories.map((cat) => (
        <section key={cat.label} style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#7a50b0", marginBottom: 12, paddingLeft: 4 }}>{cat.label}</h3>
          <div style={{ background: "white", borderRadius: 16, border: "0.5px solid rgba(200,170,240,0.2)", overflow: "hidden" }}>
            {cat.faqs.map((faq, i) => (
              <details key={faq.q} style={{ borderBottom: i < cat.faqs.length - 1 ? "0.5px solid rgba(0,0,0,0.05)" : "none" }}>
                <summary style={{ padding: "18px 24px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14, listStyle: "none", fontSize: 14, fontWeight: 600, color: "#444", lineHeight: 1.6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#a3c0ff", flexShrink: 0, paddingTop: 1 }}>Q.</span>
                  <span style={{ flex: 1 }}>{faq.q}</span>
                </summary>
                <div style={{ padding: "4px 24px 20px 52px", fontSize: 14, color: "#666", lineHeight: 1.9 }}>{faq.a}</div>
              </details>
            ))}
          </div>
        </section>
      ))}
      <div style={{ marginTop: 40, background: "linear-gradient(135deg,rgba(244,185,185,0.1),rgba(228,155,253,0.1))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 16, padding: "28px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#555", marginBottom: 8 }}>解決しない場合はお気軽にご連絡ください</div>
        <div style={{ fontSize: 13, color: "#aaa", marginBottom: 20, lineHeight: 1.7 }}>画面右下のチャットからお気軽にご連絡ください。</div>
        <button onClick={() => { (window as any).tidioChatApi?.open(); }} style={{ fontSize: 13, padding: "10px 32px", borderRadius: 20, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}>
          チャットで問い合わせる →
        </button>
      </div>
    </PageShell>
  );
}

// ===== toolioとは =====
export function AboutContent({ onBack, compact }: { onBack: () => void; compact?: boolean }) {
  return (
    <PageShell title="toolioとは" compact={compact}>
      <section style={{ marginBottom: 56 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 16 }}>サービス概要</h3>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 2, marginBottom: 16 }}>toolioは、日本語を学ぶ子供を支える先生・保護者のための日本語学習ツールサイトです。学校でも・ご家庭でもすぐに使えるツールを提供しています。</p>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 2 }}>かるた・ゲーム・ロールプレイなど、子供が自然に楽しめる活動ベースの教材をPDF形式で提供。ダウンロードしてすぐに授業や家庭学習に取り入れられます。</p>
      </section>
      <section style={{ marginBottom: 56 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 16 }}>こんな方におすすめ</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {["日本語補習校・国際校・日本語学校の先生", "日本語を学ぶお子さんをお持ちの保護者", "海外在住・国内在住どちらも対応", "就学前〜小学生のお子さんの指導に"].map((item) => (
            <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#555", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 20px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#a3c0ff)", flexShrink: 0, display: "inline-block" }} />{item}
            </li>
          ))}
        </ul>
      </section>
      <section style={{ marginBottom: 56 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 16 }}>toolioの特徴</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { title: "楽しい活動ベースの教材", desc: "かるた・ゲーム・ロールプレイなど、子供が自分から「やりたい！」と言える教材を揃えています。説明は最小限で、楽しみながら自然に日本語が身につきます。", color: "#fce4f8", border: "#e49bfd" },
            { title: "ダウンロードしてすぐ使える", desc: "PDF形式でご提供。教材づくりに追われる時間をゼロに。印刷してそのまま授業・家庭学習に取り入れられます。", color: "#ddeeff", border: "#a3c0ff" },
            { title: "無料から始められる", desc: "登録なしでも教材を試せます。無料アカウントを作成すると、お気に入り保存・ダウンロード履歴などの機能も使えます。", color: "#d6f5ee", border: "#6dcfb8" },
          ].map((f) => (
            <div key={f.title} style={{ background: f.color, border: `0.5px solid ${f.border}`, borderRadius: 16, padding: "24px 28px" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 8 }}>{f.title}</div>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ marginBottom: 56 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 16 }}>学びのコンセプト</h3>
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 16, padding: "28px 32px" }}>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 2, marginBottom: 16 }}>子供たちは、楽しんでいる時ほど、自然に言葉を覚えています。かるたで遊びながら気づいたら単語を言えるようになっていた。ゲームに夢中になりながら、気づいたら文が出てきた。</p>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 2 }}>「楽しい活動」→「気づいたら日本語に触れてる」→「あれ、できた！」→「またやりたい！」——このループを繰り返すことで、勉強した感覚がないまま、できることが増えていく。それがtoolioの学び方です。</p>
        </div>
      </section>
      <section style={{ textAlign: "center", background: "linear-gradient(135deg,rgba(244,185,185,0.1),rgba(228,155,253,0.1))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 20, padding: "40px 32px" }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#555", marginBottom: 8 }}>まず、無料で教材を試してみてください</p>
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 24, lineHeight: 1.7 }}>登録不要・クレジットカード不要</p>
        <button onClick={onBack} style={{ fontSize: 15, padding: "14px 48px", borderRadius: 28, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, border: "none", cursor: "pointer" }}>
          教材を見てみる →
        </button>
      </section>
    </PageShell>
  );
}
