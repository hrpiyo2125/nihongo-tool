"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase";
import { useAuth } from "./AuthContext";
import { useLocale, useTranslations } from "next-intl";
import { getCardStyle } from "../../lib/materialUtils";
import { contentTabLabels, methodTabLabels, getContentTabs, getMethodTabs } from "../../lib/tabs";
import MobileTeaserModal from "./MobileTeaserModal";
import MaterialCard from "./MaterialCard";
import MobileMaterialsModal from "./MobileMaterialsModal";
import { FaqSection } from "./MobileTroubleGuide";
import { PrivacyContent, TermsContent, TokushohoContent, AboutContent } from "./LegalPagesContent";
import PersonalizedSection from "./PersonalizedSection";
import AuthModal, { AuthModalMode } from "../../components/AuthModal";
import AnnouncementModal from "./AnnouncementModal";
import MyPage from "./MyPage";
import PlanSelector from "../../components/PlanSelector";
import PlanModal from "../../components/PlanModal";
import PurchaseConfirmModal from "./PurchaseConfirmModal";
import { BrandIcon } from "../../components/BrandIcon";
import { useMobileStore, findModal } from "../../lib/mobileStore";

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

// ─── お気に入りトグル共通ロジック ────────────────────────────
async function toggleFav(
  mat: Material,
  favIds: string[],
  setFavIds: (fn: (prev: string[]) => string[]) => void
) {
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
}

