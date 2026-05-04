"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "../../lib/supabase";

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
import { getCardStyle } from "../../lib/materialUtils";
import MaterialCard from "./MaterialCard";

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

type Tab = {
  id: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

type ContentTab = { id: string; label: string; char: string; color: string; imageSrc: string | null };
type MethodTab = { id: string; label: string; char: string; imageSrc: string | null };

type Props = {
  materials: Material[];
  locale: string;
  isLoggedIn: boolean;
  userPlan: string;
  favIds: string[];
  purchasedIds: string[];
  contentTabs: ContentTab[];
  methodTabs: MethodTab[];
  avatarUrl: string | null;
  userInitial: string;
  tabs: Tab[];
  initContent?: string;
  initMethod?: string;
  onFavToggle: (mat: Material) => void;
  onCardClick: (mat: Material) => void;
  onClose: () => void;
  onTabChange: (tabId: string) => void;
  onOpenMyPage: () => void;
  onFilterChange?: (content: string, method: string) => void;
};

export default function MobileMaterialsModal({
  materials, locale, isLoggedIn, userPlan, favIds, purchasedIds,
  contentTabs, methodTabs, avatarUrl, userInitial, tabs,
  initContent = "all", initMethod = "all",
  onFavToggle, onCardClick, onClose, onTabChange, onOpenMyPage, onFilterChange,
}: Props) {
  const [activeContentFilter, setActiveContentFilter] = useState(initContent);
  const [activeMethodFilter, setActiveMethodFilter] = useState(initMethod);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const contentTabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const methodTabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleScroll = () => {
    isScrollingRef.current = true;
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => { isScrollingRef.current = false; }, 300);
  };

  const safeCardClick = (mat: Parameters<typeof onCardClick>[0]) => {
    if (isScrollingRef.current) return;
    onCardClick(mat);
  };

  useEffect(() => {
    contentTabRefs.current.get(activeContentFilter)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeContentFilter]);

  useEffect(() => {
    methodTabRefs.current.get(activeMethodFilter)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeMethodFilter]);

  const executeSearch = (q: string) => {
    if (!q.trim()) return;
    setActiveContentFilter("all");
    setActiveMethodFilter("all");
    const words = q.trim().split(/\s+/);
    const matched = materials
      .filter((m) => {
        const haystack = [m.title, m.description, (m as any).searchKeywords ?? ""].join(" ").toLowerCase();
        return words.every((w) => haystack.includes(w.toLowerCase()));
      })
      .map((m) => m.id);
    setSearchResults(matched);
  };

  const filtered = materials.filter(m => {
    if (searchResults !== null) return searchResults.includes(m.id);
    const cMatch = activeContentFilter === "all" || (m.content ?? []).includes(activeContentFilter);
    const mMatch = activeMethodFilter === "all" || (m.method ?? []).includes(activeMethodFilter);
    return cMatch && mMatch;
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "white", display: "flex", flexDirection: "column" }}>

      <style>{scrollbarStyle}</style>

      {/* 検索欄 */}
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8f6ff", border: "1px solid rgba(163,192,255,0.4)", borderRadius: 28, padding: "10px 18px", width: "100%", maxWidth: 480 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="search" placeholder="教材を検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); executeSearch(searchQuery); } }} style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#555", outline: "none" }} />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setSearchResults(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", display: "flex", alignItems: "center", color: "#bbb", flexShrink: 0 }}
              aria-label="検索をクリア"
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
          <button
            onClick={() => executeSearch(searchQuery)}
            disabled={!searchQuery.trim()}
            style={{ background: "none", border: "none", cursor: searchQuery.trim() ? "pointer" : "default", padding: "0 2px", display: "flex", alignItems: "center", color: searchQuery.trim() ? "#9b6ed4" : "#ddd", flexShrink: 0 }}
            aria-label="検索"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
        </div>
      </div>

      {/* 方法タブ */}
      <div style={{ borderBottom: "0.5px solid rgba(0,0,0,0.06)", flexShrink: 0, display: "flex" }}>
        <div style={{ width: 80, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/toolio_logo_mini.png" alt="toolio" style={{ width: 48, height: 48, objectFit: "contain" }} />
        </div>
        <div className="toolio-scroll-x" onScroll={handleScroll} style={{ display: "flex", overflowX: "auto", flex: 1 }}>
          {methodTabs.map((tab) => {
            const active = searchResults === null && activeMethodFilter === tab.id;
            return (
              <button key={tab.id} ref={(el) => { if (el) methodTabRefs.current.set(tab.id, el); else methodTabRefs.current.delete(tab.id); }} onClick={() => { setSearchQuery(""); setSearchResults(null); setActiveMethodFilter(tab.id); onFilterChange?.(activeContentFilter, tab.id); }} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: "10px 12px", flexShrink: 0, border: "none", background: active ? "rgba(163,192,255,0.15)" : "transparent", cursor: "pointer" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: tab.id === "all" ? "linear-gradient(135deg,#f4b9b9,#a3c0ff)" : "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 11, fontWeight: 700, color: "#555" }}>
                  {tab.imageSrc ? <img src={tab.imageSrc} alt={tab.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{tab.char}</span>}
                </div>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#888", whiteSpace: "nowrap" as const, lineHeight: 1.2 }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
        </div>

      {/* メインエリア */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* 内容タブ（縦） */}
        <div style={{ width: 80, flexShrink: 0, display: "flex", flexDirection: "column" as const, borderRight: "0.5px solid rgba(0,0,0,0.06)" }}>
          <div className="toolio-scroll-y" style={{ flex: 1, overflowY: "auto" }} onScroll={handleScroll}>
          {contentTabs.map((tab) => {
            const active = searchResults === null && activeContentFilter === tab.id;
            return (
              <button key={tab.id} ref={(el) => { if (el) contentTabRefs.current.set(tab.id, el); else contentTabRefs.current.delete(tab.id); }} onClick={() => { setSearchQuery(""); setSearchResults(null); setActiveContentFilter(tab.id); onFilterChange?.(tab.id, activeMethodFilter); }} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: "10px 12px", width: "100%", border: "none", background: active ? "rgba(163,192,255,0.15)" : "transparent", cursor: "pointer" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: tab.id === "all" ? "linear-gradient(135deg,#f4b9b9,#a3c0ff)" : tab.color, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 11 }}>
                  {tab.imageSrc ? <img src={tab.imageSrc} alt={tab.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : tab.char}
                </div>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#888", textAlign: "center" as const, lineHeight: 1.2 }}>{tab.label}</span>
              </button>
            );
          })}
          </div>
        </div>

        {/* カード一覧 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }} onScroll={handleScroll}>
          <div style={{ padding: "0 0 12px", fontSize: 12, color: "#bbb" }}>
            {searchResults !== null
              ? `検索結果 — ${filtered.length}件`
              : `${contentTabs.find(t => t.id === activeContentFilter)?.label}${activeMethodFilter !== "all" ? ` × ${methodTabs.find(t => t.id === activeMethodFilter)?.label}` : ""} — ${filtered.length}件`
            }
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {filtered.map((mat) => {
              const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
              return (
                <MaterialCard
                  key={mat.id}
                  mat={mat}
                  onClick={() => safeCardClick(mat)}
                  locale={locale}
                  isLoggedIn={isLoggedIn}
                  userPlan={userPlan}
                  favIds={favIds}
                  purchasedIds={purchasedIds}
                  onFavToggle={onFavToggle}
                  bg={bg} char={char} charColor={charColor}
                  tag={tag} tagBg={tagBg} tagColor={tagColor}
                />
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
            <button key={tab.id} onClick={() => { if (tab.id !== "materials" && !isScrollingRef.current) { onTabChange(tab.id); } }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", padding: "8px 16px" }}>
              {tab.icon(active)}
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#9b6ed4" : "#bbb" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
