import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "toolioとは | 日本語を学ぶ子供のための教材サービス",
  description: "toolioは、日本語を学ぶ子供を支える先生・保護者のための日本語学習ツールサイトです。かるた・ゲーム・ロールプレイなど楽しい活動ベースの教材をダウンロードしてすぐ使えます。無料から始められます。",
  keywords: ["日本語教材", "継承語", "補習校", "日本語学習", "子供", "無料", "プリント", "かるた", "ゲーム教材"],
  openGraph: {
    title: "toolioとは | 日本語を学ぶ子供のための教材サービス",
    description: "楽しい活動ベースの日本語教材をダウンロードしてすぐ使える。先生・保護者のための日本語学習ツールサイト。",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Hiragino Kaku Gothic ProN','Hiragino Sans','Noto Sans JP',sans-serif", background: "#fdf8ff" }}>
      <style>{`
        @media (max-width: 640px) {
          .about-wrap { padding: 80px 16px 64px !important; background: white !important; }
          .about-concept { padding: 20px 20px !important; }
          .about-cta { padding: 28px 20px !important; }
          .about-feat { padding: 18px 20px !important; }
          .desktop-hero { display: none !important; }
          .mobile-header { display: flex !important; }
        }
        @media (min-width: 641px) {
          .mobile-header { display: none !important; }
        }
      `}</style>

      <div className="mobile-header" style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, height: 56, alignItems: "center", padding: "0 16px", background: "white", borderBottom: "0.5px solid rgba(200,170,240,0.2)", zIndex: 50, gap: 12 }}>
        <Link href="/" style={{ fontSize: 22, color: "#aaa", textDecoration: "none", lineHeight: 1 }}>‹</Link>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>toolioとは</span>
      </div>

      <div className="desktop-hero" style={{ padding: "48px 0 36px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 80%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#bbb", textDecoration: "none", marginBottom: 24 }}>
          ← ホームに戻る
        </Link>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Image src="/toolio_logo.png" alt="toolio" width={120} height={40} style={{ objectFit: "contain" }} />
        </div>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 10 }}>About</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          toolioとは
        </h1>
        <p style={{ fontSize: 13, color: "#bbb", marginTop: 10 }}>日本語を学ぶ子供のための教材サービス</p>
      </div>

      <div className="about-wrap" style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* サービス概要 */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 16 }}>サービス概要</h2>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 2, marginBottom: 16 }}>
            toolioは、日本語を学ぶ子供を支える先生・保護者のための日本語学習ツールサイトです。
            学校でも・ご家庭でもすぐに使えるツールを提供しています。
          </p>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 2 }}>
            かるた・ゲーム・ロールプレイなど、子供が自然に楽しめる活動ベースの教材をPDF形式で提供。
            ダウンロードしてすぐに授業や家庭学習に取り入れられます。
          </p>
        </section>

        {/* 対象者 */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 16 }}>こんな方におすすめ</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "日本語補習校・国際校・日本語学校の先生",
              "日本語を学ぶお子さんをお持ちの保護者",
              "海外在住・国内在住どちらも対応",
              "就学前〜小学生のお子さんの指導に",
            ].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#555", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 20px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#a3c0ff)", flexShrink: 0, display: "inline-block" }} />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 特徴 */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 16 }}>toolioの特徴</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                title: "楽しい活動ベースの教材",
                desc: "かるた・ゲーム・ロールプレイなど、子供が自分から「やりたい！」と言える教材を揃えています。説明は最小限で、楽しみながら自然に日本語が身につきます。",
                color: "#fce4f8",
                border: "#e49bfd",
              },
              {
                title: "ダウンロードしてすぐ使える",
                desc: "PDF形式でご提供。教材づくりに追われる時間をゼロに。印刷してそのまま授業・家庭学習に取り入れられます。",
                color: "#ddeeff",
                border: "#a3c0ff",
              },
              {
                title: "無料から始められる",
                desc: "登録なしでも教材を試せます。無料アカウントを作成すると、お気に入り保存・ダウンロード履歴などの機能も使えます。",
                color: "#d6f5ee",
                border: "#6dcfb8",
              },
            ].map((f) => (
              <div key={f.title} className="about-feat" style={{ background: f.color, border: `0.5px solid ${f.border}`, borderRadius: 16, padding: "24px 28px" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 8 }}>{f.title}</div>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 学びのコンセプト */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 16 }}>学びのコンセプト</h2>
          <div className="about-concept" style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 16, padding: "28px 32px" }}>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 2, marginBottom: 16 }}>
              子供たちは、楽しんでいる時ほど、自然に言葉を覚えています。かるたで遊びながら気づいたら単語を言えるようになっていた。ゲームに夢中になりながら、気づいたら文が出てきた。
            </p>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 2 }}>
              「楽しい活動」→「気づいたら日本語に触れてる」→「あれ、できた！」→「またやりたい！」——このループを繰り返すことで、勉強した感覚がないまま、できることが増えていく。それがtoolioの学び方です。
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta" style={{ textAlign: "center", background: "linear-gradient(135deg,rgba(244,185,185,0.1),rgba(228,155,253,0.1))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 20, padding: "40px 32px" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#555", marginBottom: 8 }}>まず、無料で教材を試してみてください</p>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: 24, lineHeight: 1.7 }}>登録不要・クレジットカード不要</p>
          <Link
            href="/"
            style={{ display: "inline-block", fontSize: 15, padding: "14px 48px", borderRadius: 28, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, textDecoration: "none" }}
          >
            教材を見てみる →
          </Link>
        </section>

      </div>
    </div>
  );
}
