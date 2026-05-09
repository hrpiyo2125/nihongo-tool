"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import PdfViewer from "./PdfViewer";
import MaterialCard from "../../MaterialCard";
import TeaserModal from "../../TeaserModal";
import MobileTeaserModal from "../../MobileTeaserModal";
import { getCardStyle, getTag } from "../../../../lib/materialUtils";
import { BrandIcon } from "../../../../components/BrandIcon";
import { contentTabsJa as contentTabs, methodTabsJa as methodTabs } from "../../../../lib/tabs";
import AuthModal, { AuthModalMode } from "../../../../components/AuthModal";
import { useIsMobile } from "../../useIsMobile";

type Material = {
  id: string;
  title: string;
  description: string;
  level: string[];
  content: string[];
  method: string[];
  ageGroup: string;
  requiredPlan: string;
  mockupImage?: string;
  isPickup: boolean;
  isRecommended: boolean;
  ranking: number | null;
  isNew: boolean;
  usageBasic: string;
  usageMiddle: string;
  usageAdvanced: string;
  features: string;
  howto: string;
  pdfFile: string;
  studyTime?: string;
};






type TooltipType = "favorite" | "download";

function LockTooltip({ type, visible, onClose, onOpenAuth }: { type: TooltipType; visible: boolean; onClose: () => void; onOpenAuth: (mode: "signup" | "login") => void }) {
  if (!visible) return null;
  const isFav = type === "favorite";
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
      <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 50, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", padding: "16px 18px", width: 230, border: "0.5px solid rgba(200,170,240,0.25)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><BrandIcon name="lock" size={13} color="#bbb" />{isFav ? "お気に入り機能" : "ダウンロード"}</span>
        </div>
        <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7, marginBottom: 14 }}>
          {isFav ? "ログインするとお気に入りに保存できます。" : "ログインするとPDFをダウンロードできます。"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { onClose(); onOpenAuth("signup"); }} style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "7px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>新規登録</button>
          <button onClick={() => { onClose(); onOpenAuth("login"); }} style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: "7px 0", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer" }}>ログイン</button>
        </div>
      </div>
    </>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} style={{ fontWeight: 700, color: "#444" }}>{part.slice(2, -2)}</strong>
      : part
  );
}

function renderNotionText(text: string) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return <div key={i} style={{ fontSize: 14, fontWeight: 800, color: "#333", marginTop: 6 }}>{renderInline(line.replace("## ", ""))}</div>;
        if (line.startsWith("> ")) return <div key={i} style={{ fontSize: 13, color: "#9b6ed4", background: "rgba(228,155,253,0.08)", border: "0.5px solid rgba(228,155,253,0.3)", borderRadius: 8, padding: "8px 12px", lineHeight: 1.8 }}>{renderInline(line.replace("> ", ""))}</div>;
        if (/^\d+\. /.test(line)) {
          const num = line.match(/^(\d+)\. /)?.[1];
          return (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{num}</span>
              <span style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>{renderInline(line.replace(/^\d+\. /, ""))}</span>
            </div>
          );
        }
        if (line.startsWith("✦ ") || line.startsWith("- ") || line.startsWith("・")) return (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: "#e49bfd", fontSize: 12, flexShrink: 0, marginTop: 3 }}>✦</span>
            <span style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>{renderInline(line.replace("✦ ", "").replace("- ", "").replace("・", ""))}</span>
          </div>
        );
        if (line === "") return <div key={i} style={{ height: 4 }} />;
        return <p key={i} style={{ fontSize: 13, color: "#777", lineHeight: 1.9, margin: 0 }}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    "無料": { bg: "#d6f5e5", color: "#2a6a44" },
    "PICK": { bg: "#ecdeff", color: "#7040b0" },
    "NEW": { bg: "#ffd9ee", color: "#a03070" },
    "サブスク": { bg: "#ecdeff", color: "#7040b0" },
  };
  const s = styles[tag] ?? { bg: "#eee", color: "#555" };
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: s.bg, color: s.color, whiteSpace: "nowrap", flexShrink: 0 }}>{tag}</span>;
}

