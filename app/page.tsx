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
  { id: "all",      label: "すべて",   char: "✦", color: "#e8efff", imageSrc: null },
  { id: "hiragana", label: "ひらがな", char: "あ", color: "#e8efff", imageSrc: "/hiragana.png" },
  { id: "katakana", label: "カタカナ", char: "ア", color: "#f0e8ff", imageSrc: "/kanakana.png" },
  { id: "kanji",    label: "漢字",     char: "字", color: "#ffe8f4", imageSrc: "/kanji.png" },
  { id: "math",     label: "算数",     char: "＋", color: "#e8f8ee", imageSrc: "/math.png" },
  { id: "vocab",    label: "語彙",     char: "語", color: "#fff8e0", imageSrc: null },
  { id: "grammar",  label: "文法",     char: "文", color: "#fff0ec", imageSrc: null },
  { id: "picture",  label: "絵本",     char: "絵", color: "#e8f8ff", imageSrc: null },
  { id: "song",     label: "うた",     char: "♪", color: "#edfff0", imageSrc: null },
  { id: "daily",    label: "日常",     char: "日", color: "#f8e8ff", imageSrc: null },
  { id: "season",   label: "季節",     char: "季", color: "#e8efff", imageSrc: null },
  { id: "number",   label: "数字",     char: "数", color: "#f0e8ff", imageSrc: null },
];

const methodTabs = [
  { id: "all",      label: "すべて",     char: "✦" },
  { id: "test",     label: "テスト",     char: "✓" },
  { id: "karuta",   label: "かるた",     char: "札" },
  { id: "practice", label: "練習",       char: "✏" },
  { id: "game",     label: "ゲーム",     char: "▶" },
  { id: "nurie",    label: "ぬりえ",     char: "◎" },
  { id: "reading",  label: "読み物",     char: "本" },
  { id: "craft",    label: "工作",       char: "✂" },
  { id: "music",    label: "うた",       char: "♪" },
  { id: "talk",     label: "会話",       char: "話" },
  { id: "nazori",   label: "なぞり書き", char: "な" },
  { id: "puzzle",   label: "パズル",     char: "⊞" },
];

