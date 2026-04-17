"use client";
import Link from "next/link";
import { useState } from "react";
import { BrandIcon } from "../../../components/BrandIcon";
type BrandIconName = Parameters<typeof BrandIcon>[0]["name"];

const tabs = [
  { id: "start",    label: "はじめての方へ",       icon: "sparkle" as BrandIconName },
  { id: "choose",   label: "教材を選びたい",         icon: "document" as BrandIconName },
  { id: "use",      label: "授業・学習に使いたい",   icon: "pencil" as BrandIconName },
  { id: "more",     label: "もっと活用したい",       icon: "star" as BrandIconName },
];

type Step = { num: string; title: string; desc: string; sub?: string };
type Tip  = { icon: BrandIconName; title: string; desc: string; link?: string; linkLabel?: string };
type Card = { icon: BrandIconName; title: string; items: string[] };

// ===== はじめての方へ =====
const startSteps: Step[] = [
  { num: "01", title: "無料アカウントを作成する", desc: "メールアドレスだけで登録できます。30秒で完了します。", sub: "登録しなくても一部の教材は閲覧できますが、ダウンロードにはアカウントが必要です。" },
  { num: "02", title: "教材一覧を開く", desc: "トップページの「教材一覧を見る」から、全教材をカテゴリ・方法別に絞り込んで探せます。" },
  { num: "03", title: "気になる教材を選ぶ", desc: "教材をクリックするとプレビューと使い方が確認できます。まずは「無料」タグの教材からお試しください。" },
  { num: "04", title: "ダウンロード・印刷する", desc: "PDFをダウンロードして、A4用紙に印刷するだけ。カラーでも白黒でも使えます。" },
];

const startTips: Tip[] = [
  { icon: "lightbulb", title: "最初におすすめの教材は？", desc: "「ひらがな練習シート」や「ひらがなかるた」は初めての方に人気です。まずここから試してみてください。", link: "/", linkLabel: "教材一覧を見る →" },
  { icon: "printer", title: "印刷環境がなくても大丈夫？", desc: "コンビニのネットプリントでも印刷できます。PDFをそのまま持ち込むか、USBに入れてご利用ください。" },
];

// ===== 教材を選びたい =====
const chooseCards: Card[] = [
  { icon: "target", title: "目的から選ぶ", items: ["文字を覚えさせたい → ひらがな・カタカナ練習シート・なぞり書き", "楽しく学ばせたい → かるた・ゲーム・パズル", "定着を確認したい → テスト・ドリル系", "季節行事に合わせたい → 季節カテゴリの教材"] },
  { icon: "chart", title: "レベルから選ぶ", items: ["文字をまだ知らない → なぞり書き・絵カード系からスタート", "少し読める → かるた・読み物・絵本系", "ある程度読める → テスト・漢字・文法系", "日常会話ができる → 語彙・会話カード系"] },
  { icon: "calendar", title: "時間・場面から選ぶ", items: ["授業の最初の5分 → ゲーム・かるた（短時間で盛り上がる）", "宿題として → 練習シート・テスト系", "家族で楽しく → かるた・絵本・うた系", "すきま時間に → カード系・パズル"] },
];

const chooseTips: Tip[] = [
  { icon: "search", title: "迷ったときは「内容×方法」で絞り込む", desc: "教材一覧では「ひらがな × かるた」のように2軸で絞り込めます。どちらかだけでも絞り込めるので、まず学習内容か方法のどちらか気になる方から試してみてください。", link: "/", linkLabel: "教材一覧で絞り込む →" },
  { icon: "heart", title: "お気に入りに保存しておく", desc: "「使いたいかも」と思った教材はハートボタンでお気に入りに保存できます（要ログイン）。あとでまとめて確認できて便利です。" },
];

// ===== 授業・学習に使いたい =====
const useCards: Card[] = [
  { icon: "note", title: "先生の方へ", items: ["授業の導入にかるたやゲームを取り入れると子どもが集中しやすくなります", "練習シートは宿題として配布するのに最適です", "テスト系教材は単元の終わりの確認に活用できます", "「使い方ガイド」が各教材についているので、準備に迷いません"] },
  { icon: "user", title: "保護者の方へ", items: ["週1〜2回、10〜15分の短い時間から始めるのがおすすめです", "かるたやゲームは親子で一緒に楽しめます", "なぞり書きシートは毎日の習慣づけに使いやすいです", "お子さんが好きな学習方法（ゲーム・ぬりえなど）から始めると続きやすいです"] },
];

const useTips: Tip[] = [
  { icon: "gamepad", title: "「楽しい」が一番の近道", desc: "テストや練習だけでなく、かるた・ゲーム・うたなど楽しめる教材を混ぜることで、子どもが日本語を「好き」になるきっかけを作れます。" },
  { icon: "calendar", title: "週のルーティンに組み込む", desc: "「月曜は練習シート、金曜はかるた」のように曜日で教材の種類を変えると飽きにくく継続しやすくなります。" },
];

