"use client";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import ToolioConceptSection from "./ToolioConceptSection"

const scrollbarStyle = `
  .toolio-scroll-y::-webkit-scrollbar { width: 5px; }
  .toolio-scroll-y::-webkit-scrollbar-track { background: rgba(0,0,0,0.04); border-radius: 4px; }
  .toolio-scroll-y::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.14); border-radius: 4px; }
  .toolio-scroll-y::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }
  .toolio-scroll-x::-webkit-scrollbar { height: 5px; }
  .toolio-scroll-x::-webkit-scrollbar-track { background: rgba(0,0,0,0.04); border-radius: 4px; }
  .toolio-scroll-x::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.14); border-radius: 4px; }
  .toolio-scroll-x::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }
`;
const contentTabLabels: Record<string, Record<string, string>> = {
  ja: { all: "すべて", hiragana: "ひらがな", katakana: "カタカナ", kanji: "漢字", vocab: "語彙", joshi: "助詞", bunkei: "文型", aisatsu: "あいさつ", kaiwa: "場面会話", season: "季節・行事", food: "食べ物", animal: "動物", body: "体・健康", color: "色・形", number: "数・算数" },
  en: { all: "All", hiragana: "Hiragana", katakana: "Katakana", kanji: "Kanji", vocab: "Vocabulary", joshi: "Particles", bunkei: "Sentence Patterns", aisatsu: "Greetings", kaiwa: "Conversations", season: "Seasons & Events", food: "Food", animal: "Animals", body: "Body & Health", color: "Colors & Shapes", number: "Numbers" },
};

const methodTabLabels: Record<string, Record<string, string>> = {
  ja: { all: "すべて", drill: "ドリル", test: "テスト", card: "カード", karuta: "かるた", game: "ゲーム", nurie: "ぬりえ", reading: "読み物", music: "うた", roleplay: "ロールプレイ" },
  en: { all: "All", drill: "Drill", test: "Test", card: "Cards", karuta: "Karuta", game: "Game", nurie: "Coloring", reading: "Reading", music: "Song", roleplay: "Role Play" },
};

type Material = {
  id: string;
  title: string;
  description: string;
  level: string[];
  content: string[];
  method: string[];
  ageGroup: string;
  requiredPlan: string;
  thumbnail: string;
  isPickup: boolean;
  isRecommended: boolean;
  ranking: number | null;
  isNew: boolean;
  bg?: string;
  char?: string;
  charColor?: string;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
};



const cards = [
  { img: "あ", bg: "linear-gradient(135deg,#dbe8ff,#c8d8ff)", color: "#4a72c4", tag: "無料", tagBg: "#d6f5e5", tagColor: "#2a6a44", title: "ひらがな練習シート", sub: "50音すべて収録・なぞり書き対応" },
  { img: "🃏", bg: "linear-gradient(135deg,#ecdeff,#ddc8ff)", color: "#8a5cc4", tag: "PICK", tagBg: "#ecdeff", tagColor: "#7040b0", title: "かるたセット・春", sub: "春の語彙を楽しく覚えられる" },
  { img: "字", bg: "linear-gradient(135deg,#ffd9ee,#ffc8e4)", color: "#c44a88", tag: "NEW", tagBg: "#ffd9ee", tagColor: "#a03070", title: "漢字テスト1年生", sub: "小1の漢字80字をテスト形式で" },
  { img: "🎮", bg: "linear-gradient(135deg,#d6f5e5,#c0ecd4)", color: "#3a8a5a", tag: "無料", tagBg: "#d6f5e5", tagColor: "#2a6a44", title: "かずあそびゲーム", sub: "数字と量の対応を遊びながら学ぶ" },
];

const guideTabs = [
  { id: "start",  label: "はじめての方へ",       emoji: "✦" },
  { id: "find",   label: "教材の探し方",           emoji: "🔍" },
  { id: "more",   label: "もっと活用したい",       emoji: "★" },
  { id: "help",   label: "使っていてわからないとき", emoji: "❓" },
];

const guideStartSteps = [
  { num: "01", title: "無料アカウントを作成する", desc: "メールアドレスだけで登録できます。30秒で完了します。", sub: "登録しなくても一部の教材は閲覧できますが、ダウンロードにはアカウントが必要です。" },
  { num: "02", title: "教材一覧を開く", desc: "トップページの「教材一覧を見る」から、全教材をカテゴリ・方法別に絞り込んで探せます。" },
  { num: "03", title: "気になる教材を選ぶ", desc: "教材をクリックするとプレビューと使い方が確認できます。まずは「無料」タグの教材からお試しください。" },
  { num: "04", title: "ダウンロード・印刷する", desc: "PDFをダウンロードして、A4用紙に印刷するだけ。カラーでも白黒でも使えます。" },
];
const guideStartTips = [
  { emoji: "💡", title: "最初におすすめの教材は？", desc: "「ひらがな練習シート」や「ひらがなかるた」は初めての方に人気です。まずここから試してみてください。" },
  { emoji: "🖨", title: "印刷環境がなくても大丈夫？", desc: "コンビニのネットプリントでも印刷できます。PDFをそのまま持ち込むか、USBに入れてご利用ください。" },
];
const guideChooseCards = [
  { emoji: "🎯", title: "目的から選ぶ", items: ["文字を覚えさせたい → ひらがな・カタカナ練習シート・なぞり書き", "楽しく学ばせたい → かるた・ゲーム・パズル", "定着を確認したい → テスト・ドリル系", "季節行事に合わせたい → 季節カテゴリの教材"] },
  { emoji: "📊", title: "レベルから選ぶ", items: ["文字をまだ知らない → なぞり書き・絵カード系からスタート", "少し読める → かるた・読み物・絵本系", "ある程度読める → テスト・漢字・文法系", "日常会話ができる → 語彙・会話カード系"] },
  { emoji: "🗓", title: "時間・場面から選ぶ", items: ["授業の最初の5分 → ゲーム・かるた（短時間で盛り上がる）", "宿題として → 練習シート・テスト系", "家族で楽しく → かるた・絵本・うた系", "すきま時間に → カード系・パズル"] },
];
const guideChooseTips = [
  { emoji: "🔍", title: "迷ったときは「内容×方法」で絞り込む", desc: "教材一覧では「ひらがな × かるた」のように2軸で絞り込めます。" },
  { emoji: "❤️", title: "お気に入りに保存しておく", desc: "「使いたいかも」と思った教材はハートボタンでお気に入りに保存できます（要ログイン）。" },
];
const guideUseCards = [
  { emoji: "👩‍🏫", title: "先生の方へ", items: ["授業の導入にかるたやゲームを取り入れると子どもが集中しやすくなります", "練習シートは宿題として配布するのに最適です", "テスト系教材は単元の終わりの確認に活用できます", "「使い方ガイド」が各教材についているので、準備に迷いません"] },
  { emoji: "👨‍👩‍👧", title: "保護者の方へ", items: ["週1〜2回、10〜15分の短い時間から始めるのがおすすめです", "かるたやゲームは親子で一緒に楽しめます", "なぞり書きシートは毎日の習慣づけに使いやすいです", "お子さんが好きな学習方法（ゲーム・ぬりえなど）から始めると続きやすいです"] },
];
const guideUseTips = [
  { emoji: "🎮", title: "「楽しい」が一番の近道", desc: "かるた・ゲーム・うたなど楽しめる教材を混ぜることで、子どもが日本語を「好き」になるきっかけを作れます。" },
  { emoji: "📅", title: "週のルーティンに組み込む", desc: "「月曜は練習シート、金曜はかるた」のように曜日で種類を変えると飽きにくく継続しやすくなります。" },
];
const guideMoreTips = [
  { emoji: "📂", title: "ダウンロード履歴を活用する", desc: "過去にダウンロードした教材はマイページの履歴からすぐ再ダウンロードできます。" },
  { emoji: "❤️", title: "お気に入りリストを整理する", desc: "学習テーマや季節ごとにお気に入りをまとめておくと、授業・学習の計画が立てやすくなります。" },
  { emoji: "🔓", title: "サブスクプランで全教材を使い放題に", desc: "サブスクプランに登録すると体系的なカリキュラム・全教材が使い放題になります。" },
  { emoji: "📬", title: "新着教材をチェックする", desc: "トップページの「新着」タブで最新の教材を確認できます。定期的に新しい教材が追加されます。" },
];

function GuideTipItem({ tip }: { tip: { emoji: string; title: string; desc: string } }) {
  return (
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 14, padding: "18px 22px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><span>{tip.emoji}</span>{tip.title}</div>
      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>{tip.desc}</div>
    </div>
  );
}

function GuideCardItem({ card }: { card: { emoji: string; title: string; items: string[] } }) {
  return (
    <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#7a50b0", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><span>{card.emoji}</span>{card.title}</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {card.items.map((item) => (
          <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 7 }} />
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
const troubleTabs = [
  { id: "start",      label: "何から始める？" },
  { id: "level",      label: "レベルがわからない" },
  { id: "goal",       label: "何を目標にすればいい？" },
  { id: "material",   label: "どの教材を使えばいい？" },
  { id: "teach",      label: "どう教えればいい？" },
  { id: "motivation", label: "やる気を出さない" },
  { id: "bored",      label: "子どもが飽きてしまう" },
  { id: "improve",    label: "できるようにならない" },
];

function TroubleSection({ onOpenModal }: { onOpenModal: () => void }) {
  const [tab, setTab] = useState("start");
  return (
    <div style={{ display: "flex", flexDirection: "column" as const }}>
      <div style={{ padding: "48px 48px 0", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 85%), linear-gradient(to right, rgba(244,185,185,0.4) 0%, rgba(228,155,253,0.4) 50%, rgba(163,192,255,0.4) 100%)", borderRadius: "16px 16px 0 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 8 }}>Trouble Shooting</p>
        <h2 style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>お悩み解決</h2>
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28, lineHeight: 1.8 }}>日本語指導でよくあるお悩みに、一緒に向き合います。</p>
        <div style={{ display: "flex", borderBottom: "0.5px solid rgba(200,170,240,0.25)", gap: 0, overflowX: "auto" as const }}>
          {troubleTabs.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 20px", border: "none", borderBottom: active ? "2px solid #9b6ed4" : "2px solid transparent", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#aaa", whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "36px 48px 64px", display: "flex", flexDirection: "column" as const, gap: 24 }}>
 {tab === "start" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* リード文 */}
    <p style={{ fontSize: 14, color: "#555", lineHeight: 1.9, margin: 0 }}>
      子どもに日本語を教える時、こんなこと、ありませんか？
    </p>

    {/* 実体験ブロック */}
    <div style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
      
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
  
  {[
    { icon: "📝", before: "ひらがな50音表を書く", after: "緊張感があって、楽しんでいるように見えない…" },
    { icon: "📝", before: "語彙や文の練習問題を重ねる", after: "プリントを出すと嫌がる。準備も意外と大変。" },
    { icon: "📚", before: "子ども向けの教科書を使う", after: "教科書を出すと、途端に嫌がる。" },

  ].map((item, i) => (
    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "12px 16px" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
        <span style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>{item.before}</span>
      </div>
      <div style={{ fontSize: 18, color: "#ddd", flexShrink: 0 }}>→</div>
      <div style={{ fontSize: 13, color: "#888", fontWeight: 400, lineHeight: 1.6 }}>{item.after}</div>
    </div>
  ))}
</div>
    </div>

    {/* まとめ文 */}
  

<div style={{ borderLeft: "3px solid #e49bfd", background: "#fafafa", borderRadius: "0 12px 12px 0", padding: "16px 20px" }}>
  <p style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 8 }}>そして毎回、終わった後——</p>
  <p style={{ fontSize: 13, color: "#777", lineHeight: 1.85, margin: 0 }}>
    「これでよかったのかな」「もっと楽しくできたかも」　　　そんなふうに感じたこと、ありませんか。
  </p>
</div>

    <div style={{ borderLeft: "3px solid #a3c0ff", background: "#fafafa", borderRadius: "0 12px 12px 0", padding: "16px 20px" }}>
  <p style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 8 }}>でも、子どもってかるた、大好きですよね。</p>
  <p style={{ fontSize: 13, color: "#777", lineHeight: 1.85, margin: 0 }}>
    毎回同じかるたでも、飽きずにやってくれる。そしてそのかるたの言葉は、気づいたらすんなり覚えてしまっている。
  </p>
</div>
    
    {/* ループ図 */}
    <p style={{ fontSize: 18, fontWeight: 800, color: "#444", lineHeight: 1.9, margin: 40, textAlign: "center" as const }}>
  日本語を話すために必要な内容すべてを、このように楽しくできれば——そう思って考えたのが、toolioの構成です。
</p>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start"  }}>
      <img
  src="/tanoshii_dekita.png"
  alt="たのしい→できた！の繰り返しで成長する階段図"
  style={{ width: "100%", maxWidth: 680, display: "block", margin: "0 auto", borderRadius: 12 }}
/>
<div style={{ marginTop: 24, fontSize: 13, color: "#777", lineHeight: 1.9, textAlign: "left" as const }}>
  このように、学習の中で「たのしい」→「できた！」をたくさん繰り返します。
  同じ体験を繰り返しながら、少しずつステップアップさせていくと、最後には大きな「できた！」になります。
  この大きな「できた！」は、私たちが目標とする、"日本語で話せるようになる”になります。
</div>

<div style={{ height: 24 }} />
{/* レベルの説明 */}
<p style={{ fontSize: 13, color: "#777", lineHeight: 1.9, margin: 0, textAlign: "left" as const }}>
  でも、毎回同じ内容で「たのしい→できた！」を繰り返しているだけでは、大きな「できた！」には辿り着けません。そのために必要なのが、<span style={{ fontWeight: 700, color: "#7a50b0" }}>レベルを少しずつ上げていくこと</span>です。
</p>




<img
  src="/toollevel.png"
  alt="Basic・Middle・Advancedの3段階レベル図"
 style={{ width: "100%", maxWidth: 680, display: "block", margin: "0 auto", borderRadius: 12 }}
/>
<div style={{ height: 32 }} />
<p style={{ fontSize: 13, color: "#777", lineHeight: 1.85, margin: 0, textAlign: "left" as const }}>
  楽しい活動で子どものモチベーションを維持しながら、少しずつレベルを上げていく。これって、最高の流れだと思いませんか？
</p>
<div style={{ height: 32 }} />
    </div>

   {/* toolioの核心ブロック */}
<div style={{ borderLeft: "3px solid #f4b9b9", background: "#fafafa", borderRadius: "0 12px 12px 0", padding: "16px 20px" }}>
  <p style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 8 }}>でも——</p>
  <p style={{ fontSize: 13, color: "#777", lineHeight: 1.85, margin: 0 }}>
    このような「たのしい→できた！」を実現できる教材って、作ろうと思うと準備が大変ですよね。そんな時に生み出したのが、<span style={{ fontWeight: 700, color: "#7a50b0" }}>toolio</span>です。
  </p>
</div>

<div style={{ height: 24 }} />

<div style={{ border: "0.5px solid rgba(228,155,253,0.5)", borderRadius: 14, padding: "40px 30px", background: "linear-gradient(135deg,rgba(252,228,248,0.3),rgba(221,238,255,0.3))" }}>
  <p style={{ fontSize: 14, fontWeight: 700, color: "#444", lineHeight: 1.85, textAlign: "center" as const }}>
    toolioは、子どもに楽しく日本語を学習してもらいたい、そしてそれを支える先生や保護者の方々の力になりたい、と言う思いから生まれました。
  </p>
