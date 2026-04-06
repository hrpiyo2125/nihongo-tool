"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";

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

const contentTabs = [
  { id: "all",        label: "すべて",     char: "✦", color: "#e8efff", imageSrc: null },
  { id: "hiragana",   label: "ひらがな",   char: "あ", color: "#e8efff", imageSrc: "/hiragana.png" },
  { id: "katakana",   label: "カタカナ",   char: "ア", color: "#f0e8ff", imageSrc: "/katakana.png" },
  { id: "kanji",      label: "漢字",       char: "字", color: "#ffe8f4", imageSrc: "/kanji.png" },
  { id: "vocab",      label: "語彙",       char: "語", color: "#fff8e0", imageSrc: null },
  { id: "joshi",      label: "助詞",       char: "は", color: "#fff0ec", imageSrc: null },
  { id: "bunkei",     label: "文型",       char: "文", color: "#f0ffe8", imageSrc: null },
  { id: "aisatsu",    label: "あいさつ",   char: "👋", color: "#e8f8ff", imageSrc: null },
  { id: "kaiwa",      label: "場面会話",   char: "話", color: "#f8e8ff", imageSrc: null },
  { id: "season",     label: "季節・行事", char: "季", color: "#e8efff", imageSrc: null },
  { id: "food",       label: "食べ物",     char: "🍎", color: "#fff0e8", imageSrc: null },
  { id: "animal",     label: "動物",       char: "🐾", color: "#e8f8ee", imageSrc: null },
  { id: "body",       label: "体・健康",   char: "💪", color: "#ffe8f4", imageSrc: null },
  { id: "color",      label: "色・形",     char: "🔵", color: "#f0e8ff", imageSrc: null },
  { id: "number",     label: "数・算数",   char: "数", color: "#e8f8ff", imageSrc: null },
];

const methodTabs = [
  { id: "all",        label: "すべて",     char: "✦" },
  { id: "drill",      label: "ドリル",     char: "✏" },
  { id: "test",       label: "テスト",     char: "✓" },
  { id: "card",       label: "カード",     char: "🃏" },
  { id: "karuta",     label: "かるた",     char: "札" },
  { id: "game",       label: "ゲーム",     char: "▶" },
  { id: "nurie",      label: "ぬりえ",     char: "◎" },
  { id: "reading",    label: "読み物",     char: "本" },
  { id: "music",      label: "うた",       char: "♪" },
  { id: "roleplay",   label: "ロールプレイ", char: "🎭" },
];