// ===== もっと活用したい =====
const moreTips: Tip[] = [
  { icon: "folder", title: "ダウンロード履歴を活用する", desc: "過去にダウンロードした教材はマイページの履歴からすぐ再ダウンロードできます。印刷のたびに探し直す手間が省けます。" },
  { icon: "heart", title: "お気に入りリストを整理する", desc: "学習テーマや季節ごとにお気に入りをまとめておくと、授業・学習の計画が立てやすくなります。" },
  { icon: "unlock", title: "サブスクプランで全教材を使い放題に", desc: "無料プランでは一部の教材のみご利用いただけます。サブスクプランに登録すると体系的なカリキュラム・全教材が使い放題になります。", link: "/plan", linkLabel: "プランを見る →" },
  { icon: "mail", title: "新着教材をチェックする", desc: "トップページの「新着」タブで最新の教材を確認できます。定期的に新しい教材が追加されます。" },
  { icon: "chat", title: "リクエスト・フィードバックを送る", desc: "「こんな教材がほしい」「使ってみた感想」などはお問い合わせページから送ってください。教材制作の参考にします。", link: "/contact", linkLabel: "お問い合わせ →" },
];

function StepItem({ step }: { step: Step }) {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {step.num}
      </div>
      <div style={{ flex: 1, paddingTop: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 6 }}>{step.title}</div>
        <div style={{ fontSize: 14, color: "#666", lineHeight: 1.8 }}>{step.desc}</div>
        {step.sub && <div style={{ fontSize: 12, color: "#bbb", marginTop: 6, lineHeight: 1.7 }}>{step.sub}</div>}
      </div>
    </div>
  );
}

function TipItem({ tip }: { tip: Tip }) {
  return (
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 14, padding: "20px 24px" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#444", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <BrandIcon name={tip.icon} size={18} color="#c9a0f0" />{tip.title}
      </div>
      <div style={{ fontSize: 14, color: "#666", lineHeight: 1.8 }}>{tip.desc}</div>
      {tip.link && (
        <Link href={tip.link} style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: "#9b6ed4", textDecoration: "none", fontWeight: 600 }}>
          {tip.linkLabel}
        </Link>
      )}
    </div>
  );
}

function CardItem({ card }: { card: Card }) {
  return (
    <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "22px 24px" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#7a50b0", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <BrandIcon name={card.icon} size={18} color="#c9a0f0" />{card.title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {card.items.map((item) => (
          <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 6 }} />
            <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState("start");

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif", background: "#f8f4f4" }}>
      {/* ヘッダー */}
      <div style={{ padding: "48px 0 0", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 85%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#bbb", textDecoration: "none", marginBottom: 24 }}>
          ← ホームに戻る
        </Link>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 10 }}>Guide</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          使い方ガイド
        </h1>
        <p style={{ fontSize: 14, color: "#aaa", marginTop: 10, marginBottom: 36, lineHeight: 1.8 }}>
          お悩みに合わせて、toolioの使い方をご案内します。
        </p>

        {/* 横タブ */}
        <div style={{ display: "flex", justifyContent: "center", borderBottom: "0.5px solid rgba(200,170,240,0.25)", background: "white" }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ padding: "14px 28px", border: "none", borderBottom: active ? "2px solid #9b6ed4" : "2px solid transparent", background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#aaa", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", transition: "color 0.15s" }}
              >
                <BrandIcon name={tab.icon} size={15} color={active ? "#9b6ed4" : "#ccc"} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* はじめての方へ */}
        {activeTab === "start" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 28 }}>toolioをはじめよう</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 28, background: "white", borderRadius: 16, border: "0.5px solid rgba(200,170,240,0.2)", padding: "32px 36px" }}>
                {startSteps.map((step) => <StepItem key={step.num} step={step} />)}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 20 }}>よくある疑問</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {startTips.map((tip) => <TipItem key={tip.title} tip={tip} />)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/auth" style={{ display: "inline-block", fontSize: 15, padding: "14px 40px", borderRadius: 28, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", textDecoration: "none", fontWeight: 700 }}>
                無料で登録してはじめる →
              </Link>
            </div>
          </div>
        )}

        {/* 教材を選びたい */}
        {activeTab === "choose" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 20 }}>目的・レベル・場面で選ぶ</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {chooseCards.map((card) => <CardItem key={card.title} card={card} />)}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 20 }}>選び方のヒント</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {chooseTips.map((tip) => <TipItem key={tip.title} tip={tip} />)}
              </div>
            </div>
          </div>
        )}

        {/* 授業・学習に使いたい */}
        {activeTab === "use" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 20 }}>あなたの状況に合わせたヒント</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {useCards.map((card) => <CardItem key={card.title} card={card} />)}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 20 }}>長続きのコツ</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {useTips.map((tip) => <TipItem key={tip.title} tip={tip} />)}
              </div>
            </div>
          </div>
        )}

        {/* もっと活用したい */}
        {activeTab === "more" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 20 }}>toolioをもっと便利に使う</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {moreTips.map((tip) => <TipItem key={tip.title} tip={tip} />)}
              </div>
            </div>
          </div>
        )}

        {/* 共通フッター：まだ解決しない場合 */}
        <div style={{ marginTop: 56, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(228,155,253,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 16, padding: "28px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#555", marginBottom: 8 }}>解決しませんでしたか？</div>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 20, lineHeight: 1.7 }}>お気軽にお問い合わせください。通常2〜3営業日以内にご返信します。</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Link href="/faq" style={{ display: "inline-block", fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "0.5px solid rgba(163,192,255,0.6)", background: "white", color: "#7a50b0", textDecoration: "none", fontWeight: 600 }}>
              よくある質問を見る
            </Link>
            <Link href="/contact" style={{ display: "inline-block", fontSize: 13, padding: "10px 28px", borderRadius: 20, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", textDecoration: "none", fontWeight: 700 }}>
              お問い合わせする →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