const materials = [
  { id: 1,  title: "ひらがな練習シート",   content: "hiragana", method: "practice", tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#dbe8ff,#c8d8ff)", char: "あ", charColor: "#4a72c4" },
  { id: 2,  title: "ひらがなかるたセット", content: "hiragana", method: "karuta",   tag: "PICK", tagBg: "#ecdeff",  tagColor: "#7040b0", bg: "linear-gradient(135deg,#ecdeff,#ddc8ff)", char: "い", charColor: "#8a5cc4" },
  { id: 3,  title: "ひらがなテスト①",     content: "hiragana", method: "test",     tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#ffd9ee,#ffc8e4)", char: "う", charColor: "#c44a88" },
  { id: 4,  title: "ひらがなゲーム",       content: "hiragana", method: "game",     tag: "NEW",  tagBg: "#ffd9ee",  tagColor: "#a03070", bg: "linear-gradient(135deg,#d6f5e5,#c0ecd4)", char: "え", charColor: "#3a8a5a" },
  { id: 5,  title: "ひらがななぞり書き",   content: "hiragana", method: "nazori",   tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#fff0ec,#ffe4d9)", char: "お", charColor: "#c47a4a" },
  { id: 6,  title: "カタカナ練習シート",   content: "katakana", method: "practice", tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#f0e8ff,#e4d8ff)", char: "ア", charColor: "#7a5cc4" },
  { id: 7,  title: "カタカナかるた",       content: "katakana", method: "karuta",   tag: "PICK", tagBg: "#ecdeff",  tagColor: "#7040b0", bg: "linear-gradient(135deg,#ecdeff,#ddc8ff)", char: "イ", charColor: "#8a5cc4" },
  { id: 8,  title: "カタカナテスト",       content: "katakana", method: "test",     tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#dbe8ff,#c8d8ff)", char: "ウ", charColor: "#4a72c4" },
  { id: 9,  title: "漢字テスト1年生",      content: "kanji",    method: "test",     tag: "NEW",  tagBg: "#ffd9ee",  tagColor: "#a03070", bg: "linear-gradient(135deg,#ffd9ee,#ffc8e4)", char: "字", charColor: "#c44a88" },
  { id: 10, title: "漢字なぞり書き1年生",  content: "kanji",    method: "nazori",   tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#fff8e0,#fff0c8)", char: "山", charColor: "#b08020" },
  { id: 11, title: "かずあそびゲーム",     content: "math",     method: "game",     tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#d6f5e5,#c0ecd4)", char: "＋", charColor: "#3a8a5a" },
  { id: 12, title: "数字練習シート",       content: "math",     method: "practice", tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#e8f8ee,#d0f0e0)", char: "１", charColor: "#3a8a5a" },
  { id: 13, title: "季節のうた",           content: "season",   method: "music",    tag: "NEW",  tagBg: "#ffd9ee",  tagColor: "#a03070", bg: "linear-gradient(135deg,#e8efff,#d8e8ff)", char: "春", charColor: "#4a72c4" },
  { id: 14, title: "日常会話カード",       content: "daily",    method: "talk",     tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#f8e8ff,#f0d8ff)", char: "話", charColor: "#8a4ac4" },
  { id: 15, title: "語彙パズル",           content: "vocab",    method: "puzzle",   tag: "PICK", tagBg: "#ecdeff",  tagColor: "#7040b0", bg: "linear-gradient(135deg,#fff8e0,#fff0c8)", char: "語", charColor: "#b08020" },
  { id: 16, title: "絵本ぬりえ",           content: "picture",  method: "nurie",    tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#e8f8ff,#d0f0ff)", char: "絵", charColor: "#4a9ac4" },
];

const contentItems = [
  { label: "ひらがな", char: "あ", color: "#e8efff", imageSrc: "/hiragana.png", contentId: "hiragana" },
  { label: "カタカナ", char: "ア", color: "#f0e8ff", imageSrc: "/kanakana.png", contentId: "katakana" },
  { label: "漢字",     char: "字", color: "#ffe8f4", imageSrc: "/kanji.png",    contentId: "kanji" },
  { label: "算数",     char: "＋", color: "#e8f8ee", imageSrc: "/math.png",     contentId: "math" },
  { label: "語彙",     char: "語", color: "#fff8e0", contentId: "vocab" },
  { label: "文法",     char: "文", color: "#fff0ec", contentId: "grammar" },
  { label: "絵本",     char: "絵", color: "#e8f8ff", contentId: "picture" },
  { label: "うた",     char: "♪", color: "#edfff0", contentId: "song" },
  { label: "日常",     char: "日", color: "#f8e8ff", contentId: "daily" },
  { label: "季節",     char: "季", color: "#e8efff", contentId: "season" },
  { label: "数字",     char: "数", color: "#f0e8ff", contentId: "number" },
  { label: "もっと見る", char: "›", color: "#f8f4ff", isMore: true, contentId: "all" },
];

const methodItems = [
  { label: "テスト",     char: "✓", color: "#f0e8ff", methodId: "test" },
  { label: "かるた",     char: "札", color: "#ffe8f4", methodId: "karuta" },
  { label: "練習",       char: "✏", color: "#e8efff", methodId: "practice" },
  { label: "ゲーム",     char: "▶", color: "#e8f8ee", methodId: "game" },
  { label: "ぬりえ",     char: "◎", color: "#fff8e0", methodId: "nurie" },
  { label: "読み物",     char: "本", color: "#fff0ec", methodId: "reading" },
  { label: "工作",       char: "✂", color: "#e8f8ff", methodId: "craft" },
  { label: "うた",       char: "♪", color: "#edfff0", methodId: "music" },
  { label: "会話",       char: "話", color: "#f8e8ff", methodId: "talk" },
  { label: "なぞり書き", char: "な", color: "#e8efff", methodId: "nazori" },
  { label: "パズル",     char: "⊞", color: "#f0e8ff", methodId: "puzzle" },
  { label: "もっと見る", char: "›", color: "#f8f4ff", isMore: true, methodId: "all" },
];

const cards = [
  { img: "あ", bg: "linear-gradient(135deg,#dbe8ff,#c8d8ff)", color: "#4a72c4", tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", title: "ひらがな練習シート", sub: "50音すべて収録・なぞり書き対応" },
  { img: "🃏", bg: "linear-gradient(135deg,#ecdeff,#ddc8ff)", color: "#8a5cc4", tag: "PICK", tagBg: "#ecdeff",  tagColor: "#7040b0", title: "かるたセット・春",   sub: "春の語彙を楽しく覚えられる" },
  { img: "字", bg: "linear-gradient(135deg,#ffd9ee,#ffc8e4)", color: "#c44a88", tag: "NEW",  tagBg: "#ffd9ee",  tagColor: "#a03070", title: "漢字テスト1年生",   sub: "小1の漢字80字をテスト形式で" },
  { img: "🎮", bg: "linear-gradient(135deg,#d6f5e5,#c0ecd4)", color: "#3a8a5a", tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", title: "かずあそびゲーム",  sub: "数字と量の対応を遊びながら学ぶ" },
];
const guideTabs = [
  { id: "start",  label: "はじめての方へ",     emoji: "✦" },
  { id: "choose", label: "教材を選びたい",       emoji: "📄" },
  { id: "use",    label: "授業・学習に使いたい", emoji: "✏" },
  { id: "more",   label: "もっと活用したい",     emoji: "★" },
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
 
function GuideSection() {
  const [guideTab, setGuideTab] = useState("start");
  return (
    <div style={{ display: "flex", flexDirection: "column" as const }}>
      {/* ヘッダー */}
      <div style={{ padding: "48px 48px 0", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 85%), linear-gradient(to right, rgba(244,185,185,0.4) 0%, rgba(228,155,253,0.4) 50%, rgba(163,192,255,0.4) 100%)", borderRadius: "16px 16px 0 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 8 }}>Guide</p>
        <h2 style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>使い方ガイド</h2>
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28, lineHeight: 1.8 }}>お悩みに合わせて、toolioの使い方をご案内します。</p>
        {/* 横タブ */}
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
 
      {/* コンテンツ */}
      <div style={{ padding: "36px 48px 64px", display: "flex", flexDirection: "column" as const, gap: 36 }}>
        {guideTab === "start" && (
          <>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 20 }}>toolioをはじめよう</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 22, background: "#fafafa", borderRadius: 14, border: "0.5px solid rgba(200,170,240,0.15)", padding: "28px 32px" }}>
                {guideStartSteps.map((step) => (
                  <div key={step.num} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.num}</div>
                    <div style={{ paddingTop: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>{step.title}</div>
                      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>{step.desc}</div>
                      {step.sub && <div style={{ fontSize: 11, color: "#bbb", marginTop: 4, lineHeight: 1.7 }}>{step.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 16 }}>よくある疑問</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                {guideStartTips.map((tip) => <GuideTipItem key={tip.title} tip={tip} />)}
              </div>
            </div>
          </>
        )}
        {guideTab === "choose" && (
          <>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 16 }}>目的・レベル・場面で選ぶ</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
                {guideChooseCards.map((card) => <GuideCardItem key={card.title} card={card} />)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 16 }}>選び方のヒント</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                {guideChooseTips.map((tip) => <GuideTipItem key={tip.title} tip={tip} />)}
              </div>
            </div>
          </>
        )}
        {guideTab === "use" && (
          <>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 16 }}>あなたの状況に合わせたヒント</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
                {guideUseCards.map((card) => <GuideCardItem key={card.title} card={card} />)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 16 }}>長続きのコツ</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                {guideUseTips.map((tip) => <GuideTipItem key={tip.title} tip={tip} />)}
              </div>
            </div>
          </>
        )}
        {guideTab === "more" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 16 }}>toolioをもっと便利に使う</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {guideMoreTips.map((tip) => <GuideTipItem key={tip.title} tip={tip} />)}
            </div>
          </div>
        )}
 
        {/* 共通フッター */}
        <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(228,155,253,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 14, padding: "24px 28px", textAlign: "center" as const }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 6 }}>解決しませんでしたか？</div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16, lineHeight: 1.7 }}>お気軽にお問い合わせください。通常2〜3営業日以内にご返信します。</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button onClick={() => window.location.href = "/faq"} style={{ fontSize: 12, padding: "9px 24px", borderRadius: 20, border: "0.5px solid rgba(163,192,255,0.6)", background: "white", color: "#7a50b0", cursor: "pointer", fontWeight: 600 }}>よくある質問を見る</button>
            <button onClick={() => window.location.href = "/contact"} style={{ fontSize: 12, padding: "9px 24px", borderRadius: 20, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}>お問い合わせする →</button>
          </div>
        </div>
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

// ===== 教材一覧モーダル =====
  function MaterialsModal({ initContent, initMethod, onClose, isLoggedIn }: { initContent: string; initMethod: string; onClose: () => void; isLoggedIn: boolean; }) {
  const [activeContent, setActiveContent] = useState(initContent);
const [activeMethod, setActiveMethod] = useState(initMethod);
const [teaserMat, setTeaserMat] = useState<typeof materials[0] | null>(null);
const [favIds, setFavIds] = useState<number[]>([]);
const [favTooltipId, setFavTooltipId] = useState<number | null>(null);

useEffect(() => {
  if (!isLoggedIn) return;
  const supabase = createClient();
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (!session) return;
    const { data } = await supabase
      .from("favorites")
      .select("material_id")
      .eq("user_id", session.user.id);
    if (data) setFavIds(data.map((d) => d.material_id));
  });
}, [isLoggedIn]);

  const filtered = materials.filter((m) => {
    const cMatch = activeContent === "all" || m.content === activeContent;
    const mMatch = activeMethod === "all" || m.method === activeMethod;
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
            <input type="text" placeholder="教材を検索..." style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, color: "#555", outline: "none" }} />
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
                  {filtered.map((mat) => (
                    <div key={mat.id} onClick={() => setTeaserMat(mat)} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer", position: "relative" }}>
                      {/* お気に入りボタン＋吹き出し */}
<div style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
  <button
    onClick={async (e) => {
      e.stopPropagation();
      if (!isLoggedIn) {
        setFavTooltipId(favTooltipId === mat.id ? null : mat.id);
        return;
      }
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      if (favIds.includes(mat.id)) {
        await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
        setFavIds((prev) => prev.filter((id) => id !== mat.id));
      } else {
        await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
        setFavIds((prev) => [...prev, mat.id]);
      }
    }}
    style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "rgba(255,255,255,0.85)",
      border: "0.5px solid rgba(200,180,230,0.3)",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill={isLoggedIn && favIds.includes(mat.id) ? "#c9a0f0" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/>
</svg>
  </button>

  {/* 吹き出し */}
  {favTooltipId === mat.id && (
    <>
      <div onClick={(e) => { e.stopPropagation(); setFavTooltipId(null); }} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
      <div style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50,
        background: "white", borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
        padding: "14px 16px", width: 150,
        border: "0.5px solid rgba(200,170,240,0.25)",
      }}>
        {/* 三角 */}
        <div style={{ position: "absolute", top: -6, right: 10, width: 12, height: 6, overflow: "hidden" }}>
          <div style={{ width: 8, height: 8, background: "white", border: "0.5px solid rgba(200,170,240,0.25)", transform: "rotate(45deg)", margin: "2px auto 0", boxShadow: "-2px -2px 4px rgba(0,0,0,0.04)" }} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5 }}>🔒 お気に入り機能</div>
        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7, marginBottom: 12 }}>
          ログインするとお気に入りに保存できます。
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); window.location.href = "/auth"; }}
            style={{ flex: 1, fontSize: 10, fontWeight: 700, padding: "6px 0", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}
          >
            新規登録
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); window.location.href = "/auth?mode=login"; }}
            style={{ flex: 1, fontSize: 10, fontWeight: 600, padding: "6px 0", borderRadius: 7, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer" }}
          >
            ログイン
          </button>
        </div>
      </div>
    </>
  )}
