"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import PdfViewer from "./PdfViewer";
import MaterialCard from "../../MaterialCard";
import TeaserModal from "../../TeaserModal";


function PdfCanvas({ url }: { url: string }) {
  const [pages, setPages] = useState<any[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const doc = await pdfjsLib.getDocument({ url, withCredentials: false }).promise;
      if (cancelled) return;
      const pageList = [];
      for (let i = 1; i <= doc.numPages; i++) {
        pageList.push(await doc.getPage(i));
      }
      setPages(pageList);
    })();
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    pages.forEach(async (page, i) => {
      const canvas = canvasRefs.current[i];
      if (!canvas) return;
      const viewport = page.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
    });
  }, [pages]);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: "white" }}>
      {pages.map((_, i) => (
        <canvas key={i} ref={el => { canvasRefs.current[i] = el; }} style={{ width: "100%", height: "auto", display: "block" }} />
      ))}
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
};

const contentTabs = [
  { id: "hiragana", label: "ひらがな" },
  { id: "katakana", label: "カタカナ" },
  { id: "kanji",    label: "漢字" },
  { id: "math",     label: "算数" },
  { id: "vocab",    label: "語彙" },
  { id: "grammar",  label: "文法" },
  { id: "picture",  label: "絵本" },
  { id: "song",     label: "うた" },
  { id: "daily",    label: "日常" },
  { id: "season",   label: "季節" },
  { id: "number",   label: "数字" },
];
const methodTabs = [
  { id: "test",     label: "テスト" },
  { id: "karuta",   label: "かるた" },
  { id: "practice", label: "練習" },
  { id: "game",     label: "ゲーム" },
  { id: "nurie",    label: "ぬりえ" },
  { id: "reading",  label: "読み物" },
  { id: "craft",    label: "工作" },
  { id: "music",    label: "うた" },
  { id: "talk",     label: "会話" },
  { id: "nazori",   label: "なぞり書き" },
  { id: "puzzle",   label: "パズル" },
];

const bgMap: Record<string, string> = {
  hiragana: "linear-gradient(135deg,#dbe8ff,#c8d8ff)",
  katakana: "linear-gradient(135deg,#ecdeff,#ddc8ff)",
  kanji:    "linear-gradient(135deg,#ffd9ee,#ffc8e4)",
  math:     "linear-gradient(135deg,#d6f5e5,#c0ecd4)",
  vocab:    "linear-gradient(135deg,#fff8e0,#ffedb0)",
  grammar:  "linear-gradient(135deg,#fff0ec,#ffd8d0)",
  picture:  "linear-gradient(135deg,#e8f8ff,#c8eeff)",
  song:     "linear-gradient(135deg,#edfff0,#c8f0d0)",
  daily:    "linear-gradient(135deg,#f8e8ff,#ecd0ff)",
  season:   "linear-gradient(135deg,#e8efff,#d0dcff)",
  number:   "linear-gradient(135deg,#f0e8ff,#d8c8ff)",
};
const charMap: Record<string, string> = {
  hiragana: "あ", katakana: "ア", kanji: "字", math: "＋",
  vocab: "語", grammar: "文", picture: "絵", song: "♪",
  daily: "日", season: "季", number: "数",
};
const charColorMap: Record<string, string> = {
  hiragana: "#4a72c4", katakana: "#8a5cc4", kanji: "#c44a88", math: "#3a8a5a",
  vocab: "#b08020", grammar: "#c05040", picture: "#4090c0", song: "#3a8a5a",
  daily: "#9040c0", season: "#4a72c4", number: "#7040c0",
};

function getCardStyle(mat: Material) {
  const first = mat.content?.[0] ?? "hiragana";
  return {
    bg: bgMap[first] ?? "linear-gradient(135deg,#e8efff,#d0dcff)",
    char: charMap[first] ?? "✦",
    charColor: charColorMap[first] ?? "#4a72c4",
  };
}

