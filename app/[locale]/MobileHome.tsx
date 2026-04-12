"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { getCardStyle } from "../../lib/materialUtils";
import { contentTabLabels, methodTabLabels } from "../../lib/tabs";
import TeaserModal from "./TeaserModal";
import MobileTeaserModal from "./MobileTeaserModal";
import MaterialCard from "./MaterialCard";
import { TroubleSection, GuideSection } from "./MobileTroubleGuide";



function MobileTroubleSection({ onOpenModal }: { onOpenModal: () => void }) {
  const [tab, setTab] = useState("start");
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
  return (
    <div>
      <div style={{ padding: "24px 20px 0", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 85%), linear-gradient(to right, rgba(244,185,185,0.4) 0%, rgba(228,155,253,0.4) 50%, rgba(163,192,255,0.4) 100%)" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 6 }}>Trouble Shooting</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>お悩み解決</h2>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16, lineHeight: 1.8 }}>日本語指導でよくあるお悩みに、一緒に向き合います。</p>
        <div style={{ display: "flex", overflowX: "auto" as const, gap: 0, borderBottom: "0.5px solid rgba(200,170,240,0.25)", scrollbarWidth: "none" as const }}>
          {troubleTabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 14px", border: "none", borderBottom: tab === t.id ? "2px solid #9b6ed4" : "2px solid transparent", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? "#7a50b0" : "#aaa", whiteSpace: "nowrap" as const, flexShrink: 0 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "24px 20px 80px" }}>
        <p style={{ fontSize: 13, color: "#777", lineHeight: 1.9 }}>
          {tab === "start" && "「授業をもっと楽しくしたい」「どこから始めればいいかわからない」——そんな悩みから一緒に考えましょう。toolioは「使いながら覚える・気づいたらできてた」をコンセプトに設計されています。"}
          {tab === "level" && "テストしなくて大丈夫。日常の会話の中でざっくり観察するだけで十分です。「できること」を見つけることが大切です。聞く・話す・読む・書く、それぞれできることを観察してみましょう。"}
          {tab === "goal" && "目標は「何を学ぶか」より「何ができるようになるか」で考えてみましょう。「ひらがなを練習する」より「お菓子のパッケージが読める」のような形にすると、子どもにも達成感が生まれます。"}
          {tab === "material" && "得意な力から入るのが一番スムーズです。聞く・話すが得意ならかるた・カードから、読むに興味が出てきたなら文字系の教材から始めてみましょう。同じ教材でも使い方次第でどのレベルにも使えます。"}
          {tab === "teach" && "説明より先に「楽しい活動」から入りましょう。まず活動に飛び込んで、やりながら自然に言葉に触れさせます。最後は必ず「できた！」で締めくくることが大切です。"}
          {tab === "motivation" && "やる気は「待つ」ものではなく「動いてから生まれる」ものです。まず小さな「できた！」を作ることが一番の近道。ゲームや遊びから気分を上げて、短い時間から始めましょう。"}
          {tab === "bored" && "飽きには必ず理由があります。難しすぎ・簡単すぎ・疲れ・興味がない——パターンを見極めて対処しましょう。授業は15〜20分を目安に、必ず「できたね」で終わるのがコツです。"}
          {tab === "improve" && "「できるようにならない」には必ず理由があります。インプット不足・定着前に次へ進む・使う場面がない——まずは「知る→慣れる→使う」の流れを意識してみましょう。"}
        </p>
        <button onClick={onOpenModal} style={{ marginTop: 24, fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
          教材一覧を見る →
        </button>
      </div>
    </div>
  );
}

function MobileGuideSection() {
  const [tab, setTab] = useState("start");
  const guideTabs = [
    { id: "start",  label: "はじめての方へ", emoji: "✦" },
    { id: "find",   label: "教材の探し方",   emoji: "🔍" },
    { id: "more",   label: "もっと活用",     emoji: "★" },
    { id: "help",   label: "わからないとき", emoji: "❓" },
  ];
  return (
    <div>
      <div style={{ padding: "24px 20px 0", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 85%), linear-gradient(to right, rgba(244,185,185,0.4) 0%, rgba(228,155,253,0.4) 50%, rgba(163,192,255,0.4) 100%)" }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 6 }}>Guide</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>使い方ガイド</h2>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16, lineHeight: 1.8 }}>toolioの使い方をご案内します。</p>
        <div style={{ display: "flex", overflowX: "auto" as const, gap: 0, borderBottom: "0.5px solid rgba(200,170,240,0.25)", scrollbarWidth: "none" as const }}>
          {guideTabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 14px", border: "none", borderBottom: tab === t.id ? "2px solid #9b6ed4" : "2px solid transparent", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? "#7a50b0" : "#aaa", whiteSpace: "nowrap" as const, flexShrink: 0 }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "24px 20px 80px", display: "flex", flexDirection: "column" as const, gap: 16 }}>
        {tab === "start" && (<>
          {[
            { num: "01", title: "まず無料教材を試す", desc: "アカウント不要・登録なしで今すぐダウンロードできます。まずは気になった教材を1つ試してみてください。" },
            { num: "02", title: "気に入ったら無料登録する", desc: "登録するとお気に入り保存・ダウンロード履歴などが使えるようになります。" },
            { num: "03", title: "サブスクプランに登録する", desc: "プランに応じて使える教材が増えます。Light ¥980 / Standard ¥1,980 / Premium ¥3,980。" },
          ].map((step) => (
            <div key={step.num} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "16px 18px", display: "flex", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.num}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: "#777", lineHeight: 1.8 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </>)}
        {tab === "find" && (<>
          {[
            { icon: "🔵", title: "学習内容のアイコンから探す", desc: "ひらがな・カタカナ・語彙など、学びたい内容のアイコンをタップ" },
            { icon: "▶️", title: "学習方法のアイコンから探す", desc: "ドリル・カード・ゲームなど、使いたい方法のアイコンをタップ" },
            { icon: "✦", title: "「教材一覧を見る」から探す", desc: "内容と方法を組み合わせて絞り込みができます" },
            { icon: "🔍", title: "キーワードで検索する", desc: "教材一覧上部の検索バーにキーワードを入力" },
          ].map((item) => (
            <div key={item.title} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </>)}
        {tab === "more" && (<>
          {[
            { icon: "📂", title: "ダウンロード履歴を活用する", desc: "過去にダウンロードした教材はダウンロード履歴からすぐ再ダウンロードできます。" },
            { icon: "❤️", title: "お気に入りリストを整理する", desc: "ハートボタンで保存した教材はお気に入りから確認できます。" },
            { icon: "🔖", title: "サブスク教材を確認する", desc: "教材一覧では、使えるプランがタグで色分けして表示されています。" },
            { icon: "✨", title: "トップページのタブを活用する", desc: "ピックアップ・おすすめ・ランキング・新着の4つのタブから教材を探せます。" },
          ].map((item) => (
            <div key={item.title} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </>)}
        {tab === "help" && (<>
          {[
            { q: "ダウンロードボタンが押せない", a: "サブスク教材の場合、対応するプランへの登録が必要です。教材のタグを確認してください。" },
            { q: "ログインできない", a: "パスワードをお忘れの場合はログイン画面の「パスワードを忘れた方」から再設定できます。" },
            { q: "お気に入りが保存されない", a: "お気に入り機能はログインが必要です。ログインしてください。" },
            { q: "PDFが開けない・印刷できない", a: "PDFビューワー（Adobe Acrobatなど）をインストールしてお試しください。" },
          ].map((item) => (
            <div key={item.q} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", display: "flex", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#e49bfd", flexShrink: 0 }}>Q</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>{item.q}</span>
              </div>
              <div style={{ padding: "12px 16px", background: "#fafafa", display: "flex", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#a3c0ff", flexShrink: 0 }}>A</span>
                <span style={{ fontSize: 12, color: "#666", lineHeight: 1.8 }}>{item.a}</span>
              </div>
            </div>
          ))}
        </>)}
      </div>
    </div>
  );
}
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
};

export default function MobileHome() {
  const router = useRouter();
  const locale = useLocale();
  const cl = contentTabLabels[locale] ?? contentTabLabels.ja;
  const ml = methodTabLabels[locale] ?? methodTabLabels.ja;

  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("？");
  const [scrolled, setScrolled] = useState(false);
  const [myPageOpen, setMyPageOpen] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; date: string }[]>([]);
  const [activeCardTab, setActiveCardTab] = useState("pickup");
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<Record<string, any>>({ plan: "free" });
  const [modalFilter, setModalFilter] = useState<{ content: string; method: string } | null>(null);
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [activeContentFilter, setActiveContentFilter] = useState("all");
  const [activeMethodFilter, setActiveMethodFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [morePage, setMorePage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user?.email) {
        setUserInitial(session.user.email[0].toUpperCase());
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileData) setProfile(profileData);
        const { data: favData } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id);
        if (favData) setFavIds(favData.map((d: any) => d.material_id));
      }
    });
  }, []);

  useEffect(() => {
    fetch("/api/materials").then(r => r.json()).then(data => setMaterials(Array.isArray(data) ? data : []));
    fetch("/api/announcements").then(r => r.json()).then(data => setAnnouncements(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 10);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

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
];

  const methodItems = [
  { label: ml.drill,    char: "✏", color: "#e8efff", imageSrc: "/method_drill.png",    methodId: "drill" },
  { label: ml.test,     char: "✓", color: "#f0e8ff", imageSrc: "/method_test.png",     methodId: "test" },
  { label: ml.card,     char: "🃏", color: "#ffe8f4", imageSrc: "/method_card.png",     methodId: "card" },
  { label: ml.karuta,   char: "札", color: "#fff8e0", imageSrc: null,                   methodId: "karuta" },
  { label: ml.game,     char: "▶", color: "#e8f8ee", imageSrc: null,                   methodId: "game" },
  { label: ml.nurie,    char: "◎", color: "#fff0ec", imageSrc: null,                   methodId: "nurie" },
  { label: ml.reading,  char: "本", color: "#e8f8ff", imageSrc: "/method_reading.png",  methodId: "reading" },
  { label: ml.music,    char: "♪", color: "#edfff0", imageSrc: null,                   methodId: "music" },
  { label: ml.roleplay, char: "🎭", color: "#f8e8ff", imageSrc: "/method_roleplay.png", methodId: "roleplay" },
];

  const filteredMaterials = materials.filter(mat => {
    if (activeCardTab === "pickup") return mat.isPickup;
    if (activeCardTab === "recommended") return mat.isRecommended;
    if (activeCardTab === "ranking") return mat.ranking !== null;
    if (activeCardTab === "new") return mat.isNew;
    return true;
  }).sort((a, b) => {
    if (activeCardTab === "ranking") return (a.ranking ?? 999) - (b.ranking ?? 999);
    return 0;
  }).slice(0, 6);

  const tabs = [
    { id: "home", label: "ホーム", icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={active ? "#9b6ed4" : "#bbb"} />
        <path d="M9 22V12h6v10" stroke={active ? "#9b6ed4" : "#bbb"} />
      </svg>
    )},
    { id: "materials", label: "教材", icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke={active ? "#9b6ed4" : "#bbb"} />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke={active ? "#9b6ed4" : "#bbb"} />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke={active ? "#9b6ed4" : "#bbb"} />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke={active ? "#9b6ed4" : "#bbb"} />
      </svg>
    )},
    { id: "fav", label: "お気に入り", icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={active ? "#9b6ed4" : "#bbb"} />
      </svg>
    )},
    { id: "more", label: "もっと見る", icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="12" r="1.5" fill={active ? "#9b6ed4" : "#bbb"} />
        <circle cx="12" cy="12" r="1.5" fill={active ? "#9b6ed4" : "#bbb"} />
        <circle cx="19" cy="12" r="1.5" fill={active ? "#9b6ed4" : "#bbb"} />
      </svg>
    )},
  ];

  const tmmDummy = (key: string) => ({
    title: "教材を探す", search_placeholder: "教材を検索...", age: "対象年齢",
    content: "学習内容", method: "学習方法", download: "ダウンロード",
    lock_download: "ダウンロード", add_fav: "お気に入りに追加", added_fav: "お気に入りに追加済み",
  }[key] ?? key);

  const contentTabsForModal = [
    { id: "all", label: "すべて", char: "✦", color: "#e8efff", imageSrc: "/all.png" },
    { id: "hiragana", label: cl.hiragana, char: "あ", color: "#e8efff", imageSrc: "/hiragana.png" },
    { id: "katakana", label: cl.katakana, char: "ア", color: "#f0e8ff", imageSrc: "/katakana.png" },
    { id: "kanji", label: cl.kanji, char: "字", color: "#ffe8f4", imageSrc: "/kanji.png" },
    { id: "vocab", label: cl.vocab, char: "語", color: "#fff8e0", imageSrc: "/vocab.png" },
    { id: "food", label: cl.food, char: "🍎", color: "#fff0e8", imageSrc: "/food.png" },
    { id: "animal", label: cl.animal, char: "🐾", color: "#e8f8ee", imageSrc: "/animal.png" },
    { id: "season", label: cl.season, char: "季", color: "#e8efff", imageSrc: "/season.png" },
  ];

  const methodTabsForModal = [
    { id: "all", label: "すべて", char: "✦", imageSrc: "/all.png" },
    { id: "karuta", label: ml.karuta, char: "札", imageSrc: null },
    { id: "card", label: ml.card, char: "🃏", imageSrc: "/method_card.png" },
    { id: "game", label: ml.game, char: "▶", imageSrc: null },
    { id: "nurie", label: ml.nurie, char: "◎", imageSrc: null },
    { id: "drill", label: ml.drill, char: "✏", imageSrc: "/method_drill.png" },
    { id: "reading", label: ml.reading, char: "本", imageSrc: "/method_reading.png" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "white", fontFamily: "'Hiragino Sans', 'Yu Gothic', sans-serif", overflow: "hidden" }}>

      {/* ヘッダー */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: scrolled ? "white" : "transparent", borderBottom: scrolled ? "0.5px solid rgba(200,170,240,0.2)" : "none", transition: "background 0.2s" }}>
        <img src="/toolio_logo.png" alt="toolio" style={{ height: 32, objectFit: "contain" }} />
        <button onClick={() => setMyPageOpen(true)} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer" }}>
          {userInitial}
        </button>
      </header>

      {/* メインコンテンツ */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>

        {/* ホームタブ */}
        {activeTab === "home" && (
          <div>
            {/* ヒーロー */}
            <section style={{ padding: "80px 32px 48px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 10%, rgba(255,255,255,1) 80%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
              <p style={{ fontSize: 10, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 14 }}>Japanese Language Tools</p>
              <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.6, marginBottom: 14, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>にほんごの勉強が、もっとたのしくなる。</h1>
              <p style={{ fontSize: 13, color: "#999", lineHeight: 1.8, marginBottom: 28 }}>日本語を学ぶ子供を支える方のための<br />日本語学習ツールサイト。</p>
              <button onClick={() => setMaterialsModalOpen(true)} style={{ fontSize: 13, padding: "10px 24px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", marginBottom: 12 }}>
                教材一覧を見る
              </button>
              {!isLoggedIn && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                  <button onClick={() => router.push("/auth?mode=login")} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 20, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>ログイン</button>
                  <button onClick={() => router.push("/auth")} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>新規登録</button>
                </div>
              )}
            </section>

            {/* 学習内容から探す */}
            <section style={{ padding: "32px 0 24px" }}>
              <div style={{ padding: "0 28px", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 4 }}>Browse by Content</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#333" }}>学習内容から探す</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "4px 28px 8px" }}>
                {contentItems.map((item) => (
                  <div key={item.label} onClick={() => { setActiveContentFilter(item.contentId); setActiveMethodFilter("all"); setMaterialsModalOpen(true); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: item.color, border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 20 }}>
                      {item.imageSrc ? <img src={item.imageSrc} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : item.char}
                    </div>
                    <span style={{ fontSize: 10, color: "#777", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 学習方法から探す */}
            <section style={{ padding: "24px 0", borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
              <div style={{ padding: "0 28px", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 4 }}>Browse by Method</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#333" }}>学習方法から探す</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "4px 28px 8px" }}>
                {methodItems.map((item) => (
                  <div key={item.label} onClick={() => { setActiveContentFilter("all"); setActiveMethodFilter(item.methodId); setMaterialsModalOpen(true); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: item.color, border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 20 }}>
                      {item.imageSrc ? <img src={item.imageSrc} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : item.char}
                    </div>
                    <span style={{ fontSize: 10, color: "#777", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* お知らせ */}
            {announcements.length > 0 && (
              <section style={{ padding: "24px 20px", borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f4b9b9" }} />お知らせ
                </div>
                {announcements.slice(0, 3).map((n) => (
                  <div key={n.id} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: "#bbb", minWidth: 80, flexShrink: 0 }}>{n.date}</span>
                    <span style={{ fontSize: 12, color: "#444", lineHeight: 1.6 }}>{n.title}</span>
                  </div>
                ))}
              </section>
            )}

            {/* 教材タブ（ピックアップ等） */}
            <section style={{ padding: "24px 0 32px", borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
              <div style={{ display: "flex", overflowX: "auto", padding: "0 20px", marginBottom: 16, gap: 0, borderBottom: "0.5px solid #eee", scrollbarWidth: "none" }}>
                {[
                  { key: "pickup", label: "ピックアップ" },
                  { key: "recommended", label: "おすすめ" },
                  { key: "ranking", label: "ランキング" },
                  { key: "new", label: "新着" },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setActiveCardTab(key)} style={{ fontSize: 13, padding: "8px 14px", background: "transparent", border: "none", borderBottom: activeCardTab === key ? "2px solid #9b6ed4" : "2px solid transparent", color: activeCardTab === key ? "#9b6ed4" : "#bbb", cursor: "pointer", fontWeight: activeCardTab === key ? 700 : 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 20px" }}>
                {filteredMaterials.length === 0 ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#bbb", fontSize: 13 }}>該当する教材がありません</div>
                ) : filteredMaterials.map((mat) => {
                  const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
                  return (
                    <MaterialCard
                      key={mat.id}
                      mat={mat}
                      onClick={() => setTeaserMat(mat)}
                      locale={locale}
                      isLoggedIn={isLoggedIn}
                      favIds={favIds}
                      bg={bg} char={char} charColor={charColor}
                      tag={tag} tagBg={tagBg} tagColor={tagColor}
                      onFavToggle={async (mat) => {
                        const supabase = createClient();
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) return;
                        if (favIds.includes(mat.id)) {
                          await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
                          setFavIds(prev => prev.filter(id => id !== mat.id));
                        } else {
                          await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
                          setFavIds(prev => [...prev, mat.id]);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        )}

        

        {/* お気に入りタブ */}
        {activeTab === "fav" && (
          <div style={{ padding: "80px 20px 20px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#333", marginBottom: 20 }}>お気に入り</div>
            {!isLoggedIn ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>♡</div>
                <div style={{ fontSize: 14, color: "#bbb", marginBottom: 20 }}>ログインするとお気に入りを保存できます</div>
                <button onClick={() => router.push("/auth")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>ログイン / 新規登録</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {materials.filter(m => favIds.includes(m.id)).length === 0 ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#bbb" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>♡</div>
                    <div style={{ fontSize: 14 }}>お気に入りはまだありません</div>
                  </div>
                ) : materials.filter(m => favIds.includes(m.id)).map((mat) => {
                  const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
                  return (
                    <MaterialCard
                      key={mat.id}
                      mat={mat}
                      onClick={() => setTeaserMat(mat)}
                      locale={locale}
                      isLoggedIn={isLoggedIn}
                      favIds={favIds}
                      bg={bg} char={char} charColor={charColor}
                      tag={tag} tagBg={tagBg} tagColor={tagColor}
                      onFavToggle={async (mat) => {
                        const supabase = createClient();
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) return;
                        if (favIds.includes(mat.id)) {
                          await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
                          setFavIds(prev => prev.filter(id => id !== mat.id));
                        } else {
                          await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
                          setFavIds(prev => [...prev, mat.id]);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* もっと見るタブ */}
        {activeTab === "more" && (
          <div style={{ padding: "80px 20px 20px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#333", marginBottom: 24 }}>もっと見る</div>
            {[
              { icon: "↓", label: "ダウンロード履歴", action: () => setMorePage("dl") },
              { icon: "💬", label: "お悩み解決", action: () => setMorePage("trouble") },
              { icon: "❓", label: "使い方ガイド", action: () => setMorePage("guide") },
              { icon: "📋", label: "プラン", action: () => router.push("/plan") },
            ].map((item) => (
              <div key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "0.5px solid rgba(200,170,240,0.2)", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 15, color: "#333", fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
              </div>
            ))}

            {/* ダウンロード履歴サブページ */}
            {morePage === "dl" && (
              <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "white", display: "flex", flexDirection: "column" }}>
                <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0, gap: 12 }}>
                  <button onClick={() => setMorePage(null)} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>ダウンロード履歴</span>
                </header>
                <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
                  {!isLoggedIn ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>↓</div>
                      <div style={{ fontSize: 14, color: "#bbb", marginBottom: 20 }}>ログインするとダウンロード履歴を確認できます</div>
                      <button onClick={() => router.push("/auth")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>ログイン / 新規登録</button>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>↓</div>
                      <div style={{ fontSize: 14 }}>ダウンロード履歴はまだありません</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* お悩み解決サブページ */}
            {morePage === "trouble" && (
              <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "white", display: "flex", flexDirection: "column" }}>
                <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0, gap: 12 }}>
                  <button onClick={() => setMorePage(null)} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>お悩み解決</span>
                </header>
                <div style={{ flex: 1, overflowY: "auto" }}>
                 <TroubleSection onOpenModal={() => setMaterialsModalOpen(true)} onHome={() => setMorePage(null)} />
                </div>
              </div>
            )}

            {/* 使い方ガイドサブページ */}
            {morePage === "guide" && (
              <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "white", display: "flex", flexDirection: "column" }}>
                <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0, gap: 12 }}>
                  <button onClick={() => setMorePage(null)} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>使い方ガイド</span>
                </header>
                <div style={{ flex: 1, overflowY: "auto" }}>
                  <GuideSection />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 下部タブバー */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 80, background: "white", borderTop: "0.5px solid rgba(200,170,240,0.25)", display: "flex", alignItems: "center", justifyContent: "space-around", paddingBottom: 16, zIndex: 50 }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => { if (tab.id === "materials") { setMaterialsModalOpen(true); } else { setActiveTab(tab.id); } }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", padding: "8px 16px" }}>
            {tab.icon(active)}
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#9b6ed4" : "#bbb" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ティザーモーダル */}
      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <MobileTeaserModal
            mat={teaserMat}
            bg={bg} char={char} charColor={charColor}
            tag={tag} tagBg={tagBg} tagColor={tagColor}
            isLoggedIn={isLoggedIn}
            userPlan={profile.plan ?? "free"}
            favIds={favIds}
            contentTabs={contentTabsForModal}
            methodTabs={methodTabsForModal}
            locale={locale}
            onClose={() => setTeaserMat(null)}
            tmm={tmmDummy}
            onFavChange={(materialId, isFav) => {
              if (isFav) setFavIds(prev => [...prev, materialId]);
              else setFavIds(prev => prev.filter(id => id !== materialId));
            }}
          />
        );
      })()}

      {/* マイページドロワー */}
      {myPageOpen && (
        <>
          <div onClick={() => setMyPageOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 99 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "80vw", maxWidth: 300, background: "white", zIndex: 100, padding: "60px 24px 40px", display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 20 }}>マイページ</div>
            {[
              { icon: "👤", label: "プロフィール" },
              { icon: "📋", label: "プラン" },
              { icon: "🧾", label: "支払い履歴" },
              { icon: "🔔", label: "通知設定" },
              { icon: "⭐", label: "ポイント" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 0", borderBottom: "0.5px solid rgba(200,170,240,0.15)", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 15, color: "#333" }}>{item.label}</span>
                </div>
                <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
              </div>
            ))}
            <div style={{ marginTop: "auto" }}>
              {!isLoggedIn ? (
                <button onClick={() => router.push("/auth")} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  ログイン / 新規登録
                </button>
              ) : (
                <button onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  setIsLoggedIn(false);
                  setMyPageOpen(false);
                }} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "0.5px solid #eee", background: "white", color: "#aaa", fontSize: 14, cursor: "pointer" }}>
                  ログアウト
                </button>
              )}
            </div>
          </div>
        </>
      )}
 {materialsModalOpen && (
  <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "white", display: "flex", flexDirection: "column" }}>
    
    {/* ヘッダー */}
    <header style={{ position: "relative", zIndex: 50, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: "white", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0 }}>
      <img src="/toolio_logo.png" alt="toolio" style={{ height: 32, objectFit: "contain" }} />
      <button onClick={() => setMyPageOpen(true)} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer" }}>
      {userInitial}
      </button>
    </header>

    {/* タイトル＋検索＋方法タブ */}
    <div style={{ padding: "16px 16px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)", flexShrink: 0 }}>
      
        
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" as const }}>
        {[{ id: "all", label: "すべて" }, ...methodTabsForModal.filter(t => t.id !== "all")].map((tab) => {
          const active = activeMethodFilter === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveMethodFilter(tab.id)} style={{ padding: "5px 12px", flexShrink: 0, background: active ? "rgba(163,192,255,0.18)" : "rgba(0,0,0,0.03)", border: active ? "1px solid rgba(163,192,255,0.5)" : "1px solid rgba(0,0,0,0.07)", borderRadius: 20, cursor: "pointer" }}>
              <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#888", whiteSpace: "nowrap" as const }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>

    {/* メインエリア */}
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ width: 80, flexShrink: 0, overflowY: "auto", borderRight: "0.5px solid rgba(0,0,0,0.06)", padding: "8px 0" }}>
        {[{ id: "all", label: "すべて", color: "#e8efff", imageSrc: "/all.png", char: "✦" }, ...contentTabsForModal.filter(t => t.id !== "all")].map((tab) => {
          const active = activeContentFilter === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveContentFilter(tab.id)} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: "10px 4px", width: "100%", border: "none", background: active ? "rgba(163,192,255,0.12)" : "transparent", cursor: "pointer", borderLeft: active ? "3px solid #9b6ed4" : "3px solid transparent" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: tab.id === "all" ? "linear-gradient(135deg,#f4b9b9,#a3c0ff)" : tab.color, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 14 }}>
                {tab.imageSrc ? <img src={tab.imageSrc} alt={tab.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : tab.char}
              </div>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#888", textAlign: "center" as const, lineHeight: 1.2 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        <div style={{ fontSize: 11, color: "#bbb", marginBottom: 10 }}>
          {materials.filter(m => {
            const cMatch = activeContentFilter === "all" || (m.content ?? []).includes(activeContentFilter);
            const mMatch = activeMethodFilter === "all" || (m.method ?? []).includes(activeMethodFilter);
            const sMatch = !searchQuery || m.title.includes(searchQuery);
            return cMatch && mMatch && sMatch;
          }).length}件
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {materials.filter(m => {
            const cMatch = activeContentFilter === "all" || (m.content ?? []).includes(activeContentFilter);
            const mMatch = activeMethodFilter === "all" || (m.method ?? []).includes(activeMethodFilter);
            const sMatch = !searchQuery || m.title.includes(searchQuery);
            return cMatch && mMatch && sMatch;
          }).map((mat) => {
            const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
            return (
              <div key={mat.id} onClick={() => setTeaserMat(mat)} style={{ borderRadius: 12, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer" }}>
                <div style={{ height: 100, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: charColor, fontWeight: 700 }}>{char}</div>
                <div style={{ padding: "8px 10px 10px" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 5, background: tagBg, color: tagColor, display: "inline-block", marginBottom: 4 }}>{tag}</span>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* 下部タブバー */}
    <div style={{ height: 80, background: "white", borderTop: "0.5px solid rgba(200,170,240,0.25)", display: "flex", alignItems: "center", justifyContent: "space-around", paddingBottom: 16, flexShrink: 0 }}>
      {tabs.map((tab) => {
        const active = tab.id === "materials";
        return (
          <button key={tab.id} onClick={() => { if (tab.id !== "materials") { setMaterialsModalOpen(false); setActiveTab(tab.id); } }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", padding: "8px 16px" }}>
            {tab.icon(active)}
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#9b6ed4" : "#bbb" }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  </div>
)}
    </div>
  );
}
