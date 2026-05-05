"use client";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
import { useAuth } from "./AuthContext";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import AuthModal from "../../components/AuthModal";
import AnnouncementModal from "./AnnouncementModal";
import MaterialCard from "./MaterialCard";
import TeaserModal from "./TeaserModal";
import { contentTabLabels, methodTabLabels, getContentTabs, getMethodTabs } from "../../lib/tabs";
import { getCardStyle } from "../../lib/materialUtils";
import PersonalizedSection from "./PersonalizedSection";
import IconItem from "./IconItem";

type Material = {
  id: string; title: string; description: string;
  level: string[]; content: string[]; method: string[];
  ageGroup: string; requiredPlan: string; pdfFile?: string;
  isPickup: boolean; isRecommended: boolean; ranking: number | null; isNew: boolean;
};

export default function HomePage() {
  const locale = useLocale();
  const router = useRouter();
  const th = useTranslations("home");
  const tmm = useTranslations("materials_modal");

  const { isLoggedIn, userId, profile,
          favIds, favIdsLoaded, dlIds, purchasedIds, loadProfile,
          setFavIds } = useAuth();

  const cl = contentTabLabels[locale] ?? contentTabLabels.ja;
  const ml = methodTabLabels[locale] ?? methodTabLabels.ja;
  const contentTabs = getContentTabs(cl);
  const methodTabs = getMethodTabs(ml);
  const effectiveFavIds = (!profile.plan || profile.plan === "free") ? favIds.slice(0, 5) : favIds;

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; date: string; type: string; material_id: string | null }[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{ id: string; title: string; date: string; type: string; material_id: string | null } | null>(null);
  const [activeTab, setActiveTab] = useState("pickup");
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("signup");

  useEffect(() => {
    fetch("/api/materials")
      .then(r => r.json())
      .then(data => { setMaterials(Array.isArray(data) ? data : []); setMaterialsLoading(false); })
      .catch(() => setMaterialsLoading(false));
    fetch("/api/announcements")
      .then(r => r.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []));
  }, []);

  const toggleFav = async (mat: Material) => {
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
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    const container = document.getElementById("main-scroll");
    if (el && container) container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

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
    { label: locale === "ja" ? "もっと見る" : "More", char: "›", color: "#f8f4ff", isMore: true, contentId: "all" },
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
    { label: locale === "ja" ? "もっと見る" : "More", char: "›", color: "#f8f4ff", isMore: true, methodId: "all" },
  ];

  const filteredMaterials = materials.filter(mat => {
    if (activeTab === "pickup")      return mat.isPickup;
    if (activeTab === "recommended") return mat.isRecommended;
    if (activeTab === "ranking")     return mat.ranking !== null;
    if (activeTab === "new")         return mat.isNew;
    return true;
  }).sort((a, b) => activeTab === "ranking" ? (a.ranking ?? 999) - (b.ranking ?? 999) : 0);

  return (
    <>
      {/* ─── デスクトップ版ホーム ─── */}
      <div className="hidden md:block">
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
            <Link href={`/${locale}/materials`} style={{ fontSize: 15, padding: "14px 48px", borderRadius: 28, border: "1px solid rgba(163,192,255,0.5)", cursor: "pointer", fontWeight: 700, background: "white", color: "#7a50b0", textDecoration: "none" }}>{th("view_all")}</Link>
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

        <section id="anchor-content" style={{ padding: "80px 0 72px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", background: "white", textAlign: "center" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", fontFamily: "var(--font-libre)" }}>Browse by Content</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>{th("browse_content_label")}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 16, flexWrap: "wrap", padding: "0 32px" }}>
            {contentItems.map(item => (
              <IconItem key={item.label} item={item} onClick={() => router.push(`/${locale}/materials?content=${item.contentId ?? "all"}&method=all`)} />
            ))}
          </div>
        </section>

        <section id="anchor-method" style={{ padding: "80px 0 72px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", background: "white", textAlign: "center" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", fontFamily: "var(--font-libre)" }}>Browse by Method</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>{th("browse_method_label")}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 16, flexWrap: "wrap", padding: "0 32px" }}>
            {methodItems.map(item => (
              <IconItem key={item.label} item={item} onClick={() => router.push(`/${locale}/materials?content=all&method=${item.methodId ?? "all"}`)} />
            ))}
          </div>
        </section>

        <section style={{ padding: "80px 36px 152px", flex: 1, background: "white" }}>
          <div style={{ background: "#fafafa", border: "0.5px solid #eee", borderRadius: 12, padding: "18px 22px", marginBottom: 152 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 12 }}>{th("notice")}</div>
            {announcements.length === 0 ? (
              <div style={{ fontSize: 13, color: "#bbb" }}>お知らせはありません</div>
            ) : announcements.map(n => (
              <div key={n.id} onClick={() => setSelectedAnnouncement(n)} style={{ display: "flex", gap: 16, marginBottom: 8, cursor: "pointer", borderRadius: 8, padding: "4px 6px", margin: "0 -6px 6px" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5f0ff")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 13, color: "#bbb", minWidth: 88, flexShrink: 0 }}>{n.date}</span>
                <span style={{ fontSize: 13, color: "#444", flex: 1 }}>{n.title}</span>
                <span style={{ fontSize: 11, color: "#b48be8", flexShrink: 0 }}>›</span>
              </div>
            ))}
          </div>
          <PersonalizedSection
            materials={materials} favIds={effectiveFavIds} dlIds={dlIds}
            favIdsLoaded={favIdsLoaded} userId={userId} userPlan={profile.plan ?? "free"}
            isLoggedIn={isLoggedIn} purchasedIds={purchasedIds} locale={locale}
            onCardClick={mat => setTeaserMat(mat)}
            onFavToggle={toggleFav}
            onPlanChanged={loadProfile}
          />
          <div style={{ display: "flex", borderBottom: "0.5px solid #eee", marginBottom: 24, marginTop: 152 }}>
            {[{ key: "pickup", label: th("pickup") }, { key: "recommended", label: th("recommended") }, { key: "ranking", label: th("ranking") }, { key: "new", label: th("new") }].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{ fontSize: 14, padding: "10px 20px", background: "transparent", border: "none", borderBottom: activeTab === key ? "2px solid #9b6ed4" : "2px solid transparent", color: activeTab === key ? "#9b6ed4" : "#bbb", cursor: "pointer", fontWeight: 600, marginBottom: -0.5 }}>
                {label}{key === "new" && <span style={{ fontSize: 10, fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", padding: "2px 6px", borderRadius: 8, marginLeft: 4 }}>NEW</span>}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {materialsLoading ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white" }}>
                <div className="skeleton" style={{ height: 120 }} />
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="skeleton" style={{ height: 13, width: "75%" }} />
                  <div className="skeleton" style={{ height: 11, width: "50%" }} />
                </div>
              </div>
            )) : filteredMaterials.slice(0, 8).map(mat => {
              const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
              return (
                <MaterialCard key={mat.id} mat={mat} onClick={() => setTeaserMat(mat)} locale={locale}
                  isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"} favIds={effectiveFavIds}
                  purchasedIds={purchasedIds} bg={bg} char={char} charColor={charColor}
                  tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={toggleFav} />
              );
            })}
          </div>
        </section>
      </div>

      {/* ─── モバイル版ホーム ─── */}
      <div className="block md:hidden">
        <section style={{ padding: "40px 32px 48px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 10%, rgba(255,255,255,1) 28%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
          <p style={{ fontSize: 8, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 18, fontFamily: "var(--font-libre)" }}>Japanese Learning Tools For Kids</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.6, marginBottom: 14, textAlign: "center", whiteSpace: "pre-line", background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "var(--font-libre)" }}>{th("hero_title")}</h1>
          <p style={{ fontSize: 11, color: "#999", lineHeight: 1.8, marginBottom: 48 }}>{th("hero_desc1")}<br />{th("hero_desc2")}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 10 }}>
            <button onClick={() => { const el = document.getElementById("mobile-anchor-content"); el?.scrollIntoView({ behavior: "smooth", block: "start" }); }} style={{ fontSize: 12, padding: "14px 18px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white" }}>{th("browse_content")}</button>
            <button onClick={() => { const el = document.getElementById("mobile-anchor-method"); el?.scrollIntoView({ behavior: "smooth", block: "start" }); }} style={{ fontSize: 12, padding: "14px 18px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", color: "white" }}>{th("browse_method")}</button>
          </div>
          <div style={{ fontSize: 11, color: "#ccc", marginBottom: 10, letterSpacing: 2 }}>or</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
            <Link href={`/${locale}/materials`} style={{ fontSize: 12, padding: "14px 32px", borderRadius: 28, border: "1px solid rgba(163,192,255,0.5)", cursor: "pointer", fontWeight: 700, background: "white", color: "#7a50b0", textDecoration: "none" }}>{th("view_all")}</Link>
          </div>
          {!isLoggedIn && (
            <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.12),rgba(228,155,253,0.12))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 14, padding: "16px 20px" }}>
              <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: "#7a50b0" }}>無料でアカウント作成</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setAuthModalMode("login"); setAuthModalOpen(true); }} style={{ flex: 1, fontSize: 12, padding: "10px 0", borderRadius: 20, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>ログイン</button>
                <button onClick={() => { setAuthModalMode("signup"); setAuthModalOpen(true); }} style={{ flex: 1, fontSize: 12, padding: "10px 0", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>新規登録</button>
              </div>
            </div>
          )}
        </section>

        <section id="mobile-anchor-content" style={{ padding: "32px 0 24px" }}>
          <div style={{ padding: "0 28px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 4, fontFamily: "var(--font-libre)" }}>Browse by Content</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>学習内容から探す</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "4px 28px 8px" }}>
            {contentItems.filter(i => !i.isMore).map(item => (
              <Link key={item.label} href={`/${locale}/materials?content=${item.contentId}&method=all`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: item.color, border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {item.imageSrc ? <img src={item.imageSrc} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 20 }}>{item.char}</span>}
                </div>
                <span style={{ fontSize: 10, color: "#777", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section id="mobile-anchor-method" style={{ padding: "24px 0", borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
          <div style={{ padding: "0 28px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 4, fontFamily: "var(--font-libre)" }}>Browse by Method</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>学習方法から探す</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "4px 28px 8px" }}>
            {methodItems.filter(i => !i.isMore).map(item => (
              <Link key={item.label} href={`/${locale}/materials?content=all&method=${item.methodId}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: item.color, border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {item.imageSrc ? <img src={item.imageSrc} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 20 }}>{item.char}</span>}
                </div>
                <span style={{ fontSize: 10, color: "#777", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {announcements.length > 0 && (
          <section style={{ padding: "24px 20px", borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 12 }}>お知らせ</div>
            {announcements.slice(0, 3).map(n => (
              <div key={n.id} onClick={() => setSelectedAnnouncement(n)} style={{ display: "flex", gap: 12, marginBottom: 10, cursor: "pointer" }}>
                <span style={{ fontSize: 11, color: "#bbb", minWidth: 80, flexShrink: 0 }}>{n.date}</span>
                <span style={{ fontSize: 12, color: "#444", lineHeight: 1.6, flex: 1 }}>{n.title}</span>
                <span style={{ fontSize: 11, color: "#b48be8", flexShrink: 0 }}>›</span>
              </div>
            ))}
          </section>
        )}

        <section style={{ padding: "24px 20px 0", borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
          <PersonalizedSection
            materials={materials} favIds={effectiveFavIds} dlIds={dlIds}
            favIdsLoaded={favIdsLoaded} userId={userId} userPlan={profile.plan ?? "free"}
            isLoggedIn={isLoggedIn} purchasedIds={purchasedIds} locale={locale}
            columns={2} isMobile={true}
            onCardClick={mat => setTeaserMat(mat)}
            onFavToggle={toggleFav}
          />
        </section>

        <section style={{ padding: "24px 0 32px", borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
          <div style={{ display: "flex", overflowX: "auto", padding: "0 20px", marginBottom: 16, borderBottom: "0.5px solid #eee", scrollbarWidth: "none" }}>
            {[{ key: "pickup", label: "ピックアップ" }, { key: "recommended", label: "おすすめ" }, { key: "ranking", label: "ランキング" }, { key: "new", label: "新着" }].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{ fontSize: 13, padding: "8px 14px", background: "transparent", border: "none", borderBottom: activeTab === key ? "2px solid #9b6ed4" : "2px solid transparent", color: activeTab === key ? "#9b6ed4" : "#bbb", cursor: "pointer", fontWeight: activeTab === key ? 700 : 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 20px" }}>
            {filteredMaterials.slice(0, 6).map(mat => {
              const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
              return <MaterialCard key={mat.id} mat={mat} onClick={() => setTeaserMat(mat)} locale={locale} isLoggedIn={isLoggedIn} favIds={effectiveFavIds} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={toggleFav} />;
            })}
          </div>
        </section>
      </div>

      {/* ─── モーダル（デスクトップ・モバイル共通） ─── */}
      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <TeaserModal
            mat={teaserMat} bg={bg} char={char} charColor={charColor}
            tag={tag} tagBg={tagBg} tagColor={tagColor}
            isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"}
            favIds={favIds} purchasedIds={purchasedIds}
            contentTabs={contentTabs} methodTabs={methodTabs} locale={locale} tmm={tmm}
            onClose={() => setTeaserMat(null)}
            onFavChange={(id, isFav) => setFavIds(prev => isFav ? [...prev, id] : prev.filter(x => x !== id))}
            onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }}
          />
        );
      })()}

      {selectedAnnouncement && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"}
          favIds={favIds} purchasedIds={purchasedIds} locale={locale}
          onClose={() => setSelectedAnnouncement(null)}
          onFavChange={(id, isFav) => setFavIds(prev => isFav ? [...prev, id] : prev.filter(x => x !== id))}
          onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }}
        />
      )}

      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onLoggedIn={() => setAuthModalOpen(false)}
        />
      )}
    </>
  );
}