// ===== 関連教材パネル（独立コンポーネント）=====
function RelatedPanel({
  relatedMaterials, isLoggedIn, userPlan, purchasedIds, teaserFavIds, setTeaserFavIds,
}: {
  relatedMaterials: Material[];
  isLoggedIn: boolean;
  userPlan: string;
  purchasedIds: string[];
  teaserFavIds: string[];
  setTeaserFavIds: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const isMobile = useIsMobile();

  const contentTabsMapped = contentTabs.map(t => ({ ...t, char: t.label[0], color: "#e8efff", imageSrc: null }));
  const methodTabsMapped = methodTabs.map(t => ({ ...t, char: t.label[0], imageSrc: null }));
  const tmmFn = (key: string) => ({ age: "対象年齢", content: "学習内容", method: "学習方法", download: "ダウンロード", lock_download: "ダウンロード", add_fav: "お気に入りに追加", added_fav: "お気に入りに追加済み" }[key] ?? key);

  return (
    <div style={{ padding: "20px 18px", position: "relative" as const, height: "100%" }}>
      {teaserMat ? (() => {
        const { bg, char, charColor } = getCardStyle(teaserMat);
        const { tag, tagBg, tagColor } = getTag(teaserMat);
        const commonProps = {
          mat: teaserMat as any,
          bg, char, charColor, tag, tagBg, tagColor,
          isLoggedIn, userPlan,
          purchasedIds,
          favIds: teaserFavIds,
          contentTabs: contentTabsMapped,
          methodTabs: methodTabsMapped,
          locale: "ja",
          tmm: tmmFn,
          onClose: () => setTeaserMat(null),
          onFavChange: (materialId: string, isFav: boolean) => {
            if (isFav) setTeaserFavIds(prev => [...prev, materialId]);
            else setTeaserFavIds(prev => prev.filter(id => id !== materialId));
          },
          onOpenPlanModal: () => {},
          onOpenPurchaseConfirm: () => {},
        };
        return isMobile
          ? <MobileTeaserModal {...commonProps} />
          : <TeaserModal {...commonProps} />;
      })() : (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 14 }}>関連する教材</div>
          {relatedMaterials.length === 0 ? (
            <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.8 }}>関連する教材が見つかりませんでした。</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {relatedMaterials.map((m) => {
                const { bg, char, charColor } = getCardStyle(m);
                const { tag, tagBg, tagColor } = getTag(m);
                return (
                  <MaterialCard
                    key={m.id}
                    mat={m as any}
                    onClick={() => setTeaserMat(m)}
                    locale="ja"
                    isLoggedIn={isLoggedIn}
                    favIds={teaserFavIds}
                    bg={bg} char={char} charColor={charColor}
                    tag={tag} tagBg={tagBg} tagColor={tagColor}
                    onFavToggle={async (mat) => {
                      if (!isLoggedIn) return;
                      const supabase = createClient();
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) return;
                      if (teaserFavIds.includes(mat.id)) {
                        await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
                        setTeaserFavIds(prev => prev.filter(fid => fid !== mat.id));
                      } else {
                        await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
                        setTeaserFavIds(prev => [...prev, mat.id]);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MaterialDetailPage() {
  const params = useParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const [material, setMaterial] = useState<Material | null>(null);
  const [relatedMaterials, setRelatedMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<TooltipType | null>(null);
  const [teaserFavIds, setTeaserFavIds] = useState<string[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<Record<string, any>>({ plan: "free" });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("signup");
  const openAuth = (mode: AuthModalMode) => { setAuthModalMode(mode); setAuthModalOpen(true); };
  
  const [dlHover, setDlHover] = useState(false);
  const [favHover, setFavHover] = useState(false);
  const [homeHover, setHomeHover] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/materials/${id}`)
      .then(r => r.json())
      .then(async (data) => {
        setMaterial(data);
        setLoading(false);
        setRelatedMaterials(data.relatedMaterials ?? []);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session) {
        const { data: favData } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id);
        if (favData) {
          const ids = favData.map((d: { material_id: string }) => d.material_id);
          setTeaserFavIds(ids);
          setIsFav(ids.includes(id));
        }
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileData) setProfile(profileData);
        const { data: purchaseData } = await supabase.from("purchases").select("material_id").eq("user_id", session.user.id);
        if (purchaseData) setPurchasedIds([...new Set(purchaseData.map((d: any) => d.material_id as string))]);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const dispatchFavChange = useCallback((materialId: string, newIsFav: boolean) => {
    window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId, isFav: newIsFav } }));
  }, []);

  const handleFavClick = async () => {
    if (!isLoggedIn) { setActiveTooltip(activeTooltip === "favorite" ? null : "favorite"); return; }
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", id);
      setIsFav(false); dispatchFavChange(id, false);
    } else {
      await supabase.from("favorites").insert({ user_id: session.user.id, material_id: id });
      setIsFav(true); dispatchFavChange(id, true);
    }
  };

  const handleDownloadClick = async () => {
  if (!material?.pdfFile) return;

  

  // PDFダウンロード
  try {
    const res = await fetch(material.pdfFile);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${material.title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    window.open(material.pdfFile, "_blank");
  }

  // 履歴の記録
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from("download_history").insert({ user_id: session.user.id, material_id: id });
    }
  } catch (e) {
    console.error("履歴の記録に失敗しました", e);
  }
};

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); }
    };
    const onGesture = (e: any) => { e.preventDefault(); };
    el.addEventListener("wheel", onWheel, { passive: false, capture: true });
    el.addEventListener("gesturestart", onGesture, { passive: false, capture: true });
    el.addEventListener("gesturechange", onGesture, { passive: false, capture: true });
    el.addEventListener("gestureend", onGesture, { passive: false, capture: true });
    return () => {
      el.removeEventListener("wheel", onWheel, { capture: true });
      el.removeEventListener("gesturestart", onGesture, { capture: true });
      el.removeEventListener("gesturechange", onGesture, { capture: true });
      el.removeEventListener("gestureend", onGesture, { capture: true });
    };
  }, []);

  const isMobile = useIsMobile();
  const SB_ICON_W = 64;
  const SB_PANEL_W = isMobile ? 280 : 393;
  const panelOpen = activePanel !== null;

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif", background: "#f0f0f0", overflow: "hidden" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .sk {
          background: linear-gradient(90deg, #e8e8e8 25%, #f4f4f4 50%, #e8e8e8 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 6px;
        }
        .sk-white {
          background: linear-gradient(90deg, rgba(255,255,255,0.35) 25%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.35) 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 6px;
        }
      `}</style>

      {/* ヘッダー */}
      <header style={{ flexShrink: 0, background: "linear-gradient(135deg,#f4b9b9 0%,#e49bfd 45%,#a3c0ff 100%)", padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          {/* ホームボタン */}
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.15)" }} />
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.3)" }} />
          {/* タグ・タイトル */}
          <div className="sk-white" style={{ width: 44, height: 18, borderRadius: 6 }} />
          <div className="sk-white" style={{ width: 180, height: 16, borderRadius: 6 }} />
          <div className="sk-white" style={{ width: 100, height: 13, borderRadius: 6 }} />
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.3)" }} />
          <div className="sk-white" style={{ width: 210, height: 13, borderRadius: 6 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div className="sk-white" style={{ width: 96, height: 34, borderRadius: 8 }} />
          <div style={{ width: 108, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.85)" }} />
        </div>
      </header>

      {/* ボディ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* サイドバー（アイコン列） */}
        <div style={{ width: 64, background: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 4, flexShrink: 0 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ width: 46, height: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <div className="sk" style={{ width: 32, height: 32, borderRadius: 8 }} />
              <div className="sk" style={{ width: 28, height: 8, borderRadius: 4 }} />
            </div>
          ))}
        </div>

        {/* メインエリア：用紙スケルトン */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "min(480px, 90vw)", aspectRatio: "1 / 1.414", borderRadius: 4, boxShadow: "0 16px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)", overflow: "hidden" }}>
            <div className="sk" style={{ width: "100%", height: "100%", borderRadius: 0 }} />
          </div>
        </div>
      </div>
    </div>
  );
  if (!material) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#bbb", fontSize: 14 }}>教材が見つかりませんでした</div>;

  const { bg, char, charColor } = getCardStyle(material);
  const { tag } = getTag(material);
  const isFree = material.requiredPlan === "free";

  const sidePanels = [
    {
      id: "description", label: "解説",
      icon: (active: boolean) => (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {active && <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4b9b9"/><stop offset="50%" stopColor="#e49bfd"/><stop offset="100%" stopColor="#a3c0ff"/></linearGradient></defs>}
          <rect x="3" y="3" width="18" height="18" rx="3" stroke={active ? "url(#g1)" : "#555"} />
          <path d="M8 8h8M8 12h8M8 16h5" stroke={active ? "url(#g1)" : "#555"} />
        </svg>
      ),
      content: (
        <div style={{ padding: "20px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10 }}>この教材について</div>
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.9, marginBottom: 16 }}>{material.description || `楽しく学べる${contentTabs.find(t => t.id === material.content?.[0])?.label ?? ""}の教材です。`}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "対象年齢", value: material.ageGroup || "－" },
              { label: "学習時間", value: material.studyTime || "－" },
              { label: "学習方法", value: (material.method ?? []).map(m => methodTabs.find(t => t.id === m)?.label).filter(Boolean).join("・") || "－" },
              { label: "学習内容", value: (material.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・") || "－" },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "10px 12px", background: "#f7f7f7", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#444" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "features", label: "特徴",
      icon: (active: boolean) => (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {active && <defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4b9b9"/><stop offset="50%" stopColor="#e49bfd"/><stop offset="100%" stopColor="#a3c0ff"/></linearGradient></defs>}
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke={active ? "url(#g2)" : "#555"} />
        </svg>
      ),
      content: (
        <div style={{ padding: "20px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 14 }}>この教材の特徴</div>
          {material.features ? renderNotionText(material.features) : ["授業でそのまま使えるA4サイズ","手描きイラストで温かみのあるデザイン","白黒印刷でもきれいに出る高コントラスト"].map((text, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
              <span style={{ color: "#e49bfd", fontSize: 12, flexShrink: 0, marginTop: 2 }}>✦</span>
              <span style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{text}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "howto", label: "使い方",
      icon: (active: boolean) => (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {active && <defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4b9b9"/><stop offset="50%" stopColor="#e49bfd"/><stop offset="100%" stopColor="#a3c0ff"/></linearGradient></defs>}
          <circle cx="12" cy="12" r="10" stroke={active ? "url(#g3)" : "#555"} />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={active ? "url(#g3)" : "#555"} />
          <circle cx="12" cy="17" r="0.8" fill={active ? "#e49bfd" : "#555"} strokeWidth="0" />
        </svg>
      ),
      content: (
        <div style={{ padding: "20px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 14 }}>使い方ガイド</div>
          {material.howto ? renderNotionText(material.howto) : <p style={{ fontSize: 13, color: "#777", lineHeight: 1.9, margin: 0 }}>PDFをダウンロードして印刷してご使用ください。</p>}
        </div>
      ),
    },
    ...(material.usageBasic ? [{
      id: "basic", label: "Basic",
      icon: (active: boolean) => (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {active && <defs><linearGradient id="gb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4b9b9"/><stop offset="50%" stopColor="#e49bfd"/><stop offset="100%" stopColor="#a3c0ff"/></linearGradient></defs>}
          <circle cx="12" cy="12" r="10" stroke={active ? "url(#gb)" : "#555"} />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fill={active ? "url(#gb)" : "#555"} stroke="none">B</text>
        </svg>
      ),
      content: <div style={{ padding: "20px 18px" }}><div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 14 }}>Basic の使い方</div>{renderNotionText(material.usageBasic)}</div>,
    }] : []),
    ...(material.usageMiddle ? [{
      id: "middle", label: "Middle",
      icon: (active: boolean) => (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {active && <defs><linearGradient id="gm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4b9b9"/><stop offset="50%" stopColor="#e49bfd"/><stop offset="100%" stopColor="#a3c0ff"/></linearGradient></defs>}
          <circle cx="12" cy="12" r="10" stroke={active ? "url(#gm)" : "#555"} />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fill={active ? "url(#gm)" : "#555"} stroke="none">M</text>
        </svg>
      ),
      content: <div style={{ padding: "20px 18px" }}><div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 14 }}>Middle の使い方</div>{renderNotionText(material.usageMiddle)}</div>,
    }] : []),
    ...(material.usageAdvanced ? [{
      id: "advanced", label: "Advanced",
      icon: (active: boolean) => <div style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: active ? "#a03070" : "#aaa" }}>A</div>,
      content: <div style={{ padding: "20px 18px" }}><div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 14 }}>Advanced の使い方</div>{renderNotionText(material.usageAdvanced)}</div>,
    }] : []),
    {
      id: "related", label: "関連ツール",
      icon: (active: boolean) => (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {active && <defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4b9b9"/><stop offset="50%" stopColor="#e49bfd"/><stop offset="100%" stopColor="#a3c0ff"/></linearGradient></defs>}
          <circle cx="6" cy="12" r="2" stroke={active ? "url(#g4)" : "#555"} />
          <circle cx="18" cy="6" r="2" stroke={active ? "url(#g4)" : "#555"} />
          <circle cx="18" cy="18" r="2" stroke={active ? "url(#g4)" : "#555"} />
          <path d="M8 11l8-4M8 13l8 4" stroke={active ? "url(#g4)" : "#555"} />
        </svg>
      ),
      content: null,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif", background: "#f0f0f0", overflow: "hidden" }}>
      <header style={{ flexShrink: 0, background: "linear-gradient(135deg,#f4b9b9 0%,#e49bfd 45%,#a3c0ff 100%)", padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          <button onClick={() => window.location.href = "/"} onMouseEnter={() => setHomeHover(true)} onMouseLeave={() => setHomeHover(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 8, border: "none", background: homeHover ? "rgba(255,255,255,0.22)" : "transparent", cursor: "pointer", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="white" />
              <path d="M9 22V12h6v10" stroke="white" />
            </svg>
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
          {tag && <TagBadge tag={tag} />}
          {material.requiredPlan === "subscribe" && (
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(200,180,230,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M2 8l5 4 5-7 5 7 5-4-2 9H4L2 8z" fill="#c9a0f0" stroke="#c9a0f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="4" y="17" width="16" height="2.5" rx="1" fill="#c9a0f0"/>
              </svg>
            </div>
          )}
          {(material.level ?? []).map((lv: string) => (
            <span key={lv} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070", whiteSpace: "nowrap", flexShrink: 0 }}>{lv}</span>
          ))}
          {!isMobile && <span style={{ fontSize: 15, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{material.title}</span>}
          {!isMobile && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap", fontWeight: 400, flexShrink: 0 }}>{(material.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・")}</span>}
          {!isMobile && <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />}
          {!isMobile && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", fontWeight: 400, flexShrink: 0 }}>{isFree ? "このプリントは無料でダウンロードできます" : "このプリントはサブスク会員限定です"}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8, flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <button onClick={handleFavClick} onMouseEnter={() => setFavHover(true)} onMouseLeave={() => setFavHover(false)} style={{ display: "flex", alignItems: "center", gap: isMobile ? 0 : 6, height: isMobile ? 30 : 34, padding: isMobile ? "0 8px" : "0 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.55)", background: favHover ? "rgba(255,255,255,0.22)" : "transparent", cursor: "pointer" }}>
              {!isLoggedIn ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" stroke="white" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="white" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill={isFav ? "white" : "none"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="white" /></svg>
              )}
              {!isMobile && <span style={{ fontSize: 12, fontWeight: 600, color: "white", whiteSpace: "nowrap" }}>{isLoggedIn ? (isFav ? "保存済み" : "お気に入り") : "お気に入り"}</span>}
            </button>
            <LockTooltip type="favorite" visible={activeTooltip === "favorite"} onClose={() => setActiveTooltip(null)} onOpenAuth={openAuth} />
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={handleDownloadClick} onMouseEnter={() => setDlHover(true)} onMouseLeave={() => setDlHover(false)} style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 6, height: isMobile ? 30 : 34, padding: isMobile ? "0 10px" : "0 16px", borderRadius: 8, border: "none", background: dlHover ? "rgba(255,255,255,0.85)" : "white", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M12 3v13M7 11l5 5 5-5" stroke="#333" /><path d="M4 20h16" stroke="#333" /></svg>
              {!isMobile && <span style={{ fontSize: 12, fontWeight: 700, color: "#333", whiteSpace: "nowrap" }}>ダウンロード</span>}
            </button>
          </div>
        </div>
      </header>



      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <aside style={{ display: "flex", position: "absolute", top: 0, left: 0, bottom: 0, zIndex: 20, overflow: "hidden" }} onMouseLeave={isMobile ? undefined : () => setActivePanel(null)}>
          <div style={{ width: SB_ICON_W, background: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 4, flexShrink: 0 }}>
            {sidePanels.map((panel) => {
              const active = activePanel === panel.id;
              return (
                <button
                  key={panel.id}
                  onMouseEnter={isMobile ? undefined : () => setActivePanel(panel.id)}
                  onClick={isMobile ? () => setActivePanel(active ? null : panel.id) : undefined}
                  title={panel.label}
                  style={{ width: 46, height: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, border: "none", borderRadius: 10, background: "transparent", cursor: "pointer", padding: 0 }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: active ? "rgba(255,255,255,0.9)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: active ? "0 1px 6px rgba(0,0,0,0.08)" : "none" }}>
                    {panel.icon(active)}
                  </div>
                  <span style={{ fontSize: 9, color: "#666", fontWeight: 500, lineHeight: 1 }}>{panel.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ width: panelOpen ? SB_PANEL_W : 0, transition: "width 0.22s ease", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ width: SB_PANEL_W, height: "calc(100% - 12px)", overflowY: "scroll", background: "white", borderRadius: "16px 16px 0 0", marginTop: 12, boxShadow: "0 -4px 24px rgba(200,150,150,0.12)", scrollbarWidth: "thin" as const, position: "relative" }}>
              <div style={{ padding: "14px 18px 10px", borderBottom: "0.5px solid rgba(163,192,255,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#9b6ed4" }}>{sidePanels.find(p => p.id === activePanel)?.label}</span>
                {isMobile && <button onClick={() => setActivePanel(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#aaa", padding: "0 4px" }}>✕</button>}
              </div>
              {activePanel === "related" ? (
                <RelatedPanel
                  relatedMaterials={relatedMaterials}
                  isLoggedIn={isLoggedIn}
                  userPlan={profile.plan ?? "free"}
                  purchasedIds={purchasedIds}
                  teaserFavIds={teaserFavIds}
                  setTeaserFavIds={setTeaserFavIds}
                />
              ) : (
                sidePanels.find(p => p.id === activePanel)?.content
              )}
            </div>
          </div>
        </aside>

        <main ref={containerRef} style={{ flex: 1, overflow: "hidden", background: "#f0f0f0", position: "relative" }}>
          {material.pdfFile ? (
            <PdfViewer url={material.pdfFile} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "min(480px, 90vw)", aspectRatio: "1 / 1.414", background: bg, borderRadius: 4, boxShadow: "0 16px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.25)" }} />
                <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 80, fontWeight: 700, color: charColor }}>{char}</div>
                  <div style={{ fontSize: 14, color: "rgba(80,80,120,0.5)", marginTop: 8, letterSpacing: 2 }}>PREVIEW</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onLoggedIn={() => { setAuthModalOpen(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}