</div>

<div style={{ height: 24}} />

{/* 新ステップ構成 */}
<div style={{ display: "flex", flexDirection: "column" as const, gap: 48 }}>

  {/* 3ステップ概要 */}
  <div style={{ display: "flex", gap: 0, alignItems: "center", justifyContent: "center" }}>
    {[
      { num: "01", label: "レベルを知る" },
      { num: "02", label: "ゴールを設定する" },
      { num: "03", label: "教材を使って教える" },
    ].map((item, i, arr) => (
      <div key={item.num} style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white" }}>{item.num}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", whiteSpace: "nowrap" as const }}>{item.label}</div>
        </div>
        {i < arr.length - 1 && <div style={{ fontSize: 20, color: "#ddd", margin: "0 12px", paddingBottom: 20 }}>→</div>}
      </div>
    ))}
  </div>
  <div style={{ height: 8}} />
  {/* STEP 1: レベルを知る */}
  <div style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "24px 28px 36px", display: "flex", flexDirection: "column" as const, gap: 20 }}>
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>01</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#333" }}>レベルを知る</div>
        <div style={{ fontSize: 12, color: "#b090c8", marginTop: 2 }}>初回だけでOK</div>
      </div>
    </div>
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9 }}>
      レベルを知ることで、正確なスタート地点を決めることができます。これがないと——
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        <img src="/toodifficult.png" alt="難しすぎる場合" style={{ width: "100%", borderRadius: 10, display: "block" }} />
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8, padding: "10px 14px", background: "#f0f0f0", borderRadius: 10, minHeight: 80, textAlign: "center" as const }}>
          内容がむずかしすぎた場合、子どものレベルとかけ離れていて理解できない、やる気が出ないと言うことが起きます。
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        <img src="/tooeasy.png" alt="簡単すぎる場合" style={{ width: "100%", borderRadius: 10, display: "block" }} />
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8, padding: "10px 14px", background: "#f0f0f0", borderRadius: 10, minHeight: 80, textAlign: "center" as const }}>
          内容が簡単すぎた場合、すでにわかっていることなのでつまらない、と言うことが起きてしまいます。
        </div>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
      <button onClick={() => setTab("level")} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        詳しいチェックの仕方はこちら →
      </button>
    </div>
  </div>

  <div style={{ display: "flex", justifyContent: "center", fontSize: 16, color: "#ddd" }}>↓</div>

  {/* STEP 2: ゴールを設定する */}
  <div style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "24px 28px 36px", display: "flex", flexDirection: "column" as const, gap: 20 }}>
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>02</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#333" }}>ゴールを設定する</div>
        <div style={{ fontSize: 12, color: "#b090c8", marginTop: 2 }}>毎回の作業</div>
      </div>
    </div>
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9 }}>
      具体的に考えなくてOKです。子どもの日ごろの観察により、「どんなことをやったほうがいいか」を決めてみましょう。これをやることで、どんな内容をやるかを具体的に決められます。
    </div>
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
      <button onClick={() => setTab("goal")} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        目標の決め方はこちら →
      </button>
    </div>
  </div>

  <div style={{ display: "flex", justifyContent: "center", fontSize: 16, color: "#ddd" }}>↓</div>

  {/* STEP 3: 教材を選んで実践 */}
  <div style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "24px 28px 36px", display: "flex", flexDirection: "column" as const, gap: 20 }}>
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>03</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#333" }}>教材を選んで実践！</div>
        <div style={{ fontSize: 12, color: "#b090c8", marginTop: 2 }}>レベルとゴールの間にある教材を選ぶ</div>
      </div>
    </div>
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9 }}>
      2つが決まったら、その間にある教材を選んで実践しましょう！
    </div>
    <img src="/choose.png" alt="教材を選ぶ" style={{ width: "100%", maxWidth: 680, display: "block", margin: "0 auto", borderRadius: 12, mixBlendMode: "multiply" as const }} />
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>
  </div>
  </div>
    {/* 締めの言葉 */}
    <div style={{ textAlign: "center" as const, padding: "32px 24px", background: "linear-gradient(135deg,rgba(244,185,185,0.15),rgba(228,155,253,0.15),rgba(163,192,255,0.15))", borderRadius: 16, border: "0.5px solid rgba(200,170,240,0.25)" }}>
      <div style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.6, marginBottom: 8 }}>
        さあ、toolioと一緒に始めましょう。
      </div>
      <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.8 }}>
        まずは気になった教材を1つ、試してみてください。
      </div>
    </div>

  </div>
)}
 {tab === "level" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ① 日常の中で観察しよう */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      テストしなくて大丈夫。レベルは、日常の会話の中でざっくり観察するだけで十分です。<br />
      大切なのは「できないこと」を探すのではなく、<span style={{ fontWeight: 700, color: "#7a50b0" }}>「できること」を見つけること</span>。できることが見えれば、最初の一歩が自信を持って踏み出せます。
    </div>

    {/* ② やさしい日本語とは？ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>やさしい日本語で話しかけてみよう</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>
        子どもに日本語で話しかけるとき、難しい言葉・長い文・早口では正確に伝わりません。まず「やさしい日本語」を意識してみましょう。
      </div>

      {/* 3つのポイント */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 16 }}>
        {[
          { icon: "✂️", point: "短く話す", desc: "一文に一つの内容だけ。「ごはん、食べた？」" },
          { icon: "🐢", point: "ゆっくり話す", desc: "急がず、間をとって。子どもが処理する時間を作る" },
          { icon: "💬", point: "知っている言葉を使う", desc: "「食事」より「ごはん」。子どもが知っていそうな言葉で" },
        ].map((item) => (
          <div key={item.point} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#444", marginBottom: 3 }}>{item.point}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* NG→OK例 */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10 }}>NG → OK の例</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {[
          { ng: "今日学校でどんなことがあったか教えて", ok: "今日、楽しかった？" },
          { ng: "急いで準備しないと遅刻するよ", ok: "はやく！急いで！" },
          { ng: "この字、なんて読むかわかる？", ok: "これ、読める？" },
          { ng: "もう少し大きな声で話してみて", ok: "もっと大きい声で" },
        ].map((item) => (
          <div key={item.ng} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "12px 16px" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#f4b9b9", marginBottom: 3 }}>NG</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>{item.ng}</div>
            </div>
            <div style={{ fontSize: 16, color: "#ddd" }}>→</div>
            <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.1),rgba(163,192,255,0.1))", borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#a3c0ff", marginBottom: 3 }}>OK ✅</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{item.ok}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ③ 四技能チェックリスト */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 6 }}>日常の中でチェックしてみよう</div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16 }}>やさしい日本語で話しかけながら、できることに✓を入れてみましょう。</div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
        {[
          {
            skill: "聞く",
            icon: "👂",
            color: "#e8efff",
            border: "rgba(163,192,255,0.4)",
            titleColor: "#3a5a9a",
            items: [
              "名前を呼ばれたら振り向く",
              "「座って」「来て」など簡単な指示がわかる",
              "「〇〇はどこ？」という質問に体や指で答えられる",
              "短いお話を最後まで聞ける",
              "話の内容について「うん」「ちがう」で答えられる",
            ],
          },
          {
            skill: "話す",
            icon: "🗣",
            color: "#fce4f8",
            border: "rgba(228,155,253,0.4)",
            titleColor: "#7a2e7a",
            items: [
              "単語（「おなかすいた」「いや」など）で気持ちを伝えられる",
              "「〇〇したい」「〇〇がすき」と言える",
              "経験を一文で話せる（「公園いった」など）",
              "知らない言葉を身振りや別の言葉で伝えようとする",
              "日本語で話しかけられたとき、日本語で返そうとする",
            ],
          },
          {
            skill: "読む",
            icon: "📖",
            color: "#fff8e0",
            border: "rgba(240,200,80,0.4)",
            titleColor: "#7a5a00",
            items: [
              "自分の名前がひらがなで読める",
              "ひらがな50音がだいたい読める",
              "短い単語（「ねこ」「りんご」など）が読める",
              "簡単な文（「ねこがいる」など）が読める",
              "初めて見た文章を自分で読もうとする",
            ],
          },
          {
            skill: "書く",
            icon: "✏️",
            color: "#d6f5ee",
            border: "rgba(109,207,184,0.4)",
            titleColor: "#0d5c4a",
            items: [
              "自分の名前がひらがなで書ける",
              "見本を見ながらひらがなが書ける",
              "見本なしでひらがなが書ける",
              "短い文が書ける（「わたしは〇〇です」など）",
              "自分の考えを文章で書こうとする",
            ],
          },
        ].map((skill) => (
          <div key={skill.skill} style={{ background: skill.color, border: `0.5px solid ${skill.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>{skill.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: skill.titleColor }}>{skill.skill}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {skill.items.map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${skill.border}`, background: "white", flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 印刷ボタン */}
      <button style={{ marginTop: 14, fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "0.5px solid rgba(163,192,255,0.5)", background: "white", color: "#7a50b0", cursor: "pointer" }}>
        📄 チェックリストを印刷する（準備中）
      </button>
    </div>

    {/* ④ チェックした後は？ */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 10 }}>チェックした後は？</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, marginBottom: 16 }}>
        チェックが多くついた力が、今のお子さんの<span style={{ fontWeight: 700, color: "#7a50b0" }}>得意な入口</span>です。その力から使える教材を選ぶと、最初の一歩が踏み出しやすくなります。toolioの教材はレベルで縛っていません。同じ教材でも使い方次第でどのレベルにも使えます。
      </div>
      <button onClick={() => setTab("material")} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        どんな教材を使えばいい？ →
      </button>
    </div>

  </div>
)}
{tab === "material" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ① チェックリストの結果を活かして選ぼう */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>チェックリストの結果を活かして選ぼう</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>
        レベルチェックの結果を参考に、得意な力から入るのが一番スムーズです。
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "👂🗣", skill: "聞く・話すにチェックが多い", desc: "まず音声・会話系の教材から（かるた・カード・ロールプレイ）" },
          { icon: "📖", skill: "読むに興味が出てきた", desc: "ひらがな・文字系の教材から（練習シート・読み物）" },
          { icon: "✏️", skill: "書くが得意", desc: "練習シート・ドリル系から始めてみましょう" },
        ].map((item) => (
          <div key={item.skill} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "12px 16px" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 3 }}>{item.skill}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>→ {item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: "#888", lineHeight: 1.8, padding: "12px 16px", background: "#f8f6ff", borderRadius: 10 }}>
        ただし、レベルの縛りはありません。同じ教材でも使い方次第でどのレベルにも使えます。各教材ページの「使い方」タブに具体的な活用例を載せています。
      </div>
    </div>

    {/* ② Basic→Middle→Advancedって何？ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>Basic・Middle・Advancedって何？</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>
        toolioの教材には3つの活動の形があります。難しさが気づかないうちに上がっていくので、子どもはストレスなく自然にステップアップできます。
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
        {[
          {
            level: "Basic",
            icon: "🃏",
            color: "#d6f5e5",
            border: "rgba(109,207,184,0.4)",
            titleColor: "#2a6a44",
            desc: "説明なしで飛び込める活動。ルールがシンプルで、すぐに「できた！」が生まれます。",
            examples: "かるた・カード・ぬりえ",
            dekita: "「札が取れた！」「全部塗れた！」",
          },
          {
            level: "Middle",
            icon: "🎮",
            color: "#e8efff",
            border: "rgba(163,192,255,0.4)",
            titleColor: "#3a5a9a",
            desc: "少しルールがある活動。Basicで触れた言葉が自然に出てきます。",
            examples: "ゲーム・クイズ・ビンゴ",
            dekita: "「全部言えた！」「勝った！」",
          },
          {
            level: "Advanced",
            icon: "🎭",
            color: "#ffe8f4",
            border: "rgba(244,185,185,0.4)",
            titleColor: "#a03070",
            desc: "やり取りが生まれる活動。気づいたら日本語で話せるようになっています。",
            examples: "ロールプレイ・インタビュー・お店屋さんごっこ",
            dekita: "「お店屋さんと話せた！」「インタビューできた！」",
          },
        ].map((item) => (
          <div key={item.level} style={{ background: item.color, border: `0.5px solid ${item.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: item.titleColor }}>{item.level}</span>
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8, marginBottom: 8 }}>{item.desc}</div>
            <div style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>例：{item.examples}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: item.titleColor }}>できた！の例：{item.dekita}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#f8f6ff", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#666", lineHeight: 1.8 }}>
        Basicから始めるのが入りやすいですが、順番の縛りはありません。「この教材、うちの子に合いそう」という直感で選んでOKです。toolioの教材はどの段階から入っても、活動の中で自然に「やりたい！」が生まれるように設計しています。
      </div>
    </div>

    {/* 授業例 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>授業の流れの例</div>

      {/* パターンA */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#7a50b0", marginBottom: 12 }}>パターンA｜1回の授業で完結（約30分）</div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 12 }}>
          同じテーマをその日のうちにBasic→Middle→Advancedと進みます。毎回必ず「できた！」で終わるのがポイントです。
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {[
            { time: "導入（5分）", icon: "💬", desc: "食べ物カードを見ながら「これ知ってる？」と話しかける" },
            { time: "Basic（10分）", icon: "🃏", desc: "食べ物かるたで遊ぶ → 札が取れた！" },
            { time: "Middle（10分）", icon: "🎮", desc: "食べ物ビンゴをする → 全部言えた！" },
            { time: "Advanced（5分）", icon: "🎭", desc: "お買い物ロールプレイ → お店屋さんと話せた！" },
          ].map((step, i, arr) => (
            <div key={step.time}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{step.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#c9a0f0", marginBottom: 3 }}>{step.time}</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{step.desc}</div>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", padding: "4px 0", fontSize: 14, color: "#ddd" }}>↓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* パターンB */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#7a50b0", marginBottom: 12 }}>パターンB｜複数回にまたがる構成（例：3回）</div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 12 }}>
          同じテーマで少しずつ難しくしていきます。前回の「できた！」が次回の土台になり、子どもが「あ、これ知ってる！」と自信を持って入れます。
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {[
            { time: "1回目", icon: "🃏", desc: "食べ物かるたで遊ぶ（Basic）→ 札が取れた！で終わる" },
            { time: "2回目", icon: "🎮", desc: "食べ物ビンゴをする（Middle）→ 前回のかるたで覚えた言葉が出てくる！" },
            { time: "3回目", icon: "🎭", desc: "お買い物ロールプレイ（Advanced）→ 気づいたら話せるようになってた！" },
          ].map((step, i, arr) => (
            <div key={step.time}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{step.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#c9a0f0", marginBottom: 3 }}>{step.time}</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{step.desc}</div>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", padding: "4px 0", fontSize: 14, color: "#ddd" }}>↓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ③ 横断学習 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 8 }}>一つの活動で複数のことが学べる</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>
        toolioの教材は、一つの活動の中で別の学習項目も自然に深まるように設計されています。「これだけを教えよう」と構えなくても、活動の中で自然にいろんな言葉に触れられます。
      </div>
      <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {[
            { icon: "🍎", text: "食べ物かるた → 食べ物の語彙＋「赤いいちご」で色にも自然に触れる" },
            { icon: "🛒", text: "お買い物ロールプレイ → 食べ物の語彙＋「3つください」で数＋会話表現が同時に深まる" },
            { icon: "🍂", text: "季節のぬりえ → 色の名前＋季節の語彙に同時に触れる" },
            { icon: "🐾", text: "動物カード → 動物の名前＋耳・しっぽなど体の部位も自然に出てくる" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ④ 子どもの興味も大切 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>子どもの興味も大切</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "🚗", title: "好きなものから", desc: "車が好き→乗り物の語彙、動物が好き→動物の教材など、興味のあるテーマから入ると吸収が早い" },
          { icon: "🍂", title: "季節・生活に合わせて", desc: "今の季節の教材、日常生活で使う言葉など、子どもの生活に近いものが定着しやすい" },
          { icon: "✨", title: "「やってみたい！」を大切に", desc: "子どもが楽しそうと感じる教材を選ぶことが、続けるための一番の近道" },
        ].map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ⑤ 教材一覧へ */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>まずは気になった教材を1つ試してみましょう</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>各教材ページの「使い方」タブに、レベル別・場面別の活用例を載せています。参考にしながら、自由に使ってみてください。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>

  </div>
)}
{tab === "teach" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* 共感リード */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      教え方に正解はありません。でも、こんなことを意識するだけで、子どもの反応がぐっと変わります。
    </div>

    {/* 心がけること */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>心がけること</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>

        {/* 1 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎉</div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>説明より先に「楽しい活動」から入る</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>説明から始めると子どもは構えてしまいます。まず活動に飛び込んで、やりながら自然に言葉に触れさせましょう。</div>
              <div style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, marginBottom: 6 }}>例えば——</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8, background: "#f8f6ff", borderRadius: 8, padding: "10px 14px" }}>
                「今日はかるたをやろう！」とカードを広げるだけでOK。ルールの説明は最小限に、まずやってみる。やっているうちに子どもが自然にルールを覚えていきます。
              </div>
            </div>
          </div>
        </div>

        {/* 2 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🌱</div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>先生がさりげなく言葉を添える</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>「これは○○だよ」と教え込むのではなく、活動の中でさりげなく言葉を添えるだけで十分です。</div>
              <div style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, marginBottom: 6 }}>声かけの例——</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, background: "#f8f6ff", borderRadius: 8, padding: "10px 14px" }}>
                {[
                  "札を取った瞬間に「いちご！赤いね」とさりげなく言う",
                  "子どもが指さしたら「そう、これはりんごだね」と繰り返す",
                  "正解・不正解より「言葉を拾う」感覚で",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 7 }} />
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⭐</div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>必ず「できた！」で終わる</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>最後は子どもが「できた！」と感じられる活動で締めくくりましょう。こんな工夫を取り入れてみてください。</div>
              <div style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, marginBottom: 6 }}>工夫の例——</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, background: "#f8f6ff", borderRadius: 8, padding: "10px 14px" }}>
                {[
                  "抜き打ちで「これ言える？」と聞いてみる → 自然に言えた！という達成感が生まれる",
                  "できた札・カードを手元に集めておく → 「これだけ取れた！」と目で見てわかる",
                  "前回できなかったことをもう一度やってみる → 「あ、今回はできた！」と成長を自分で感じられる",
                  "できた言葉をノートや紙に書き留める → 積み重なっていく「できた！」が目に見える形になる",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 7 }} />
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👀</div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>疲れたサインを見逃さない</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>集中できる時間は子どもによって違います。サインを感じたら「今日はここまで」と早めに切り上げてOKです。</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                <div style={{ background: "#fff0f0", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 12, color: "#c07070", fontWeight: 700, marginBottom: 6 }}>こんなサインに気をつけて——</div>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
                    {["視線がそれる・返事が遅くなる", "ぼーっとする・欠伸が出る", "関係ない話を始める・席を立とうとする"].map((item) => (
                      <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f4b9b9", flexShrink: 0, marginTop: 7 }} />
                        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#f0fff4", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 12, color: "#2a6a44", fontWeight: 700, marginBottom: 6 }}>対処——</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>「今日はここまでにしよう」と切り上げる・別の簡単な活動に切り替えてから終わる</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤍</div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>できなくても責めない</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>「怒られないようにやる」ではなく「やりたいからやる」を大切に。間違えても大丈夫、という空気が「できる」を引き出します。</div>
              <div style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, marginBottom: 6 }}>こんな場面では——</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, background: "#f8f6ff", borderRadius: 8, padding: "10px 14px" }}>
                {[
                  "かるたの札が取れなかった → 「惜しかった！次は取れるよ」と切り替える",
                  "言葉が出てこなかった → 「そうそう、これは○○だよ」とさりげなくフォロー",
                  "間違えた → 「あ、そう聞こえるよね」と否定せず自然に正しい言葉を繰り返す",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 7 }} />
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🌟</div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>できた部分を認めてほめる</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>できない部分には必ず原因があります。まずできていることを見つけて認めることが、子どもの自信につながります。</div>
              <div style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, marginBottom: 6 }}>こんな伝え方で——</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, background: "#f8f6ff", borderRadius: 8, padding: "10px 14px" }}>
                {[
                  "「全部はできなかったけど、この3枚は全部言えたね！」",
                  "「先週より速く取れるようになったね」と変化を伝える",
                  "できた札だけ集めて「これだけ取れた！」と一緒に数える",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 7 }} />
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    {/* 教材一覧へ */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>まずは楽しい活動から始めてみましょう</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>toolioの教材はすべて「まず楽しい活動ありき」で設計されています。説明は最小限。すぐに使えます。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>

  </div>
)}

{tab === "motivation" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：共感リード */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      「やって」と言っても動かない。そのたびに消耗してしまう——そんな毎日、ありませんか。<br />
      でも「やる気がない」のではなく、「やる気が出る状況になっていない」だけかもしれません。
    </div>

    {/* ブロック2：やる気が出ない理由 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>やる気が出ない、よくある理由</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "😮‍💨", title: "必要性を感じていない", desc: "「なんでやるの？」がわかっていない" },
          { icon: "🎯", title: "ゴールが見えない", desc: "何ができるようになるのかイメージできない" },
          { icon: "😞", title: "失敗が怖い", desc: "「また間違えたら嫌だ」という気持ちが先に立つ" },
          { icon: "🔋", title: "そもそも疲れている", desc: "学校・習い事・日常でエネルギーが残っていない" },
        ].map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック3：やる気のスイッチを押すヒント */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>やる気のスイッチを押すヒント</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { icon: "🗣", title: "「今日これだけやろう」と小さく始める", desc: "ハードルを下げるほど、動き出しやすくなる" },
          { icon: "🎮", title: "最初はゲームや遊びで気分を上げる", desc: "楽しい入口があると、本題にも乗りやすい" },
          { icon: "🌟", title: "「できたこと」を毎回見えるようにする", desc: "シール・スタンプなど、小さな達成感を積み重ねる" },
          { icon: "📅", title: "決まった時間・場所でやる", desc: "「習慣」になると、やる気を待たなくてよくなる" },
        ].map((step, i, arr) => (
          <div key={step.title}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{step.icon}</div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ブロック4：やる気より大切なこと */}
    <div style={{ background: "#f8f6ff", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#7a50b0", marginBottom: 10 }}>やる気より大切なこと</div>
      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.9 }}>
        やる気は「待つ」ものではなく、<span style={{ fontWeight: 700, color: "#7a50b0" }}>「動いてから生まれる」</span>ものです。<br />
        まず小さな「できた！」を作ることが、一番の近道です。
      </div>
    </div>

    {/* ブロック5：CTA */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>短時間・ゲーム感覚で取り組める教材を揃えています</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>「今日はこれだけ」から始めてみてください。小さな一歩が、続ける力になります。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>

  </div>
)}

        {tab === "bored" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：共感リード */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      がんばって準備したのに、5分で「もうやだ」。そんな経験、ありませんか。<br />
      でも、飽きるのは子どものせいでも、教材のせいでもないことがほとんどです。「飽き」には、必ず理由があります。
    </div>

    {/* ブロック2：飽きの4パターン */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>飽きているとき、何が起きている？</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "🧩", title: "難しすぎる", desc: "わからないから、やる気が出ない" },
          { icon: "😪", title: "簡単すぎる", desc: "達成感がなく、つまらなく感じる" },
          { icon: "😴", title: "疲れている", desc: "集中できる時間は子どもによって違う" },
          { icon: "💭", title: "興味がない", desc: "内容が自分ごとに感じられない" },
        ].map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック3：パターン別の対処法 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>パターン別の対処法</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { icon: "🧩", title: "難しすぎるとき", desc: "一つ前のステップに戻る。「できた！」の体験を作ってから進む。" },
          { icon: "😪", title: "簡単すぎるとき", desc: "スピードを競ったり、役割を逆にしたりしてゲームにする。" },
          { icon: "😴", title: "疲れているとき", desc: "時間を15分以内に区切る。「今日はここまで」と決めてOK。" },
          { icon: "💭", title: "興味がないとき", desc: "テーマを子どもの好きなものに変える。乗り物好きなら乗り物の語彙から。" },
        ].map((step, i, arr) => (
          <div key={step.title}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{step.icon}</div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ブロック4：授業設計のコツ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>授業設計のちょっとしたコツ</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {[
          { icon: "🎯", text: "最初に「今日はこれをやるよ」と伝える" },
          { icon: "⏱", text: "1回の学習は15〜20分を目安に" },
          { icon: "🎉", text: "終わりは「できたね」で締めくくる" },
        ].map((item) => (
          <div key={item.text} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 10 }}>
            <div style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック5：CTA */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>toolioの教材は「飽きさせない」ために作っています</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>ゲーム・カード・クイズなど、楽しみながら学べる教材を揃えています。子どもの「やってみたい！」を引き出すヒントが見つかるはずです。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>

  </div>
)}

{tab === "improve" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：共感リード */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      何度やっても覚えない。同じ間違いを繰り返す。「この子、本当に大丈夫？」と不安になることありませんか。<br />
      でも「できるようにならない」には、必ず理由があります。焦らず、一緒に原因を探しましょう。
    </div>

    {/* ブロック2：よくある原因 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>よくある原因</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "🔁", title: "インプットが足りない", desc: "練習回数・触れる量がまだ少ない" },
          { icon: "🧠", title: "定着する前に次へ進んでいる", desc: "「わかった」と「できる」は別物" },
          { icon: "📦", title: "使う場面がない", desc: "日常で使わないと記憶に残りにくい" },
          { icon: "😰", title: "プレッシャーがかかっている", desc: "緊張すると、知っていることも出てこない" },
          { icon: "📚", title: "学習方法が合っていない", desc: "書くより話す・見るより聞くなど、得意な方法は子どもによって違う" },
        ].map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック3：定着のための3ステップ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>定着のための3ステップ</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { icon: "👀", title: "まず「知る」", desc: "教材・カードで内容に触れる。正確さより「なんとなくわかる」が大事" },
          { icon: "🔄", title: "次に「慣れる」", desc: "ゲーム・かるたで繰り返す。楽しみながら自然に身につける" },
          { icon: "🗣", title: "最後に「使う」", desc: "会話・ロールプレイで実際に使ってみる。ここで初めて「できた」になる" },
        ].map((step, i, arr) => (
          <div key={step.title}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{step.icon}</div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ブロック4：環境と方法を見直す */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>環境と方法を見直してみましょう</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          {
            icon: "😌",
            title: "リラックスできる環境を作る",
            desc: "テストのような雰囲気にしない。間違えても大丈夫、という空気が「できる」を引き出します。「怒られないようにやる」より「やりたいからやる」を大切に。",
          },
          {
            icon: "🔄",
            title: "学習方法を変えてみる",
            desc: "書くのが苦手なら話してみる、見るより聞く方が入りやすい子もいる。同じ内容でもアプローチを変えるだけで、ぐんと定着が変わることがあります。",
          },
        ].map((item) => (
          <div key={item.title} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{item.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック5：CTA */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>「知る→慣れる→使う」の流れで使える教材を揃えています</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>方法を変えるヒントも、各教材ページの「使い方」タブで確認できます。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>

  </div>
)}
        {tab === "goal" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：共感リード */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      「今日は50音表を練習する」——それ自体は悪くありません。でも、子どもにとって「何のためにやるのか」が見えないと、続きにくくなります。<br />
      目標は「何を学ぶか」より、<span style={{ fontWeight: 700, color: "#7a50b0" }}>「何ができるようになるか」</span>で考えてみましょう。
    </div>

    {/* ブロック2：Can-doで考えてみよう */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>Can-doで考えてみよう</div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12 }}>「できた！」がわかる目標の例</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {[
          { before: "ひらがなを練習する", after: "お菓子のパッケージが読める" },
          { before: "あいさつを覚える", after: "朝起きたときに日本語であいさつできる" },
          { before: "数字を学ぶ", after: "お店で値段がわかる" },
          { before: "季節の語彙をやる", after: "「今日は寒いね」と日本語で話せる" },
        ].map((item) => (
          <div key={item.before} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#ccc", marginBottom: 4 }}>学習ベース</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>{item.before}</div>
            </div>
            <div style={{ fontSize: 18, color: "#ddd" }}>→</div>
            <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.1),rgba(163,192,255,0.1))", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#c9a0f0", marginBottom: 4 }}>Can-doベース ✅</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{item.after}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック3：1回の授業の目標の立て方 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>1回の授業の目標の立て方</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { icon: "🎯", title: "「今日のゴール」を最初に決める", desc: "子どもと一緒に「今日はこれができるようになろう」と確認する" },
          { icon: "📝", title: "Can-doの形で言葉にする", desc: "「〜を学ぶ」ではなく「〜ができるようになる」という形にする" },
          { icon: "🎉", title: "最後に「できたね」を確認して終わる", desc: "ゴールに戻って振り返ることで、達成感が生まれる" },
        ].map((step, i, arr) => (
          <div key={step.title}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{step.icon}</div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ブロック4：目標は小さいほど達成感が大きい */}
    <div style={{ background: "#f8f6ff", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#7a50b0", marginBottom: 10 }}>目標が小さいほど、達成感が大きい</div>
      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.9 }}>
        「ひらがなを全部覚える」より「今日はこの5文字が読める」。<br />
        小さなCan-doの積み重ねが、<span style={{ fontWeight: 700, color: "#7a50b0" }}>子どもの自信</span>になります。
      </div>
    </div>

    {/* ブロック5：CTA */}
<div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
  <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>ゴールが決まったら、教材を選びましょう</div>
  <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>
    Can-doをもとに、そのゴールに向かって使える教材を選びましょう。各教材ページの「使い方」タブに、場面別・Can-do別の活用例を載せています。
  </div>
  <button onClick={() => setTab("material")} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
    どの教材を使えばいい？ →
  </button>
</div>

  </div>
)}
      </div>
    </div>
  );
}

function GuideSection() {
  const [guideTab, setGuideTab] = useState("start");
  return (
    <div style={{ display: "flex", flexDirection: "column" as const }}>
      <div style={{ padding: "48px 48px 0", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 85%), linear-gradient(to right, rgba(244,185,185,0.4) 0%, rgba(228,155,253,0.4) 50%, rgba(163,192,255,0.4) 100%)", borderRadius: "16px 16px 0 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 8 }}>Guide</p>
        <h2 style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>使い方ガイド</h2>
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28, lineHeight: 1.8 }}>お悩みに合わせて、toolioの使い方をご案内します。</p>
        <div style={{ display: "flex", borderBottom: "0.5px solid rgba(200,170,240,0.25)", gap: 0, overflowX: "auto" as const }}>
          {guideTabs.map((tab) => {
            const active = guideTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setGuideTab(tab.id)} style={{ padding: "12px 22px", border: "none", borderBottom: active ? "2px solid #9b6ed4" : "2px solid transparent", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#aaa", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                <span>{tab.emoji}</span>{tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "36px 48px 64px", display: "flex", flexDirection: "column" as const, gap: 36 }}>
        {guideTab === "start" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ステップ全体 */}
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 20 }}>toolioをはじめよう</div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {/* STEP 1 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>01</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>まず無料教材を試す</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>アカウント不要・登録なしで今すぐダウンロードできます。まずは気になった教材を1つ試してみてください。</div>
              {/* プレースホルダー：無料タグ・ダウンロードボタンのスクリーンショット */}
              <div style={{ width: "100%", aspectRatio: "16/7", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, gap: 6, color: "#bbb", fontSize: 12 }}>
                <div style={{ fontSize: 20 }}>🖼</div>
                <div>無料タグ・ダウンロードボタンの画像</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

        {/* STEP 2 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>02</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>気に入ったら無料登録する</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 12 }}>登録するとこんな機能が使えるようになります。</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 16 }}>
                {[
                  { icon: "❤️", title: "お気に入り保存", desc: "気になった教材をハートボタンで保存できます", placeholder: "お気に入りボタンの画像" },
                  { icon: "📂", title: "ダウンロード履歴", desc: "過去にダウンロードした教材をいつでも再ダウンロードできます", placeholder: "ダウンロード履歴画面の画像" },
                ].map((item) => (
                  <div key={item.title} style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.15)", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#999", lineHeight: 1.7, marginBottom: 10 }}>{item.desc}</div>
                    {/* プレースホルダー */}
                    <div style={{ width: "100%", aspectRatio: "16/5", background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
                      <span>🖼</span><span>{item.placeholder}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

        {/* STEP 3 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>03</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>サブスクプランに登録する</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>プランに応じて使える教材が増えます。まずは気軽にLightプランから試してみてください。</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 16 }}>
                {[
                  { plan: "Light", price: "¥980", color: "#d6f5e5", textColor: "#2a6a44" },
                  { plan: "Standard", price: "¥1,980", color: "#e8efff", textColor: "#3a5a9a" },
                  { plan: "Premium", price: "¥3,980", color: "#ffe8f4", textColor: "#a03070" },
                ].map((item) => (
                  <div key={item.plan} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: item.color, borderRadius: 10, padding: "10px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.textColor }}>{item.plan}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.textColor }}>{item.price} / 月</div>
                  </div>
                ))}
              </div>
              <button onClick={() => window.location.href = "/plan"} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
                プランの詳細を見る →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 教材の探し方 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>教材の探し方</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "🔵", title: "学習内容のアイコンから探す", desc: "ひらがな・カタカナ・語彙など、学びたい内容のアイコンをタップ", placeholder: "学習内容アイコン行の画像" },
          { icon: "▶️", title: "学習方法のアイコンから探す", desc: "ドリル・カード・ゲームなど、使いたい方法のアイコンをタップ", placeholder: "学習方法アイコン行の画像" },
          { icon: "✦", title: "「教材一覧を見る」から探す", desc: "内容と方法を組み合わせて絞り込みができます", placeholder: "教材一覧モーダルの画像" },
        ].map((item) => (
          <div key={item.title} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{item.title}</span>
            </div>
            <div style={{ fontSize: 12, color: "#999", lineHeight: 1.7, marginBottom: 10 }}>{item.desc}</div>
            {/* プレースホルダー */}
            <div style={{ width: "100%", aspectRatio: "16/6", background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>{item.placeholder}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ダウンロード・印刷 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>ダウンロード・印刷する</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {[
          { icon: "🖨", text: "PDFをダウンロードして、A4用紙に印刷するだけ。カラーでも白黒でも使えます。" },
          { icon: "✂️", text: "カード系教材は印刷後、ハサミで切り取ってご使用ください。" },
        ].map((item) => (
          <div key={item.text} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 10 }}>
            <div style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>

  </div>
)}
        {guideTab === "find" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 4 }}>教材の探し方</div>

    <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>

      {/* ① 学習内容から探す */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>01</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>学習内容から探す</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>トップページの学習内容アイコンをタップすると、教材一覧が開き該当の内容の教材が表示されます。</div>
            <div style={{ width: "100%", aspectRatio: "16/6", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>学習内容アイコン行の画像</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

      {/* ② 学習方法から探す */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>02</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>学習方法から探す</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>トップページの学習方法アイコンをタップすると、教材一覧が開き該当の方法の教材が表示されます。</div>
            <div style={{ width: "100%", aspectRatio: "16/6", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>学習方法アイコン行の画像</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

      {/* ③ 2つを組み合わせて絞り込む */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>03</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>2つを組み合わせて絞り込む</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 8 }}>教材一覧では左の縦タブ（内容）と上の横タブ（方法）を組み合わせて絞り込めます。</div>
            <div style={{ fontSize: 12, color: "#c9a0f0", fontWeight: 700, marginBottom: 16 }}>例：「ひらがな × ゲーム」→ ひらがなのゲーム教材だけ表示</div>
            <div style={{ width: "100%", aspectRatio: "16/7", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>教材一覧の縦タブ・横タブの画像</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

      {/* ④ キーワードで検索する */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>04</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>キーワードで検索する</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>教材一覧上部の検索バーにキーワードを入力すると、関連する教材が表示されます。</div>
            <div style={{ width: "100%", aspectRatio: "16/5", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>検索バーの画像</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

      {/* ⑤ 教材の詳細を確認する */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>05</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>教材の詳細を確認する</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>教材をタップするとプレビューと使い方が確認できます。気に入ったらそのままダウンロードできます。</div>
            <div style={{ width: "100%", aspectRatio: "16/9", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>教材詳細（ティザーモーダル）の画像</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
)}
       
        {guideTab === "more" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 4 }}>もっと活用したい</div>

    <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>

      {/* ① ダウンロード履歴 */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>📂</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>ダウンロード履歴を活用する</span>
        </div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>過去にダウンロードした教材はサイドバーの「ダウンロード履歴」からすぐ再ダウンロードできます。</div>
        <div style={{ width: "100%", aspectRatio: "16/6", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
          <span>🖼</span><span>サイドバーのダウンロード履歴の画像</span>
        </div>
      </div>

      {/* ② お気に入り */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>❤️</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>お気に入りリストを整理する</span>
        </div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>ハートボタンで保存した教材はサイドバーの「お気に入り」から確認できます。学習テーマや季節ごとにまとめておくと、授業・学習の計画が立てやすくなります。</div>
        <div style={{ width: "100%", aspectRatio: "16/6", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
          <span>🖼</span><span>お気に入り画面の画像</span>
        </div>
      </div>

      {/* ③ サブスク教材の確認 */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>🔖</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>サブスク教材を確認する</span>
        </div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>教材一覧では、使えるプランがタグで色分けして表示されています。自分のプランで使える教材がひと目でわかります。</div>
        <div style={{ width: "100%", aspectRatio: "16/7", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
          <span>🖼</span><span>教材一覧のタグ表示の画像</span>
        </div>
      </div>

      {/* ④ トップページのタブ */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>✨</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>トップページのタブを活用する</span>
        </div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 10 }}>ピックアップ・おすすめ・ランキング・新着の4つのタブから教材を探せます。ログインしていなくても、登録していなくても見られます。</div>
        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7, marginBottom: 14 }}>※ダウンロードは教材によって異なります。</div>
        <div style={{ width: "100%", aspectRatio: "16/7", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
          <span>🖼</span><span>トップページのタブの画像</span>
        </div>
      </div>

    </div>
  </div>
)}
{guideTab === "help" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 4 }}>使っていてわからないとき</div>

    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
      {[
        {
          q: "ダウンロードボタンが押せない",
          a: "サブスク教材の場合、対応するプランへの登録が必要です。教材のタグを確認してください。",
        },
        {
          q: "ログインできない",
          a: "パスワードをお忘れの場合はログイン画面の「パスワードを忘れた方」から再設定できます。",
        },
        {
          q: "お気に入りが保存されない",
          a: "お気に入り機能はログインが必要です。サイドバーからログインしてください。",
        },
        {
          q: "PDFが開けない・印刷できない",
          a: "PDFビューワー（Adobe Acrobatなど）をインストールしてお試しください。",
        },
        {
          q: "教材のリクエストをしたい",
          a: "画面右下のチャットボタンからリクエストを送ることができます。",
        },
      ].map((item) => (
        <div key={item.q} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#e49bfd", flexShrink: 0 }}>Q</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.7 }}>{item.q}</span>
          </div>
          <div style={{ padding: "14px 18px", background: "#fafafa", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#a3c0ff", flexShrink: 0 }}>A</span>
            <span style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>{item.a}</span>
          </div>
        </div>
      ))}
    </div>

    {/* 解決しない場合 */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(228,155,253,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 14, padding: "24px 28px", textAlign: "center" as const }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 6 }}>解決しませんでしたか？</div>
      <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16, lineHeight: 1.7 }}>お気軽にお問い合わせください。通常2〜3営業日以内にご返信します。</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        <button onClick={() => window.location.href = "/faq"} style={{ fontSize: 12, padding: "9px 24px", borderRadius: 20, border: "0.5px solid rgba(163,192,255,0.6)", background: "white", color: "#7a50b0", cursor: "pointer", fontWeight: 600 }}>よくある質問を見る</button>
        <button onClick={() => window.location.href = "/contact"} style={{ fontSize: 12, padding: "9px 24px", borderRadius: 20, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}>お問い合わせする →</button>
      </div>
    </div>

  </div>
)}
       
      </div>
    </div>
  );
}

const ACTIVE_COLOR = "#7a50b0";

type NavItem = {
  id: string;
  label: string;
  icon: (id: string, active: boolean) => React.ReactNode;
  badge?: number;
};


type ItemType = { 
  label: string; 
  char: string; 
  color: string; 
  imageSrc?: string | null;  // nullを追加
  isMore?: boolean; 
  contentId?: string; 
  methodId?: string; 
};

function IconItem({ item, onClick }: { item: ItemType; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0, width: 76 }}>
      <div style={{ width: 62, height: 62, borderRadius: "50%", background: item.isMore ? "white" : item.color, border: item.isMore ? "1.5px dashed #c9a0f0" : "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: item.isMore ? 20 : item.char.length > 1 ? 15 : 22, fontWeight: 700, color: item.isMore ? "#b090d0" : "#555", flexShrink: 0 }}>
        {item.imageSrc ? <img src={item.imageSrc} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : item.char}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#777", textAlign: "center", lineHeight: 1.3, width: "100%" }}>{item.label}</span>
    </div>
  );
}

function getCardStyle(mat: Material, locale: string = "ja") {
  const bgMap: Record<string, string> = {
    hiragana: "linear-gradient(135deg,#dbe8ff,#c8d8ff)",
    katakana: "linear-gradient(135deg,#ecdeff,#ddc8ff)",
    kanji:    "linear-gradient(135deg,#ffd9ee,#ffc8e4)",
    math:     "linear-gradient(135deg,#d6f5e5,#c0ecd4)",
    vocab:    "linear-gradient(135deg,#fff8e0,#ffedb0)",
    grammar:  "linear-gradient(135deg,#fff0ec,#ffd8d0)",
    picture:  "linear-gradient(135deg,#e8f8ff,#c8eeff)",
    song:     "linear-gradient(135deg,#edfff0,#c8f0d0)",
    daily:    "linear-gradient(135deg,#f8e8ff,#ecd0ff)",
    season:   "linear-gradient(135deg,#e8efff,#d0dcff)",
    number:   "linear-gradient(135deg,#f0e8ff,#d8c8ff)",
  };
  const charMap: Record<string, string> = {
    hiragana: "あ", katakana: "ア", kanji: "字", math: "＋",
    vocab: "語", grammar: "文", picture: "絵", song: "♪",
    daily: "日", season: "季", number: "数",
  };
  const charColorMap: Record<string, string> = {
    hiragana: "#4a72c4", katakana: "#8a5cc4", kanji: "#c44a88", math: "#3a8a5a",
    vocab: "#b08020", grammar: "#c05040", picture: "#4090c0", song: "#3a8a5a",
    daily: "#9040c0", season: "#4a72c4", number: "#7040c0",
  };
  const firstContent = mat.content?.[0] ?? "hiragana";
  const bg = mat.bg ?? bgMap[firstContent] ?? "linear-gradient(135deg,#e8efff,#d0dcff)";
  const char = mat.char ?? charMap[firstContent] ?? "✦";
  const charColor = mat.charColor ?? charColorMap[firstContent] ?? "#4a72c4";

  let tag = mat.tag ?? "無料";
  let tagBg = mat.tagBg ?? "#d6f5e5";
  let tagColor = mat.tagColor ?? "#2a6a44";
  if (!mat.tag) {
    if (mat.isPickup) { tag = "PICK"; tagBg = "#ecdeff"; tagColor = "#7040b0"; }
    else if (mat.isNew) { tag = "NEW"; tagBg = "#ffd9ee"; tagColor = "#a03070"; }
    else if (mat.requiredPlan === "free") { tag = locale === "ja" ? "無料" : "Free"; tagBg = "#d6f5e5"; tagColor = "#2a6a44"; }
    else { tag = locale === "ja" ? "サブスク" : "Subscribe"; tagBg = "#ecdeff"; tagColor = "#7040b0"; }
  }

  return { bg, char, charColor, tag, tagBg, tagColor };
}

function MaterialCard({
  mat, onClick, locale, isLoggedIn, favIds, onFavToggle,
}: {
  mat: Material;
  onClick: () => void;
  locale: string;
  isLoggedIn?: boolean;
  favIds?: string[];
  onFavToggle?: (mat: Material) => void;
}) {
  const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
  return (
    <div onClick={onClick} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer", position: "relative" }}>
      {isLoggedIn && onFavToggle && (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onFavToggle(mat); }}
            style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(200,180,230,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={favIds?.includes(mat.id) ? "#c9a0f0" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/>
            </svg>
          </button>
        </div>
      )}
      <div style={{ height: 135, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: charColor, fontWeight: 700 }}>{char}</div>
      <div style={{ padding: "10px 12px 14px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: tagBg, color: tagColor, display: "inline-block", marginBottom: 6 }}>{tag}</span>
        {(mat.level ?? []).length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
              {(mat.level ?? []).map((lv: string) => (
                <span key={lv} style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070" }}>{lv}</span>
              ))}
            </div>
          )}
        <div style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
      </div>
    </div>
  );
}

// ===== 教材一覧モーダル =====
function MaterialsModal({
  initContent, initMethod, onClose, isLoggedIn, materials, tmm, contentTabs, methodTabs, locale,
}: {
  initContent: string; 
  initMethod: string; 
  onClose: () => void; 
  isLoggedIn: boolean; 
  materials: Material[]; 
  tmm: (key: string) => string; 
  contentTabs: {id: string; label: string; char: string; color: string; imageSrc: string | null}[]; 
  methodTabs: {id: string; label: string; char: string; imageSrc: string | null}[];  // ← ここにimageSrcを追加
  locale: string;
}) {
  const [activeContent, setActiveContent] = useState(initContent);
  const [activeMethod, setActiveMethod] = useState(initMethod);
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [teaserFavTooltip, setTeaserFavTooltip] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id);
      if (data) setFavIds(data.map((d: { material_id: string }) => d.material_id));
    });
  }, [isLoggedIn]);

  const filtered = materials.filter((m) => {
  if (searchResults !== null) return searchResults.includes(m.id);
  const cMatch = activeContent === "all" || (m.content ?? []).includes(activeContent);
  const mMatch = activeMethod === "all" || (m.method ?? []).includes(activeMethod);
  return cMatch && mMatch;
});

  const handleMethodTabWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.scrollLeft += e.deltaY + e.deltaX;
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <style>{scrollbarStyle}</style>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, zIndex: 110, width: 40, height: 40, borderRadius: "50%", background: "white", border: "none", cursor: "pointer", fontSize: 18, color: "#888", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>✕</button>

      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", width: "91vw", maxWidth: 1600, height: "calc(100vh - 56px)", background: "white", borderRadius: 16, boxShadow: "0 8px 48px rgba(0,0,0,0.22)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "24px 28px 20px 28px", borderBottom: "0.5px solid rgba(0,0,0,0.06)", flexShrink: 0, gap: 28 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 2 }}>Materials</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#999", whiteSpace: "nowrap" }}>{tmm("title")}</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#f8f6ff", border: "1px solid rgba(163,192,255,0.4)", borderRadius: 28, padding: "12px 24px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
               type="text"
               placeholder={tmm("search_placeholder")}
               value={searchQuery}
               onChange={async (e) => {
                  const q = e.target.value;
                  setSearchQuery(q);
                  if (!q.trim()) { setSearchResults(null); return; }
                  setSearchLoading(true);
                  try {
                  const res = await fetch("/api/search", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ query: q }),
                      });
                  const data = await res.json();
                      setSearchResults((data.results ?? []).map((r: { id: string }) => r.id));
                      } catch { setSearchResults(null); }
                      finally { setSearchLoading(false); }
                      }}
                  style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, color: "#555", outline: "none" }}
             />
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div className="toolio-scroll-y" style={{ width: 180, flexShrink: 0, overflowY: "auto", padding: "16px 0 28px", borderRight: "0.5px solid rgba(0,0,0,0.06)" }}>
            {contentTabs.map((tab) => {
              const active = activeContent === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveContent(tab.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", margin: "0 8px", background: active ? "rgba(163,192,255,0.15)" : "transparent", border: "none", borderRadius: 10, cursor: "pointer", width: "calc(100% - 16px)", textAlign: "left" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: tab.id === "all" ? "linear-gradient(135deg,#f4b9b9,#a3c0ff)" : tab.color, border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 13, fontWeight: 700, color: "#555" }}>
                    {tab.imageSrc ? <img src={tab.imageSrc} alt={tab.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : tab.char}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#666", whiteSpace: "nowrap" }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 28px 0", background: "white", flexShrink: 0 }}>
              <div className="toolio-scroll-x" style={{ display: "flex", gap: 6, overflowX: "scroll", paddingBottom: 6 }} onWheel={handleMethodTabWheel}>
                {methodTabs.map((tab) => {
                 const active = activeMethod === tab.id;
                 return (<button key={tab.id} onClick={() => setActiveMethod(tab.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 5px", flexShrink: 0, background: active ? "rgba(163,192,255,0.18)" : "rgba(0,0,0,0.03)", border: active ? "1px solid rgba(163,192,255,0.5)" : "1px solid rgba(0,0,0,0.07)", borderRadius: 20, cursor: "pointer" }}>
                 <div style={{ width: 24, height: 24, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                  {tab.imageSrc? <img src={tab.imageSrc} alt={tab.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                   : <span>{tab.char}</span>
                  }
                 </div>
                 <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#888", whiteSpace: "nowrap" }}>{tab.label}</span>
                 </button>
                 );
                 })}
              </div>
              <div style={{ padding: "10px 0 14px", fontSize: 12, color: "#bbb" }}>
                {contentTabs.find(t => t.id === activeContent)?.label}
                {activeMethod !== "all" && ` × ${methodTabs.find(t => t.id === activeMethod)?.label}`}
                {` — ${filtered.length}件`}
              </div>
            </div>

            <div className="toolio-scroll-y" style={{ flex: 1, overflowY: "auto", padding: "4px 24px 40px" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb", fontSize: 15 }}>該当する教材がありません</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                  {filtered.map((mat) => {
                    const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
                    return (
                      <div key={mat.id} onClick={() => setTeaserMat(mat)} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer", position: "relative" }}>

                        {/* ✅ 教材カード右上：ログイン時のみハートを表示、未ログイン時は何も表示しない */}
                        {isLoggedIn && (
                          <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const supabase = createClient();
                                const { data: { session } } = await supabase.auth.getSession();
                                if (!session) return;
                                if (favIds.includes(mat.id)) {
                                  await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
                                  setFavIds((prev) => prev.filter((id) => id !== mat.id));
                                  window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
                                } else {
                                  await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
                                  setFavIds((prev) => [...prev, mat.id]);
                                  window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
                                }
                              }}
                              style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(200,180,230,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill={favIds.includes(mat.id) ? "#c9a0f0" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/>
                              </svg>
                            </button>
                          </div>
                        )}

                        <div style={{ height: 135, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: charColor, fontWeight: 700 }}>{char}</div>
                        <div style={{ padding: "10px 12px 14px" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: tagBg, color: tagColor, display: "inline-block", marginBottom: 6 }}>{tag}</span>
                          {(mat.level ?? []).length > 0 && (
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                              {(mat.level ?? []).map((lv: string) => (
                                <span key={lv} style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070" }}>{lv}</span>
                              ))}
                            </div>
                          )}
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ティザーモーダル */}
      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <div onClick={() => setTeaserMat(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 720, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden", position: "relative", maxHeight: "88vh" }}>
              <button onClick={() => setTeaserMat(null)} style={{ position: "absolute", top: 14, right: 14, zIndex: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.08)", border: "none", cursor: "pointer", fontSize: 14, color: "#666" }}>✕</button>

              {/* 左：プレビュー */}
              <div style={{ background: "#f5f0ff", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "3/4" }}>
                  <div style={{ width: "100%", height: "100%", background: bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, color: charColor, fontWeight: 700, userSelect: "none" }}>{char}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[0, 1].map((i) => (
                    <div key={i} style={{ aspectRatio: "1", background: bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: charColor, fontWeight: 700, userSelect: "none", opacity: 0.7 }}>{char}</div>
                  ))}
                </div>
              </div>

              {/* 右：情報 */}
              <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", gap: 8 }}>
                 <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: tagBg, color: tagColor }}>{tag}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                   {(teaserMat.level ?? []).map((lv: string) => (
                   <span key={lv} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070" }}>{lv}</span>
                   ))}
                </div>
             </div>
                
                <div style={{ fontSize: 20, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{teaserMat.title}</div>
                <div style={{ fontSize: 14, color: "#777", lineHeight: 1.7 }}>
                  {teaserMat.description || `楽しく学べる${contentTabs.find(t => t.id === (teaserMat.content?.[0] ?? ""))?.label}の教材です。印刷してすぐに使えます。`}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                   { label: tmm("age"), value: teaserMat.ageGroup || "－" },
                   { label: tmm("content"), value: (teaserMat.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・") || "－" },
                   { label: tmm("method"), value: (teaserMat.method ?? []).map(m => methodTabs.find(t => t.id === m)?.label).filter(Boolean).join("・") || "－" },
                  
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "#f7f7f7", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>{value}</div>
                    </div>
                  ))}
                </div>
                

                {/* ✅ ティザーモーダルのお気に入りボタン：未ログイン時は鍵＋吹き出し、ログイン時はハート */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!isLoggedIn) {
                        setTeaserFavTooltip(!teaserFavTooltip);
                        return;
                      }
                      const supabase = createClient();
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) return;
                      if (favIds.includes(teaserMat.id)) {
                        await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", teaserMat.id);
                        setFavIds((prev) => prev.filter((id) => id !== teaserMat.id));
                        window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: teaserMat.id, isFav: false } }));
                      } else {
                        await supabase.from("favorites").insert({ user_id: session.user.id, material_id: teaserMat.id });
                        setFavIds((prev) => [...prev, teaserMat.id]);
                        window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: teaserMat.id, isFav: true } }));
                      }
                    }}
                    style={{
                      width: "100%", padding: "11px", marginBottom: 10,
                      borderRadius: 10, border: "0.5px solid rgba(200,170,240,0.4)",
                      background: "white", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      fontSize: 13, fontWeight: 600,
                      color: isLoggedIn && favIds.includes(teaserMat.id) ? "#c9a0f0" : "#999",
                    }}
                  >
                    {!isLoggedIn ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="#bbb" />
                        <path d="M7 11V7a5 5 0 0110 0v4" stroke="#bbb" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={favIds.includes(teaserMat.id) ? "#c9a0f0" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/>
                      </svg>
                    )}
                    {!isLoggedIn ? tmm("add_fav") : favIds.includes(teaserMat.id) ? tmm("added_fav") : tmm("add_fav")}
                  </button>

                  {/* 吹き出し（未ログイン時） */}
                  {teaserFavTooltip && (
                    <>
                      <div onClick={(e) => { e.stopPropagation(); setTeaserFavTooltip(false); }} style={{ position: "fixed", inset: 0, zIndex: 249 }} />
                      <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 250, background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", padding: "14px 16px", width: 220, border: "0.5px solid rgba(200,170,240,0.25)" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5 }}>🔒 お気に入り機能</div>
                        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7, marginBottom: 12 }}>ログインするとお気に入りに保存できます。</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={(e) => { e.stopPropagation(); window.location.href = "/auth"; }} style={{ flex: 1, fontSize: 10, fontWeight: 700, padding: "6px 0", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>新規登録</button>
                          <button onClick={(e) => { e.stopPropagation(); window.location.href = "/auth?mode=login"; }} style={{ flex: 1, fontSize: 10, fontWeight: 600, padding: "6px 0", borderRadius: 7, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer" }}>ログイン</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ダウンロードボタン */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      if (teaserMat.requiredPlan === "free") {
                        window.open(`/materials/${teaserMat.id}`, "_blank");
                        setTeaserMat(null);
                      }
                    }}
                    style={{ width: "100%", padding: "13px", background: teaserMat.requiredPlan !== "free" ? "#f0eeff" : "#a3c0ff", color: teaserMat.requiredPlan !== "free" ? "#7F77DD" : "white", border: teaserMat.requiredPlan !== "free" ? "1px solid rgba(163,192,255,0.4)" : "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {teaserMat.requiredPlan !== "free" && <span style={{ fontSize: 16 }}>🔒</span>}
                    {teaserMat.requiredPlan !== "free" ? tmm("lock_download") : tmm("download")}
                  </button>
                  {teaserMat.requiredPlan !== "free" && (
                    <div style={{ marginTop: 10, background: "linear-gradient(135deg, rgba(244,185,185,0.08), rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.35)", borderRadius: 12, padding: "14px 16px", position: "relative" }}>
                      <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: 12, height: 6, overflow: "hidden" }}>
                        <div style={{ width: 8, height: 8, background: "white", border: "0.5px solid rgba(200,170,240,0.35)", transform: "rotate(45deg)", margin: "2px auto 0" }} />
                      </div>
                      <div style={{ fontSize: 12, color: "#7a50b0", fontWeight: 700, marginBottom: 6 }}>サブスクプランで使い放題 ✨</div>
                      {!isLoggedIn ? (
                        <>
                          <div style={{ fontSize: 11, color: "#999", lineHeight: 1.7, marginBottom: 12 }}>登録するとすべての教材がダウンロードし放題になります。</div>
                          <button onClick={(e) => { e.stopPropagation(); setTeaserMat(null); window.location.href = "/auth"; }} style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", marginBottom: 8 }}>無料で登録する</button>
                          <div style={{ textAlign: "center", fontSize: 11, color: "#bbb" }}>
                            すでにアカウントをお持ちの方は
                            <span onClick={(e) => { e.stopPropagation(); setTeaserMat(null); window.location.href = "/auth?mode=login"; }} style={{ color: "#9b6ed4", cursor: "pointer", marginLeft: 2 }}>ログイン</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 11, color: "#999", lineHeight: 1.7 }}>プランの詳細はこちらから確認できます。</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function FavoritesSection({ allMaterials, isLoggedIn, contentTabs, methodTabs, locale, tmm }: { allMaterials: Material[]; isLoggedIn: boolean; contentTabs: {id: string; label: string; char: string; color: string; imageSrc?: string | null}[]; methodTabs: {id: string; label: string; char: string}[];
  locale: string; 
　tmm: (key: string) => string;}) {
  const [favMaterials, setFavMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [teaserFavTooltip, setTeaserFavTooltip] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const { data } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id).order("created_at", { ascending: false });
      if (data) {
        const ids = data.map((d: { material_id: string }) => d.material_id);
        setFavIds(ids);
        setFavMaterials(allMaterials.filter((m) => ids.includes(m.id)));
      }
      setLoading(false);
    });
  }, [allMaterials]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { materialId, isFav } = (e as CustomEvent).detail;
      setFavIds(prev => isFav ? [...prev, materialId] : prev.filter(id => id !== materialId));
      setFavMaterials(prev => {
        if (isFav) {
          const mat = allMaterials.find(m => m.id === materialId);
          if (!mat || prev.some(m => m.id === materialId)) return prev;
          return [mat, ...prev];
        } else {
          return prev.filter(m => m.id !== materialId);
        }
      });
    };
    window.addEventListener("toolio:fav-change", handler);
    return () => window.removeEventListener("toolio:fav-change", handler);
  }, [allMaterials]);

  if (loading) return <p style={{ fontSize: 13, color: "#bbb" }}>読み込み中...</p>;
  if (favMaterials.length === 0) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>♡</div>
      <div style={{ fontSize: 14 }}>お気に入りはまだありません</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>教材のハートボタンで保存できます</div>
    </div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        {favMaterials.map((mat) => (
  <MaterialCard
    key={mat.id}
    mat={mat}
    onClick={() => setTeaserMat(mat)}
    locale={locale}
    isLoggedIn={isLoggedIn}
    favIds={favIds}
    onFavToggle={async (mat) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      if (favIds.includes(mat.id)) {
        await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
        setFavIds((prev) => prev.filter((id) => id !== mat.id));
        setFavMaterials((prev) => prev.filter((m) => m.id !== mat.id));
        window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
      } else {
        await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
        setFavIds((prev) => [...prev, mat.id]);
        window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
      }
    }}
  />
))}
      </div>
      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <div onClick={() => setTeaserMat(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 720, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden", position: "relative", maxHeight: "88vh" }}>
              <button onClick={() => setTeaserMat(null)} style={{ position: "absolute", top: 14, right: 14, zIndex: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.08)", border: "none", cursor: "pointer", fontSize: 14, color: "#666" }}>✕</button>
              <div style={{ background: "#f5f0ff", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "3/4" }}>
                  <div style={{ width: "100%", height: "100%", background: bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, color: charColor, fontWeight: 700, userSelect: "none" }}>{char}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[0, 1].map((i) => (
                    <div key={i} style={{ aspectRatio: "1", background: bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: charColor, fontWeight: 700, userSelect: "none", opacity: 0.7 }}>{char}</div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: tagBg, color: tagColor }}>{tag}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(teaserMat.level ?? []).map((lv: string) => (
                      <span key={lv} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070" }}>{lv}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{teaserMat.title}</div>
                <div style={{ fontSize: 14, color: "#777", lineHeight: 1.7 }}>
                  {teaserMat.description || `楽しく学べる${contentTabs.find(t => t.id === (teaserMat.content?.[0] ?? ""))?.label}の教材です。`}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: tmm("age"), value: teaserMat.ageGroup || "－" },
                    { label: tmm("content"), value: (teaserMat.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・") || "－" },
                    { label: tmm("method"), value: (teaserMat.method ?? []).map(m => methodTabs.find(t => t.id === m)?.label).filter(Boolean).join("・") || "－" },
                    
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "#f7f7f7", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>{value}</div>
                    </div>
                  ))}
                </div>
                
                <div style={{ height: 1, background: "#f0f0f0" }} />
                <div style={{ position: "relative" }}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!isLoggedIn) { setTeaserFavTooltip(!teaserFavTooltip); return; }
                      const supabase = createClient();
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) return;
                      if (favIds.includes(teaserMat.id)) {
                        await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", teaserMat.id);
                        setFavIds(prev => prev.filter(id => id !== teaserMat.id));
                        setFavMaterials(prev => prev.filter(m => m.id !== teaserMat.id));
                        window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: teaserMat.id, isFav: false } }));
                        setTeaserMat(null);
                      } else {
                        await supabase.from("favorites").insert({ user_id: session.user.id, material_id: teaserMat.id });
                        setFavIds(prev => [...prev, teaserMat.id]);
                        window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: teaserMat.id, isFav: true } }));
                      }
                    }}
                    style={{ width: "100%", padding: "11px", marginBottom: 10, borderRadius: 10, border: "0.5px solid rgba(200,170,240,0.4)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 600, color: isLoggedIn && favIds.includes(teaserMat.id) ? "#c9a0f0" : "#999" }}
                  >
                    {!isLoggedIn ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#bbb" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="#bbb" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={favIds.includes(teaserMat.id) ? "#c9a0f0" : "none"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/></svg>
                    )}
                    {!isLoggedIn ? tmm("add_fav") : favIds.includes(teaserMat.id) ? tmm("added_fav") : tmm("add_fav")}
                  </button>
                </div>
                <button
                  onClick={() => { window.open(`/materials/${teaserMat.id}`, "_blank"); setTeaserMat(null); }}
                  style={{ width: "100%", padding: "13px", background: "#a3c0ff", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
                >
                  この教材をダウンロードする
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

function DownloadHistorySection({ allMaterials, locale }: { allMaterials: Material[]; locale: string }) {
  const [historyMaterials, setHistoryMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const { data } = await supabase.from("download_history").select("material_id").eq("user_id", session.user.id).order("created_at", { ascending: false });
      if (data) {
        const ids = [...new Set(data.map((d: { material_id: string }) => d.material_id))];
        setHistoryMaterials(allMaterials.filter((m) => ids.includes(m.id)));
      }
      setLoading(false);
    });
  }, [allMaterials]);

  if (loading) return <p style={{ fontSize: 13, color: "#bbb" }}>読み込み中...</p>;
  if (historyMaterials.length === 0) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>↓</div>
      <div style={{ fontSize: 14 }}>ダウンロード履歴はまだありません</div>
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
      {historyMaterials.map((mat) => <MaterialCard key={mat.id} mat={mat}locale={locale} onClick={() => window.open(`/materials/${mat.id}`, "_blank")} />)}
    </div>
  );
}
function UserMenuPopup({
  userIconRef, userInitial, userName, onClose, onNavigate, onRouterPush, onLogout, sbOpen, tm,
}: {
  userIconRef: React.RefObject<HTMLDivElement | null>;
  sbOpen: boolean;
  userInitial: string;
  userName: string;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onRouterPush: (href: string) => void;
  onLogout: () => void;
  tm: (key: string) => string;
}) {
  const el = userIconRef.current;if (!el) return null;
  const rect = el.getBoundingClientRect();if (!rect) return null;
  const left = sbOpen ? 308 : 80;

  return (
    <div style={{
      position: "fixed",
      left: sbOpen ? 200 : 80,
      bottom: window.innerHeight - rect.bottom - 8,
      width: 240,
      background: "white",
      borderRadius: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
      border: "0.5px solid rgba(200,170,240,0.25)",
      zIndex: 50,
      overflow: "hidden",
    }}>
      <div style={{ padding: "16px 18px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>{userInitial}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{userName}</div>
          <div style={{ fontSize: 11, color: "#aaa" }}>{tm("free_plan")}</div>
        </div>
      </div>
      {[
        { icon: "👤", label: tm("profile"), page: "settings-profile" },
        { icon: "📋", label: tm("plan"), page: "plan" },
        { icon: "⭐", label: tm("points"), page: "pt" },
        { icon: "🧾", label: tm("billing"), page: "settings-billing" },
        { icon: "🔔", label: tm("notifications"), page: "settings-notifications" },
      ].map((item) => (
        <button key={item.label} onClick={() => {
         onNavigate(item.page);
         }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: 13, color: "#444", borderBottom: "0.5px solid rgba(200,170,240,0.1)" }}>
          <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
        </button>
      ))}
      <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: 13, color: "#e49bfd" }}>
        
        <span style={{ fontSize: 16 }}>🚪</span>{tm("logout")}
      </button>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');
  const th = useTranslations('home');
  const tm = useTranslations('mypage');
const tmm = useTranslations('materials_modal');
const pathname = usePathname();

const switchLanguage = () => {
  const nextLocale = locale === 'ja' ? 'en' : 'ja';
  const newPath = pathname.replace(`/${locale}`, '') || '/';
  router.push(`/${nextLocale}${newPath}`);
};
const navItems: NavItem[] = [
  { id: "home", label: t("home"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M9 22V12h6v10" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "materials", label: t("materials"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /><rect x="14" y="3" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /><rect x="3" y="14" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /><rect x="14" y="14" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "dl", label: t("dl"), badge: 3, icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M7 11l5 5 5-5" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M4 20h16" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "fav", label: t("fav"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "trouble", label: t("trouble"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "guide", label: t("guide"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={active ? ACTIVE_COLOR : "#bbb"} /><circle cx="12" cy="17" r="0.8" fill={active ? ACTIVE_COLOR : "#bbb"} strokeWidth="0" /></svg>) },
];
  const cl = contentTabLabels[locale] ?? contentTabLabels.ja;
  const ml = methodTabLabels[locale] ?? methodTabLabels.ja;

  const contentTabs = [
  { id: "all",      label: cl.all,      char: "✦", color: "#e8efff", imageSrc: "/all.png" },
  { id: "hiragana", label: cl.hiragana, char: "あ", color: "#e8efff", imageSrc: "/hiragana.png" },
  { id: "katakana", label: cl.katakana, char: "ア", color: "#f0e8ff", imageSrc: "/katakana.png" },
  { id: "kanji",    label: cl.kanji,    char: "字", color: "#ffe8f4", imageSrc: "/kanji.png" },
  { id: "vocab",    label: cl.vocab,    char: "語", color: "#fff8e0", imageSrc: "/vocab.png" },
  { id: "joshi",    label: cl.joshi,    char: "は", color: "#fff0ec", imageSrc: "/joshi.png" },
  { id: "bunkei",   label: cl.bunkei,   char: "文", color: "#f0ffe8", imageSrc: "/bunkei.png" },
  { id: "aisatsu",  label: cl.aisatsu,  char: "👋", color: "#e8f8ff", imageSrc: "/aisatsu.png" },
  { id: "kaiwa",    label: cl.kaiwa,    char: "話", color: "#f8e8ff", imageSrc: "/kaiwa.png" },
  { id: "season",   label: cl.season,   char: "季", color: "#e8efff", imageSrc: "/season.png" },
  { id: "food",     label: cl.food,     char: "🍎", color: "#fff0e8", imageSrc: "/food.png" },
  { id: "animal",   label: cl.animal,   char: "🐾", color: "#e8f8ee", imageSrc: "/animal.png" },
  { id: "body",     label: cl.body,     char: "💪", color: "#ffe8f4", imageSrc: "/body.png" },
  { id: "color",    label: cl.color,    char: "🔵", color: "#f0e8ff", imageSrc: "/color.png" },
  { id: "number",   label: cl.number,   char: "数", color: "#e8f8ff", imageSrc: "/number.png" },
];

const methodTabs: { id: string; label: string; char: string; imageSrc: string | null }[] = [
  { id: "all",      label: ml.all,      char: "✦", imageSrc: "/all.png" },
  { id: "drill",    label: ml.drill,    char: "✏", imageSrc: "/method_drill.png" },
  { id: "test",     label: ml.test,     char: "✓", imageSrc: "/method_test.png" },
  { id: "card",     label: ml.card,     char: "🃏", imageSrc: "/method_card.png" },
  { id: "karuta",   label: ml.karuta,   char: "札", imageSrc: null },
  { id: "game",     label: ml.game,     char: "▶", imageSrc: null },
  { id: "nurie",    label: ml.nurie,    char: "◎", imageSrc: null },
  { id: "reading",  label: ml.reading,  char: "本", imageSrc: "/method_reading.png" },
  { id: "music",    label: ml.music,    char: "♪", imageSrc: null },
  { id: "roleplay", label: ml.roleplay, char: "🎭", imageSrc: "/method_roleplay.png" },
];

  const contentItems = [
  { label: cl.hiragana, char: "あ", color: "#e8efff", imageSrc: "/hiragana.png", contentId: "hiragana" },
  { label: cl.katakana, char: "ア", color: "#f0e8ff", imageSrc: "/katakana.png", contentId: "katakana" },
  { label: cl.kanji,    char: "字", color: "#ffe8f4", imageSrc: "/kanji.png",    contentId: "kanji" },
  { label: cl.vocab,    char: "語", color: "#fff8e0", imageSrc: "/vocab.png",    contentId: "vocab" },
  { label: cl.joshi,    char: "は", color: "#fff0ec", imageSrc: "/joshi.png",    contentId: "joshi" },
  { label: cl.bunkei,   char: "文", color: "#f0ffe8", imageSrc: "/bunkei.png",   contentId: "bunkei" },
  { label: cl.aisatsu,  char: "👋", color: "#e8f8ff", imageSrc: "/aisatsu.png",  contentId: "aisatsu" },
  { label: cl.kaiwa,    char: "話", color: "#f8e8ff", imageSrc: "/kaiwa.png",    contentId: "kaiwa" },
  { label: cl.season,   char: "季", color: "#e8efff", imageSrc: "/season.png",   contentId: "season" },
  { label: cl.food,     char: "🍎", color: "#fff0e8", imageSrc: "/food.png",     contentId: "food" },
  { label: cl.animal,   char: "🐾", color: "#e8f8ee", imageSrc: "/animal.png",   contentId: "animal" },
  { label: cl.body,     char: "💪", color: "#ffe8f4", imageSrc: "/body.png",     contentId: "body" },
  { label: cl.color,    char: "🔵", color: "#f0e8ff", imageSrc: "/color.png",    contentId: "color" },
  { label: cl.number,   char: "数", color: "#e8f8ff", imageSrc: "/number.png",   contentId: "number" },
  { label: locale === "ja" ? "もっと見る" : "More", char: "›", color: "#f8f4ff", isMore: true, contentId: "all" },
];

const methodItems = [
  { label: ml.drill,    char: "✏", color: "#e8efff", imageSrc: "/method_drill.png",   methodId: "drill" },
  { label: ml.test,     char: "✓", color: "#f0e8ff", imageSrc: "/method_test.png",    methodId: "test" },
  { label: ml.card,     char: "🃏", color: "#ffe8f4", imageSrc: "/method_card.png",    methodId: "card" },
  { label: ml.karuta,   char: "札", color: "#fff8e0", imageSrc: null,                  methodId: "karuta" },
  { label: ml.game,     char: "▶", color: "#e8f8ee", imageSrc: null,                  methodId: "game" },
  { label: ml.nurie,    char: "◎", color: "#fff0ec", imageSrc: null,                  methodId: "nurie" },
  { label: ml.reading,  char: "本", color: "#e8f8ff", imageSrc: "/method_reading.png", methodId: "reading" },
  { label: ml.music,    char: "♪", color: "#edfff0", imageSrc: null,                  methodId: "music" },
  { label: ml.roleplay, char: "🎭", color: "#f8e8ff", imageSrc: "/method_roleplay.png",methodId: "roleplay" },
  { label: locale === "ja" ? "もっと見る" : "More", char: "›", color: "#f8f4ff", isMore: true, methodId: "all" },
];

  const [sbOpen, setSbOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [activeTab, setActiveTab] = useState("pickup");
  const [modal, setModal] = useState<{ content: string; method: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("？");
  const [userName, setUserName] = useState("ゲスト");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; date: string }[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [topTeaserMat, setTopTeaserMat] = useState<Material | null>(null);
  const [topTeaserFavTooltip, setTopTeaserFavTooltip] = useState(false);
  const [topFavIds, setTopFavIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<Record<string, any>>({ full_name: "", country: "", city: "", purpose: [], occupation: "", student_level: "", occupation_other: "", purpose_other: "", notif_new_material: true, notif_favorite: false, notif_billing: true, notif_announcement: false });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const userIconRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/materials")
      .then((res) => res.json())
      .then((data) => { setMaterials(Array.isArray(data) ? data : []); setMaterialsLoading(false); })
      .catch(() => setMaterialsLoading(false));
  }, []);

  useEffect(() => {
  fetch("/api/announcements")
    .then((res) => res.json())
    .then((data) => setAnnouncements(Array.isArray(data) ? data : []));
}, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session) {
      const { data: favData } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id);
      if (favData) setTopFavIds(favData.map((d: { material_id: string }) => d.material_id));
      }
      if (session?.user?.email) {
        setUserInitial(session.user.email[0].toUpperCase());
        setUserName(session.user.user_metadata?.full_name || session.user.email.split("@")[0]);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            country: profileData.country || "",
            city: profileData.city || "",
            purpose: profileData.purpose || [],
            occupation: profileData.occupation || "",
            student_level: profileData.student_level || "",
            occupation_other: profileData.occupation_other || "",
            purpose_other: profileData.purpose_other || "",
            notif_new_material: profileData.notif_new_material ?? true,
            notif_favorite: profileData.notif_favorite ?? false,
            notif_billing: profileData.notif_billing ?? true,
            notif_announcement: profileData.notif_announcement ?? false,
            plan: profileData.plan || "free",
          });
          if (profileData.full_name) setUserName(profileData.full_name);
        }
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user?.email) {
        setUserInitial(session.user.email[0].toUpperCase());
        setUserName(session.user.user_metadata?.full_name || session.user.email.split("@")[0]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const openModal = (content = "all", method = "all") => setModal({ content, method });
  const closeModal = () => setModal(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    const container = document.getElementById("main-scroll");
    if (el && container) container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  const SB_CLOSED = 72;
  const SB_OPEN = 300;
  const navSections = [
  { section: t("main"),   items: navItems.slice(0, 2) },
  { section: t("mypage"), items: navItems.slice(2, 4) },
  { section: t("service"), items: navItems.slice(4) },
];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8f4f4", overflow: "hidden", position: "relative" }}>
      <aside style={{ width: sbOpen ? SB_OPEN : SB_CLOSED, transition: "width 0.22s ease", background: "transparent", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "visible", zIndex: 10 }}>
        <div style={{ flexShrink: 0 }}>
          {sbOpen ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
              <img src="/toolio_logo.png" alt="toolio" style={{ height: 52, width: "auto", objectFit: "contain", display: "block" }} />
              <button onClick={() => setSbOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#aaa", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>‹</button>
            </div>
          ) : (
            <button onClick={() => setSbOpen(true)} style={{ width: "100%", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#aaa" strokeWidth="2"><path d="M6 3l5 5-5 5" /></svg>
            </button>
          )}
        </div>
        <div style={{ flex: 1, padding: "8px 0", overflow: "hidden" }}>
          {navSections.map(({ section, items }) => (
            <div key={section}>
              {sbOpen && <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#c0a0a0", padding: "8px 18px 3px", whiteSpace: "nowrap" }}>{section}</div>}
              {items.map((item) => (
                <div key={item.id} onClick={() => {if (item.id === "materials") { openModal("all", "all")} else {setActivePage(item.id);}}} style={{ display: "flex", alignItems: "center", gap: 12, padding: sbOpen ? "9px 14px" : "9px 0", justifyContent: sbOpen ? "flex-start" : "center", cursor: "pointer", borderRadius: 10, margin: sbOpen ? "1px 8px" : "1px 4px", whiteSpace: "nowrap", background: "transparent" }}>
                  <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 10, background: activePage === item.id ? "rgba(163,192,255,0.15)" : "transparent", transition: "background 0.15s" }}>
                    {item.icon(item.id, activePage === item.id)}
                  </div>
                  {sbOpen && (
                    <>
                      <span style={{ fontSize: 13, fontWeight: 600, color: activePage === item.id ? "#7040b0" : "#666" }}>{item.label}</span>
                      {item.badge && <span style={{ marginLeft: "auto", fontSize: 10, background: "#ffe8f4", color: "#b0427a", padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>{item.badge}</span>}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 6px", flexShrink: 0, position: "relative" }}>
  {userMenuOpen && isLoggedIn && (
  <>
    <div onClick={() => setUserMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
    <UserMenuPopup
      userIconRef={userIconRef}
      userInitial={userInitial}
      userName={userName}
      onClose={() => setUserMenuOpen(false)}
      onNavigate={(page) => { setUserMenuOpen(false); setActivePage(page); }}
      onRouterPush={(href) => { setUserMenuOpen(false); router.push(href); }}
      onLogout={async () => {
        setUserMenuOpen(false);
        const supabase = createClient();
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        router.refresh();
      }}
      sbOpen={sbOpen}
      tm={tm} 
    />
  </>
)}
  <div ref={userIconRef} onClick={() => { if (!isLoggedIn) { router.push("/auth?mode=login"); } else { setUserMenuOpen(!userMenuOpen); } }} style={{ display: "flex", alignItems: "center", gap: 8, padding: sbOpen ? "6px 10px" : "6px 0", justifyContent: sbOpen ? "flex-start" : "center", borderRadius: 10, cursor: "pointer", background: userMenuOpen ? "rgba(163,192,255,0.1)" : "transparent" }}>
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0 }}>{userInitial}</div>
    {sbOpen && <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: "#555", whiteSpace: "nowrap" }}>{isLoggedIn ? userName : "ゲスト"}</div><div style={{ fontSize: 11, color: "#999" }}>{isLoggedIn ? "Freeプラン" : "未登録"}</div></div>}
    {sbOpen && isLoggedIn && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>}
  </div>
  <div style={{ display: "flex", justifyContent: sbOpen ? "stretch" : "center", marginTop: 4 }}>
    <button onClick={switchLanguage}style={{ fontSize: sbOpen ? 11 : 14, padding: sbOpen ? "5px 10px" : "5px 6px", width: sbOpen ? "100%" : "auto", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 8, background: "rgba(255,255,255,0.4)", color: "#888", cursor: "pointer" }}>
      {sbOpen ? (locale === 'ja' ? "🌐 日本語 / EN" : "🌐 EN / 日本語") : "🌐"}
    </button>
  </div>
  {sbOpen && (
  <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "10px 0 4px", flexWrap: "wrap" }}>
    <Link href="/terms" style={{ fontSize: 11, color: "#ccc", textDecoration: "none" }}>利用規約</Link>
    <span style={{ fontSize: 11, color: "#ddd" }}>|</span>
    <Link href="/privacy" style={{ fontSize: 11, color: "#ccc", textDecoration: "none" }}>プライバシー</Link>
    <span style={{ fontSize: 11, color: "#ddd" }}>|</span>
    <Link href="/tokushoho" style={{ fontSize: 11, color: "#ccc", textDecoration: "none" }}>特商法</Link>
  </div>
)}
<div style={{ textAlign: "center", padding: "2px 0 8px", fontSize: 11, color: "#ccc" }}>
  © 2026 toolio
</div>
</div>
      </aside>

      <main id="main-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0, background: "white", borderRadius: "16px 16px 0 0", margin: "12px 12px 0 0", boxShadow: "0 -4px 24px rgba(200,150,150,0.15)" }}>
        {activePage === "home" && (
          <>
            <section style={{ padding: "120px 48px 60px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 10%, rgba(255,255,255,1) 28%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
              <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.55)", textTransform: "uppercase", marginBottom: 18 }}>{th("hero_sub")}</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.55, marginBottom: 16, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "var(--font-libre)" }}>{th("hero_title")}</h1>
              <p style={{ fontSize: 16, color: "#999", marginBottom: 64, lineHeight: 1.9 }}>{th("hero_desc1")}<br />{th("hero_desc2")}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                <button onClick={() => scrollTo("anchor-content")} style={{ fontSize: 15, padding: "14px 32px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white" }}>{th("browse_content")}</button>
                <button onClick={() => scrollTo("anchor-method")} style={{ fontSize: 15, padding: "14px 32px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", color: "white" }}>{th("browse_method")}</button>
              </div>
              <div style={{ fontSize: 11, color: "#ccc", marginBottom: 12, letterSpacing: 2 }}>or</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                <button onClick={() => openModal("all", "all")} style={{ fontSize: 15, padding: "14px 48px", borderRadius: 28, border: "1px solid rgba(163,192,255,0.5)", cursor: "pointer", fontWeight: 700, background: "white", color: "#7a50b0" }}>{th("view_all")}</button>
              </div>
              {!isLoggedIn && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 24, background: "linear-gradient(135deg,rgba(244,185,185,0.12),rgba(228,155,253,0.12))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 14, padding: "14px 40px" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#b090d0", marginBottom: 3 }}>会員登録すると全機能が使えます</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#7a50b0" }}>無料でアカウント作成 →</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => router.push("/auth?mode=login")} style={{ fontSize: 12, padding: "7px 28px", borderRadius: 20, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>ログイン</button>
                    <button onClick={() => router.push("/auth")} style={{ fontSize: 12, padding: "7px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>新規登録</button>
                  </div>
                </div>
              )}
            </section>

            <section id="anchor-content" suppressHydrationWarning style={{ padding: "80px 0 72px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", background: "white", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#a3c0ff)", flexShrink: 0 }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", fontFamily: "var(--font-libre)" }}>Browse by Content</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>{th("browse_content_label")}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 16, flexWrap: "wrap", padding: "0 32px" }}>
                {contentItems.map((item) => <IconItem key={item.label} item={item} onClick={() => openModal(item.contentId ?? "all", "all")} />)}
              </div>
            </section>

            <section id="anchor-method" suppressHydrationWarning style={{ padding: "80px 0 72px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", background: "white", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
               å<div style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#a3c0ff)", flexShrink: 0 }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", fontFamily: "var(--font-libre)" }}>Browse by Method</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>{th("browse_method_label")}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 16, flexWrap: "wrap", padding: "0 32px" }}>
                {methodItems.map((item) => <IconItem key={item.label} item={item} onClick={() => openModal("all", item.methodId ?? "all")} />)}
              </div>
            </section>

            <section style={{ padding: "64px 36px 80px", flex: 1, background: "white" }}>
              <div style={{ background: "#fafafa", border: "0.5px solid #eee", borderRadius: 12, padding: "18px 22px", marginBottom: 30 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f4b9b9" }} />{th("notice")}
                </div>
                {announcements.length === 0 ? (
                 <div style={{ fontSize: 13, color: "#bbb" }}>お知らせはありません</div>
                 ) : announcements.map((n) => (
                 <div key={n.id} style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                   <span style={{ fontSize: 13, color: "#bbb", minWidth: 88, flexShrink: 0 }}>{n.date}</span>
                   <span style={{ fontSize: 13, color: "#444" }}>{n.title}</span>
                 </div>
                ))}
              </div>
              <div style={{ display: "flex", borderBottom: "0.5px solid #eee", marginBottom: 24, marginTop: 48 }}>
                {[
                { key: "pickup", label: th("pickup") },
                { key: "recommended", label: th("recommended") },
                { key: "ranking", label: th("ranking") },
                { key: "new", label: th("new") },
                ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{ fontSize: 14, padding: "10px 20px", background: "transparent", border: "none", borderBottom: activeTab === key ? "2px solid #9b6ed4" : "2px solid transparent", color: activeTab === key ? "#9b6ed4" : "#bbb", cursor: "pointer", fontWeight: 600, marginBottom: -0.5 }}>
                {label}{key === "new" && <span style={{ fontSize: 10, fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", padding: "2px 6px", borderRadius: 8, marginLeft: 4 }}>NEW</span>}
              </button>
                ))}
                  
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
  {materialsLoading ? (
    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#bbb", fontSize: 14 }}>読み込み中...</div>
  ) : materials
    .filter((mat) => {
      if (activeTab === "pickup") return mat.isPickup === true;
      if (activeTab === "recommended") return mat.isRecommended === true;
      if (activeTab === "ranking") return mat.ranking !== null;
      if (activeTab === "new") return mat.isNew === true;
      return true;
    })
    .sort((a, b) => {
      if (activeTab === "ranking") return (a.ranking ?? 999) - (b.ranking ?? 999);
      return 0;
    })
    .slice(0, 8)
    .length === 0 ? (
      <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#bbb", fontSize: 14 }}>該当する教材がありません</div>
    ) : (
      materials
        .filter((mat) => {
          if (activeTab === "pickup") return mat.isPickup === true;
          if (activeTab === "recommended") return mat.isRecommended === true;
          if (activeTab === "ranking") return mat.ranking !== null;
          if (activeTab === "new") return mat.isNew === true;
          return true;
        })
        .sort((a, b) => {
          if (activeTab === "ranking") return (a.ranking ?? 999) - (b.ranking ?? 999);
          return 0;
        })
        .slice(0, 8)
        .map((mat) => {
          const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
          return (
            <div key={mat.id} onClick={() => setTopTeaserMat(mat)} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer", position: "relative" }}>
              {isLoggedIn && (
  <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
    <button
      onClick={async (e) => {
        e.stopPropagation();
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        if (topFavIds.includes(mat.id)) {
          await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
          setTopFavIds((prev) => prev.filter((id) => id !== mat.id));
          window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
        } else {
          await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
          setTopFavIds((prev) => [...prev, mat.id]);
          window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
        }
      }}
      style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(200,180,230,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={topFavIds.includes(mat.id) ? "#c9a0f0" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/>
      </svg>
    </button>
  </div>
)}
<div style={{ height: 180, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: charColor, fontWeight: 700 }}>{char}</div>
              <div style={{ padding: "16px 18px 22px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 8, background: tagBg, color: tagColor, display: "inline-block", marginBottom: 10 }}>{tag}</span>
                {(mat.level ?? []).length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                    {(mat.level ?? []).map((lv: string) => (
                      <span key={lv} style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070" }}>{lv}</span>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 15, fontWeight: 700, color: "#333", lineHeight: 1.4, marginBottom: 8 }}>{mat.title}</div>
                <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>{mat.description}</div>
              </div>
            </div>
          );
        })
    )}
</div>
            </section>
          </>
        )}

        {activePage !== "home" && (
          activePage === "guide" ? (
            <GuideSection />

            ) : activePage === "trouble" ? (
    <TroubleSection onOpenModal={() => setModal({ content: "all", method: "all" })} />

  ) : activePage === "settings-profile" ? (
    <div>
      <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 8 }}>My Account</p>
        <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{tm("profile_title")}</h2>
      </div>
      <div style={{ padding: "32px 48px 56px", display: "flex", flexDirection: "column" as const, gap: 20, maxWidth: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "white", flexShrink: 0 }}>{userInitial}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>{userName}</div>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 10 }}>{tm("free_plan")}</div>
            <button style={{ fontSize: 11, padding: "5px 14px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>{tm("change_photo")}</button>
          </div>
        </div>
        {[
          { label: tm("name"), value: profile.full_name || userName },
          { label: tm("student_level"), value: profile.student_level || tm("not_registered") },
        ].map((field) => (
          <div key={field.label} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{field.label}</div>
              {editingField === field.label ? (
                <input
                  autoFocus
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  style={{ fontSize: 14, fontWeight: 600, color: "#333", border: "0.5px solid rgba(200,170,240,0.5)", borderRadius: 8, padding: "6px 10px", width: "100%", outline: "none" }}
                />
              ) : (
                <div style={{ fontSize: 14, fontWeight: 600, color: field.value === "未設定" ? "#ccc" : "#333" }}>{field.value}</div>
              )}
            </div>
            {editingField === field.label ? (
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;
                    const fieldMap: Record<string, string> = {
                      "名前": "full_name",
                      "居住地": "country",
                      "職業": "occupation",
                      "利用目的": "purpose",
                      "指導している児童のレベル": "student_level",
                    };
                    const col = fieldMap[field.label];
                    if (!col) return;
                    const isArray = col === "purpose";
                    const value = isArray ? editingValue.split("・").map(s => s.trim()).filter(Boolean) : editingValue;
                    await supabase.from("profiles").upsert({ id: session.user.id, [col]: value });
                    setProfile((prev) => ({ ...prev, [col]: value as any }));
                    if (col === "full_name") setUserName(editingValue);
                    setEditingField(null);
                  }}
                  style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}
                >{tm("save")}</button>
                <button
                  onClick={() => setEditingField(null)}
                  style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}
                >{tm("cancel")}</button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingField(field.label); setEditingValue(field.value === "未設定" ? "" : field.value); }}
                style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}
              >編集</button>
            )}
          </div>
        ))}

        {/* 居住地 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 12 }}>{tm("residence")}</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "#bbb", marginBottom: 6 }}>{tm("country")}</div>
              <select
                value={profile.country || ""}
                onChange={async (e) => {
                  const val = e.target.value;
                  setProfile((prev: any) => ({ ...prev, country: val, city: "" }));
                  const supabase = createClient();
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  await supabase.from("profiles").upsert({ id: session.user.id, country: val, city: "" });
                }}
                style={{ width: "100%", fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", color: "#555", background: "white" }}
              >
                <option value="">{tm("select_country")}</option>
                {["日本", "オーストラリア", "アメリカ", "カナダ", "イギリス", "ニュージーランド", "シンガポール", "マレーシア", "台湾", "韓国", "中国", "タイ", "フランス", "ドイツ", "その他"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {profile.country && (
              <div>
                <div style={{ fontSize: 11, color: "#bbb", marginBottom: 6 }}>{tm("city")}</div>
                <input
                  placeholder={tm("enter_city")}
                  value={profile.city || ""}
                  onChange={(e) => setProfile((prev: any) => ({ ...prev, city: e.target.value }))}
                  onBlur={async () => {
                    const supabase = createClient();
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;
                    await supabase.from("profiles").upsert({ id: session.user.id, city: profile.city });
                  }}
                  style={{ width: "100%", fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", color: "#555" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 職業 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 12 }}>{tm("occupation")}</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {[tm("occ_teacher"), tm("occ_parent"), tm("occ_school"), tm("occ_school_owner"), tm("occ_other")].map((opt) => (
              <div key={opt} onClick={async () => {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                await supabase.from("profiles").upsert({ id: session.user.id, occupation: opt });
                setProfile((prev) => ({ ...prev, occupation: opt }));
              }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${profile.occupation === opt ? "#e49bfd" : "#ddd"}`, background: profile.occupation === opt ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "white", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {profile.occupation === opt && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                </div>
                <span style={{ fontSize: 13, color: profile.occupation === opt ? "#7a50b0" : "#555", fontWeight: profile.occupation === opt ? 700 : 400 }}>{opt}</span>
                
              </div>
            ))}
            {profile.occupation === "その他" && (
              <input
                placeholder="職業を入力してください"
                value={profile.occupation_other || ""}
                onChange={(e) => setProfile((prev: any) => ({ ...prev, occupation_other: e.target.value }))}
                onBlur={async () => {
                  const supabase = createClient();
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  await supabase.from("profiles").upsert({ id: session.user.id, occupation_other: profile.occupation_other });
                }}
                style={{ marginTop: 8, fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", width: "100%" }}
              />
            )}
          </div>
        </div>

        {/* 利用目的 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 12 }}>{tm("purpose")}</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {[tm("purpose_lesson"), tm("purpose_home"), tm("purpose_research"), tm("purpose_other")].map((opt) => {
              const checked = profile.purpose?.includes(opt);
              return (
                <div key={opt} onClick={async () => {
                  const supabase = createClient();
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  const newPurpose = checked
                    ? profile.purpose.filter((p: string) => p !== opt)
                    : [...(profile.purpose || []), opt];
                  await supabase.from("profiles").upsert({ id: session.user.id, purpose: newPurpose });
                  setProfile((prev) => ({ ...prev, purpose: newPurpose }));
                }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? "#e49bfd" : "#ddd"}`, background: checked ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "white", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </div>
                  <span style={{ fontSize: 13, color: checked ? "#7a50b0" : "#555", fontWeight: checked ? 700 : 400 }}>{opt}</span>
                </div>
              );
            })}
            {profile.purpose?.includes("その他") && (
              <input
                placeholder="利用目的を入力してください"
                value={profile.purpose_other || ""}
                onChange={(e) => setProfile((prev: any) => ({ ...prev, purpose_other: e.target.value }))}
                onBlur={async () => {
                  const supabase = createClient();
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  await supabase.from("profiles").upsert({ id: session.user.id, purpose_other: profile.purpose_other });
                }}
                style={{ marginTop: 8, fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", width: "100%" }}
              />
            )}
          </div>
        </div>
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>パスワード</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>••••••••</div>
          </div>
          <button style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>変更</button>
        </div>
        <div style={{ paddingTop: 8, borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
          <button style={{ fontSize: 12, border: "none", background: "transparent", cursor: "pointer", color: "#ccc" }}>アカウントを削除する</button>
        </div>
      </div>
    </div>

  ) : activePage === "settings-billing" ? (
    <div>
      <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 8 }}>Billing</p>
        <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>支払い履歴</h2>
      </div>
      <div style={{ padding: "32px 48px 56px", maxWidth: 640 }}>
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "16px 24px", borderBottom: "0.5px solid rgba(200,170,240,0.1)", display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr", fontSize: 11, color: "#bbb", fontWeight: 700 }}>
            <span>日付</span><span>内容</span><span>金額</span><span>ステータス</span>
          </div>
          <div style={{ padding: "56px 0", textAlign: "center" as const, color: "#bbb", fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🧾</div>
            支払い履歴はまだありません
          </div>
        </div>
        <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 6 }}>現在のプラン</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#7a50b0" }}>
                {profile.plan === "light" ? "Lightプラン" : profile.plan === "standard" ? "Standardプラン" : profile.plan === "premium" ? "Premiumプラン" : "Freeプラン"}
              </div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                {profile.plan === "light" ? "¥980 / 月" : profile.plan === "standard" ? "¥1,980 / 月" : profile.plan === "premium" ? "¥3,980 / 月" : "無料"}
              </div>
            </div>
            <button onClick={() => setActivePage("plan")} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>プランを変更する →</button>
          </div>
        </div>
      </div>
    </div>

  ) : activePage === "settings-notifications" ? (
    <div>
      <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 8 }}>Notifications</p>
        <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>通知設定</h2>
      </div>
      <div style={{ padding: "32px 48px 56px", display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 600 }}>
        {[
          { label: tm("notif_new_material_label"), desc: tm("notif_new_material_desc"), col: "notif_new_material" },
          { label: tm("notif_favorite_label"), desc: tm("notif_favorite_desc"), col: "notif_favorite" },
          { label: tm("notif_billing_label"), desc: tm("notif_billing_desc"), col: "notif_billing" },
          { label: tm("notif_announcement_label"), desc: tm("notif_announcement_desc"), col: "notif_announcement" },
        ].map((item) => {
          const on = !!profile[item.col];
          return (
            <div key={item.label} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
              <div onClick={async () => {
                const newVal = !on;
                setProfile((prev: any) => ({ ...prev, [item.col]: newVal }));
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                await supabase.from("profiles").upsert({ id: session.user.id, [item.col]: newVal });
              }} style={{ flexShrink: 0, width: 44, height: 24, borderRadius: 12, background: on ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "#e8e8e8", position: "relative" as const, cursor: "pointer", transition: "background 0.2s" }}>
                <div style={{ position: "absolute" as const, top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", transition: "left 0.15s" }} />
              </div>
            </div>
          );
        })}
        <p style={{ fontSize: 12, color: "#ccc", marginTop: 8 }}>{tm("notif_note")}</p>
      </div>
    </div>

  ) : activePage === "pt" ? (
    <div>
      <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 8 }}>Points</p>
        <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ポイント</h2>
      </div>
      <div style={{ padding: "32px 48px 56px", maxWidth: 600 }}>
        <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.15),rgba(228,155,253,0.15),rgba(163,192,255,0.15))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 16, padding: "32px", textAlign: "center" as const, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#c9a0f0", fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>現在のポイント</div>
          <div style={{ fontSize: 56, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>0</div>
          <div style={{ fontSize: 13, color: "#aaa", marginTop: 6 }}>pt</div>
        </div>
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "16px 24px", borderBottom: "0.5px solid rgba(200,170,240,0.1)", fontSize: 13, fontWeight: 700, color: "#555" }}>ポイント履歴</div>
          <div style={{ padding: "48px 0", textAlign: "center" as const, color: "#bbb", fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⭐</div>
            ポイント履歴はまだありません
          </div>
        </div>
        <div style={{ background: "#f8f6ff", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7a50b0", marginBottom: 8 }}>ポイントについて</div>
          <div style={{ fontSize: 12, color: "#888", lineHeight: 1.9 }}>
            ・教材をダウンロードするとポイントが貯まります<br />
            ・貯まったポイントはサブスクプランの割引に使えます<br />
            ・ポイントの有効期限は取得から1年間です
          </div>
        </div>
      </div>
    </div>

  ) : (
    <div>
          
          
              <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>
                  {navItems.find(n => n.id === activePage)?.label}
                </h2>
              </div>
              <div style={{ padding: "32px 48px 56px" }}>
                {activePage === "plan" ? (
                  <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 16, padding: "28px 36px", background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(228,155,253,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 16 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#333" }}>もっとわくわくする教材を使いませんか</div>
                    <div style={{ fontSize: 13, color: "#999", lineHeight: 1.8 }}>サブスクプランに登録すると<br />全教材・体系的カリキュラムが使い放題になります</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <button onClick={() => router.push("/plan")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>プランを見る →</button>
                    </div>
                  </div>
                ) : !isLoggedIn ? (
                  <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 16, padding: "28px 36px", background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(228,155,253,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 16 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#333" }}>この機能を使うには登録が必要です</div>
                    <div style={{ fontSize: 13, color: "#999", lineHeight: 1.8 }}>無料アカウントを作成すると<br />お気に入り保存・ダウンロード履歴などが使えます</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <button onClick={() => router.push("/auth")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>無料で登録する →</button>
                      <button onClick={() => router.push("/auth?mode=login")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>ログイン</button>
                    </div>
                  </div>
                ) : activePage === "fav" ? (
                  <FavoritesSection allMaterials={materials} isLoggedIn={isLoggedIn} contentTabs={contentTabs} methodTabs={methodTabs} locale={locale} tmm={tmm} />
                ) : activePage === "dl" ? (
                  <DownloadHistorySection allMaterials={materials} locale={locale} />
                ) : (
                  <p style={{ fontSize: 15, color: "#bbb" }}>このページは準備中です。</p>
                )}
              </div>
            </div>
          )
        )}
      </main>

      {topTeaserMat && (() => {
  const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(topTeaserMat, locale);
  return (
    <div onClick={() => setTopTeaserMat(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 720, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden", position: "relative", maxHeight: "88vh" }}>
        <button onClick={() => setTopTeaserMat(null)} style={{ position: "absolute", top: 14, right: 14, zIndex: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.08)", border: "none", cursor: "pointer", fontSize: 14, color: "#666" }}>✕</button>
        <div style={{ background: "#f5f0ff", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "3/4" }}>
            <div style={{ width: "100%", height: "100%", background: bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, color: charColor, fontWeight: 700, userSelect: "none" }}>{char}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ aspectRatio: "1", background: bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: charColor, fontWeight: 700, userSelect: "none", opacity: 0.7 }}>{char}</div>
            ))}
          </div>
        </div>
        <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: tagBg, color: tagColor }}>{tag}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(topTeaserMat.level ?? []).map((lv: string) => (
                <span key={lv} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070" }}>{lv}</span>
              ))}
            </div>
          </div>
          
          <div style={{ fontSize: 20, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{topTeaserMat.title}</div>
          <div style={{ fontSize: 14, color: "#777", lineHeight: 1.7 }}>{topTeaserMat.description}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: tmm("age"), value: topTeaserMat.ageGroup || "－" },
              { label: tmm("content"), value: (topTeaserMat.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・") || "－" },
              { label: tmm("method"), value: (topTeaserMat.method ?? []).map(m => methodTabs.find(t => t.id === m)?.label).filter(Boolean).join("・") || "－" },
            
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#f7f7f7", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>{value}</div>
              </div>
            ))}
          </div>
            
          <div style={{ height: 1, background: "#f0f0f0" }} />
          <div style={{ position: "relative" }}>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!isLoggedIn) { setTopTeaserFavTooltip(!topTeaserFavTooltip); return; }
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                if (topFavIds.includes(topTeaserMat.id)) {
                  await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", topTeaserMat.id);
                  setTopFavIds((prev) => prev.filter((id) => id !== topTeaserMat.id));
                } else {
                  await supabase.from("favorites").insert({ user_id: session.user.id, material_id: topTeaserMat.id });
                  setTopFavIds((prev) => [...prev, topTeaserMat.id]);
                }
              }}
              style={{ width: "100%", padding: "11px", marginBottom: 10, borderRadius: 10, border: "0.5px solid rgba(200,170,240,0.4)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 600, color: isLoggedIn && topFavIds.includes(topTeaserMat.id) ? "#c9a0f0" : "#999" }}
            >
              {!isLoggedIn ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#bbb" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="#bbb" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={topFavIds.includes(topTeaserMat.id) ? "#c9a0f0" : "none"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/></svg>
              )}
              {!isLoggedIn ? tmm("add_fav") : topFavIds.includes(topTeaserMat.id) ? tmm("added_fav") : tmm("add_fav")}
            </button>
            {topTeaserFavTooltip && (
              <>
                <div onClick={() => setTopTeaserFavTooltip(false)} style={{ position: "fixed", inset: 0, zIndex: 249 }} />
                <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 250, background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", padding: "14px 16px", width: 220, border: "0.5px solid rgba(200,170,240,0.25)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5 }}>🔒 お気に入り機能</div>
                  <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7, marginBottom: 12 }}>ログインするとお気に入りに保存できます。</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { setTopTeaserMat(null); window.location.href = "/auth"; }} style={{ flex: 1, fontSize: 10, fontWeight: 700, padding: "6px 0", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>新規登録</button>
                    <button onClick={() => { setTopTeaserMat(null); window.location.href = "/auth?mode=login"; }} style={{ flex: 1, fontSize: 10, fontWeight: 600, padding: "6px 0", borderRadius: 7, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer" }}>ログイン</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => {
              if (topTeaserMat.requiredPlan === "free") {
                window.open(`/materials/${topTeaserMat.id}`, "_blank");
                setTopTeaserMat(null);
              }
            }}
            style={{ width: "100%", padding: "13px", background: topTeaserMat.requiredPlan !== "free" ? "#f0eeff" : "#a3c0ff", color: topTeaserMat.requiredPlan !== "free" ? "#7F77DD" : "white", border: topTeaserMat.requiredPlan !== "free" ? "1px solid rgba(163,192,255,0.4)" : "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {topTeaserMat.requiredPlan !== "free" && <span style={{ fontSize: 16 }}>🔒</span>}
            {topTeaserMat.requiredPlan !== "free" ? tmm("lock_download") : tmm("download")}
          </button>
          {topTeaserMat.requiredPlan !== "free" && (
            <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.35)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, color: "#7a50b0", fontWeight: 700, marginBottom: 6 }}>サブスクプランで使い放題 ✨</div>
              {!isLoggedIn ? (
                <>
                  <div style={{ fontSize: 11, color: "#999", lineHeight: 1.7, marginBottom: 12 }}>登録するとすべての教材がダウンロードし放題になります。</div>
                  <button onClick={() => { setTopTeaserMat(null); window.location.href = "/auth"; }} style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", marginBottom: 8 }}>無料で登録する</button>
                  <div style={{ textAlign: "center", fontSize: 11, color: "#bbb" }}>
                    すでにアカウントをお持ちの方は
                    <span onClick={() => { setTopTeaserMat(null); window.location.href = "/auth?mode=login"; }} style={{ color: "#9b6ed4", cursor: "pointer", marginLeft: 2 }}>ログイン</span>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: "#999", lineHeight: 1.7 }}>プランの詳細はこちらから確認できます。</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
})()}

      {modal && (
        <MaterialsModal
          initContent={modal.content}
          initMethod={modal.method}
          onClose={closeModal}
          isLoggedIn={isLoggedIn}
          materials={materials}
          tmm={tmm}
          contentTabs={contentTabs}
          methodTabs={methodTabs}
          locale={locale}
        />
      )}
    </div>
  );
}