function getTag(mat: Material) {
  if (mat.isPickup) return { tag: "PICK", tagBg: "#ecdeff", tagColor: "#7040b0" };
  if (mat.isNew) return { tag: "NEW", tagBg: "#ffd9ee", tagColor: "#a03070" };
  if (mat.requiredPlan === "free") return { tag: "無料", tagBg: "#d6f5e5", tagColor: "#2a6a44" };
  return { tag: "サブスク", tagBg: "#ecdeff", tagColor: "#7040b0" };
}

type TooltipType = "favorite" | "download";

function LockTooltip({ type, visible, onClose }: { type: TooltipType; visible: boolean; onClose: () => void }) {
  if (!visible) return null;
  const isFav = type === "favorite";
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
      <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 50, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", padding: "16px 18px", width: 230, border: "0.5px solid rgba(200,170,240,0.25)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 6 }}>
          {isFav ? "🔒 お気に入り機能" : "🔒 ダウンロード"}
        </div>
        <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7, marginBottom: 14 }}>
          {isFav ? "ログインするとお気に入りに保存できます。" : "ログインするとPDFをダウンロードできます。"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { window.location.href = "/auth"; }} style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: "7px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>新規登録</button>
          <button onClick={() => { window.location.href = "/auth?mode=login"; }} style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: "7px 0", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer" }}>ログイン</button>
        </div>
      </div>
    </>
  );
}

