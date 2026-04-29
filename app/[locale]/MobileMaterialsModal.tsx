"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
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
};

export default function MobileMaterialsModal({
  materials, locale, isLoggedIn, userPlan, favIds, purchasedIds,
  contentTabs, methodTabs, avatarUrl, userInitial, tabs,
  initContent = "all", initMethod = "all",
  onFavToggle, onCardClick, onClose, onTabChange, onOpenMyPage,
}: Props) {
  const [activeContentFilter, setActiveContentFilter] = useState(initContent);
  const [activeMethodFilter, setActiveMethodFilter] = useState(initMethod);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = materials.filter(m => {
    const cMatch = activeContentFilter === "all" || (m.content ?? []).includes(activeContentFilter);
    const mMatch = activeMethodFilter === "all" || (m.method ?? []).includes(activeMethodFilter);
    const sMatch = !searchQuery || m.title.includes(searchQuery);
    return cMatch && mMatch && sMatch;
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "white", display: "flex", flexDirection: "column" }}>

      {/* ヘッダー */}
      <header style={{ position: "relative", zIndex: 50, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: "white", borderBottom: "0.5px solid rgba(200,170,240,0.2)", flexShrink: 0 }}>
        <img src="/toolio_logo.png" alt="toolio" style={{ height: 32, objectFit: "contain" }} />
        <button onClick={onOpenMyPage} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer", overflow: "hidden", padding: 0 }}>
          {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userInitial}
        </button>
      </header>

      {/* 検索欄 */}
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8f6ff", border: "1px solid rgba(163,192,255,0.4)", borderRadius: 28, padding: "10px 18px", width: "100%", maxWidth: 480 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="教材を検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#555", outline: "none" }} />
        </div>
      </div>

      {/* 方法タブ */}
      <div style={{ borderBottom: "0.5px solid rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none" as const }}>
          {methodTabs.map((tab) => {
            const active = activeMethodFilter === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveMethodFilter(tab.id)} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: "10px 12px", flexShrink: 0, border: "none", background: active ? "rgba(163,192,255,0.12)" : "transparent", cursor: "pointer", borderBottom: active ? "3px solid #9b6ed4" : "3px solid transparent" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: tab.id === "all" ? "linear-gradient(135deg,#f4b9b9,#a3c0ff)" : "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 14, fontWeight: 700, color: "#555" }}>
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
          <div style={{ height: 71, flexShrink: 0 }} />
          <div style={{ flex: 1, overflowY: "auto" }}>
          {contentTabs.map((tab) => {
            const active = activeContentFilter === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveContentFilter(tab.id)} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, padding: "10px 12px", width: "100%", border: "none", background: active ? "rgba(163,192,255,0.12)" : "transparent", cursor: "pointer", borderLeft: active ? "3px solid #9b6ed4" : "3px solid transparent" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: tab.id === "all" ? "linear-gradient(135deg,#f4b9b9,#a3c0ff)" : tab.color, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 14 }}>
                  {tab.imageSrc ? <img src={tab.imageSrc} alt={tab.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : tab.char}
                </div>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#888", textAlign: "center" as const, lineHeight: 1.2 }}>{tab.label}</span>
              </button>
            );
          })}
          </div>
        </div>

        {/* カード一覧 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          <div style={{ fontSize: 11, color: "#bbb", marginBottom: 10 }}>{filtered.length}件</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {filtered.map((mat) => {
              const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
              return (
                <MaterialCard
                  key={mat.id}
                  mat={mat}
                  onClick={() => onCardClick(mat)}
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
            <button key={tab.id} onClick={() => { if (tab.id !== "materials") { onClose(); onTabChange(tab.id); } }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", padding: "8px 16px" }}>
              {tab.icon(active)}
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#9b6ed4" : "#bbb" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
