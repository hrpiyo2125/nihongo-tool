"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getCardStyle } from "../../lib/materialUtils";
import { contentTabLabels, methodTabLabels } from "../../lib/tabs";
import MobileTeaserModal from "./MobileTeaserModal";
import MaterialCard from "./MaterialCard";
import MobileMaterialsModal from "./MobileMaterialsModal";
import { GuideSection } from "./MobileTroubleGuide";
import PersonalizedSection from "./PersonalizedSection";
import AuthModal, { AuthModalMode } from "../../components/AuthModal";
import AnnouncementModal from "./AnnouncementModal";
import MyPage from "./MyPage";
import { BrandIcon } from "../../components/BrandIcon";
type Material = {
  id: string;
  title: string;
  description: string;
  level: string[];
  content: string[];
  method: string[];
  ageGroup: string;
  requiredPlan: string;
  pdfFile?: string;
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

  const tm = useTranslations('mypage');
  const tmm = useTranslations('materials_modal');

  const [activeTab, setActiveTab] = useState("home");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("signup");
  const openAuth = (mode: AuthModalMode) => { setAuthModalMode(mode); setAuthModalOpen(true); };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("？");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [myPageOpen, setMyPageOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const [mySubPage, setMySubPage] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; date: string; type: string; material_id: string | null }[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{ id: string; title: string; date: string; type: string; material_id: string | null } | null>(null);
  const [activeCardTab, setActiveCardTab] = useState("pickup");
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [userId, setUserId] = useState("");
  const [favIds, setFavIds] = useState<string[]>([]);
  const [favIdsLoaded, setFavIdsLoaded] = useState(false);
  const [dlIds, setDlIds] = useState<string[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<Record<string, any>>({ plan: "free" });
  const effectiveFavIds = (!profile.plan || profile.plan === "free") ? favIds.slice(0, 5) : favIds;
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [modalInitContent, setModalInitContent] = useState("all");
  const [modalInitMethod, setModalInitMethod] = useState("all");
  const [morePage, setMorePage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user?.email) {
        setUserId(session.user.id);
        setUserEmail(session.user.email);
        const displayName = session.user.user_metadata?.full_name || session.user.email.split("@")[0];
        setUserName(displayName);
        setUserInitial(displayName.charAt(0).toUpperCase());
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileData) {
          setProfile(profileData);
          if (profileData.full_name) { setUserInitial(profileData.full_name.charAt(0).toUpperCase()); setUserName(profileData.full_name); }
          if (profileData.avatar_url) setAvatarUrl(profileData.avatar_url);
        }
        const { data: favData } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id);
        if (favData) setFavIds(favData.map((d: any) => d.material_id));
        setFavIdsLoaded(true);
        const { data: dlData } = await supabase.from("download_history").select("material_id").eq("user_id", session.user.id);
        if (dlData) setDlIds([...new Set(dlData.map((d: any) => d.material_id as string))]);
        const { data: purchaseData } = await supabase.from("purchases").select("material_id").eq("user_id", session.user.id);
        if (purchaseData) setPurchasedIds([...new Set(purchaseData.map((d: any) => d.material_id as string))]);
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
  { label: cl.joshi,      char: "は", color: "#fff0ec", imageSrc: "/joshi.png",    contentId: "joshi" },
  { label: cl.kaiwa,      char: "話", color: "#f8e8ff", imageSrc: "/kaiwa.png",    contentId: "kaiwa" },
  { label: cl.season,     char: "季", color: "#e8efff", imageSrc: "/season.png",   contentId: "season" },
  { label: cl.food,       char: "🍎", color: "#fff0e8", imageSrc: "/food.png",     contentId: "food" },
  { label: cl.animal,     char: "🐾", color: "#e8f8ee", imageSrc: "/animal.png",   contentId: "animal" },
  { label: cl.body,       char: "💪", color: "#ffe8f4", imageSrc: "/body.png",     contentId: "body" },
  { label: cl.color,      char: "🔵", color: "#f0e8ff", imageSrc: "/color.png",    contentId: "color" },
  { label: cl.number,     char: "数", color: "#e8f8ff", imageSrc: "/number.png",   contentId: "number" },
  { label: cl.adjective,  char: "い", color: "#fff8e0", imageSrc: null,            contentId: "adjective" },
  { label: cl.verb,       char: "動", color: "#e8f8ee", imageSrc: null,            contentId: "verb" },
  { label: cl.conjunction,char: "接", color: "#f0e8ff", imageSrc: null,            contentId: "conjunction" },
  { label: cl.grammar,    char: "文", color: "#f0ffe8", imageSrc: null,            contentId: "grammar" },
  { label: cl.familiar,   char: "🏠", color: "#e8efff", imageSrc: null,            contentId: "familiar" },
  { label: cl.kotoba,     char: "語", color: "#fff0e8", imageSrc: null,            contentId: "kotoba" },
  { label: cl.vegefruit,  char: "🥦", color: "#e8f8ee", imageSrc: null,            contentId: "vegefruit" },
];

  const methodItems = [
  { label: ml.drill,    char: "✏", color: "#e8efff", imageSrc: "/method_drill.png",    methodId: "drill" },
  { label: ml.test,     char: "✓", color: "#f0e8ff", imageSrc: "/method_test.png",     methodId: "test" },
  { label: ml.card,     char: "🃏", color: "#ffe8f4", imageSrc: "/method_card.png",     methodId: "card" },
  { label: ml.nurie,     char: "◎", color: "#fff0ec", imageSrc: null,                    methodId: "nurie" },
  { label: ml.roleplay,  char: "🎭", color: "#f8e8ff", imageSrc: "/method_roleplay.png",  methodId: "roleplay" },
  { label: ml.bingo,     char: "🎯", color: "#e8efff", imageSrc: null,                    methodId: "bingo" },
  { label: ml.interview, char: "🎤", color: "#fff8e0", imageSrc: null,                    methodId: "interview" },
  { label: ml.sentence,  char: "文", color: "#f0ffe8", imageSrc: null,                    methodId: "sentence" },
  { label: ml.essay,     char: "✍", color: "#fff0ec", imageSrc: null,                    methodId: "essay" },
  { label: ml.check,     char: "✓", color: "#e8f8ee", imageSrc: null,                    methodId: "check" },
  { label: ml.sugoroku,  char: "🎲", color: "#f0e8ff", imageSrc: null,                    methodId: "sugoroku" },
  { label: ml.poster,    char: "📄", color: "#e8f8ff", imageSrc: null,                    methodId: "poster" },
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


  const contentTabsForModal = [
    { id: "all", label: "すべて", char: "✦", color: "#e8efff", imageSrc: "/all.png" },
    { id: "hiragana", label: cl.hiragana, char: "あ", color: "#e8efff", imageSrc: "/hiragana.png" },
    { id: "katakana", label: cl.katakana, char: "ア", color: "#f0e8ff", imageSrc: "/katakana.png" },
    { id: "kanji", label: cl.kanji, char: "字", color: "#ffe8f4", imageSrc: "/kanji.png" },
    { id: "food", label: cl.food, char: "🍎", color: "#fff0e8", imageSrc: "/food.png" },
    { id: "animal", label: cl.animal, char: "🐾", color: "#e8f8ee", imageSrc: "/animal.png" },
    { id: "season", label: cl.season, char: "季", color: "#e8efff", imageSrc: "/season.png" },
    { id: "adjective", label: cl.adjective, char: "い", color: "#fff8e0", imageSrc: null },
    { id: "verb", label: cl.verb, char: "動", color: "#e8f8ee", imageSrc: null },
  ];

  const methodTabsForModal = [
    { id: "all", label: "すべて", char: "✦", imageSrc: "/all.png" },
    { id: "card", label: ml.card, char: "🃏", imageSrc: "/method_card.png" },
    { id: "nurie", label: ml.nurie, char: "◎", imageSrc: null },
    { id: "drill", label: ml.drill, char: "✏", imageSrc: "/method_drill.png" },
    { id: "bingo", label: ml.bingo, char: "🎯", imageSrc: null },
    { id: "sugoroku", label: ml.sugoroku, char: "🎲", imageSrc: null },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "white", fontFamily: "'Hiragino Sans', 'Yu Gothic', sans-serif", overflow: "hidden" }}>
      <nav aria-label="サイト内リンク" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
        <Link href="/plan">料金プラン</Link>
        <Link href="/faq">よくある質問</Link>
        <Link href="/guide">使い方ガイド</Link>
        <Link href="/about">toolioとは</Link>
        <Link href="/terms">利用規約</Link>
        <Link href="/privacy">プライバシーポリシー</Link>
        <Link href="/tokushoho">特定商取引法に基づく表示</Link>
      </nav>

      {/* ヘッダー */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: scrolled ? "white" : "transparent", borderBottom: scrolled ? "0.5px solid rgba(200,170,240,0.2)" : "none", transition: "background 0.2s" }}>
        <img src="/toolio_logo.png" alt="toolio" style={{ height: 32, objectFit: "contain" }} />
        <div style={{ position: "relative" }}>
          <button onClick={() => isLoggedIn ? setMyPageOpen(true) : setGuestMenuOpen(v => !v)} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer", overflow: "hidden", padding: 0 }}>
            {isLoggedIn && avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : isLoggedIn ? userInitial : "?"}
          </button>
          {guestMenuOpen && (
            <>
              <div onClick={() => setGuestMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
              <div style={{ position: "absolute", top: 44, right: 0, zIndex: 60, width: 220, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "0.5px solid rgba(200,170,240,0.25)", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px 10px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", fontSize: 13, fontWeight: 700, color: "#555" }}>ログインしますか？</div>
                <button onClick={() => { setGuestMenuOpen(false); openAuth("login"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#444", borderBottom: "0.5px solid rgba(200,170,240,0.1)" }}>
                  <BrandIcon name="key" size={14} color="#c9a0f0" />
                  ログイン
                </button>
                <button onClick={() => { setGuestMenuOpen(false); openAuth("signup"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#7040b0" }}>
                  <BrandIcon name="sparkle" size={14} color="#9b6ed4" />
                  会員でない方はこちらから新規登録
                </button>
              </div>
            </>
          )}
        </div>
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
                  <button onClick={() => openAuth("login")} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 20, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>ログイン</button>
                  <button onClick={() => openAuth("signup")} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>新規登録</button>
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
                  <div key={item.label} onClick={() => { setModalInitContent(item.contentId); setModalInitMethod("all"); setMaterialsModalOpen(true); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
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
                  <div key={item.label} onClick={() => { setModalInitContent("all"); setModalInitMethod(item.methodId); setMaterialsModalOpen(true); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
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
                  <div key={n.id} onClick={() => setSelectedAnnouncement(n)} style={{ display: "flex", gap: 12, marginBottom: 10, cursor: "pointer", borderRadius: 8, padding: "4px 6px", margin: "0 -6px 8px" }}>
                    <span style={{ fontSize: 11, color: "#bbb", minWidth: 80, flexShrink: 0 }}>{n.date}</span>
                    <span style={{ fontSize: 12, color: "#444", lineHeight: 1.6, flex: 1 }}>{n.title}</span>
                    <span style={{ fontSize: 11, color: "#b48be8", flexShrink: 0 }}>›</span>
                  </div>
                ))}
              </section>
            )}

            {/* あなたへのおすすめ */}
            <section style={{ padding: "24px 20px 0", borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
              <PersonalizedSection
                materials={materials}
                favIds={effectiveFavIds}
                dlIds={dlIds}
                favIdsLoaded={favIdsLoaded}
                userId={userId}
                userPlan={profile.plan ?? "free"}
                isLoggedIn={isLoggedIn}
                purchasedIds={purchasedIds}
                locale={locale}
                columns={2}
                onCardClick={(mat) => setTeaserMat(mat)}
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
            </section>

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
                      favIds={effectiveFavIds}
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
                <button onClick={() => openAuth("signup")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>ログイン / 新規登録</button>
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
                      favIds={effectiveFavIds}
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
              { icon: "download" as const, label: "ダウンロード履歴", action: () => setMorePage("dl") },
              { icon: "guide"     as const, label: "使い方ガイド",    action: () => setMorePage("guide") },
              { icon: "purchases" as const, label: "教材購入履歴",    action: () => setMorePage("purchases") },
            ].map((item) => (
              <div key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "0.5px solid rgba(200,170,240,0.2)", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <BrandIcon name={item.icon} size={20} color="#c9a0f0" />
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
                      <button onClick={() => openAuth("signup")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>ログイン / 新規登録</button>
                    </div>
                  ) : (() => {
                    const dlMaterials = materials.filter(m => dlIds.includes(m.id));
                    if (dlMaterials.length === 0) return (
                      <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>↓</div>
                        <div style={{ fontSize: 14 }}>ダウンロード履歴はまだありません</div>
                      </div>
                    );
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {dlMaterials.map((mat) => {
                          const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
                          return (
                            <MaterialCard
                              key={mat.id}
                              mat={mat}
                              onClick={() => setTeaserMat(mat)}
                              locale={locale}
                              isLoggedIn={isLoggedIn}
                              favIds={effectiveFavIds}
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
                    );
                  })()}
                </div>
              </div>
            )}

            {/* 教材購入履歴サブページ */}
            {morePage === "purchases" && (
              <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "white", display: "flex", flexDirection: "column" }}>
                <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0, gap: 12 }}>
                  <button onClick={() => setMorePage(null)} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>教材購入履歴</span>
                </header>
                <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
                  {!isLoggedIn ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <BrandIcon name="purchases" size={32} color="#e0d0f0" />
                      <div style={{ fontSize: 14, color: "#bbb", marginTop: 12, marginBottom: 20 }}>ログインすると購入履歴を確認できます</div>
                      <button onClick={() => openAuth("signup")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>ログイン / 新規登録</button>
                    </div>
                  ) : (() => {
                    const purchasedMaterials = materials.filter(m => purchasedIds.includes(m.id));
                    if (purchasedMaterials.length === 0) return (
                      <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}>
                        <BrandIcon name="purchases" size={32} color="#e0d0f0" />
                        <div style={{ fontSize: 14, marginTop: 12 }}>購入した教材はまだありません</div>
                      </div>
                    );
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {purchasedMaterials.map((mat) => {
                          const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
                          return (
                            <MaterialCard
                              key={mat.id}
                              mat={mat}
                              onClick={() => setTeaserMat(mat)}
                              locale={locale}
                              isLoggedIn={isLoggedIn}
                              favIds={effectiveFavIds}
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
                    );
                  })()}
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
            favIds={effectiveFavIds}
            contentTabs={contentTabsForModal}
            methodTabs={methodTabsForModal}
            locale={locale}
            onClose={() => setTeaserMat(null)}
            tmm={tmm}
            onFavChange={(materialId, isFav) => {
              if (isFav) setFavIds(prev => [...prev, materialId]);
              else setFavIds(prev => prev.filter(id => id !== materialId));
            }}
            onOpenAuth={openAuth}
          />
        );
      })()}

      {selectedAnnouncement && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          isLoggedIn={isLoggedIn}
          userPlan={profile.plan ?? "free"}
          favIds={effectiveFavIds}
          purchasedIds={purchasedIds}
          locale={locale}
          onClose={() => setSelectedAnnouncement(null)}
          onFavChange={(materialId, isFav) => {
            if (isFav) setFavIds(prev => [...prev, materialId]);
            else setFavIds(prev => prev.filter(id => id !== materialId));
          }}
          onOpenAuth={openAuth}
          onMaterialClick={(mat) => {
            setSelectedAnnouncement(null);
            setTeaserMat(mat as any);
          }}
        />
      )}

      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onLoggedIn={() => { setAuthModalOpen(false); window.location.reload(); }}
        />
      )}

      {/* マイページドロワー */}
      {myPageOpen && (
        <>
          <div onClick={() => setMyPageOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 99 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "80vw", maxWidth: 300, background: "white", zIndex: 100, padding: "60px 24px 40px", display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 20 }}>マイページ</div>
            {[
              { icon: "user"    as const, label: "プロフィール", action: () => { setMySubPage("profile"); } },
              { icon: "plan"    as const, label: "プラン",       action: () => { router.push(locale === "ja" ? "/plan" : `/${locale}/plan`); } },
              { icon: "billing" as const, label: "支払い履歴",   action: () => { setMySubPage("billing"); } },
              { icon: "bell"    as const, label: "通知設定",     action: () => { setMySubPage("notifications"); } },
            ].map((item) => (
              <div key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 0", borderBottom: "0.5px solid rgba(200,170,240,0.15)", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <BrandIcon name={item.icon} size={20} color="#c9a0f0" />
                  <span style={{ fontSize: 15, color: "#333" }}>{item.label}</span>
                </div>
                <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
              </div>
            ))}
            <div style={{ marginTop: "auto" }}>
              {!isLoggedIn ? (
                <button onClick={() => openAuth("signup")} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
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

      {/* マイページサブページ */}
      {mySubPage && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, background: "white", display: "flex", flexDirection: "column" }}>
          <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0, gap: 12 }}>
            <button onClick={() => setMySubPage(null)} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>
              {mySubPage === "profile" ? "プロフィール" : mySubPage === "billing" ? "支払い履歴" : "通知設定"}
            </span>
          </header>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <MyPage
              activePage={
                mySubPage === "profile" ? "settings-profile"
                : mySubPage === "billing" ? "settings-billing"
                : "settings-notifications"
              }
              setActivePage={(page) => {
                if (page === "plan") { setMySubPage(null); router.push(locale === "ja" ? "/plan" : `/${locale}/plan`); }
              }}
              isLoggedIn={isLoggedIn}
              userInitial={userInitial}
              setUserInitial={setUserInitial}
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              profile={profile}
              setProfile={setProfile}
              editingField={editingField}
              setEditingField={setEditingField}
              editingValue={editingValue}
              setEditingValue={setEditingValue}
              materials={materials}
              contentTabs={contentTabsForModal}
              methodTabs={methodTabsForModal}
              locale={locale}
              tmm={tmm}
              tm={tm}
              navItems={[]}
              mobileMode={true}
              onPlanChanged={async () => {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
                if (data) setProfile(data);
              }}
              onOpenAuth={openAuth}
            />
          </div>
        </div>
      )}

      {materialsModalOpen && (
  <MobileMaterialsModal
    materials={materials}
    locale={locale}
    isLoggedIn={isLoggedIn}
    userPlan={profile.plan ?? "free"}
    favIds={effectiveFavIds}
    purchasedIds={purchasedIds}
    contentTabs={contentTabsForModal}
    methodTabs={methodTabsForModal}
    avatarUrl={avatarUrl}
    userInitial={userInitial}
    tabs={tabs}
    initContent={modalInitContent}
    initMethod={modalInitMethod}
    onFavToggle={async (m) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      if (favIds.includes(m.id)) {
        await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", m.id);
        setFavIds(prev => prev.filter(id => id !== m.id));
      } else {
        await supabase.from("favorites").insert({ user_id: session.user.id, material_id: m.id });
        setFavIds(prev => [...prev, m.id]);
      }
    }}
    onCardClick={(mat) => setTeaserMat(mat)}
    onClose={() => setMaterialsModalOpen(false)}
    onTabChange={(tabId) => setActiveTab(tabId)}
    onOpenMyPage={() => setMyPageOpen(true)}
  />
)}
    </div>
  );
}
