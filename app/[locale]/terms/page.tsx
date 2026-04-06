"use client";
import Link from "next/link";

const sections = [
  {
    title: "サービスの概要",
    content: `toolio（以下「当サービス」）は、海外で日本語を学ぶ子どもたちのための教材プラットフォームです。教材のダウンロード・閲覧・印刷などの機能を提供します。`,
  },
  {
    title: "利用登録",
    content: `当サービスの一部機能は、無料アカウントの登録が必要です。登録にあたり正確な情報をご提供ください。虚偽の情報を登録した場合、アカウントを停止することがあります。`,
  },
  {
    title: "禁止事項",
    content: `以下の行為を禁止します。

・当サービスのコンテンツを無断で複製・転載・再配布すること
・当サービスを通じて第三者に教材を販売・譲渡すること
・当サービスのシステムに不正アクセスを試みること
・他の利用者または第三者の権利を侵害する行為
・その他、当サービスが不適切と判断する行為`,
  },
  {
    title: "コンテンツの利用範囲",
    content: `当サービスの教材は、個人的な学習目的および教室内での教育目的に限り利用できます。商業目的での利用・販売・大量印刷・再配布はできません。著作権は当サービスに帰属します。`,
  },
  {
    title: "サブスクリプション",
    content: `有料プランは月次または年次のサブスクリプション形式です。解約はマイページからいつでも行えます。解約後は次回更新日までサービスをご利用いただけます。料金の返金は原則として行っておりません。`,
  },
  {
    title: "サービスの変更・停止",
    content: `当サービスは予告なくコンテンツの追加・変更・削除を行うことがあります。また、システムメンテナンスや不可抗力によりサービスが停止する場合があります。`,
  },
  {
    title: "免責事項",
    content: `当サービスは、提供するコンテンツの正確性・完全性を保証するものではありません。当サービスの利用により生じた損害について、当サービスは責任を負いません。`,
  },
  {
    title: "準拠法・管轄",
    content: `本規約は日本法に準拠します。当サービスに関する紛争については、神奈川地方裁判所を第一審の専属的合意管轄裁判所とします。`,
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
    <div style={{ minHeight: "100vh", fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif", background: "#f8f4f4" }}>
      <div style={{ padding: "48px 0 36px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 80%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#bbb", textDecoration: "none", marginBottom: 24 }}>
          ← ホームに戻る
        </Link>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 10 }}>Legal</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          利用規約
        </h1>
        <p style={{ fontSize: 13, color: "#bbb", marginTop: 10 }}>Terms of Service</p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <p style={{ fontSize: 14, color: "#888", lineHeight: 1.9, marginBottom: 40, background: "white", borderRadius: 12, padding: "20px 24px", border: "0.5px solid rgba(200,170,240,0.2)" }}>
          本利用規約（以下「本規約」）は、toolioが提供するサービス（nihongo-tool.com）の利用条件を定めるものです。ご利用いただく前に必ずお読みください。
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {sections.map((s, i) => (
            <div key={s.title} style={{ background: "white", borderRadius: 14, border: "0.5px solid rgba(200,170,240,0.2)", padding: "24px 28px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#7a50b0", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", borderRadius: "50%", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                第{i + 1}条　{s.title}
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
