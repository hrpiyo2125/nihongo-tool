"use client";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
import { useAuth } from "./AuthContext";
import { useDesktopUI } from "@/components/DesktopUIProvider";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import TeaserModal from "./TeaserModal";
import AnnouncementModal from "./AnnouncementModal";
import MaterialCard from "./MaterialCard";
import MaterialsModal from "./MaterialsModal";
import UserMenuPopup from "./UserMenuPopup";
import GuestLoginPopup from "./GuestLoginPopup";
import AuthModal, { AuthModalMode } from "../../components/AuthModal";
import { contentTabLabels, methodTabLabels } from "../../lib/tabs";
import { getCardStyle } from "../../lib/materialUtils";
import { FaqSection } from "./TroubleGuide";
import MyPage from "./MyPage";
import { PrivacyContent, TermsContent, TokushohoContent, FaqContent, AboutContent } from "./LegalPagesContent";
import PersonalizedSection from "./PersonalizedSection";
import IconItem from "./IconItem";

type Material = {
  id: string; title: string; description: string; level: string[];
  content: string[]; method: string[]; ageGroup: string; requiredPlan: string;
  pdfFile?: string; isPickup: boolean; isRecommended: boolean;
  ranking: number | null; isNew: boolean;
  bg?: string; char?: string; charColor?: string;
  tag?: string; tagBg?: string; tagColor?: string;
  [key: string]: unknown;
};

type NavItem = {
  id: string; label: string;
  icon: (id: string, active: boolean) => React.ReactNode;
  badge?: number;
};

const ACTIVE_COLOR = "#7a50b0";

