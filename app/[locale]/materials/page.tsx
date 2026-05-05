"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "../../../lib/supabase";
import { useAuth } from "../AuthContext";
import { getCardStyle } from "../../../lib/materialUtils";
import { contentTabLabels, methodTabLabels, getContentTabs, getMethodTabs } from "../../../lib/tabs";
import MaterialCard from "../MaterialCard";
import MobileTeaserModal from "../MobileTeaserModal";
import TeaserModal from "../TeaserModal";
import AuthModal, { AuthModalMode } from "../../../components/AuthModal";

type Material = {
  id: string; title: string; description: string;
  level: string[]; content: string[]; method: string[];
  ageGroup: string; requiredPlan: string; pdfFile?: string;
  isPickup: boolean; isRecommended: boolean; ranking: number | null; isNew: boolean;
};

function MaterialsContent() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tmm = useTranslations("materials_modal");

  const { isLoggedIn, profile, favIds, purchasedIds, dlIds, setFavIds } = useAuth();
  const effectiveFavIds = (!profile.plan || profile.plan === "free") ? favIds.slice(0, 5) : favIds;

  const cl = contentTabLabels[locale] ?? contentTabLabels.ja;
  const ml = methodTabLabels[locale] ?? methodTabLabels.ja;
  const contentTabs = getContentTabs(cl);
  const methodTabs = getMethodTabs(ml);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("signup");
  const [activeContentTab, setActiveContentTab] = useState(searchParams.get("content") ?? "all");
  const [activeMethodTab, setActiveMethodTab] = useState(searchParams.get("method") ?? "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    fetch("/api/materials")
      .then(r => r.json())
      .then(data => { setMaterials(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // URLパラメータ変化に追従
  useEffect(() => {
    setActiveContentTab(searchParams.get("content") ?? "all");
    setActiveMethodTab(searchParams.get("method") ?? "all");
  }, [searchParams]);

  const updateFilter = (content: string, method: string) => {
    setActiveContentTab(content);
    setActiveMethodTab(method);
    const params = new URLSearchParams();
    if (content !== "all") params.set("content", content);
    if (method !== "all") params.set("method", method);
    if (searchQuery) params.set("q", searchQuery);
    router.replace(`/${locale}/materials${params.size ? `?${params}` : ""}`, { scroll: false });
  };

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

  const filtered = materials.filter(mat => {
    const contentMatch = activeContentTab === "all" || mat.content.includes(activeContentTab);
    const methodMatch = activeMethodTab === "all" || mat.method.includes(activeMethodTab);
    const queryMatch = !searchQuery || mat.title.toLowerCase().includes(searchQuery.toLowerCase());
    return contentMatch && methodMatch && queryMatch;
  });

  return (
    <>
      {/* ─── デスクトップ版 ─── */}
      <div className="hidden md:block" style={{ padding: "40px 36px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#333", marginBottom: 24 }}>教材を探す</h1>

        {/* 検索 */}
        <input
          type="search" value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); }}
          onKeyDown={e => { if (e.key === "Enter") updateFilter(activeContentTab, activeMethodTab); }}
          placeholder="教材を検索..."
          style={{ width: "100%", padding: "10px 16px", borderRadius: 20, border: "0.5px solid #e0d0f0", fontSize: 14, marginBottom: 24, outline: "none", boxSizing: "border-box" }}
        />

        {/* コンテンツタブ */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#bbb", letterSpacing: 1, marginBottom: 8 }}>学習内容</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {contentTabs.map(tab => (
              <button key={tab.id} onClick={() => updateFilter(tab.id, activeMethodTab)}
                style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, border: "0.5px solid", borderColor: activeContentTab === tab.id ? "#9b6ed4" : "#e0d0f0", background: activeContentTab === tab.id ? "#f5f0ff" : "white", color: activeContentTab === tab.id ? "#7a50b0" : "#888", cursor: "pointer", fontWeight: activeContentTab === tab.id ? 700 : 400 }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* メソッドタブ */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#bbb", letterSpacing: 1, marginBottom: 8 }}>学習方法</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {methodTabs.map(tab => (
              <button key={tab.id} onClick={() => updateFilter(activeContentTab, tab.id)}
                style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, border: "0.5px solid", borderColor: activeMethodTab === tab.id ? "#9b6ed4" : "#e0d0f0", background: activeMethodTab === tab.id ? "#f5f0ff" : "white", color: activeMethodTab === tab.id ? "#7a50b0" : "#888", cursor: "pointer", fontWeight: activeMethodTab === tab.id ? 700 : 400 }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 13, color: "#bbb", marginBottom: 16 }}>{filtered.length}件</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {loading ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden" }}>
              <div className="skeleton" style={{ height: 120 }} />
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton" style={{ height: 13, width: "75%" }} />
                <div className="skeleton" style={{ height: 11, width: "50%" }} />
              </div>
            </div>
          )) : filtered.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#bbb" }}>該当する教材がありません</div>
          ) : filtered.map(mat => {
            const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
            return (
              <MaterialCard key={mat.id} mat={mat} onClick={() => setTeaserMat(mat)} locale={locale}
                isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"} favIds={effectiveFavIds}
                purchasedIds={purchasedIds} bg={bg} char={char} charColor={charColor}
                tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={toggleFav} />
            );
          })}
        </div>
      </div>

      {/* ─── モバイル版 ─── */}
      <div className="block md:hidden">
        {/* 検索バー */}
        <div style={{ padding: "12px 16px", borderBottom: "0.5px solid rgba(200,170,240,0.15)" }}>
          <input
            type="search" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="教材を検索..."
            style={{ width: "100%", padding: "9px 14px", borderRadius: 20, border: "0.5px solid #e0d0f0", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* コンテンツタブ横スクロール */}
        <div style={{ display: "flex", overflowX: "auto", padding: "10px 16px", gap: 8, scrollbarWidth: "none", borderBottom: "0.5px solid rgba(200,170,240,0.1)" }}>
          {contentTabs.map(tab => (
            <button key={tab.id} onClick={() => updateFilter(tab.id, activeMethodTab)}
              style={{ fontSize: 11, padding: "5px 12px", borderRadius: 16, border: "0.5px solid", flexShrink: 0, borderColor: activeContentTab === tab.id ? "#9b6ed4" : "#e0d0f0", background: activeContentTab === tab.id ? "#f5f0ff" : "white", color: activeContentTab === tab.id ? "#7a50b0" : "#888", cursor: "pointer", fontWeight: activeContentTab === tab.id ? 700 : 400 }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* メソッドタブ横スクロール */}
        <div style={{ display: "flex", overflowX: "auto", padding: "8px 16px", gap: 8, scrollbarWidth: "none", borderBottom: "0.5px solid rgba(200,170,240,0.15)" }}>
          {methodTabs.map(tab => (
            <button key={tab.id} onClick={() => updateFilter(activeContentTab, tab.id)}
              style={{ fontSize: 11, padding: "5px 12px", borderRadius: 16, border: "0.5px solid", flexShrink: 0, borderColor: activeMethodTab === tab.id ? "#9b6ed4" : "#e0d0f0", background: activeMethodTab === tab.id ? "#f5f0ff" : "white", color: activeMethodTab === tab.id ? "#7a50b0" : "#888", cursor: "pointer", fontWeight: activeMethodTab === tab.id ? 700 : 400 }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "8px 16px 4px", fontSize: 11, color: "#bbb" }}>{filtered.length}件</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "4px 16px 16px" }}>
          {loading ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden" }}>
              <div className="skeleton" style={{ height: 100 }} />
              <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="skeleton" style={{ height: 12, width: "75%" }} />
                <div className="skeleton" style={{ height: 10, width: "50%" }} />
              </div>
            </div>
          )) : filtered.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#bbb" }}>該当する教材がありません</div>
          ) : filtered.map(mat => {
            const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
            return (
              <MaterialCard key={mat.id} mat={mat} onClick={() => setTeaserMat(mat)} locale={locale}
                isLoggedIn={isLoggedIn} favIds={effectiveFavIds} bg={bg} char={char}
                charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={toggleFav} />
            );
          })}
        </div>
      </div>

      {/* ─── ティーザーモーダル（デスクトップ：TeaserModal、モバイル：MobileTeaserModal） ─── */}
      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <>
            <div className="hidden md:block">
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
            </div>
            <div className="block md:hidden">
              <MobileTeaserModal
                mat={teaserMat} bg={bg} char={char} charColor={charColor}
                tag={tag} tagBg={tagBg} tagColor={tagColor}
                isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"}
                favIds={effectiveFavIds} purchasedIds={purchasedIds}
                contentTabs={contentTabs} methodTabs={methodTabs} locale={locale} tmm={tmm}
                onClose={() => setTeaserMat(null)}
                onFavChange={(id, isFav) => setFavIds(prev => isFav ? [...prev, id] : prev.filter(x => x !== id))}
                onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }}
                onOpenPlanModal={() => {}}
                onOpenPurchaseConfirm={() => {}}
              />
            </div>
          </>
        );
      })()}

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

export default function MaterialsPage() {
  return (
    <Suspense>
      <MaterialsContent />
    </Suspense>
  );
}