</div>
                      <div style={{ height: 135, background: mat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: mat.charColor, fontWeight: 700 }}>{mat.char}</div>
                      <div style={{ padding: "10px 12px 14px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: mat.tagBg, color: mat.tagColor, display: "inline-block", marginBottom: 6 }}>{mat.tag}</span>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ティザーモーダル（MaterialsModalのreturnの中） */}
      {teaserMat && (
  <div onClick={() => setTeaserMat(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
    <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 720, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden", position: "relative", maxHeight: "88vh" }}>
      <button onClick={() => setTeaserMat(null)} style={{ position: "absolute", top: 14, right: 14, zIndex: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.08)", border: "none", cursor: "pointer", fontSize: 14, color: "#666" }}>✕</button>

      {/* 左：プレビュー */}
      <div style={{ background: "#f5f0ff", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "3/4" }}>
          <div style={{ width: "100%", height: "100%", background: teaserMat.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, color: teaserMat.charColor, fontWeight: 700, userSelect: "none" }}>
            {teaserMat.char}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ aspectRatio: "1", background: teaserMat.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: teaserMat.charColor, fontWeight: 700, userSelect: "none", opacity: 0.7 }}>
              {teaserMat.char}
            </div>
          ))}
        </div>
      </div>

      {/* 右：情報 */}
      <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: teaserMat.tagBg, color: teaserMat.tagColor }}>{teaserMat.tag}</span>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#f0f0f0", color: "#888" }}>{contentTabs.find(t => t.id === teaserMat.content)?.label}</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{teaserMat.title}</div>
        <div style={{ fontSize: 14, color: "#777", lineHeight: 1.7 }}>楽しく学べる{contentTabs.find(t => t.id === teaserMat.content)?.label}の教材です。印刷してすぐに使えます。</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ label: "対象年齢", value: "4〜10歳" }, { label: "形式", value: "PDF印刷" }, { label: "ページ数", value: "4枚" }, { label: "言語", value: "日本語" }].map(({ label, value }) => (
            <div key={label} style={{ background: "#f7f7f7", borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: "#f0f0f0" }} />

        {/* ダウンロードボタン＋吹き出し */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              if (teaserMat.tag === "無料") {
                window.open(`/materials/${teaserMat.id}`, "_blank");
                setTeaserMat(null);
              }
            }}
            style={{
              width: "100%", padding: "13px",
              background: teaserMat.tag !== "無料" ? "#f0eeff" : "#a3c0ff",
              color: teaserMat.tag !== "無料" ? "#7F77DD" : "white",
              border: teaserMat.tag !== "無料" ? "1px solid rgba(163,192,255,0.4)" : "none",
              borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {teaserMat.tag !== "無料" && <span style={{ fontSize: 16 }}>🔒</span>}
            {teaserMat.tag !== "無料" ? "ダウンロード" : "この教材をダウンロードする"}
          </button>

          {/* サブスク限定：吹き出し */}
        {teaserMat.tag !== "無料" && (
  <div style={{
    marginTop: 10,
    background: "linear-gradient(135deg, rgba(244,185,185,0.08), rgba(163,192,255,0.08))",
    border: "0.5px solid rgba(200,170,240,0.35)",
    borderRadius: 12, padding: "14px 16px",
    position: "relative",
  }}>
    {/* 上の三角 */}
    <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: 12, height: 6, overflow: "hidden" }}>
      <div style={{ width: 8, height: 8, background: "white", border: "0.5px solid rgba(200,170,240,0.35)", transform: "rotate(45deg)", margin: "2px auto 0" }} />
    </div>

    <div style={{ fontSize: 12, color: "#7a50b0", fontWeight: 700, marginBottom: 6 }}>サブスクプランで使い放題 ✨</div>

    {!isLoggedIn ? (
      // 未ログイン・未登録
      <>
        <div style={{ fontSize: 11, color: "#999", lineHeight: 1.7, marginBottom: 12 }}>
          登録するとすべての教材がダウンロードし放題になります。
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setTeaserMat(null); window.location.href = "/auth"; }}
          style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", marginBottom: 8 }}
        >
          無料で登録する
        </button>
        <div style={{ textAlign: "center", fontSize: 11, color: "#bbb" }}>
          すでにアカウントをお持ちの方は
          <span
            onClick={(e) => { e.stopPropagation(); setTeaserMat(null); window.location.href = "/auth?mode=login"; }}
            style={{ color: "#9b6ed4", cursor: "pointer", marginLeft: 2 }}
          >
            ログイン
          </span>
        </div>
      </>
    ) : (
      // TODO: Notion本番化・Stripe実装後にプラン判定を追加
      // ログイン済み・無料会員 → 「プランを見る」
      // ログイン済み・ライトプラン会員でスタンダード以上教材 → 「プランをアップグレードする」
      // 対応プラン会員 → 吹き出しなし・ダウンロード可
      <div style={{ fontSize: 11, color: "#999", lineHeight: 1.7 }}>
        プランの詳細はこちらから確認できます。
      </div>
    )}
  </div>
)}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