function DesktopHomeInner({ materials }: { materials: Material[] }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');
  const th = useTranslations('home');
  const tm = useTranslations('mypage');
  const tmm = useTranslations('materials_modal');
  const pathname = usePathname();
  const cl = contentTabLabels[locale] ?? contentTabLabels.ja;
  const ml = methodTabLabels[locale] ?? methodTabLabels.ja;

  const navItems: NavItem[] = [
    { id: "home", label: t("home"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M9 22V12h6v10" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
    { id: "materials", label: t("materials"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /><rect x="14" y="3" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /><rect x="3" y="14" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /><rect x="14" y="14" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
    { id: "dl", label: t("dl"), badge: 3, icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M7 11l5 5 5-5" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M4 20h16" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
    { id: "purchases", label: t("purchases"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M2 10h20" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M6 15h4" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M14 15h4" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
    { id: "fav", label: t("fav"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
    { id: "guide", label: t("guide"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={active ? ACTIVE_COLOR : "#bbb"} /><circle cx="12" cy="17" r="0.8" fill={active ? ACTIVE_COLOR : "#bbb"} strokeWidth="0" /></svg>) },
  ];

  const contentTabs = [
    { id: "all", label: cl.all, char: "✦", color: "#e8efff", imageSrc: "/contents/14_all.png" },
    { id: "hiragana", label: cl.hiragana, char: "あ", color: "#e8efff", imageSrc: "/contents/12_hiragana.png" },
    { id: "katakana", label: cl.katakana, char: "ア", color: "#f0e8ff", imageSrc: "/contents/4_kanakana.png" },
    { id: "kanji", label: cl.kanji, char: "字", color: "#ffe8f4", imageSrc: "/contents/3_kanji.png" },
    { id: "joshi", label: cl.joshi, char: "は", color: "#fff0ec", imageSrc: "/contents/5_joshi.png" },
    { id: "kaiwa", label: cl.kaiwa, char: "話", color: "#f8e8ff", imageSrc: "/contents/8_kaiwa.png" },
    { id: "season", label: cl.season, char: "季", color: "#e8efff", imageSrc: "/contents/17_season.png" },
    { id: "food", label: cl.food, char: "🍎", color: "#fff0e8", imageSrc: "/contents/15_food.png" },
    { id: "animal", label: cl.animal, char: "🐾", color: "#e8f8ee", imageSrc: "/contents/1_animal.png" },
    { id: "body", label: cl.body, char: "💪", color: "#ffe8f4", imageSrc: "/contents/9_body.png" },
    { id: "color", label: cl.color, char: "🔵", color: "#f0e8ff", imageSrc: "/contents/18_color.png" },
    { id: "number", label: cl.number, char: "数", color: "#e8f8ff", imageSrc: "/contents/13_number.png" },
    { id: "adjective", label: cl.adjective, char: "い", color: "#fff8e0", imageSrc: "/contents/2_keiyoushi.png" },
    { id: "verb", label: cl.verb, char: "動", color: "#e8f8ee", imageSrc: "/contents/6_doushi.png" },
    { id: "conjunction", label: cl.conjunction, char: "接", color: "#f0e8ff", imageSrc: "/contents/10_setsuzokushi.png" },
    { id: "grammar", label: cl.grammar, char: "文", color: "#f0ffe8", imageSrc: "/contents/16_bunpo.png" },
    { id: "familiar", label: cl.familiar, char: "🏠", color: "#e8efff", imageSrc: "/contents/7_mijika.png" },
    { id: "kotoba", label: cl.kotoba, char: "語", color: "#fff0e8", imageSrc: "/contents/19_word.png" },
    { id: "vegefruit", label: cl.vegefruit, char: "🥦", color: "#e8f8ee", imageSrc: "/contents/11_yasai.png" },
    { id: "myself", label: cl.myself, char: "👤", color: "#e8efff", imageSrc: "/contents/myself.png" },
  ];

  const methodTabs: { id: string; label: string; char: string; imageSrc: string | null }[] = [
    { id: "all", label: ml.all, char: "✦", imageSrc: "/contents/14_all.png" },
    { id: "drill", label: ml.drill, char: "✏", imageSrc: "/method/10_drill.png" },
    { id: "test", label: ml.test, char: "✓", imageSrc: "/method/13_test.png" },
    { id: "card", label: ml.card, char: "🃏", imageSrc: "/method/9_card.png" },
    { id: "nurie", label: ml.nurie, char: "◎", imageSrc: "/method/2_nurie.png" },
    { id: "roleplay", label: ml.roleplay, char: "🎭", imageSrc: "/method/6_roleplay.png" },
    { id: "bingo", label: ml.bingo, char: "🎯", imageSrc: "/method/12_bingo.png" },
    { id: "interview", label: ml.interview, char: "🎤", imageSrc: "/method/4_interview.png" },
    { id: "presentation", label: ml.presentation, char: "📊", imageSrc: "/method/presentation.png" },
    { id: "sentence", label: ml.sentence, char: "文", imageSrc: "/method/5_sentense.png" },
    { id: "essay", label: ml.essay, char: "✍", imageSrc: "/method/1_sakubun.png" },
    { id: "check", label: ml.check, char: "✓", imageSrc: "/method/3_checklist.png" },
    { id: "sugoroku", label: ml.sugoroku, char: "🎲", imageSrc: "/method/7_sugoroku.png" },
    { id: "poster", label: ml.poster, char: "📄", imageSrc: "/method/8_poster.png" },
  ];

  const contentItems = [
    { label: cl.hiragana, char: "あ", color: "#e8efff", imageSrc: "/contents/12_hiragana.png", contentId: "hiragana" },
    { label: cl.katakana, char: "ア", color: "#f0e8ff", imageSrc: "/contents/4_kanakana.png", contentId: "katakana" },
    { label: cl.kanji, char: "字", color: "#ffe8f4", imageSrc: "/contents/3_kanji.png", contentId: "kanji" },
    { label: cl.joshi, char: "は", color: "#fff0ec", imageSrc: "/contents/5_joshi.png", contentId: "joshi" },
    { label: cl.kaiwa, char: "話", color: "#f8e8ff", imageSrc: "/contents/8_kaiwa.png", contentId: "kaiwa" },
    { label: cl.season, char: "季", color: "#e8efff", imageSrc: "/contents/17_season.png", contentId: "season" },
    { label: cl.food, char: "🍎", color: "#fff0e8", imageSrc: "/contents/15_food.png", contentId: "food" },
    { label: cl.animal, char: "🐾", color: "#e8f8ee", imageSrc: "/contents/1_animal.png", contentId: "animal" },
    { label: cl.body, char: "💪", color: "#ffe8f4", imageSrc: "/contents/9_body.png", contentId: "body" },
    { label: cl.color, char: "🔵", color: "#f0e8ff", imageSrc: "/contents/18_color.png", contentId: "color" },
    { label: cl.number, char: "数", color: "#e8f8ff", imageSrc: "/contents/13_number.png", contentId: "number" },
    { label: cl.adjective, char: "い", color: "#fff8e0", imageSrc: "/contents/2_keiyoushi.png", contentId: "adjective" },
    { label: cl.verb, char: "動", color: "#e8f8ee", imageSrc: "/contents/6_doushi.png", contentId: "verb" },
    { label: cl.conjunction, char: "接", color: "#f0e8ff", imageSrc: "/contents/10_setsuzokushi.png", contentId: "conjunction" },
    { label: cl.grammar, char: "文", color: "#f0ffe8", imageSrc: "/contents/16_bunpo.png", contentId: "grammar" },
    { label: cl.familiar, char: "🏠", color: "#e8efff", imageSrc: "/contents/7_mijika.png", contentId: "familiar" },
    { label: cl.kotoba, char: "語", color: "#fff0e8", imageSrc: "/contents/19_word.png", contentId: "kotoba" },
    { label: cl.vegefruit, char: "🥦", color: "#e8f8ee", imageSrc: "/contents/11_yasai.png", contentId: "vegefruit" },
    { label: cl.myself, char: "👤", color: "#e8efff", imageSrc: "/contents/myself.png", contentId: "myself" },
    { label: locale === "ja" ? "もっと見る" : "More", char: "›", color: "#f8f4ff", isMore: true, contentId: "all" },
  ];

  const methodItems = [
    { label: ml.drill, char: "✏", color: "#e8efff", imageSrc: "/method/10_drill.png", methodId: "drill" },
    { label: ml.test, char: "✓", color: "#f0e8ff", imageSrc: "/method/13_test.png", methodId: "test" },
    { label: ml.card, char: "🃏", color: "#ffe8f4", imageSrc: "/method/9_card.png", methodId: "card" },
    { label: ml.nurie, char: "◎", color: "#fff0ec", imageSrc: "/method/2_nurie.png", methodId: "nurie" },
    { label: ml.roleplay, char: "🎭", color: "#f8e8ff", imageSrc: "/method/6_roleplay.png", methodId: "roleplay" },
    { label: ml.bingo, char: "🎯", color: "#e8efff", imageSrc: "/method/12_bingo.png", methodId: "bingo" },
    { label: ml.interview, char: "🎤", color: "#fff8e0", imageSrc: "/method/4_interview.png", methodId: "interview" },
    { label: ml.presentation, char: "📊", color: "#e8efff", imageSrc: "/method/presentation.png", methodId: "presentation" },
    { label: ml.sentence, char: "文", color: "#f0ffe8", imageSrc: "/method/5_sentense.png", methodId: "sentence" },
    { label: ml.essay, char: "✍", color: "#fff0ec", imageSrc: "/method/1_sakubun.png", methodId: "essay" },
    { label: ml.check, char: "✓", color: "#e8f8ee", imageSrc: "/method/3_checklist.png", methodId: "check" },
    { label: ml.sugoroku, char: "🎲", color: "#f0e8ff", imageSrc: "/method/7_sugoroku.png", methodId: "sugoroku" },
    { label: ml.poster, char: "📄", color: "#e8f8ff", imageSrc: "/method/8_poster.png", methodId: "poster" },
    { label: locale === "ja" ? "もっと見る" : "More", char: "›", color: "#f8f4ff", isMore: true, methodId: "all" },
  ];

  const { isLoggedIn, userId, userEmail, userName, userInitial, avatarUrl, profile, authProviders,
    favIds: topFavIds, favIdsLoaded: topFavIdsLoaded, dlIds: topDlIds,
    purchasedIds, loadProfile,
    setFavIds: setTopFavIds, setUserName, setUserInitial, setAvatarUrl, updateProfile } = useAuth();

  const { sbOpen, setSbOpen, activePage, setActivePage: _setActivePage } = useDesktopUI();
  const setActivePage = (page: string) => {
    console.log('[setActivePage]', page, new Error().stack);
    _setActivePage(page);
  };
  const [activeTab, setActiveTab] = useState("pickup");
  const [modal, setModal] = useState<{ content: string; method: string } | null>(null);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; date: string; type: string; material_id: string | null }[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{ id: string; title: string; date: string; type: string; material_id: string | null } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("signup");
  const [topTeaserMat, setTopTeaserMat] = useState<Material | null>(null);
  const effectiveFavIds = (!profile.plan || profile.plan === "free") ? topFavIds.slice(0, 5) : topFavIds;
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [legalContent, setLegalContent] = useState<{ textContents: Record<string, string>; faqs: { question: string; answer: string; category: string }[] } | null>(null);
  const userIconRef = useRef<HTMLDivElement | null>(null);

  // URLパラメータからフィルターを読み込んでモーダルを自動オープン
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const content = params.get("content");
    const method = params.get("method");
    if (content || method) setModal({ content: content ?? "all", method: method ?? "all" });
  }, []);

  useEffect(() => {
    fetch("/api/announcements").then(r => r.json()).then(d => setAnnouncements(Array.isArray(d) ? d : []));
    fetch("/api/legal-content").then(r => r.json()).then(d => setLegalContent(d));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { page } = (e as CustomEvent).detail;
      setActivePage(page);
      setTopTeaserMat(null);
      setModal(null);
      document.getElementById("main-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("toolio:navigate-mypage", handler);
    return () => window.removeEventListener("toolio:navigate-mypage", handler);
  }, []);

  const switchLanguage = () => {
    const nextLocale = locale === 'ja' ? 'en' : 'ja';
    router.push(`/${nextLocale}${pathname.replace(`/${locale}`, '') || '/'}`);
  };

  const openModal = (content = "all", method = "all") => {
    setModal({ content, method });
    handleFilterChange(content, method);
  };
  const closeModal = () => { setModal(null); window.history.replaceState(null, "", window.location.pathname); };

  const handleFilterChange = (content: string, method: string) => {
    const params = new URLSearchParams();
    if (content !== "all") params.set("content", content);
    if (method !== "all") params.set("method", method);
    const q = params.toString();
    window.history.replaceState(null, "", q ? `${window.location.pathname}?${q}` : window.location.pathname);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    const container = document.getElementById("main-scroll");
    if (el && container) container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  const SB_CLOSED = 72;
  const SB_OPEN = 300;
  const navSections = [
    { section: t("main"), items: navItems.slice(0, 2) },
    { section: t("mypage"), items: navItems.slice(2, 5) },
    { section: t("service"), items: navItems.slice(5) },
  ];

  const toggleFav = async (mat: Material) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (topFavIds.includes(mat.id)) {
      await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
      setTopFavIds(prev => prev.filter(id => id !== mat.id));
      window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
    } else {
      await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
      setTopFavIds(prev => [...prev, mat.id]);
      window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8f4f4", overflow: "hidden", position: "relative" }}>
      <aside style={{ width: sbOpen ? SB_OPEN : SB_CLOSED, transition: "width 0.22s ease", background: "transparent", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "visible", zIndex: 10 }}>
        <nav aria-label="サイト内リンク" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
          <Link href="/faq">よくある質問</Link>
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/tokushoho">特定商取引法に基づく表示</Link>
        </nav>
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
        <div className="toolio-scroll-y" style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {navSections.map(({ section, items }) => (
            <div key={section}>
              {sbOpen && <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#c0a0a0", padding: "8px 18px 3px", whiteSpace: "nowrap" }}>{section}</div>}
              {items.map((item) => (
                <div key={item.id} onClick={() => { if (item.id === "materials") { openModal("all", "all"); } else { setActivePage(item.id); } }} style={{ display: "flex", alignItems: "center", gap: 12, padding: sbOpen ? "9px 14px" : "9px 0", justifyContent: sbOpen ? "flex-start" : "center", cursor: "pointer", borderRadius: 10, margin: sbOpen ? "1px 8px" : "1px 4px", whiteSpace: "nowrap", background: "transparent" }}>
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
          {guestMenuOpen && !isLoggedIn && (
            <>
              <div onClick={() => setGuestMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
              <GuestLoginPopup userIconRef={userIconRef} onClose={() => setGuestMenuOpen(false)} onOpenAuth={(mode) => { setGuestMenuOpen(false); setAuthModalMode(mode); setAuthModalOpen(true); }} sbOpen={sbOpen} />
            </>
          )}
          {userMenuOpen && isLoggedIn && (
            <>
              <div onClick={() => setUserMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
              <UserMenuPopup userIconRef={userIconRef} userInitial={userInitial} avatarUrl={avatarUrl} userName={userName} onClose={() => setUserMenuOpen(false)} onNavigate={(page) => { setUserMenuOpen(false); setActivePage(page); }} onRouterPush={(href) => { setUserMenuOpen(false); router.push(href); }} onLogout={async () => { setUserMenuOpen(false); await createClient().auth.signOut(); window.location.reload(); }} sbOpen={sbOpen} userPlan={profile.plan ?? "free"} cancelAtPeriodEnd={profile.cancel_at_period_end ?? false} currentPeriodEnd={profile.current_period_end ?? null} tm={tm} />
            </>
          )}
          <div ref={userIconRef} onClick={() => { if (!isLoggedIn) { setGuestMenuOpen(!guestMenuOpen); } else { setUserMenuOpen(!userMenuOpen); } }} style={{ display: "flex", alignItems: "center", gap: 8, padding: sbOpen ? "6px 10px" : "6px 0", justifyContent: sbOpen ? "flex-start" : "center", borderRadius: 10, cursor: "pointer", background: userMenuOpen ? "rgba(163,192,255,0.1)" : "transparent" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden" }}>
              {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userInitial}
            </div>
            {sbOpen && <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", whiteSpace: "nowrap" }}>{isLoggedIn ? userName : "ゲスト"}</div><div style={{ fontSize: 11, color: "#999" }}>{isLoggedIn ? (<>{profile.plan === "light" ? "ライトプラン" : profile.plan === "standard" ? "スタンダードプラン" : profile.plan === "premium" ? "プレミアムプラン" : "無料プラン"}{profile.cancel_at_period_end && profile.current_period_end && <span style={{ fontSize: 10, color: "#a04020", display: "block" }}>{new Date(profile.current_period_end).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}まで利用可能</span>}</>) : "未登録"}</div>
            </div>}
            {sbOpen && isLoggedIn && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>}
          </div>
          <div style={{ display: "flex", justifyContent: sbOpen ? "stretch" : "center", marginTop: 4 }}>
            <button onClick={switchLanguage} style={{ fontSize: sbOpen ? 11 : 14, padding: sbOpen ? "5px 10px" : "5px 6px", width: sbOpen ? "100%" : "auto", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 8, background: "rgba(255,255,255,0.4)", color: "#888", cursor: "pointer" }}>
              {sbOpen ? (locale === 'ja' ? "🌐 日本語 / EN" : "🌐 EN / 日本語") : "🌐"}
            </button>
          </div>
          {sbOpen && (
            <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "10px 0 4px", flexWrap: "wrap" }}>
              {[["about", "toolioとは"], ["terms", "利用規約"], ["privacy", "プライバシー"], ["tokushoho", "特商法"]].map(([page, label], i, arr) => (
                <span key={page}><button onClick={() => setActivePage(page)} style={{ fontSize: 11, color: "#ccc", background: "none", border: "none", cursor: "pointer", padding: 0 }}>{label}</button>{i < arr.length - 1 && <span style={{ fontSize: 11, color: "#ddd", marginLeft: 10 }}>|</span>}</span>
              ))}
            </div>
          )}
          <div style={{ textAlign: "center", padding: "2px 0 8px", fontSize: 11, color: "#ccc" }}>© 2026 toolio</div>
        </div>
      </aside>

      <main id="main-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0, background: "white", borderRadius: "16px 16px 0 0", margin: "12px 12px 0 0", boxShadow: "0 -4px 24px rgba(200,150,150,0.15)" }}>
        {activePage === "home" && (
          <>
            <section style={{ padding: "160px 48px 60px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 10%, rgba(255,255,255,1) 28%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
              <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.55)", textTransform: "uppercase", marginBottom: 18, fontFamily: "var(--font-libre)" }}>{th("hero_sub")}</p>
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#7a50b0" }}>無料でアカウント作成 →</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setAuthModalMode("login"); setAuthModalOpen(true); }} style={{ fontSize: 12, padding: "7px 28px", borderRadius: 20, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>ログイン</button>
                    <button onClick={() => { setAuthModalMode("signup"); setAuthModalOpen(true); }} style={{ fontSize: 12, padding: "7px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>新規登録</button>
                  </div>
                </div>
              )}
            </section>

            <section id="anchor-content" suppressHydrationWarning style={{ padding: "80px 0 72px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", background: "white", textAlign: "center" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", fontFamily: "var(--font-libre)" }}>Browse by Content</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>{th("browse_content_label")}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 16, flexWrap: "wrap", padding: "0 32px" }}>
                {contentItems.map((item) => <IconItem key={item.label} item={item} onClick={() => openModal(item.contentId ?? "all", "all")} />)}
              </div>
            </section>

            <section id="anchor-method" suppressHydrationWarning style={{ padding: "80px 0 72px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", background: "white", textAlign: "center" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", fontFamily: "var(--font-libre)" }}>Browse by Method</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>{th("browse_method_label")}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 16, flexWrap: "wrap", padding: "0 32px" }}>
                {methodItems.map((item) => <IconItem key={item.label} item={item} onClick={() => openModal("all", item.methodId ?? "all")} />)}
              </div>
            </section>

            <section style={{ padding: "80px 36px 152px", flex: 1, background: "white" }}>
              <div style={{ background: "#fafafa", border: "0.5px solid #eee", borderRadius: 12, padding: "18px 22px", marginBottom: 152 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 12 }}>{th("notice")}</div>
                {announcements.length === 0 ? <div style={{ fontSize: 13, color: "#bbb" }}>お知らせはありません</div> : announcements.map((n) => (
                  <div key={n.id} onClick={() => setSelectedAnnouncement(n)} style={{ display: "flex", gap: 16, cursor: "pointer", borderRadius: 8, padding: "4px 6px", margin: "0 -6px 6px", transition: "background 0.15s" }} onMouseEnter={e => (e.currentTarget.style.background = "#f5f0ff")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ fontSize: 13, color: "#bbb", minWidth: 88, flexShrink: 0 }}>{n.date}</span>
                    <span style={{ fontSize: 13, color: "#444", flex: 1 }}>{n.title}</span>
                    <span style={{ fontSize: 11, color: "#b48be8", flexShrink: 0 }}>›</span>
                  </div>
                ))}
              </div>
              <PersonalizedSection materials={materials as any} favIds={effectiveFavIds} dlIds={topDlIds} favIdsLoaded={topFavIdsLoaded} userId={userId} userPlan={profile.plan ?? "free"} isLoggedIn={isLoggedIn} purchasedIds={purchasedIds} locale={locale} onCardClick={(mat) => setTopTeaserMat(mat as any)} onFavToggle={toggleFav as any} onPlanChanged={loadProfile} />
              <div style={{ display: "flex", borderBottom: "0.5px solid #eee", marginBottom: 24, marginTop: 152 }}>
                {[{ key: "pickup", label: th("pickup") }, { key: "recommended", label: th("recommended") }, { key: "ranking", label: th("ranking") }, { key: "new", label: th("new") }].map(({ key, label }) => (
                  <button key={key} onClick={() => setActiveTab(key)} style={{ fontSize: 14, padding: "10px 20px", background: "transparent", border: "none", borderBottom: activeTab === key ? "2px solid #9b6ed4" : "2px solid transparent", color: activeTab === key ? "#9b6ed4" : "#bbb", cursor: "pointer", fontWeight: 600, marginBottom: -0.5 }}>
                    {label}{key === "new" && <span style={{ fontSize: 10, fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", padding: "2px 6px", borderRadius: 8, marginLeft: 4 }}>NEW</span>}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
                {materials.filter(mat => {
                  if (activeTab === "pickup") return mat.isPickup;
                  if (activeTab === "recommended") return mat.isRecommended;
                  if (activeTab === "ranking") return mat.ranking !== null;
                  if (activeTab === "new") return mat.isNew;
                  return true;
                }).sort((a, b) => activeTab === "ranking" ? (a.ranking ?? 999) - (b.ranking ?? 999) : 0).slice(0, 8).map((mat) => {
                  const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat as any, locale);
                  return <MaterialCard key={mat.id} mat={mat as any} onClick={() => setTopTeaserMat(mat)} locale={locale} isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"} favIds={effectiveFavIds} purchasedIds={purchasedIds} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={toggleFav as any} />;
                })}
              </div>
            </section>
          </>
        )}

        {activePage !== "home" && (
          activePage === "guide" ? <FaqSection /> :
          activePage === "privacy" ? <PrivacyContent onBack={() => setActivePage("home")} notionBody={legalContent?.textContents?.['プライバシーポリシー']} /> :
          activePage === "terms" ? <TermsContent onBack={() => setActivePage("home")} notionBody={legalContent?.textContents?.['利用規約']} /> :
          activePage === "tokushoho" ? <TokushohoContent onBack={() => setActivePage("home")} notionBody={legalContent?.textContents?.['特定商取引法']} /> :
          activePage === "faq" ? <FaqContent onBack={() => setActivePage("home")} notionFaqs={legalContent?.faqs} /> :
          activePage === "about" ? <AboutContent onBack={() => setActivePage("home")} notionBody={legalContent?.textContents?.['toolioとは']} /> :
          <MyPage activePage={activePage} setActivePage={setActivePage} isLoggedIn={isLoggedIn} userInitial={userInitial} setUserInitial={setUserInitial} avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} userName={userName} setUserName={setUserName} userEmail={userEmail} authProviders={authProviders} profile={profile} updateProfile={updateProfile} editingField={editingField} setEditingField={setEditingField} editingValue={editingValue} setEditingValue={setEditingValue} materials={materials as any} contentTabs={contentTabs} methodTabs={methodTabs} locale={locale} tmm={tmm} tm={tm} navItems={navItems} onPlanChanged={loadProfile} onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }} />
        )}
      </main>

      {topTeaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(topTeaserMat as any, locale);
        return <TeaserModal mat={topTeaserMat as any} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"} favIds={topFavIds} purchasedIds={purchasedIds} contentTabs={contentTabs} methodTabs={methodTabs} locale={locale} tmm={tmm} onClose={() => setTopTeaserMat(null)} onFavChange={(id, isFav) => { if (isFav) setTopFavIds(p => [...p, id]); else setTopFavIds(p => p.filter(x => x !== id)); }} onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }} />;
      })()}

      {selectedAnnouncement && <AnnouncementModal announcement={selectedAnnouncement} isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"} favIds={topFavIds} purchasedIds={purchasedIds} locale={locale} onClose={() => setSelectedAnnouncement(null)} onFavChange={(id, isFav) => { if (isFav) setTopFavIds(p => [...p, id]); else setTopFavIds(p => p.filter(x => x !== id)); }} onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }} />}

      {modal && <MaterialsModal initContent={modal.content} initMethod={modal.method} onClose={closeModal} isLoggedIn={isLoggedIn} materials={materials as any} tmm={tmm} contentTabs={contentTabs} methodTabs={methodTabs} locale={locale} userPlan={profile.plan ?? "free"} purchasedIds={purchasedIds} onFavToggle={toggleFav as any} onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }} onFilterChange={handleFilterChange} />}

      {authModalOpen && <AuthModal initialMode={authModalMode} onClose={() => setAuthModalOpen(false)} onLoggedIn={() => setAuthModalOpen(false)} />}
    </div>
  );
}

export default function DesktopHome({ materials }: { materials: unknown[] }) {
  return <DesktopHomeInner materials={materials as Material[]} />;
}
