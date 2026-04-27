"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { createClient } from "../../lib/supabase";
import AuthModal, { AuthModalMode } from "../../components/AuthModal";

export default function LandingPage() {
  const router = useRouter();
  const locale = useLocale();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("signup");
  const [checked, setChecked] = useState(false);

  const homeHref = locale === "ja" ? "/home" : `/${locale}/home`;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(homeHref);
        return;
      }
      const visited = localStorage.getItem("toolio_visited");
      if (visited) {
        router.replace(homeHref);
        return;
      }
      localStorage.setItem("toolio_visited", "1");
      setChecked(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) return null;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Hiragino Kaku Gothic ProN','Hiragino Sans','Noto Sans JP',sans-serif", background: "#fdf8ff", overflowX: "hidden" }}>

      {/* ヘッダー */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 36px", background: "rgba(253,248,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "0.5px solid rgba(200,170,240,0.15)" }}>
        <Image src="/toolio_logo.png" alt="toolio" width={96} height={32} style={{ objectFit: "contain" }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { setAuthModalMode("login"); setAuthModalOpen(true); }}
            style={{ fontSize: 13, padding: "8px 24px", borderRadius: 20, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}
          >
            ログイン
          </button>
          <Link href={homeHref} style={{ fontSize: 13, padding: "8px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            教材を見る
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 100, textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 10%, rgba(255,255,255,1) 50%), linear-gradient(135deg, rgba(244,185,185,0.5) 0%, rgba(228,155,253,0.5) 50%, rgba(163,192,255,0.5) 100%)", position: "relative" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.7)", textTransform: "uppercase", marginBottom: 20 }}>
          Japanese Language Tools for Heritage Learners
        </p>
        <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 800, lineHeight: 1.5, marginBottom: 20, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "var(--font-libre)" }}>
          日本語の勉強が、<br />もっとたのしくなる。
        </h1>
        <p style={{ fontSize: 16, color: "#999", marginBottom: 48, lineHeight: 2, maxWidth: 480, margin: "0 auto 48px" }}>
          日本語を学ぶ子供を支える方のための日本語学習ツールサイト。<br />
          学校でも・ご家庭でもすぐに使えるツールを提供しています。
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
          <Link
            href={homeHref}
            style={{ fontSize: 16, padding: "16px 48px", borderRadius: 32, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, textDecoration: "none", display: "inline-block" }}
          >
            無料で教材を見る →
          </Link>
          <button
            onClick={() => { setAuthModalMode("signup"); setAuthModalOpen(true); }}
            style={{ fontSize: 16, padding: "16px 48px", borderRadius: 32, border: "1px solid rgba(163,192,255,0.6)", background: "white", color: "#7a50b0", fontWeight: 700, cursor: "pointer" }}
          >
            アカウント登録（無料）
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#ccc", marginTop: 16 }}>登録不要・クレジットカード不要で教材を試せます</p>
      </section>

      {/* 共感セクション */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>Pain Points</p>
        <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", color: "#333", marginBottom: 40, lineHeight: 1.6 }}>
          こんな経験、ありませんか？
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { text: "プリントを出すと、子供が嫌がる…", icon: "📄" },
            { text: "楽しい教材を作ろうとすると、時間がかかりすぎる", icon: "⏰" },
            { text: "大人向け教材は難しすぎ、子ども向け教科書は嫌がる", icon: "📚" },
            { text: "かるたは楽しそうなのに、毎回準備が大変", icon: "🃏" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 16, background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "18px 24px", boxShadow: "0 2px 12px rgba(200,150,220,0.06)" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 15, color: "#555", lineHeight: 1.7 }}>{item.text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32, padding: "24px 32px", borderRadius: 16, background: "linear-gradient(135deg,rgba(244,185,185,0.1),rgba(228,155,253,0.1))", border: "0.5px solid rgba(200,170,240,0.3)", textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "#7a50b0", fontWeight: 700, lineHeight: 1.8 }}>
            でも、子供たちは楽しんでいる時ほど、<br />自然に言葉を覚えていました。
          </p>
        </div>
      </section>

      {/* 解決策：ループ図 */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>How it works</p>
        <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", color: "#333", marginBottom: 16, lineHeight: 1.6 }}>
          「たのしい」からはじまり、<br />「できた」で終わる。
        </h2>
        <p style={{ fontSize: 14, color: "#999", textAlign: "center", marginBottom: 40, lineHeight: 1.9 }}>
          勉強した感覚がないまま、できることが増えていく。<br />それがtoolioの学び方です。
        </p>

        <svg viewBox="0 0 500 520" style={{ width: "100%", maxWidth: 380, display: "block", margin: "0 auto" }} role="img" aria-label="toolioの学びのループ図">
          <defs>
            <marker id="arr-lp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          <rect x="80" y="20" width="300" height="62" rx="14" fill="#fce4f8" stroke="#e49bfd" strokeWidth="1" />
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="15" fontWeight="500" x="230" y="51" textAnchor="middle" dominantBaseline="central" fill="#7a2e7a">楽しい活動</text>
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="12" x="230" y="69" textAnchor="middle" dominantBaseline="central" fill="#9e4a9e">かるた・ゲーム・ロールプレイ</text>
          <line x1="230" y1="83" x2="230" y2="114" stroke="#a3c0ff" strokeWidth="1.5" markerEnd="url(#arr-lp)" />
          <rect x="80" y="116" width="300" height="62" rx="14" fill="#ddeeff" stroke="#a3c0ff" strokeWidth="1" />
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="15" fontWeight="500" x="230" y="140" textAnchor="middle" dominantBaseline="central" fill="#1a4a8a">気づいたら日本語に触れてる</text>
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="12" x="230" y="162" textAnchor="middle" dominantBaseline="central" fill="#2a5aa0">先生がさりげなく言葉を添える</text>
          <line x1="230" y1="179" x2="230" y2="210" stroke="#a3c0ff" strokeWidth="1.5" markerEnd="url(#arr-lp)" />
          <rect x="80" y="212" width="300" height="62" rx="14" fill="#ede8ff" stroke="#b89aff" strokeWidth="1" />
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="15" fontWeight="500" x="230" y="236" textAnchor="middle" dominantBaseline="central" fill="#3d1f8a">あれ、できた！</text>
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="12" x="230" y="258" textAnchor="middle" dominantBaseline="central" fill="#5530a0">小さな「できた！」を積み重ねる</text>
          <line x1="230" y1="275" x2="230" y2="306" stroke="#a3c0ff" strokeWidth="1.5" markerEnd="url(#arr-lp)" />
          <rect x="80" y="308" width="300" height="62" rx="14" fill="#d6f5ee" stroke="#6dcfb8" strokeWidth="1" />
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="15" fontWeight="500" x="230" y="332" textAnchor="middle" dominantBaseline="central" fill="#0d5c4a">またやりたい！</text>
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="12" x="230" y="354" textAnchor="middle" dominantBaseline="central" fill="#1a7a64">やらされ感ゼロ・自分から動く</text>
          <path d="M380 339 Q450 339 450 196 Q450 51 380 51" fill="none" stroke="#f4b9b9" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arr-lp)" />
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="11" x="466" y="200" textAnchor="middle" fill="#c07070" transform="rotate(90,466,200)">くり返す</text>
          <line x1="230" y1="371" x2="230" y2="418" stroke="#f4b9b9" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arr-lp)" />
          <rect x="55" y="420" width="350" height="76" rx="16" fill="#fff7e6" stroke="#f4b9b9" strokeWidth="1.5" strokeDasharray="6 3" />
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="16" fontWeight="500" x="230" y="452" textAnchor="middle" dominantBaseline="central" fill="#8a4a20">気づいたらできてた！</text>
          <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="12" x="230" y="476" textAnchor="middle" dominantBaseline="central" fill="#a05a30">大きな「できた！」へ</text>
        </svg>
      </section>

      {/* 特徴3つ */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>Features</p>
        <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", color: "#333", marginBottom: 48, lineHeight: 1.6 }}>
          toolioの3つの特徴
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
          {[
            {
              emoji: "🎉",
              title: "楽しい活動ベース",
              desc: "かるた・ゲーム・ロールプレイ。説明は最小限。子供が自分から「やりたい！」と言える教材だけを揃えています。",
              color: "#fce4f8",
              border: "#e49bfd",
            },
            {
              emoji: "⚡",
              title: "ダウンロードしてすぐ使える",
              desc: "教材づくりに追われる時間をゼロに。印刷してすぐ授業・家庭学習に取り入れられます。",
              color: "#ddeeff",
              border: "#a3c0ff",
            },
            {
              emoji: "🆓",
              title: "無料から始められる",
              desc: "登録なしでも教材を試せます。良さを感じてから、無料アカウントを作るだけ。",
              color: "#d6f5ee",
              border: "#6dcfb8",
            },
          ].map((f) => (
            <div key={f.title} style={{ background: f.color, border: `0.5px solid ${f.border}`, borderRadius: 20, padding: "32px 28px" }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.emoji}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#333", marginBottom: 10 }}>{f.title}</div>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 対象者 */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>For</p>
        <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", color: "#333", marginBottom: 40, lineHeight: 1.6 }}>
          こんな方におすすめ
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {[
            { icon: "👩‍🏫", label: "日本語教師・講師" },
            { icon: "👨‍👩‍👧", label: "日本語を学ぶ子を持つ保護者" },
            { icon: "🏫", label: "補習校・日本語学校の先生" },
            { icon: "🌏", label: "海外在住・国内在住どちらも" },
          ].map((p) => (
            <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 12, background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(200,150,220,0.06)" }}>
              <span style={{ fontSize: 24 }}>{p.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 再CTA */}
      <section style={{ padding: "80px 24px 100px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "linear-gradient(135deg,rgba(244,185,185,0.15),rgba(228,155,253,0.15))", border: "0.5px solid rgba(200,170,240,0.35)", borderRadius: 28, padding: "56px 40px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#333", marginBottom: 12, lineHeight: 1.6 }}>
            まず、無料で試してみる。
          </h2>
          <p style={{ fontSize: 14, color: "#999", marginBottom: 36, lineHeight: 1.9 }}>
            登録なしでも教材を見られます。<br />気に入ったら、無料でアカウントを作成してください。
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <Link
              href={homeHref}
              style={{ fontSize: 16, padding: "16px 56px", borderRadius: 32, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, textDecoration: "none", display: "inline-block" }}
            >
              教材を見てみる →
            </Link>
            <button
              onClick={() => { setAuthModalMode("signup"); setAuthModalOpen(true); }}
              style={{ fontSize: 14, padding: "12px 40px", borderRadius: 32, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", fontWeight: 600, cursor: "pointer" }}
            >
              無料アカウントを作成
            </button>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer style={{ borderTop: "0.5px solid rgba(200,170,240,0.2)", padding: "32px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, background: "white" }}>
        <Image src="/toolio_logo.png" alt="toolio" width={72} height={24} style={{ objectFit: "contain" }} />
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { label: "利用規約", href: "/terms" },
            { label: "プライバシーポリシー", href: "/privacy" },
            { label: "特定商取引法に基づく表示", href: "/tokushoho" },
            { label: "よくある質問", href: "/faq" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: 12, color: "#bbb", textDecoration: "none" }}>{l.label}</Link>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "#ccc", margin: 0 }}>© 2026 toolio</p>
      </footer>

      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onLoggedIn={() => { setAuthModalOpen(false); router.push(homeHref); }}
        />
      )}
    </div>
  );
}