// ===== メインページ =====
function FavoritesSection() {
  const [favMaterials, setFavMaterials] = useState<typeof materials[number][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase
        .from("favorites")
        .select("material_id")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (data) {
        const ids = data.map((d) => d.material_id);
        setFavMaterials(materials.filter((m) => ids.includes(m.id)));
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ fontSize: 13, color: "#bbb" }}>読み込み中...</p>;
  if (favMaterials.length === 0) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>♡</div>
      <div style={{ fontSize: 14 }}>お気に入りはまだありません</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>教材のハートボタンで保存できます</div>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
      {favMaterials.map((mat) => (
        <div key={mat.id} onClick={() => window.open(`/materials/${mat.id}`, "_blank")} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer" }}>
          <div style={{ height: 135, background: mat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: mat.charColor, fontWeight: 700 }}>{mat.char}</div>
          <div style={{ padding: "10px 12px 14px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: mat.tagBg, color: mat.tagColor, display: "inline-block", marginBottom: 6 }}>{mat.tag}</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DownloadHistorySection() {
  const [historyMaterials, setHistoryMaterials] = useState<typeof materials[number][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase
        .from("download_history")
        .select("material_id")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (data) {
        const ids = [...new Set(data.map((d) => d.material_id))];
        setHistoryMaterials(materials.filter((m) => ids.includes(m.id)));
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ fontSize: 13, color: "#bbb" }}>読み込み中...</p>;
  if (historyMaterials.length === 0) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>↓</div>
      <div style={{ fontSize: 14 }}>ダウンロード履歴はまだありません</div>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
      {historyMaterials.map((mat) => (
        <div key={mat.id} onClick={() => window.open(`/materials/${mat.id}`, "_blank")} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer" }}>
          <div style={{ height: 135, background: mat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: mat.charColor, fontWeight: 700 }}>{mat.char}</div>
          <div style={{ padding: "10px 12px 14px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: mat.tagBg, color: mat.tagColor, display: "inline-block", marginBottom: 6 }}>{mat.tag}</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
          </div>
        </div>
      ))}
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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
  setUserInitial(session.user.email[0].toUpperCase());
  const name = session.user.user_metadata?.full_name || session.user.email.split("@")[0];
  setUserName(name);
}
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user?.email) {
  setUserInitial(session.user.email[0].toUpperCase());
  const name = session.user.user_metadata?.full_name || session.user.email.split("@")[0];
  setUserName(name);
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
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif", background: "#f8f4f4", overflow: "hidden", position: "relative" }}>

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
  <button
    onClick={async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      router.refresh();
    }}
    style={{
      width: "100%", fontSize: 11, padding: "6px 10px",
      borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.4)",
      background: "transparent", color: "#c0a0c0",
      cursor: "pointer", marginTop: 4,
    }}
  >
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
              <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.55, marginBottom: 16, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>授業のアイデアが、次々とわいてくる。</h1>
              <p style={{ fontSize: 16, color: "#999", marginBottom: 64, lineHeight: 1.9 }}>海外で学ぶ子どもたちの日本語を、<br />もっとわくわくさせる教材プラットフォーム</p>
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
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#a3c0ff)", flexShrink: 0 }} />
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
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f4b9b9" }} />
                  お知らせ
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
            {activePage === "plan" ? (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#333" }}>もっとわくわくする教材を使いませんか</div>
                <div style={{ fontSize: 13, color: "#999", lineHeight: 1.8 }}>サブスクプランに登録すると<br />全教材・体系的カリキュラムが使い放題になります</div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button onClick={() => router.push("/plan")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>プランを見る →</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#333" }}>この機能を使うには登録が必要です</div>
                <div style={{ fontSize: 13, color: "#999", lineHeight: 1.8 }}>無料アカウントを作成すると<br />お気に入り保存・ダウンロード履歴などが使えます</div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button onClick={() => router.push("/auth")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>無料で登録する →</button>
                  <button onClick={() => router.push("/auth?mode=login")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>ログイン</button>
                </div>
              </>
            )}
          </div>
        ) : activePage === "fav" ? (
  <FavoritesSection />
) : activePage === "dl" ? (
  <DownloadHistorySection />
) : activePage === "plan" ? (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ fontSize: 13, color: "#999", lineHeight: 1.8 }}>
      プランの詳細・変更はこちらから確認できます。
    </div>
    <button onClick={() => router.push("/plan")} style={{
      fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none",
      background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
      color: "white", cursor: "pointer", fontWeight: 700,
      display: "inline-block", width: "fit-content",
    }}>
      プランを見る・変更する →
    </button>
  </div>
) : (
  <p style={{ fontSize: 15, color: "#bbb" }}>このページは準備中です。</p>
)}
      </div>
    </div>
  )
)}
      </main>

      {modal && <MaterialsModal initContent={modal.content} initMethod={modal.method} onClose={closeModal} isLoggedIn={isLoggedIn} />}
    </div>
  );
}