function MobileHomeInner() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  // ─── Zustand store ───────────────────────────────────────
  const { activeTab, setTab, modalStack, push, pop, updateMaterialsFilter } = useMobileStore();
  const topModal = modalStack.at(-1);
  const materialsEntry = findModal(modalStack, "materials");
  const teaserEntry = findModal(modalStack, "teaser");

  // モーダル表示フラグ（スタックから導出）
  const guestMenuOpen    = topModal?.type === "guest";
  const myPageOpen       = topModal?.type === "mypage";
  const mySubPageOpen    = topModal?.type === "mypage-profile" || topModal?.type === "mypage-plan" || topModal?.type === "mypage-billing";
  const announcementOpen = topModal?.type === "announcement";
  const authModalOpen    = topModal?.type === "auth";
  const morePageDl       = topModal?.type === "more-dl";
  const morePageGuide    = topModal?.type === "more-guide";
  const morePagePurchases = topModal?.type === "more-purchases";
  const legalPrivacy     = topModal?.type === "legal-privacy";
  const legalTerms       = topModal?.type === "legal-terms";
  const legalTokushoho   = topModal?.type === "legal-tokushoho";
  const legalAbout       = topModal?.type === "legal-about";
  const teaserPlanOpen   = topModal?.type === "teaser-plan";
  const teaserPurchaseOpen = topModal?.type === "teaser-purchase";

  // mySubPage を topModal から導出
  const mySubPage =
    topModal?.type === "mypage-profile" ? "profile" :
    topModal?.type === "mypage-plan"    ? "plan"    :
    topModal?.type === "mypage-billing" ? "billing" : null;

  // ─── i18n ────────────────────────────────────────────────
  const cl = contentTabLabels[locale] ?? contentTabLabels.ja;
  const ml = methodTabLabels[locale] ?? methodTabLabels.ja;
  const tm  = useTranslations("mypage");
  const tmm = useTranslations("materials_modal");
  const th  = useTranslations("home");

  // ─── Auth ────────────────────────────────────────────────
  const { isLoggedIn, userId, userEmail, userName, userInitial, avatarUrl, profile,
          favIds, favIdsLoaded, dlIds, purchasedIds, loadProfile,
          setFavIds, setUserName, setUserInitial, setAvatarUrl, updateProfile } = useAuth();
  const effectiveFavIds = (!profile.plan || profile.plan === "free") ? favIds.slice(0, 5) : favIds;

  // ─── ローカル state（モーダルに依存しないもの） ──────────
  const [scrolled, setScrolled]         = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [materials, setMaterials]       = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; date: string; type: string; material_id: string | null }[]>([]);
  const [activeCardTab, setActiveCardTab] = useState("pickup");
  const [legalContent, setLegalContent] = useState<{ textContents: Record<string, string>; faqs: { question: string; answer: string; category: string }[] } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ─── データ取得 ──────────────────────────────────────────
  useEffect(() => {
    fetch("/api/materials").then(r => r.json()).then(data => setMaterials(Array.isArray(data) ? data : []));
    fetch("/api/announcements").then(r => r.json()).then(data => setAnnouncements(Array.isArray(data) ? data : []));
    fetch("/api/legal-content").then(r => r.json()).then(data => setLegalContent(data));
  }, []);

  // ─── スクロール検知 + ghost tap ガード ──────────────────
  const handleMainScroll = () => {
    isScrollingRef.current = true;
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => { isScrollingRef.current = false; }, 300);
    if (scrollRef.current) setScrolled(scrollRef.current.scrollTop > 10);
  };

  // ─── スクロール位置保存・復元 ────────────────────────────
  // モーダルを最初に開くとき保存
  const savedScrollRef = useRef(false);
  useEffect(() => {
    if (modalStack.length > 0 && !savedScrollRef.current && scrollRef.current) {
      sessionStorage.setItem("homeScroll", String(scrollRef.current.scrollTop));
      savedScrollRef.current = true;
    }
    if (modalStack.length === 0) {
      savedScrollRef.current = false;
      const pos = sessionStorage.getItem("homeScroll");
      if (pos && scrollRef.current) {
        requestAnimationFrame(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = Number(pos);
        });
      }
    }
  }, [modalStack.length]);

  // ─── ナビゲーション関数 ──────────────────────────────────
  const switchTab = (tab: string) => {
    setTab(tab as import("../../lib/mobileStore").TabId);
  };

  const switchLanguage = () => {
    const nextLocale = locale === "ja" ? "en" : "ja";
    const newPath = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${nextLocale}${newPath}`);
  };

  const openAuth = (mode: AuthModalMode) => {
    push({ type: "auth", mode });
  };

  const openMaterialsModal = (content: string, method: string) => {
    // 既にスタックにあれば filter だけ更新、なければ push
    if (materialsEntry) {
      updateMaterialsFilter(content, method);
    } else {
      push({ type: "materials", filter: { content, method } });
    }
  };

  const openTeaser = (mat: Material) => {
    push({ type: "teaser", mat: mat as any });
  };

  // ─── タブ定義 ────────────────────────────────────────────
  const tabs = [
    { id: "home", label: "ホーム", icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={active ? "#7a50b0" : "#bbb"} />
        <path d="M9 22V12h6v10" stroke={active ? "#7a50b0" : "#bbb"} />
      </svg>
    )},
    { id: "materials", label: "教材", icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke={active ? "#7a50b0" : "#bbb"} />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke={active ? "#7a50b0" : "#bbb"} />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke={active ? "#7a50b0" : "#bbb"} />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke={active ? "#7a50b0" : "#bbb"} />
      </svg>
    )},
    { id: "fav", label: "お気に入り", icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={active ? "#7a50b0" : "#bbb"} />
      </svg>
    )},
    { id: "more", label: "もっと見る", icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="12" r="1.5" fill={active ? "#7a50b0" : "#bbb"} />
        <circle cx="12" cy="12" r="1.5" fill={active ? "#7a50b0" : "#bbb"} />
        <circle cx="19" cy="12" r="1.5" fill={active ? "#7a50b0" : "#bbb"} />
      </svg>
    )},
  ];

  const contentTabsForModal = getContentTabs(cl);
  const methodTabsForModal  = getMethodTabs(ml);

  const contentItems = [
    { label: cl.hiragana,    char: "あ", color: "#e8efff", imageSrc: "/contents/12_hiragana.png",     contentId: "hiragana" },
    { label: cl.katakana,    char: "ア", color: "#f0e8ff", imageSrc: "/contents/4_kanakana.png",      contentId: "katakana" },
    { label: cl.kanji,       char: "字", color: "#ffe8f4", imageSrc: "/contents/3_kanji.png",         contentId: "kanji" },
    { label: cl.joshi,       char: "は", color: "#fff0ec", imageSrc: "/contents/5_joshi.png",         contentId: "joshi" },
    { label: cl.kaiwa,       char: "話", color: "#f8e8ff", imageSrc: "/contents/8_kaiwa.png",         contentId: "kaiwa" },
    { label: cl.season,      char: "季", color: "#e8efff", imageSrc: "/contents/17_season.png",       contentId: "season" },
    { label: cl.food,        char: "🍎", color: "#fff0e8", imageSrc: "/contents/15_food.png",         contentId: "food" },
    { label: cl.animal,      char: "🐾", color: "#e8f8ee", imageSrc: "/contents/1_animal.png",        contentId: "animal" },
    { label: cl.body,        char: "💪", color: "#ffe8f4", imageSrc: "/contents/9_body.png",          contentId: "body" },
    { label: cl.color,       char: "🔵", color: "#f0e8ff", imageSrc: "/contents/18_color.png",        contentId: "color" },
    { label: cl.number,      char: "数", color: "#e8f8ff", imageSrc: "/contents/13_number.png",       contentId: "number" },
    { label: cl.adjective,   char: "い", color: "#fff8e0", imageSrc: "/contents/2_keiyoushi.png",     contentId: "adjective" },
    { label: cl.verb,        char: "動", color: "#e8f8ee", imageSrc: "/contents/6_doushi.png",        contentId: "verb" },
    { label: cl.conjunction, char: "接", color: "#f0e8ff", imageSrc: "/contents/10_setsuzokushi.png", contentId: "conjunction" },
    { label: cl.grammar,     char: "文", color: "#f0ffe8", imageSrc: "/contents/16_bunpo.png",        contentId: "grammar" },
    { label: cl.familiar,    char: "🏠", color: "#e8efff", imageSrc: "/contents/7_mijika.png",        contentId: "familiar" },
    { label: cl.kotoba,      char: "語", color: "#fff0e8", imageSrc: "/contents/19_word.png",         contentId: "kotoba" },
    { label: cl.vegefruit,   char: "🥦", color: "#e8f8ee", imageSrc: "/contents/11_yasai.png",        contentId: "vegefruit" },
    { label: cl.myself,      char: "👤", color: "#e8efff", imageSrc: "/contents/myself.png",          contentId: "myself" },
  ];

  const methodItems = [
    { label: ml.drill,        char: "✏",  color: "#e8efff", imageSrc: "/method/10_drill.png",        methodId: "drill" },
    { label: ml.test,         char: "✓",  color: "#f0e8ff", imageSrc: "/method/13_test.png",         methodId: "test" },
    { label: ml.card,         char: "🃏", color: "#ffe8f4", imageSrc: "/method/9_card.png",           methodId: "card" },
    { label: ml.nurie,        char: "◎",  color: "#fff0ec", imageSrc: "/method/2_nurie.png",         methodId: "nurie" },
    { label: ml.roleplay,     char: "🎭", color: "#f8e8ff", imageSrc: "/method/6_roleplay.png",      methodId: "roleplay" },
    { label: ml.bingo,        char: "🎯", color: "#e8efff", imageSrc: "/method/12_bingo.png",        methodId: "bingo" },
    { label: ml.interview,    char: "🎤", color: "#fff8e0", imageSrc: "/method/4_interview.png",     methodId: "interview" },
    { label: ml.presentation, char: "📊", color: "#e8efff", imageSrc: "/method/presentation.png",   methodId: "presentation" },
    { label: ml.sentence,     char: "文",  color: "#f0ffe8", imageSrc: "/method/5_sentense.png",     methodId: "sentence" },
    { label: ml.essay,        char: "✍",  color: "#fff0ec", imageSrc: "/method/1_sakubun.png",      methodId: "essay" },
    { label: ml.check,        char: "✓",  color: "#e8f8ee", imageSrc: "/method/3_checklist.png",    methodId: "check" },
    { label: ml.sugoroku,     char: "🎲", color: "#f0e8ff", imageSrc: "/method/7_sugoroku.png",     methodId: "sugoroku" },
    { label: ml.poster,       char: "📄", color: "#e8f8ff", imageSrc: "/method/8_poster.png",       methodId: "poster" },
  ];

  const filteredMaterials = materials.filter(mat => {
    if (activeCardTab === "pickup")      return mat.isPickup;
    if (activeCardTab === "recommended") return mat.isRecommended;
    if (activeCardTab === "ranking")     return mat.ranking !== null;
    if (activeCardTab === "new")         return mat.isNew;
    return true;
  }).sort((a, b) => {
    if (activeCardTab === "ranking") return (a.ranking ?? 999) - (b.ranking ?? 999);
    return 0;
  }).slice(0, 6);

  // ─── レンダリング ────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "white", overflow: "hidden" }}>

      {/* ヘッダー */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: scrolled ? "white" : "transparent", borderBottom: scrolled ? "0.5px solid rgba(200,170,240,0.2)" : "none", transition: "background 0.2s" }}>
        <img src="/toolio_logo.png" alt="toolio" style={{ height: 32, objectFit: "contain" }} />
        <div style={{ position: "relative" }}>
          <button
            onClick={() => isLoggedIn ? push({ type: "mypage" }) : (guestMenuOpen ? pop() : push({ type: "guest" }))}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer", overflow: "hidden", padding: 0 }}
          >
            {isLoggedIn && avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : isLoggedIn ? userInitial : "?"}
          </button>
          {guestMenuOpen && (
            <>
              <div onClick={() => pop()} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
              <div style={{ position: "absolute", top: 44, right: 0, zIndex: 60, width: 220, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "0.5px solid rgba(200,170,240,0.25)", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px 10px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", fontSize: 13, fontWeight: 700, color: "#555" }}>ログインしますか？</div>
                <button onClick={() => { pop(); openAuth("login"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#444", borderBottom: "0.5px solid rgba(200,170,240,0.1)" }}>
                  <BrandIcon name="key" size={14} color="#c9a0f0" />ログイン
                </button>
                <button onClick={() => { pop(); openAuth("signup"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#7040b0" }}>
                  <BrandIcon name="sparkle" size={14} color="#9b6ed4" />会員でない方はこちらから新規登録
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <div ref={scrollRef} onScroll={handleMainScroll} style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>

        {/* ホームタブ */}
        {activeTab === "home" && (
          <div>
            <section style={{ padding: "140px 32px 48px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 10%, rgba(255,255,255,1) 28%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
              <p style={{ fontSize: 8, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 18, fontFamily: "var(--font-libre)" }}>Japanese Learning Tools For Kids</p>
              <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.6, marginBottom: 14, textAlign: "center", whiteSpace: "pre-line", background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "var(--font-libre)" }}>{th("hero_title")}</h1>
              <p style={{ fontSize: 11, color: "#999", lineHeight: 1.8, marginBottom: 48 }}>{th("hero_desc1")}<br />{th("hero_desc2")}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 10 }}>
                <button onClick={() => { const el = document.getElementById("mobile-anchor-content"); if (el && scrollRef.current) scrollRef.current.scrollTo({ top: el.offsetTop - 64, behavior: "smooth" }); }} style={{ fontSize: 12, padding: "14px 18px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white" }}>{th("browse_content")}</button>
                <button onClick={() => { const el = document.getElementById("mobile-anchor-method"); if (el && scrollRef.current) scrollRef.current.scrollTo({ top: el.offsetTop - 64, behavior: "smooth" }); }} style={{ fontSize: 12, padding: "14px 18px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", color: "white" }}>{th("browse_method")}</button>
              </div>
              <div style={{ fontSize: 11, color: "#ccc", marginBottom: 10, letterSpacing: 2 }}>or</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
                <button onClick={() => openMaterialsModal("all", "all")} style={{ fontSize: 12, padding: "14px 32px", borderRadius: 28, border: "1px solid rgba(163,192,255,0.5)", cursor: "pointer", fontWeight: 700, background: "white", color: "#7a50b0" }}>{th("view_all")}</button>
              </div>
              {!isLoggedIn && (
                <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.12),rgba(228,155,253,0.12))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ marginBottom: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#7a50b0" }}>無料でアカウント作成</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openAuth("login")}  style={{ flex: 1, fontSize: 12, padding: "10px 0", borderRadius: 20, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>ログイン</button>
                    <button onClick={() => openAuth("signup")} style={{ flex: 1, fontSize: 12, padding: "10px 0", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>新規登録</button>
                  </div>
                </div>
              )}
            </section>

            {/* 学習内容から探す */}
            <section id="mobile-anchor-content" style={{ padding: "32px 0 24px" }}>
              <div style={{ padding: "0 28px", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 4, fontFamily: "var(--font-libre)" }}>Browse by Content</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>学習内容から探す</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "4px 28px 8px" }}>
                {contentItems.map((item) => (
                  <div key={item.label} onClick={() => { if (!isScrollingRef.current) openMaterialsModal(item.contentId, "all"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: item.color, border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 20 }}>
                      {item.imageSrc ? <img src={item.imageSrc} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : item.char}
                    </div>
                    <span style={{ fontSize: 10, color: "#777", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 学習方法から探す */}
            <section id="mobile-anchor-method" style={{ padding: "24px 0", borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
              <div style={{ padding: "0 28px", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 4, fontFamily: "var(--font-libre)" }}>Browse by Method</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>学習方法から探す</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "4px 28px 8px" }}>
                {methodItems.map((item) => (
                  <div key={item.label} onClick={() => { if (!isScrollingRef.current) openMaterialsModal("all", item.methodId); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
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
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 12 }}>お知らせ</div>
                {announcements.slice(0, 3).map((n) => (
                  <div key={n.id} onClick={() => push({ type: "announcement", announcement: n })} style={{ display: "flex", gap: 12, marginBottom: 10, cursor: "pointer", borderRadius: 8, padding: "4px 6px", margin: "0 -6px 8px" }}>
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
                isMobile={true}
                onCardClick={(mat) => openTeaser(mat)}
                onFavToggle={(mat) => toggleFav(mat, favIds, setFavIds)}
              />
            </section>

            {/* 教材カードタブ */}
            <section style={{ padding: "24px 0 32px", borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
              <div style={{ display: "flex", overflowX: "auto", padding: "0 20px", marginBottom: 16, gap: 0, borderBottom: "0.5px solid #eee", scrollbarWidth: "none" }}>
                {[{ key: "pickup", label: "ピックアップ" }, { key: "recommended", label: "おすすめ" }, { key: "ranking", label: "ランキング" }, { key: "new", label: "新着" }].map(({ key, label }) => (
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
                    <MaterialCard key={mat.id} mat={mat} onClick={() => openTeaser(mat)} locale={locale} isLoggedIn={isLoggedIn} favIds={effectiveFavIds} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={(mat) => toggleFav(mat, favIds, setFavIds)} />
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
                ) : materials.filter(mat => favIds.includes(mat.id)).map((mat) => {
                  const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
                  return <MaterialCard key={mat.id} mat={mat} onClick={() => openTeaser(mat)} locale={locale} isLoggedIn={isLoggedIn} favIds={effectiveFavIds} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={(mat) => toggleFav(mat, favIds, setFavIds)} />;
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
              { icon: "download" as const, label: "ダウンロード履歴", type: "more-dl"       as const },
              { icon: "guide"    as const, label: "よくある質問",     type: "more-guide"    as const },
              { icon: "purchases"as const, label: "教材購入履歴",     type: "more-purchases"as const },
            ].map((item) => (
              <div key={item.label} onClick={() => push({ type: item.type })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "0.5px solid rgba(200,170,240,0.2)", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <BrandIcon name={item.icon} size={20} color="#c9a0f0" />
                  <span style={{ fontSize: 15, color: "#333", fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
              </div>
            ))}

            {/* ダウンロード履歴 */}
            {morePageDl && (
              <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "white", display: "flex", flexDirection: "column" }}>
                <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0, gap: 12 }}>
                  <button onClick={() => pop()} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
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
                    const dlMaterials = materials.filter(mat => dlIds.includes(mat.id));
                    if (dlMaterials.length === 0) return <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}><div style={{ fontSize: 32, marginBottom: 12 }}>↓</div><div style={{ fontSize: 14 }}>ダウンロード履歴はまだありません</div></div>;
                    return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{dlMaterials.map((mat) => { const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale); return <MaterialCard key={mat.id} mat={mat} onClick={() => openTeaser(mat)} locale={locale} isLoggedIn={isLoggedIn} favIds={effectiveFavIds} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={(mat) => toggleFav(mat, favIds, setFavIds)} />; })}</div>;
                  })()}
                </div>
              </div>
            )}

            {/* 教材購入履歴 */}
            {morePagePurchases && (
              <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "white", display: "flex", flexDirection: "column" }}>
                <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0, gap: 12 }}>
                  <button onClick={() => pop()} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
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
                    const purchasedMaterials = materials.filter(mat => purchasedIds.includes(mat.id));
                    if (purchasedMaterials.length === 0) return <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}><BrandIcon name="purchases" size={32} color="#e0d0f0" /><div style={{ fontSize: 14, marginTop: 12 }}>購入した教材はまだありません</div></div>;
                    return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{purchasedMaterials.map((mat) => { const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale); return <MaterialCard key={mat.id} mat={mat} onClick={() => openTeaser(mat)} locale={locale} isLoggedIn={isLoggedIn} favIds={effectiveFavIds} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={(mat) => toggleFav(mat, favIds, setFavIds)} />; })}</div>;
                  })()}
                </div>
              </div>
            )}

            {/* よくある質問 */}
            {morePageGuide && (
              <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "white", display: "flex", flexDirection: "column" }}>
                <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0, gap: 12 }}>
                  <button onClick={() => pop()} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>よくある質問</span>
                </header>
                <div style={{ flex: 1, overflowY: "auto" }}><FaqSection /></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* リーガルページ */}
      {(legalPrivacy || legalTerms || legalTokushoho || legalAbout) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "white", display: "flex", flexDirection: "column" }}>
          <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0, gap: 12 }}>
            <button onClick={() => pop()} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>
              {legalPrivacy ? "プライバシーポリシー" : legalTerms ? "利用規約" : legalTokushoho ? "特定商取引法に基づく表記" : "toolioとは"}
            </span>
          </header>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {legalPrivacy   && <PrivacyContent   onBack={() => pop()} compact notionBody={legalContent?.textContents?.["プライバシーポリシー"]} />}
            {legalTerms     && <TermsContent     onBack={() => pop()} compact notionBody={legalContent?.textContents?.["利用規約"]} />}
            {legalTokushoho && <TokushohoContent onBack={() => pop()} compact notionBody={legalContent?.textContents?.["特定商取引法"]} />}
            {legalAbout     && <AboutContent     onBack={() => pop()} compact notionBody={legalContent?.textContents?.["toolioとは"]} />}
          </div>
        </div>
      )}

      {/* 下部タブバー */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 80, background: "white", borderTop: "0.5px solid rgba(200,170,240,0.25)", display: "flex", alignItems: "center", justifyContent: "space-around", paddingBottom: 16, zIndex: 50 }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id && !materialsEntry;
          return (
            <button key={tab.id} onClick={() => { if (isScrollingRef.current) return; if (tab.id === "materials") { openMaterialsModal("all", "all"); } else { switchTab(tab.id); } }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", padding: "8px 16px" }}>
              {tab.icon(active)}
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#bbb" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── モーダル層 ─────────────────────────────────────── */}

      {/* 教材モーダル（スタックにある間は常にマウント） */}
      {materialsEntry && (
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
          initContent={materialsEntry.filter.content}
          initMethod={materialsEntry.filter.method}
          onFavToggle={(mat) => toggleFav(mat, favIds, setFavIds)}
          onCardClick={(mat) => openTeaser(mat)}
          onClose={() => pop()}
          onTabChange={(tabId) => switchTab(tabId)}
          onOpenMyPage={() => push({ type: "mypage" })}
          onFilterChange={(content, method) => updateMaterialsFilter(content, method)}
        />
      )}

      {/* ティーザーモーダル（スタックにある間は常にマウント） */}
      {teaserEntry && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserEntry.mat as any, locale);
        return (
          <MobileTeaserModal
            mat={teaserEntry.mat as any}
            bg={bg} char={char} charColor={charColor}
            tag={tag} tagBg={tagBg} tagColor={tagColor}
            isLoggedIn={isLoggedIn}
            userPlan={profile.plan ?? "free"}
            purchasedIds={purchasedIds}
            favIds={effectiveFavIds}
            contentTabs={contentTabsForModal}
            methodTabs={methodTabsForModal}
            locale={locale}
            onClose={() => pop()}
            tmm={tmm}
            onFavChange={(materialId, isFav) => {
              if (isFav) setFavIds(prev => [...prev, materialId]);
              else setFavIds(prev => prev.filter(id => id !== materialId));
            }}
            onOpenAuth={openAuth}
            onOpenPlanModal={() => push({ type: "teaser-plan" })}
            onOpenPurchaseConfirm={() => push({ type: "teaser-purchase" })}
          />
        );
      })()}

      {/* お知らせモーダル */}
      {announcementOpen && topModal?.type === "announcement" && (
        <AnnouncementModal
          announcement={topModal.announcement}
          isLoggedIn={isLoggedIn}
          userPlan={profile.plan ?? "free"}
          favIds={effectiveFavIds}
          purchasedIds={purchasedIds}
          locale={locale}
          onClose={() => pop()}
          onFavChange={(materialId, isFav) => {
            if (isFav) setFavIds(prev => [...prev, materialId]);
            else setFavIds(prev => prev.filter(id => id !== materialId));
          }}
          onOpenAuth={openAuth}
          onMaterialClick={(mat) => { pop(); openTeaser(mat as any); }}
        />
      )}

      {/* 認証モーダル */}
      {authModalOpen && topModal?.type === "auth" && (
        <AuthModal
          initialMode={topModal.mode}
          onClose={() => pop()}
          onLoggedIn={() => { pop(); window.location.reload(); }}
        />
      )}

      {/* マイページドロワー */}
      {myPageOpen && (
        <>
          <div onClick={() => pop()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 99 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "80vw", maxWidth: 300, background: "white", zIndex: 100, padding: "0 24px 32px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden" }}>
                {isLoggedIn && avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : isLoggedIn ? userInitial : "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isLoggedIn ? userName : "ゲスト"}</div>
                <div style={{ fontSize: 11, color: "#999" }}>
                  {isLoggedIn ? (
                    <>
                      {profile.plan === "light" ? "ライトプラン" : profile.plan === "standard" ? "スタンダードプラン" : profile.plan === "premium" ? "プレミアムプラン" : "無料プラン"}
                      {profile.cancel_at_period_end && profile.current_period_end && (
                        <span style={{ fontSize: 10, color: "#a04020", display: "block" }}>
                          {new Date(profile.current_period_end).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}まで利用可能
                        </span>
                      )}
                    </>
                  ) : "未登録"}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#555", marginBottom: 8, marginTop: 4 }}>マイページ</div>
            {[
              { icon: "user"    as const, label: "プロフィール",     type: "mypage-profile"  as const },
              { icon: "plan"    as const, label: "プラン確認・変更", type: "mypage-plan"     as const },
              { icon: "billing" as const, label: "支払い履歴",       type: "mypage-billing"  as const },
            ].map((item) => (
              <div key={item.label} onClick={() => push({ type: item.type })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 0", borderBottom: "0.5px solid rgba(200,170,240,0.15)", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <BrandIcon name={item.icon} size={20} color="#c9a0f0" />
                  <span style={{ fontSize: 15, color: "#333" }}>{item.label}</span>
                </div>
                <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <button onClick={switchLanguage} style={{ fontSize: 12, padding: "8px 14px", width: "100%", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 8, background: "rgba(200,170,240,0.06)", color: "#888", cursor: "pointer" }}>
                {locale === "ja" ? "🌐 日本語 / EN" : "🌐 EN / 日本語"}
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 0", marginTop: 16, paddingTop: 16, borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
              {[
                { label: "toolioとは",  type: "legal-about"     as const },
                { label: "利用規約",    type: "legal-terms"     as const },
                { label: "プライバシー",type: "legal-privacy"   as const },
                { label: "特商法",      type: "legal-tokushoho" as const },
              ].map((l, i, arr) => (
                <span key={l.label}>
                  <button onClick={() => push({ type: l.type })} style={{ fontSize: 11, color: "#ccc", background: "none", border: "none", cursor: "pointer", padding: 0 }}>{l.label}</button>
                  {i < arr.length - 1 && <span style={{ fontSize: 11, color: "#ddd", margin: "0 6px" }}>|</span>}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#ccc", marginTop: 6, marginBottom: 16, textAlign: "center" }}>© 2026 toolio</div>
            <div style={{ marginTop: "auto" }}>
              {!isLoggedIn ? (
                <button onClick={() => openAuth("signup")} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>ログイン / 新規登録</button>
              ) : (
                <button onClick={async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.reload(); }} style={{ width: "100%", padding: "14px", borderRadius: 20, border: "0.5px solid #eee", background: "white", color: "#aaa", fontSize: 14, cursor: "pointer" }}>ログアウト</button>
              )}
            </div>
          </div>
        </>
      )}

      {/* マイページサブページ */}
      {mySubPageOpen && mySubPage && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, background: "white", display: "flex", flexDirection: "column" }}>
          <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0, gap: 12 }}>
            <button onClick={() => pop()} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>
              {mySubPage === "profile" ? "プロフィール" : mySubPage === "billing" ? "支払い履歴" : "プラン確認・変更"}
            </span>
          </header>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {mySubPage === "plan" ? (
              <div style={{ padding: "24px 20px 56px" }}>
                <PlanSelector
                  currentPlan={profile?.plan ?? "free"}
                  cancelAtPeriodEnd={profile?.cancel_at_period_end ?? false}
                  currentPeriodEnd={profile?.current_period_end ?? null}
                  isPendingDeletion={profile?.status === "pending_deletion"}
                  onSubscribed={async () => { await loadProfile(); pop(); }}
                />
              </div>
            ) : (
              <MyPage
                activePage={mySubPage === "profile" ? "settings-profile" : "settings-billing"}
                setActivePage={() => {}}
                isLoggedIn={isLoggedIn}
                userInitial={userInitial}
                setUserInitial={setUserInitial}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                userName={userName}
                setUserName={setUserName}
                userEmail={userEmail}
                profile={profile}
                updateProfile={updateProfile}
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
                onPlanChanged={loadProfile}
                onOpenAuth={openAuth}
              />
            )}
          </div>
        </div>
      )}

      {/* teaser内プランモーダル */}
      {teaserPlanOpen && teaserEntry && (
        <PlanModal
          currentPlan={profile.plan ?? "free"}
          requiredPlan={(teaserEntry.mat as any).requiredPlan}
          onSubscribed={() => pop()}
          onClose={() => pop()}
        />
      )}

      {/* teaser内購入確認モーダル */}
      {teaserPurchaseOpen && teaserEntry && (
        <PurchaseConfirmModal
          mat={teaserEntry.mat as any}
          onSuccess={() => pop()}
          onClose={() => pop()}
        />
      )}
    </div>
  );
}

export default function MobileHome() {
  return (
    <Suspense>
      <MobileHomeInner />
    </Suspense>
  );
}
