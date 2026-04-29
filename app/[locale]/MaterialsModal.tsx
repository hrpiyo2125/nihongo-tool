"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { getCardStyle } from "../../lib/materialUtils";
import MaterialCard from "./MaterialCard";
import TeaserModal from "./TeaserModal";

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

export type Material = {
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
  bg?: string;
  char?: string;
  charColor?: string;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
};

type ContentTab = { id: string; label: string; char: string; color: string; imageSrc: string | null };
type MethodTab = { id: string; label: string; char: string; imageSrc: string | null };

type Props = {
  initContent: string;
  initMethod: string;
  onClose: () => void;
  isLoggedIn: boolean;
  materials: Material[];
  tmm: (key: string) => string;
  contentTabs: ContentTab[];
  methodTabs: MethodTab[];
  locale: string;
  userPlan: string;
  purchasedIds: string[];
  onFavToggle: (mat: Material) => void;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  onOpenAuth?: (mode: "signup" | "login") => void;
};

export default function MaterialsModal({
  initContent, initMethod, onClose, isLoggedIn, materials, tmm, contentTabs, methodTabs, locale, userPlan, purchasedIds, onFavToggle, onOpenAuth,
}: Props) {
  const [activeContent, setActiveContent] = useState(initContent);
  const [activeMethod, setActiveMethod] = useState(initMethod);
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [favIds, setFavIds] = useState<string[]>([]);
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
            <div style={{ fontSize: 26, fontWeight: 700, color: "#999", whiteSpace: "nowrap" }}>{tmm("title")}</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#f8f6ff", border: "1px solid rgba(163,192,255,0.4)", borderRadius: 28, padding: "12px 24px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder={tmm("search_placeholder")}
              value={searchQuery}
              onChange={async (e) => {
                const q = e.target.value;
                setSearchQuery(q);
                if (!q.trim()) { setSearchResults(null); return; }
                setSearchLoading(true);
                try {
                  const res = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
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
                    <button key={tab.id} onClick={() => setActiveMethod(tab.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px", flexShrink: 0, background: active ? "rgba(163,192,255,0.15)" : "transparent", border: "none", borderRadius: 10, cursor: "pointer" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#555", border: "1px solid rgba(0,0,0,0.06)" }}>
                        {tab.imageSrc ? <img src={tab.imageSrc} alt={tab.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{tab.char}</span>}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#666", whiteSpace: "nowrap" }}>{tab.label}</span>
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
                    const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
                    return (
                      <MaterialCard
                        key={mat.id}
                        mat={mat}
                        onClick={() => setTeaserMat(mat)}
                        locale={locale}
                        isLoggedIn={isLoggedIn}
                        userPlan={userPlan}
                        favIds={favIds}
                        purchasedIds={purchasedIds}
                        onFavToggle={(m) => {
                          if (favIds.includes(m.id)) setFavIds(prev => prev.filter(id => id !== m.id));
                          else setFavIds(prev => [...prev, m.id]);
                          onFavToggle(m);
                        }}
                        bg={bg} char={char} charColor={charColor}
                        tag={tag} tagBg={tagBg} tagColor={tagColor}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <TeaserModal
            mat={teaserMat}
            bg={bg} char={char} charColor={charColor}
            tag={tag} tagBg={tagBg} tagColor={tagColor}
            isLoggedIn={isLoggedIn}
            userPlan={userPlan}
            favIds={favIds}
            contentTabs={contentTabs}
            methodTabs={methodTabs}
            locale={locale}
            tmm={tmm}
            onClose={() => setTeaserMat(null)}
            onFavChange={(materialId, isFav) => {
              if (isFav) setFavIds(prev => [...prev, materialId]);
              else setFavIds(prev => prev.filter(id => id !== materialId));
            }}
            onOpenAuth={onOpenAuth}
          />
        );
      })()}
    </div>
  );
}
