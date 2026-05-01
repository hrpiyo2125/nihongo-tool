"use client";
import Link from "next/link";

const sections = [
  {
    title: "収集する情報",
    content: `toolio（以下「当サービス」）は、以下の情報を収集することがあります。

・アカウント登録時にご提供いただく情報（メールアドレス・氏名など）
・Googleアカウントでログインされた場合、Google社より提供される情報（メールアドレス・名前・プロフィール画像）
・ご利用状況に関する情報（ダウンロード履歴・お気に入りなど）
・デバイス情報・アクセスログ・IPアドレス
・お支払いに関する情報（決済代行会社を通じて処理されます）
・マイページで任意にご入力いただいた情報（居住地・職業・利用目的など）`,
  },
  {
    title: "情報の利用目的",
    content: `収集した情報は以下の目的に使用します。

・サービスの提供・運営・改善
・お問い合わせへの対応
・サービスに関するご案内の送付
・利用規約への違反行為の検知・対応
・統計データの作成（個人を特定しない形式）`,
  },
  {
    title: "第三者への提供・外部サービスへのデータ預託",
    content: `当サービスは、以下の場合を除き、お客様の個人情報を第三者に提供しません。

・お客様の同意がある場合
・法令に基づく場合
・人の生命・身体・財産を保護するために必要な場合

【外部サービスへのデータ預託】
当サービスは、サービス運営のために以下の外部サービスに個人情報の一部を預託しています。各社のプライバシーポリシーに従い管理されます。

・Supabase社（認証・データベース管理）
・Stripe社（決済処理）
・Resend社（メール送信）`,
  },
  {
    title: "Cookieの使用",
    content: `当サービスはCookieを使用することがあります。Cookieはブラウザの設定により無効にすることができますが、一部機能がご利用いただけなくなる場合があります。`,
  },
  {
    title: "データの保存期間",
    content: `当サービスは、サービス提供に必要な期間、お客様の個人情報を保存します。

・アカウント情報：退会後30日以内に削除します
・ダウンロード履歴・お気に入り：退会と同時に削除します
・お問い合わせ履歴：対応完了後1年間保存した後、削除します
・決済情報：Stripe社の規定に従い管理されます

なお、法令により保存が義務付けられている情報については、法令の定める期間保存します。`,
  },
  {
    title: "子どものプライバシー",
    content: `当サービスは子どもの日本語学習を支援するサービスですが、アカウント登録・契約の主体は保護者または教師など成人の方を想定しています。

・13歳未満のお子様の個人情報を保護者の同意なく収集することはありません
・保護者の管理のもとでのご利用を推奨します
・お子様の個人情報の削除をご希望の場合は、support@nihongo-tool.com までご連絡ください`,
  },
  {
    title: "セキュリティ",
    content: `当サービスは、お客様の個人情報の安全管理のために適切な措置を講じます。ただし、インターネット上の通信において完全な安全を保証することはできません。`,
  },
  {
    title: "国際的なデータ移転",
    content: `当サービスのデータは主に日本国内および当サービスが利用する外部サービス（Supabase・Stripe等）のサーバーで管理されます。

海外からご利用の場合、お客様の個人情報が国境を越えて移転される場合があります。EUおよびEEA在住のお客様については、GDPRの定める範囲で適切に対応します。詳細はsupport@nihongo-tool.comまでお問い合わせください。`,
  },
  {
    title: "個人情報の開示・訂正・削除",
    content: `お客様は、ご自身の個人情報の開示・訂正・削除を求めることができます。ご要望はsupport@nihongo-tool.comまでお問い合わせください。`,
  },
  {
    title: "プライバシーポリシーの変更",
    content: `本ポリシーは予告なく変更される場合があります。重要な変更がある場合はサービス上でお知らせします。`,
  },
  {
    title: "お問い合わせ",
    content: `本ポリシーに関するお問い合わせは、support@nihongo-tool.com までご連絡ください。`,
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif", background: "#f8f4f4" }}>
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
        <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>プライバシーポリシー</span>
      </div>

      <div className="desktop-hero" style={{ padding: "48px 0 36px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 80%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#bbb", textDecoration: "none", marginBottom: 24 }}>
          ← ホームに戻る
        </Link>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 10 }}>Legal</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          プライバシーポリシー
        </h1>
        <p style={{ fontSize: 13, color: "#bbb", marginTop: 10 }}>Privacy Policy</p>
      </div>

      <div className="legal-wrap" style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <p style={{ fontSize: 14, color: "#888", lineHeight: 1.9, marginBottom: 40, background: "white", borderRadius: 12, padding: "20px 24px", border: "0.5px solid rgba(200,170,240,0.2)" }}>
          toolio（nihongo-tool.com、以下「当サービス」）は、お客様の個人情報の保護を重要と考え、以下のプライバシーポリシーに従って個人情報を適切に取り扱います。
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {sections.map((s, i) => (
            <div key={s.title} className="legal-card" style={{ background: "white", borderRadius: 14, border: "0.5px solid rgba(200,170,240,0.2)", padding: "24px 28px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#7a50b0", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", color: "white", borderRadius: "50%", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                {s.title}
              </h2>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 2, whiteSpace: "pre-line", margin: 0 }}>{s.content}</p>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#ccc", marginTop: 40 }}>
          制定日：2026年●月●日　／　最終更新日：2026年●月●日
        </p>
      </div>
    </div>
  );
}