type Material = {
  id: string;
  title: string;
  description: string;
  level: string;
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

const contentItems = [
  { label: "ひらがな",   char: "あ", color: "#e8efff", imageSrc: "/hiragana.png", contentId: "hiragana" },
  { label: "カタカナ",   char: "ア", color: "#f0e8ff", imageSrc: "/katakana.png",  contentId: "katakana" },
  { label: "漢字",       char: "字", color: "#ffe8f4", imageSrc: "/kanji.png",     contentId: "kanji" },
  { label: "語彙",       char: "語", color: "#fff8e0", contentId: "vocab" },
  { label: "助詞",       char: "は", color: "#fff0ec", contentId: "joshi" },
  { label: "文型",       char: "文", color: "#f0ffe8", contentId: "bunkei" },
  { label: "あいさつ",   char: "👋", color: "#e8f8ff", contentId: "aisatsu" },
  { label: "場面会話",   char: "話", color: "#f8e8ff", contentId: "kaiwa" },
  { label: "季節・行事", char: "季", color: "#e8efff", contentId: "season" },
  { label: "食べ物",     char: "🍎", color: "#fff0e8", contentId: "food" },
  { label: "動物",       char: "🐾", color: "#e8f8ee", contentId: "animal" },
  { label: "体・健康",   char: "💪", color: "#ffe8f4", contentId: "body" },
  { label: "色・形",     char: "🔵", color: "#f0e8ff", contentId: "color" },
  { label: "数・算数",   char: "数", color: "#e8f8ff", contentId: "number" },
  { label: "もっと見る", char: "›",  color: "#f8f4ff", isMore: true, contentId: "all" },
];

const methodItems = [
  { label: "ドリル",       char: "✏", color: "#e8efff", methodId: "drill" },
  { label: "テスト",       char: "✓", color: "#f0e8ff", methodId: "test" },
  { label: "カード",       char: "🃏", color: "#ffe8f4", methodId: "card" },
  { label: "かるた",       char: "札", color: "#fff8e0", methodId: "karuta" },
  { label: "ゲーム",       char: "▶", color: "#e8f8ee", methodId: "game" },
  { label: "ぬりえ",       char: "◎", color: "#fff0ec", methodId: "nurie" },
  { label: "読み物",       char: "本", color: "#e8f8ff", methodId: "reading" },
  { label: "うた",         char: "♪", color: "#edfff0", methodId: "music" },
  { label: "ロールプレイ", char: "🎭", color: "#f8e8ff", methodId: "roleplay" },
  { label: "もっと見る",   char: "›",  color: "#f8f4ff", isMore: true, methodId: "all" },
];

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
  { id: "start",    label: "何から始める？" },
  { id: "level",    label: "レベルがわからない" },
  { id: "material", label: "どの教材を使えばいい？" },
  { id: "teach",    label: "どう教えればいい？" },
  { id: "motivation", label: "やる気を出さない" },
  { id: "bored",    label: "子どもが飽きてしまう" },
  { id: "improve",  label: "できるようにならない" },
  { id: "goal",     label: "何を目標にすればいい？" },
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
    {/* ブロック1：指導の全体像 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>指導の全体像</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { icon: "👀", title: "子どもを観察する", desc: "ニーズ・育った環境・これまでの学習歴を理解する" },
          { icon: "📊", title: "レベルを知る", desc: "その子の今の日本語力を把握する" },
          { icon: "🎯", title: "指導方針を決める", desc: "この3つが揃って初めて「何を・どう教えるか」が決まる" },
          { icon: "📚", title: "教材を使って指導する", desc: "子どもの様子を見ながら、教材を駆使して進める" },
          { icon: "✨", title: "「もっと！」を引き出す", desc: "もっとやりたいという気持ちが、次への意欲につながる" },
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
      <div style={{ marginTop: 14, background: "rgba(244,185,185,0.1)", border: "0.5px solid rgba(244,185,185,0.4)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#888", lineHeight: 1.8 }}>
        ⚠️ この順番を飛ばすと…「習得しない」「飽きてしまう」「続かない」につながり、日本語が嫌いになってしまうことも。
      </div>
    </div>

    {/* ブロック2：レベルを知ることの大切さ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>なぜレベルを知ることが大切なの？</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { icon: "🌍", label: "環境を知る", desc: "どんな場所で日本語に触れているか" },
          { icon: "📖", label: "歴史を知る", desc: "これまでどんな学習をしてきたか" },
          { icon: "📊", label: "レベルを知る", desc: "今どのくらい日本語ができるか" },
        ].map((item) => (
          <div key={item.label} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 12, padding: "16px 14px", textAlign: "center" as const }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: "#999", lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: "#888", lineHeight: 1.8, padding: "12px 16px", background: "#f8f6ff", borderRadius: 10 }}>
        この3つの中で、特に<span style={{ fontWeight: 700, color: "#7a50b0" }}>「レベルを知る」</span>ことが一番難しいと感じる方が多いです。次のタブで詳しく解説します。
      </div>
      <button onClick={() => setTab("level")} style={{ marginTop: 12, fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        レベルの確認方法を見る →
      </button>
    </div>

    {/* ブロック3：楽しむことが大切 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>すべての段階で「楽しむ」ことが鍵</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { phase: "知る段階", icon: "🔍", text: "子どものことをよく知れた！という喜びが生まれる" },
          { phase: "準備の段階", icon: "📝", text: "「自分だったら何が楽しいか」を考えることが楽しくなる" },
          { phase: "指導の段階", icon: "🌟", text: "「できた！」の経験が、子どもも自分もうれしくさせる" },
        ].map((item) => (
          <div key={item.phase} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 16px", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 10 }}>
            <div style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: "#c9a0f0", fontWeight: 700, marginBottom: 2 }}>{item.phase}</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{item.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#666", lineHeight: 1.8 }}>
        楽しむことで、<span style={{ fontWeight: 700, color: "#7a50b0" }}>続けられる・大切な要素を引き出せる・「もっと！」につながる</span>という好循環が生まれます。
      </div>
    </div>
  </div>
)}
        {tab === "level" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：言語習得の基本の流れ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>言語習得の基本の流れ</div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" as const, padding: "4px 0" }}>
        {[
          { icon: "👂", label: "聞く" },
          { icon: "🗣", label: "話す" },
          { icon: "📖", label: "読む" },
          { icon: "✏️", label: "書く" },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8, padding: "16px 20px", background: "white", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 12 }}>
              <div style={{ fontSize: 28 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{item.label}</div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ fontSize: 20, color: "#ddd", padding: "0 8px" }}>→</div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: "#888", lineHeight: 1.8, padding: "12px 16px", background: "#f8f6ff", borderRadius: 10 }}>
        これは基本の流れです。継承語の子どもはこの通りにはいかないことも多いです。まず「どこができて、どこがまだかな？」を確認するところから始めましょう。
      </div>
    </div>

    {/* ブロック2：簡易チェックリスト（内容は後から追加） */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 8 }}>簡易チェックリスト</div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16 }}>やさしい日本語で話しかけながら確認してみましょう。</div>
      <div style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "24px", fontSize: 13, color: "#bbb", textAlign: "center" as const }}>
        チェックリストを準備中です。
      </div>
      <button style={{ marginTop: 12, fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "0.5px solid rgba(163,192,255,0.5)", background: "white", color: "#7a50b0", cursor: "pointer" }}>
        📄 チェックリストをダウンロード（準備中）
      </button>
    </div>

    {/* ブロック3：レベルがわかったら */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>レベルがわかったら、好きな教材を選んでOK</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>toolioの教材はレベルで縛っていません。同じ教材でも使い方次第でどのレベルにも使えます。各教材ページの「使い方」タブに具体的な活用例を載せています。</div>
      <button onClick={() => setTab("material")} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
      詳しい教材の選び方はこちら →
      </button>
    </div>

    {/* ブロック4：DLAへの一言 */}
    <div style={{ fontSize: 12, color: "#bbb", lineHeight: 1.8, padding: "12px 16px", background: "#fafafa", borderRadius: 10 }}>
      💡 より正確なレベル判定をしたい場合は、<span style={{ fontWeight: 700 }}>DLA（Developmental Language Assessment）</span>という専門ツールがあります。学校や専門機関に相談してみてください。
    </div>

  </div>
)}
        {tab === "material" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：教材内容の大まかな目安 */}
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#888", marginBottom: 8 }}>参考：よく使われる順番</div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16 }}>あくまで目安です。この通りでなくて大丈夫です。</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
         { step: "STEP 1", color: "#d6f5e5", textColor: "#2a6a44", items: ["ひらがな", "あいさつ", "身近な語彙", "かんたんな場面会話"] },
         { step: "STEP 2", color: "#e8efff", textColor: "#3a5a9a", items: ["カタカナ", "季節・行事", "文型（〜です・〜ます）"] },
         { step: "STEP 3", color: "#ffe8f4", textColor: "#a03070", items: ["漢字", "助詞", "複雑な文型", "読み物"] },
        ].map((level) => (
          <div key={level.step} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ flexShrink: 0, background: level.color, color: level.textColor, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" as const, marginTop: 2 }}>{level.step}</div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>{level.items.join("・")}</div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック2：一番大切なのは子どもの興味 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>でも、一番大切なのは「子どもの興味」</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "🚗", title: "好きなものから", desc: "車が好き→乗り物の語彙、動物が好き→動物の教材など、興味のあるテーマから入ると吸収が早い" },
          { icon: "🍂", title: "季節・生活に合わせて", desc: "今の季節の教材、日常生活で使う言葉など、子どもの生活に近いものが定着しやすい" },
          { icon: "✨", title: "「やってみたい！」を大切に", desc: "目安の順番より、子どもがやりたいと思える教材を選ぶことが続けるための一番の近道" },
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

    {/* ブロック3：教材一覧へ誘導 */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>まずは気になった教材を試してみましょう</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>各教材ページの「使い方」タブに、レベル別・場面別の活用例を載せています。参考にしながら、自由に使ってみてください。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>

  </div>
)}
        {tab === "teach" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：授業の流れ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>指導の流れ</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { icon: "🔄", title: "復習する", desc: "前回の内容を軽く確認。負担をかけず、さらっと" },
          { icon: "💬", title: "コミュニケーションから入る", desc: "いきなり本題ではなく、会話から少しずつその話題へ" },
          { icon: "🌱", title: "簡単なものから導入する", desc: "カタカナをやりたければ、まずひらがなから。小さな成功体験を積む" },
          { icon: "🎉", title: "楽しい活動で学ぶ", desc: "ゲーム・かるた・うたなど、楽しみながら内容に触れる" },
          { icon: "✏️", title: "反復練習する", desc: "ドリル・テストなどで定着を確認。楽しい活動の後に行うと効果的" },
          { icon: "⭐", title: "「できた！」で終わる", desc: "最後はゲームや会話で同じ内容を。「できるようになったね」で締めくくる" },
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

    {/* ブロック2：心がけること */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>心がけること</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {[
          { icon: "👀", text: "疲れたサインを見逃さない" },
          { icon: "🤍", text: "できなくても責めない。「怒られないようにやる」ではなく「やりたいからやる」を大切に" },
          { icon: "🔍", text: "できなかったときは原因を観察する。わからなくてもいい、徐々に理解していく" },
          { icon: "🌟", text: "できた部分を認めて、ほめる。できない部分には必ず原因がある" },
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
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>各教材ページに、場面別・Can-do別の活用例を載せています</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>「使い方」タブを参考に、今日のゴールを決めるヒントにしてみてください。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
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

const navItems: NavItem[] = [
  { id: "home", label: "ホーム", icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M9 22V12h6v10" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "dl", label: "ダウンロード履歴", badge: 3, icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M7 11l5 5 5-5" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M4 20h16" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "fav", label: "お気に入り", icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "pt", label: "ポイント", icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "plan", label: "プランを見る", icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M8 12h8M8 8h8M8 16h5" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "trouble", label: "お悩み解決", icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "guide", label: "使い方ガイド", icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={active ? ACTIVE_COLOR : "#bbb"} /><circle cx="12" cy="17" r="0.8" fill={active ? ACTIVE_COLOR : "#bbb"} strokeWidth="0" /></svg>) },
];

type ItemType = { label: string; char: string; color: string; imageSrc?: string; isMore?: boolean; contentId?: string; methodId?: string; };

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

function getCardStyle(mat: Material) {
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
    else if (mat.requiredPlan === "free") { tag = "無料"; tagBg = "#d6f5e5"; tagColor = "#2a6a44"; }
    else { tag = "サブスク"; tagBg = "#ecdeff"; tagColor = "#7040b0"; }
  }

  return { bg, char, charColor, tag, tagBg, tagColor };
}

function MaterialCard({ mat, onClick }: { mat: Material; onClick: () => void }) {
  const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat);
  return (
    <div onClick={onClick} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer" }}>
      <div style={{ height: 135, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: charColor, fontWeight: 700 }}>{char}</div>
      <div style={{ padding: "10px 12px 14px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: tagBg, color: tagColor, display: "inline-block", marginBottom: 6 }}>{tag}</span>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
      </div>
    </div>
  );
}

// ===== 教材一覧モーダル =====
function MaterialsModal({
  initContent, initMethod, onClose, isLoggedIn, materials,
}: {
  initContent: string; initMethod: string; onClose: () => void; isLoggedIn: boolean; materials: Material[];
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
            <div style={{ fontSize: 26, fontWeight: 700, color: "#999", whiteSpace: "nowrap" }}>教材を探す</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#f8f6ff", border: "1px solid rgba(163,192,255,0.4)", borderRadius: 28, padding: "12px 24px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
               type="text"
               placeholder="教材を検索..."
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
                  return (
                    <button key={tab.id} onClick={() => setActiveMethod(tab.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", flexShrink: 0, background: active ? "rgba(163,192,255,0.18)" : "rgba(0,0,0,0.03)", border: active ? "1px solid rgba(163,192,255,0.5)" : "1px solid rgba(0,0,0,0.07)", borderRadius: 20, cursor: "pointer" }}>
                      <span style={{ fontSize: 12 }}>{tab.char}</span>
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
                    const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat);
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
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat);
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
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: tagBg, color: tagColor }}>{tag}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{teaserMat.title}</div>
                <div style={{ fontSize: 14, color: "#777", lineHeight: 1.7 }}>
                  {teaserMat.description || `楽しく学べる${contentTabs.find(t => t.id === (teaserMat.content?.[0] ?? ""))?.label}の教材です。印刷してすぐに使えます。`}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "対象年齢", value: teaserMat.ageGroup || "－" },
                    { label: "学習内容", value: (teaserMat.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・") || "－" },
                    { label: "学習方法", value: (teaserMat.method ?? []).map(m => methodTabs.find(t => t.id === m)?.label).filter(Boolean).join("・") || "－" },
                    { label: "レベル", value: teaserMat.level || "－" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "#f7f7f7", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height: 1, background: "#f0f0f0" }} />

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
                    {!isLoggedIn ? "お気に入りに追加" : favIds.includes(teaserMat.id) ? "お気に入りに追加済み" : "お気に入りに追加"}
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
                    {teaserMat.requiredPlan !== "free" ? "ダウンロード" : "この教材をダウンロードする"}
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

function FavoritesSection({ allMaterials, isLoggedIn }: { allMaterials: Material[]; isLoggedIn: boolean }) {
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
        {favMaterials.map((mat) => <MaterialCard key={mat.id} mat={mat} onClick={() => setTeaserMat(mat)} />)}
      </div>
      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat);
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
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: tagBg, color: tagColor }}>{tag}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{teaserMat.title}</div>
                <div style={{ fontSize: 14, color: "#777", lineHeight: 1.7 }}>
                  {teaserMat.description || `楽しく学べる${contentTabs.find(t => t.id === (teaserMat.content?.[0] ?? ""))?.label}の教材です。`}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "対象年齢", value: teaserMat.ageGroup || "－" },
                    { label: "学習内容", value: (teaserMat.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・") || "－" },
                    { label: "学習方法", value: (teaserMat.method ?? []).map(m => methodTabs.find(t => t.id === m)?.label).filter(Boolean).join("・") || "－" },
                    { label: "レベル", value: teaserMat.level || "－" },
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
                    {!isLoggedIn ? "お気に入りに追加" : favIds.includes(teaserMat.id) ? "お気に入りに追加済み" : "お気に入りに追加"}
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

function DownloadHistorySection({ allMaterials }: { allMaterials: Material[] }) {
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
      {historyMaterials.map((mat) => <MaterialCard key={mat.id} mat={mat} onClick={() => window.open(`/materials/${mat.id}`, "_blank")} />)}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [sbOpen, setSbOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [activeTab, setActiveTab] = useState("ピックアップ");
  const [modal, setModal] = useState<{ content: string; method: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("？");
  const [userName, setUserName] = useState("ゲスト");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/materials")
      .then((res) => res.json())
      .then((data) => { setMaterials(Array.isArray(data) ? data : []); setMaterialsLoading(false); })
      .catch(() => setMaterialsLoading(false));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user?.email) {
        setUserInitial(session.user.email[0].toUpperCase());
        setUserName(session.user.user_metadata?.full_name || session.user.email.split("@")[0]);
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
    { section: "メイン",     items: navItems.slice(0, 1) },
    { section: "マイページ", items: navItems.slice(1, 4) },
    { section: "サービス",   items: navItems.slice(4) },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8f4f4", overflow: "hidden", position: "relative" }}>
      <aside style={{ width: sbOpen ? SB_OPEN : SB_CLOSED, transition: "width 0.22s ease", background: "transparent", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden", zIndex: 10 }}>
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
                <div key={item.id} onClick={() => setActivePage(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: sbOpen ? "9px 14px" : "9px 0", justifyContent: sbOpen ? "flex-start" : "center", cursor: "pointer", borderRadius: 10, margin: sbOpen ? "1px 8px" : "1px 4px", whiteSpace: "nowrap", background: "transparent" }}>
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
        <div style={{ padding: "10px 6px", flexShrink: 0 }}>
          <div onClick={() => { if (!isLoggedIn) router.push("/auth?mode=login"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: sbOpen ? "6px 10px" : "6px 0", justifyContent: sbOpen ? "flex-start" : "center", borderRadius: 10, cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0 }}>{userInitial}</div>
            {sbOpen && <div><div style={{ fontSize: 13, fontWeight: 700, color: "#555", whiteSpace: "nowrap" }}>{isLoggedIn ? userName : "ゲスト"}</div><div style={{ fontSize: 11, color: "#999" }}>{isLoggedIn ? "Freeプラン" : "未登録"}</div></div>}
            {isLoggedIn && sbOpen && (
              <button onClick={async () => { const supabase = createClient(); await supabase.auth.signOut(); setIsLoggedIn(false); router.refresh(); }} style={{ width: "100%", fontSize: 11, padding: "6px 10px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.4)", background: "transparent", color: "#c0a0c0", cursor: "pointer", marginTop: 4 }}>
                ログアウト
              </button>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: sbOpen ? "stretch" : "center", marginTop: 4 }}>
            <button style={{ fontSize: sbOpen ? 11 : 14, padding: sbOpen ? "5px 10px" : "5px 6px", width: sbOpen ? "100%" : "auto", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 8, background: "rgba(255,255,255,0.4)", color: "#888", cursor: "pointer" }}>
              {sbOpen ? "🌐 日本語 / EN" : "🌐"}
            </button>
          </div>
        </div>
      </aside>

      <main id="main-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0, background: "white", borderRadius: "16px 16px 0 0", margin: "12px 12px 0 0", boxShadow: "0 -4px 24px rgba(200,150,150,0.15)" }}>
        {activePage === "home" && (
          <>
            <section style={{ padding: "120px 48px 60px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 10%, rgba(255,255,255,1) 28%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
              <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.55)", textTransform: "uppercase", marginBottom: 18 }}>Japanese Language Tools for Heritage Learners</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.55, marginBottom: 16, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>にほんごの勉強が、もっとたのしくなる。</h1>
              <p style={{ fontSize: 16, color: "#999", marginBottom: 64, lineHeight: 1.9 }}>日本語を学ぶ子供を支える方のための日本語学習ツールサイト。<br />学校でも・ご家庭でもすぐに使えるツールを提供しています。</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                <button onClick={() => scrollTo("anchor-content")} style={{ fontSize: 15, padding: "14px 32px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white" }}>学習内容から探す</button>
                <button onClick={() => scrollTo("anchor-method")} style={{ fontSize: 15, padding: "14px 32px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", color: "white" }}>学習方法から探す</button>
              </div>
              <div style={{ fontSize: 11, color: "#ccc", marginBottom: 12, letterSpacing: 2 }}>or</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                <button onClick={() => openModal("all", "all")} style={{ fontSize: 15, padding: "14px 48px", borderRadius: 28, border: "1px solid rgba(163,192,255,0.5)", cursor: "pointer", fontWeight: 700, background: "white", color: "#7a50b0" }}>✦ 教材一覧を見る</button>
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

            <section id="anchor-content" style={{ padding: "80px 0 72px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", background: "white", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#a3c0ff)", flexShrink: 0 }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb" }}>Browse by Content</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#333" }}>学習内容から探す</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 16, flexWrap: "wrap", padding: "0 32px" }}>
                {contentItems.map((item) => <IconItem key={item.label} item={item} onClick={() => openModal(item.contentId ?? "all", "all")} />)}
              </div>
            </section>

            <section id="anchor-method" style={{ padding: "80px 0 72px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", background: "white", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
               å<div style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#a3c0ff)", flexShrink: 0 }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb" }}>Browse by Method</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#333" }}>学習方法から探す</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 16, flexWrap: "wrap", padding: "0 32px" }}>
                {methodItems.map((item) => <IconItem key={item.label} item={item} onClick={() => openModal("all", item.methodId ?? "all")} />)}
              </div>
            </section>

            <section style={{ padding: "64px 36px 80px", flex: 1, background: "white" }}>
              <div style={{ background: "#fafafa", border: "0.5px solid #eee", borderRadius: 12, padding: "18px 22px", marginBottom: 30 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f4b9b9" }} />お知らせ
                </div>
                {[{ date: "2026/03/28", text: "ひらがなカード新セット追加しました" }, { date: "2026/03/20", text: "サービスをリリースしました" }].map((n) => (
                  <div key={n.date} style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#bbb", minWidth: 88, flexShrink: 0 }}>{n.date}</span>
                    <span style={{ fontSize: 13, color: "#444" }}>{n.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", borderBottom: "0.5px solid #eee", marginBottom: 24, marginTop: 48 }}>
                {["ピックアップ", "おすすめ", "ランキング", "新着"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ fontSize: 14, padding: "10px 20px", background: "transparent", border: "none", borderBottom: activeTab === tab ? "2px solid #9b6ed4" : "2px solid transparent", color: activeTab === tab ? "#9b6ed4" : "#bbb", cursor: "pointer", fontWeight: 600, marginBottom: -0.5 }}>
                    {tab}{tab === "新着" && <span style={{ fontSize: 10, fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", padding: "2px 6px", borderRadius: 8, marginLeft: 4 }}>NEW</span>}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
                {cards.map((card) => (
                  <div key={card.title} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer" }}>
                    <div style={{ height: 180, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: card.color, fontWeight: 700 }}>{card.img}</div>
                    <div style={{ padding: "16px 18px 22px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 8, background: card.tagBg, color: card.tagColor, display: "inline-block", marginBottom: 10 }}>{card.tag}</span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", lineHeight: 1.4, marginBottom: 8 }}>{card.title}</div>
                      <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>{card.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activePage !== "home" && (
          activePage === "guide" ? (
            <GuideSection />
          ) : activePage === "trouble" ? (
            <TroubleSection onOpenModal={() => setModal({ content: "all", method: "all" })} />
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
                  <FavoritesSection allMaterials={materials} isLoggedIn={isLoggedIn} />
                ) : activePage === "dl" ? (
                  <DownloadHistorySection allMaterials={materials} />
                ) : (
                  <p style={{ fontSize: 15, color: "#bbb" }}>このページは準備中です。</p>
                )}
              </div>
            </div>
          )
        )}
      </main>

      {modal && (
        <MaterialsModal
          initContent={modal.content}
          initMethod={modal.method}
          onClose={closeModal}
          isLoggedIn={isLoggedIn}
          materials={materials}
        />
      )}
    </div>
  );
}