function renderNotionText(text: string) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return <div key={i} style={{ fontSize: 14, fontWeight: 800, color: "#333", marginTop: 6 }}>{line.replace("## ", "")}</div>;
        if (line.startsWith("> ")) return <div key={i} style={{ fontSize: 13, color: "#9b6ed4", background: "rgba(228,155,253,0.08)", border: "0.5px solid rgba(228,155,253,0.3)", borderRadius: 8, padding: "8px 12px", lineHeight: 1.8 }}>{line.replace("> ", "")}</div>;
        if (/^\d+\. /.test(line)) {
          const num = line.match(/^(\d+)\. /)?.[1];
          return (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{num}</span>
              <span style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>{line.replace(/^\d+\. /, "")}</span>
            </div>
          );
        }
        if (line.startsWith("✦ ") || line.startsWith("- ")) return (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: "#e49bfd", fontSize: 12, flexShrink: 0, marginTop: 3 }}>✦</span>
            <span style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>{line.replace("✦ ", "").replace("- ", "")}</span>
          </div>
        );
        if (line === "") return <div key={i} style={{ height: 4 }} />;
        return <p key={i} style={{ fontSize: 13, color: "#777", lineHeight: 1.9, margin: 0 }}>{line}</p>;
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
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [teaserFavIds, setTeaserFavIds] = useState<string[]>([]);
  const [teaserFavTooltip, setTeaserFavTooltip] = useState(false);
  const [userPlan, setUserPlan] = useState("free");
  const [dlHover, setDlHover] = useState(false);
  const [favHover, setFavHover] = useState(false);
  const [homeHover, setHomeHover] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id);
      if (data) setTeaserFavIds(data.map((d: { material_id: string }) => d.material_id));
    });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/materials/${id}`)
      .then(r => r.json())
      .then(async (data) => {
        setMaterial(data);
        setLoading(false);
        const allRes = await fetch("/api/materials");
        const allMats: Material[] = await allRes.json();
        const related = allMats.filter((m) =>
          m.id !== data.id &&
          (
            (m.content ?? []).some((c: string) => (data.content ?? []).includes(c)) ||
            (m.method ?? []).some((me: string) => (data.method ?? []).includes(me))
          )
        ).slice(0, 6);
        setRelatedMaterials(related);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
    setIsLoggedIn(!!session);
      if (session) {
        const { data } = await supabase.from("favorites").select("id").eq("user_id", session.user.id).eq("material_id", id).maybeSingle();
        setIsFav(!!data);
        const { data: profileData } = await supabase.from("profiles").select("plan").eq("id", session.user.id).single();
        if (profileData?.plan) setUserPlan(profileData.plan);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        const { data: profileData } = await supabase.from("profiles").select("plan").eq("id", session.user.id).single();
        if (profileData?.plan) setUserPlan(profileData.plan);
      }
    });
    return () => subscription.unsubscribe();
  }, [id]);

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
    if (!isLoggedIn) { setActiveTooltip(activeTooltip === "download" ? null : "download"); return; }
    if (!material?.pdfFile) return;
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
    // ダウンロード履歴をSupabaseに記録
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("download_history").insert({
          user_id: session.user.id,
          material_id: id,
        });
      }
    } catch (e) {
      console.error("履歴の記録に失敗しました", e);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); setScale(s => Math.min(4, Math.max(0.3, s - e.deltaY * 0.01))); }
    };
    const onGesture = (e: any) => {
      e.preventDefault();
      setScale(s => Math.min(4, Math.max(0.3, s * e.scale)));
    };
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

  const handleMouseDown = (e: React.MouseEvent) => { setDragging(true); dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }; };
  const handleMouseMove = (e: React.MouseEvent) => { if (!dragging || !dragStart.current) return; setOffset({ x: dragStart.current.ox + e.clientX - dragStart.current.mx, y: dragStart.current.oy + e.clientY - dragStart.current.my }); };
  const handleMouseUp = () => { setDragging(false); dragStart.current = null; };

  const SB_ICON_W = 64;
  const SB_PANEL_W = 393;
  const panelOpen = activePanel !== null;

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#bbb", fontSize: 14 }}>読み込み中...</div>;
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
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ padding: "10px 12px", background: "#f7f7f7", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>学習内容</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#444" }}>{(material.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・") || "－"}</div>
            </div>
            <div style={{ padding: "10px 12px", background: "#f7f7f7", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>学習方法</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#444" }}>{(material.method ?? []).map(m => methodTabs.find(t => t.id === m)?.label).filter(Boolean).join("・") || "－"}</div>
            </div>
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
      content: (
        <div style={{ padding: "20px 18px", position: "relative" as const, height: "100%" }}>
          {teaserMat ? (() => {
            const { bg: tBg, char: tChar, charColor: tCharColor } = getCardStyle(teaserMat);
            const { tag: tTag, tagBg: tTagBg, tagColor: tTagColor } = getTag(teaserMat);
            return (
              <TeaserModal
                mat={teaserMat as any}
                bg={tBg} char={tChar} charColor={tCharColor}
                tag={tTag} tagBg={tTagBg} tagColor={tTagColor}
                isLoggedIn={isLoggedIn}
                userPlan={userPlan}
                favIds={teaserFavIds}
                contentTabs={contentTabs.map(t => ({ ...t, char: t.label[0], color: "#e8efff", imageSrc: null }))}
                methodTabs={methodTabs.map(t => ({ ...t, char: t.label[0], imageSrc: null }))}
                locale="ja"
                tmm={(key) => ({ age: "対象年齢", content: "学習内容", method: "学習方法", download: "ダウンロード", lock_download: "サブスクプランで使えます", add_fav: "お気に入りに追加", added_fav: "お気に入りに追加済み" }[key] ?? key)}
                onClose={() => setTeaserMat(null)}
                onFavChange={(materialId, isFav) => {
                  if (isFav) setTeaserFavIds(prev => [...prev, materialId]);
                  else setTeaserFavIds(prev => prev.filter(id => id !== materialId));
                }}
              />
            );
          })() : (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 14 }}>関連する教材</div>
              {relatedMaterials.length === 0 ? (
                <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.8 }}>関連する教材が見つかりませんでした。</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {relatedMaterials.map((m) => {
                    const { bg: rBg, char: rChar, charColor: rCharColor } = getCardStyle(m);
                    const { tag: rTag, tagBg: rTagBg, tagColor: rTagColor } = getTag(m);
                    return (
                      <MaterialCard
                        key={m.id}
                        mat={m as any}
                        onClick={() => setTeaserMat(m)}
                        locale="ja"
                        isLoggedIn={isLoggedIn}
                        favIds={teaserFavIds}
                        bg={rBg} char={rChar} charColor={rCharColor}
                        tag={rTag} tagBg={rTagBg} tagColor={rTagColor}
                        onFavToggle={async (mat) => {
                          if (!isLoggedIn) return;
                          const supabase = createClient();
                          const { data: { session } } = await supabase.auth.getSession();
                          if (!session) return;
                          if (teaserFavIds.includes(mat.id)) {
                            await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
                            setTeaserFavIds((prev) => prev.filter((fid) => fid !== mat.id));
                          } else {
                            await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
                            setTeaserFavIds((prev) => [...prev, mat.id]);
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
      ),
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
          <TagBadge tag={tag} />
          {(material.level ?? []).map((lv: string) => (
            <span key={lv} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070", whiteSpace: "nowrap", flexShrink: 0 }}>{lv}</span>
          ))}
          <span style={{ fontSize: 15, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{material.title}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap", fontWeight: 400, flexShrink: 0 }}>{(material.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・")}</span>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", fontWeight: 400, flexShrink: 0 }}>{isFree ? "このプリントは無料でダウンロードできます" : "このプリントはサブスク会員限定です"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <button onClick={handleFavClick} onMouseEnter={() => setFavHover(true)} onMouseLeave={() => setFavHover(false)} style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.55)", background: favHover ? "rgba(255,255,255,0.22)" : "transparent", cursor: "pointer" }}>
              {!isLoggedIn ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" stroke="white" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="white" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill={isFav ? "white" : "none"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="white" /></svg>
              )}
              <span style={{ fontSize: 12, fontWeight: 600, color: "white", whiteSpace: "nowrap" }}>{isLoggedIn ? (isFav ? "保存済み" : "お気に入り") : "お気に入り"}</span>
            </button>
            <LockTooltip type="favorite" visible={activeTooltip === "favorite"} onClose={() => setActiveTooltip(null)} />
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={handleDownloadClick} onMouseEnter={() => setDlHover(true)} onMouseLeave={() => setDlHover(false)} style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 16px", borderRadius: 8, border: "none", background: dlHover ? "rgba(255,255,255,0.85)" : "white", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M12 3v13M7 11l5 5 5-5" stroke="#333" /><path d="M4 20h16" stroke="#333" /></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#333", whiteSpace: "nowrap" }}>ダウンロード</span>
            </button>
            <LockTooltip type="download" visible={activeTooltip === "download"} onClose={() => setActiveTooltip(null)} />
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <aside style={{ display: "flex", position: "absolute", top: 0, left: 0, bottom: 0, zIndex: 20, overflow: "hidden" }} onMouseLeave={() => setActivePanel(null)}>
          <div style={{ width: SB_ICON_W, background: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 4, flexShrink: 0 }}>
            {sidePanels.map((panel) => {
              const active = activePanel === panel.id;
              return (
                <button key={panel.id} onMouseEnter={() => setActivePanel(panel.id)} title={panel.label} style={{ width: 46, height: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, border: "none", borderRadius: 10, background: "transparent", cursor: "pointer", padding: 0 }}>
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
              <div style={{ padding: "14px 18px 10px", borderBottom: "0.5px solid rgba(163,192,255,0.2)" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#9b6ed4" }}>{sidePanels.find(p => p.id === activePanel)?.label}</span>
              </div>
              {sidePanels.find(p => p.id === activePanel)?.content}
            </div>
          </div>
        </aside>

        <main style={{ flex: 1, overflow: "hidden", background: "#f0f0f0", position: "relative" }}>
          {material.pdfFile ? (
            <PdfViewer url={material.pdfFile} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 480, aspectRatio: "1 / 1.414", background: material.thumbnail ? "white" : bg, borderRadius: 4, boxShadow: "0 16px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                {material.thumbnail ? (
                  <img src={material.thumbnail} alt={material.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.25)" }} />
                    <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 80, fontWeight: 700, color: charColor }}>{char}</div>
                      <div style={{ fontSize: 14, color: "rgba(80,80,120,0.5)", marginTop: 8, letterSpacing: 2 }}>PREVIEW</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      
    </div>
  );
}