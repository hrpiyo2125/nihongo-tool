"use client";
import Link from "next/link";

const sections = [
  {
    title: "サービスの概要",
    content: `toolio（以下「当サービス」）は、国内外で日本語を学ぶ子どもたちのための教材プラットフォームです。海外在住の継承語家庭のお子様、および日本国内の外国籍の日本語学習者など、様々な環境で日本語を学ぶ子どもたちを支援することを目的としています。教材のダウンロード・閲覧・印刷などの機能を提供します。当サービスは学校の先生・日本語教室の先生・保護者を主な対象としています。`,
  },
  {
    title: "利用登録・未成年の利用",
    content: `当サービスの一部機能は無料アカウントの登録が必要です。登録にあたり正確な情報をご提供ください。虚偽の情報を登録した場合、アカウントを停止することがあります。

18歳未満の方がご利用になる場合は、保護者の同意を得た上でご登録ください。保護者の方がお子様に代わって登録・利用することを推奨します。`,
  },
  {
    title: "禁止事項",
    content: `以下の行為を禁止します。

・当サービスのコンテンツを無断で複製・転載・再配布すること
・当サービスを通じて第三者に教材を販売・譲渡すること
・当サービスのシステムに不正アクセスを試みること
・他の利用者または第三者の権利を侵害する行為
・当サービスの教材・イラストのデザイン・構成・コンセプトを模倣した教材の作成・配布・販売
・当サービスのコンテンツをAI・機械学習の学習データとして使用すること
・その他、当サービスが不適切と判断する行為`,
  },
  {
    title: "コンテンツの利用範囲",
    content: `当サービスの教材は、個人的な学習目的および担当クラス・担当生徒への教育目的に限り利用できます。

【印刷・配布について】
・担当する生徒・クラスへの配布は可能です
・学校全体・他の先生・他のクラスへの共有・配布は禁止です
・印刷した教材の有償配布・販売は禁止です
・大量印刷・業務用途での利用は禁止です

【オンライン授業について】
・担当生徒とのオンライン授業での画面共有は可能です
・授業の録画・配信・録画データの共有は禁止です

著作権は当サービスに帰属します。商業目的での利用はいかなる形でも禁止します。`,
  },
  {
    title: "著作権・知的財産権",
    content: `当サービスに掲載されている教材・テキスト・イラスト・画像・デザイン・ロゴ等の一切のコンテンツの著作権・知的財産権は、当サービス（toolio）に帰属します。

・著作者名（toolio）の表示を削除・改変することを禁止します
・コンテンツの全部または一部を当サービスの許可なく使用することを禁止します
・本規約で明示的に許可された範囲以外の利用は一切禁止します`,
  },
  {
    title: "イラストの保護",
    content: `当サービスのイラストは全て手描きによるオリジナル作品です。以下の行為を厳しく禁止します。

・イラストを教材PDFから単体で抽出・切り出して使用すること
・イラストを加工・改変して使用・配布すること
・イラストをトレース・模写して自己の作品として公開すること
・イラストを参考にした二次創作・派生作品の公開・配布
・イラストをSNS・ブログ・YouTube等のメディアに無断掲載すること
・イラストをAI・機械学習の学習データとして使用すること

違反を発見した場合、削除要請および法的措置を取ることがあります。`,
  },
  {
    title: "教材の模倣禁止",
    content: `当サービスの教材は全てオリジナルコンテンツです。会員は当サービスの教材のデザイン・構成・コンセプト・世界観を模倣した教材を作成し、配布・販売・公開することを禁止します。

当サービスのコンテンツに着想を得た制作物の商業利用についても同様に禁止します。`,
  },
  {
    title: "紹介・引用時のルール",
    content: `当サービスの教材を紹介・引用する場合は、以下の条件を全て満たす必要があります。

① サービス名「toolio」を明記すること
② 元ページのURL（https://nihongo-tool.com）をリンク形式で掲載すること
③ 引用は必要最小限にとどめ、教材全体の転載はしないこと

リンクのない引用・無断転載・SNSへの無断投稿は禁止します。`,
  },
  {
    title: "アカウントの管理",
    content: `アカウントは登録者本人のみがご利用いただけます。

・他者へのアカウントの貸与・共有・譲渡は禁止です
・1アカウントは1名での利用を原則とします
・アカウントの不正利用が確認された場合、予告なくアカウントを停止することがあります
・アカウントに関する一切の責任は登録者本人が負うものとします`,
  },
  {
    title: "プランと利用権限",
    content: `当サービスは以下の4つのプランを提供しており、プランによってアクセスできる教材の範囲が異なります。

【プラン一覧】
・無料プラン（無料）
　→ 無料教材のダウンロード・お気に入り・ダウンロード履歴

・ライトプラン（月額500円・税込）
　→ 無料プランの機能 ＋ ライト教材のダウンロード ＋ 都度購入

・スタンダードプラン（月額980円・税込）
　→ ライトプランの機能 ＋ スタンダード教材のダウンロード

・プレミアムプラン（月額1,480円・税込）
　→ スタンダードプランの機能 ＋ プレミアム教材のダウンロード

【利用権限について】
・有料プランの権限はサブスクリプション有効期間中のみ有効です
・無料プランへの変更後は次回更新日をもって有料プランの利用権限が失効します
・無料プランへの変更後にダウンロード済みのデータの利用は認められません
・プランのダウングレード後は、変更後のプランに対応した教材のみご利用いただけます
・無料プランへの変更予約中であっても、プランの変更（アップグレード・ダウングレード）は可能です。その際、変更予約を取り消すか維持するかを選択いただけます`,
  },
  {
    title: "サブスクリプション・都度購入",
    content: `有料プランは月次サブスクリプション形式です。無料プランへの変更はマイページからいつでも行えます。変更後は次回更新日までサービスをご利用いただけます。料金の返金は原則として行っておりません。

【都度購入】
ライトプラン以上のご利用者は、対象教材を1点あたり350円（税込）で単品購入することも可能です。購入した教材はサブスクリプションの有無に関わらずダウンロード可能ですが、本規約に定める利用範囲の制限は引き続き適用されます。

支払いはStripe社を通じて処理されます。お支払い情報に問題が発生した場合、プランが無料プランに移行することがあります。その際は個別にご連絡の上、適切に対応いたします。`,
  },
  {
    title: "サービスの変更・停止・終了",
    content: `当サービスは予告なくコンテンツの追加・変更・削除を行うことがあります。システムメンテナンスや不可抗力によりサービスが停止する場合があります。

サービスを終了する場合は、可能な限り事前にお知らせします。サービス終了に伴う返金・データの提供義務は負いません。`,
  },
  {
    title: "免責事項・損害賠償",
    content: `当サービスは、提供するコンテンツの正確性・完全性を保証するものではありません。当サービスの利用により生じた損害について、当サービスは責任を負いません。

当サービスに起因する損害賠償責任が生じた場合、その上限額はお客様が当該月に支払われたサブスクリプション料金を上限とします。`,
  },
  {
    title: "国際利用について",
    content: `当サービスは日本国内法に準拠して運営されています。国内外からご利用いただけますが、海外からご利用の場合は、お客様自身の責任において現地の法令を確認の上ご利用ください。当サービスは現地法令への適合を保証しません。当サービスは現地法令への適合を保証しません。`,
  },
  {
    title: "違反時の対応",
    content: `本規約に違反する行為が確認された場合、当サービスは以下の措置を取ることがあります。

・警告の通知
・コンテンツの削除要請
・アカウントの一時停止または永久停止
・法的措置（著作権侵害・不正競争防止法違反等）

措置に対する異議申し立てはsupport@nihongo-tool.comまでご連絡ください。`,
  },
  {
    title: "準拠法・管轄",
    content: `本規約は日本法に準拠します。当サービスに関する紛争については、横浜地方裁判所を第一審の専属的合意管轄裁判所とします。`,
  },
  {
    title: "規約の変更",
    content: `当サービスは本規約を予告なく変更することがあります。重要な変更の場合はサービス上でお知らせします。変更後も継続してご利用いただいた場合、変更後の規約に同意したものとみなします。`,
  },
  {
    title: "お問い合わせ",
    content: `本規約に関するお問い合わせは、support@nihongo-tool.com までご連絡ください。`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif", background: "white" }}>
      <style>{`
        @media (max-width: 640px) {
          .legal-wrap { padding: 80px 16px 64px !important; background: white !important; }
          .legal-card { padding: 16px 16px !important; }
          .desktop-hero { display: none !important; }
          .mobile-header { display: flex !important; }
        }
        @media (min-width: 641px) {
          .mobile-header { display: none !important; }
        }
      `}</style>

      <div className="mobile-header" style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, height: 56, alignItems: "center", padding: "0 16px", background: "white", borderBottom: "0.5px solid rgba(200,170,240,0.2)", zIndex: 50, gap: 12 }}>
        <Link href="/" style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, textDecoration: "none" }}>‹</Link>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>利用規約</span>
      </div>

      <div className="desktop-hero" style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#bbb", textDecoration: "none", marginBottom: 20 }}>
          ← ホームに戻る
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block", marginBottom: 4 }}>
          利用規約
        </h1>
        <p style={{ fontSize: 13, color: "#bbb" }}>Terms of Service</p>
      </div>

      <div className="legal-wrap" style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <p style={{ fontSize: 14, color: "#888", lineHeight: 1.9, marginBottom: 40, background: "white", borderRadius: 12, padding: "20px 24px", border: "0.5px solid rgba(200,170,240,0.2)" }}>
          本利用規約（以下「本規約」）は、toolioが提供するサービス（nihongo-tool.com）の利用条件を定めるものです。ご利用いただく前に必ずお読みください。
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {sections.map((s, i) => (
            <div key={s.title} className="legal-card" style={{ background: "white", borderRadius: 14, border: "0.5px solid rgba(200,170,240,0.2)", padding: "24px 28px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#7a50b0", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", borderRadius: "50%", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                第{i + 1}条　{s.title}
              </h2>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 2, whiteSpace: "pre-line", margin: 0 }}>{s.content}</p>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#ccc", marginTop: 40 }}>
          制定日：2026年●月●日　／　最終更新日：2026年4月16日
        </p>
      </div>
    </div>
  );
}