"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "../../lib/supabase";

import { canDownload } from "../../lib/materialUtils";
import { BrandIcon } from "../../components/BrandIcon";
import PurchaseConfirmModal from "./PurchaseConfirmModal";
import PlanModal from "../../components/PlanModal";

type Material = {
  id: string;
  title: string;
  description: string;
  level: string[];
  content: string[];
  method: string[];
  ageGroup: string;
  studyTime?: string;
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const THUMB_BASE = `${SUPABASE_URL}/storage/v1/object/public/thumbnails`;

function ImageLightbox({ src, onClose, onPrev, onNext, hasPrev, hasNext }: { src: string; onClose: () => void; onPrev?: () => void; onNext?: () => void; hasPrev?: boolean; hasNext?: boolean }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clampOffset = (s: number, ox: number, oy: number) => {
    const maxX = Math.max(0, (s - 1) * 200);
    const maxY = Math.max(0, (s - 1) * 300);
    return { x: Math.max(-maxX, Math.min(maxX, ox)), y: Math.max(-maxY, Math.min(maxY, oy)) };
  };

  const zoom = (delta: number) => {
    setScale(prev => {
      const next = Math.max(1, Math.min(5, prev + delta));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const onWheel = (e: React.WheelEvent) => { e.preventDefault(); zoom(-e.deltaY * 0.002); };
  const onMouseDown = (e: React.MouseEvent) => { if (scale === 1) return; setDragging(true); dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }; };
  const onMouseMove = (e: React.MouseEvent) => { if (!dragging || !dragStart.current) return; setOffset(clampOffset(scale, dragStart.current.ox + (e.clientX - dragStart.current.mx), dragStart.current.oy + (e.clientY - dragStart.current.my))); };
  const onMouseUp = () => { setDragging(false); dragStart.current = null; };

  const arrowBtn = (disabled: boolean): React.CSSProperties => ({ position: "absolute", top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.25 : 1, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(200,190,220,0.45)" }}>
      <div ref={containerRef} onClick={(e) => e.stopPropagation()} onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        style={{ width: "min(480px, 66vw)", height: "min(88vh, 680px)", background: "rgba(232,228,240,0.94)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", touchAction: "none", cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default", boxShadow: "0 8px 40px rgba(0,0,0,0.22)" }}
      >
        <img src={src} alt="" draggable={false} style={{ maxWidth: "68%", maxHeight: "calc(100% - 64px)", borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`, transformOrigin: "center", transition: dragging ? "none" : "transform 0.15s ease", userSelect: "none", pointerEvents: "none" }} />
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", color: "#555" }}>✕</button>
        {onPrev && <button onClick={(e) => { e.stopPropagation(); onPrev(); }} disabled={!hasPrev} style={{ ...arrowBtn(!hasPrev), left: 10 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>}
        {onNext && <button onClick={(e) => { e.stopPropagation(); onNext(); }} disabled={!hasNext} style={{ ...arrowBtn(!hasNext), right: 10 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>}
        <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => zoom(-0.5)} disabled={scale <= 1} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", color: "#555", fontSize: 18, cursor: scale > 1 ? "pointer" : "default", opacity: scale <= 1 ? 0.35 : 1, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>−</button>
          <button onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }} style={{ fontSize: 11, color: "#555", background: "none", border: "none", cursor: "pointer", minWidth: 40, textAlign: "center" }}>{Math.round(scale * 100)}%</button>
          <button onClick={() => zoom(0.5)} disabled={scale >= 5} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", color: "#555", fontSize: 18, cursor: scale < 5 ? "pointer" : "default", opacity: scale >= 5 ? 0.35 : 1, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>＋</button>
        </div>
      </div>
    </div>
  );
}

function PdfPreview({ matId }: { matId: string }) {
  const [selected, setSelected] = useState(0);
  const [mainReady, setMainReady] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const urls = Array.from({ length: 3 }, (_, i) => `${THUMB_BASE}/${matId}-p${i + 1}.png`);
  const shimmer = "linear-gradient(90deg,#ece8f5 25%,#ddd8ee 50%,#ece8f5 75%)";

  useEffect(() => {
    setMainReady(false);
    setVisibleCount(1);
    const check = (i: number) => {
      if (i >= 3) return;
      const img = new Image();
      img.onload = () => { setVisibleCount(i + 1); check(i + 1); };
      img.onerror = () => {};
      img.src = urls[i];
    };
    check(1);
  }, [matId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0, position: "relative" }}>
        <div onClick={() => mainReady && setLightboxSrc(urls[selected])} style={{ flex: 1, background: "#e8e4f0", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, minHeight: 0, position: "relative", cursor: mainReady ? "zoom-in" : "default" }}>
          <div style={{ position: "absolute", width: "80%", aspectRatio: "210/297", background: shimmer, backgroundSize: "200% 100%", animation: "toolio-shimmer 3s infinite", borderRadius: 8, opacity: mainReady ? 0 : 1, transition: "opacity 0.4s ease", pointerEvents: "none" }} />
          <img src={urls[selected]} alt="" onLoad={() => setMainReady(true)} style={{ width: "80%", height: "auto", display: "block", borderRadius: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", opacity: mainReady ? 1 : 0, transition: "opacity 0.4s ease" }} />
          {mainReady && <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.28)", borderRadius: 6, padding: "3px 7px", fontSize: 11, color: "white", pointerEvents: "none", display: "flex", alignItems: "center", gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/><path d="M11 8v6M8 11h6"/></svg>拡大</div>}
          {selected > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setSelected(i => i - 1); setMainReady(false); }} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {selected < visibleCount - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setSelected(i => i + 1); setMainReady(false); }} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexShrink: 0, height: 72, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", gap: 8, justifyContent: "center", opacity: visibleCount > 1 ? 0 : 1, transition: "opacity 0.4s ease", pointerEvents: "none" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 52, height: 72, borderRadius: 6, background: shimmer, backgroundSize: "200% 100%", animation: "toolio-shimmer 3s infinite", flexShrink: 0 }} />
            ))}
          </div>
          {urls.slice(0, visibleCount).map((url, i) => (
            <div key={i} onClick={() => { setSelected(i); setMainReady(false); }} style={{ width: 52, cursor: "pointer", borderRadius: 6, overflow: "hidden", border: selected === i ? "2px solid #9b6ed4" : "2px solid rgba(155,110,212,0.2)", boxShadow: selected === i ? "0 0 0 2px rgba(155,110,212,0.25)" : "none", background: "#fff", flexShrink: 0 }}>
              <img src={url} alt="" style={{ width: "100%", height: "auto", display: "block", }} />
            </div>
          ))}
        </div>
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
          hasPrev={selected > 0}
          hasNext={selected < visibleCount - 1}
          onPrev={() => { setSelected(i => i - 1); setLightboxSrc(urls[selected - 1]); }}
          onNext={() => { setSelected(i => i + 1); setLightboxSrc(urls[selected + 1]); }}
        />
      )}
    </div>
  );
}

type ContentTab = { id: string; label: string; char: string; color: string; imageSrc?: string | null };
type MethodTab = { id: string; label: string; char: string; imageSrc?: string | null };

type Props = {
  mat: Material;
  bg: string;
  char: string;
  charColor: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  isLoggedIn: boolean;
  userPlan: string;
  purchasedIds?: string[];
  favIds: string[];
  contentTabs: ContentTab[];
  methodTabs: MethodTab[];
  locale: string;
  tmm: (key: string) => string;
  onClose: () => void;
  onFavChange?: (materialId: string, isFav: boolean) => void;
  onOpenAuth?: (mode: "signup" | "login") => void;
};

export default function TeaserModal({
  mat, tag, tagBg, tagColor,
  isLoggedIn, userPlan, purchasedIds = [], favIds: initialFavIds,
  contentTabs, methodTabs, locale: _locale, tmm,
  onClose, onFavChange, onOpenAuth,
}: Props) {
  const [favIds, setFavIds] = useState<string[]>(initialFavIds);
  const [favTooltip, setFavTooltip] = useState(false);
  const [favLimitTooltip, setFavLimitTooltip] = useState(false);
  const [downTooltip, setDownTooltip] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<"idle" | "confirm" | "loading" | "done">("idle");
  
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const isFreeUser = userPlan === "free" || userPlan === "" || !userPlan;
  const isFav = favIds.includes(mat.id);
  const canDl = canDownload(userPlan, mat.requiredPlan, purchasedIds, mat.id);

  const handleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) { setFavTooltip(!favTooltip); return; }
    if (isFreeUser && !isFav && new Set(favIds).size >= 5) { setFavLimitTooltip(prev => !prev); return; }
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
      setFavIds(prev => prev.filter(id => id !== mat.id));
      onFavChange?.(mat.id, false);
      window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
    } else {
      await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
      setFavIds(prev => [...prev, mat.id]);
      onFavChange?.(mat.id, true);
      window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
    }
  };

  

  return (
    <div onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 720, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden", position: "relative", height: "min(88vh, 580px)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, zIndex: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.08)", border: "none", cursor: "pointer", fontSize: 14, color: "#666" }}>✕</button>

        {/* 左：プレビュー */}
        <div style={{ background: "#f5f0ff", padding: 16, display: "flex", flexDirection: "column", gap: 10, minHeight: 0, overflow: "hidden" }}>
          <style>{`@keyframes toolio-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          {mat.pdfFile ? (
            <PdfPreview matId={mat.id} />
          ) : (
            <>
              <div style={{ width: "100%", aspectRatio: "210/297", background: "linear-gradient(90deg,#ece8f5 25%,#ddd8ee 50%,#ece8f5 75%)", backgroundSize: "200% 100%", animation: "toolio-shimmer 2.2s infinite", borderRadius: 12 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[0, 1].map(i => (
                  <div key={i} style={{ aspectRatio: "210/297", background: "linear-gradient(90deg,#ece8f5 25%,#ddd8ee 50%,#ece8f5 75%)", backgroundSize: "200% 100%", animation: "toolio-shimmer 2.2s infinite", borderRadius: 8 }} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 右：情報 */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {/* タグ・レベル */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {tag && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: tagBg, color: tagColor }}>{tag}</span>}
              {mat.requiredPlan === "subscribe" && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(201,160,240,0.15)", color: "#9b6ed4" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M2 8l5 4 5-7 5 7 5-4-2 9H4L2 8z" fill="#c9a0f0" stroke="#c9a0f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="17" width="16" height="2.5" rx="1" fill="#c9a0f0"/></svg>
                  サブスク
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(mat.level ?? []).map(lv => (
                <span key={lv} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070" }}>{lv}</span>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 20, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
          <div style={{ fontSize: 14, color: "#777", lineHeight: 1.7, marginTop: 8 }}>
            {mat.description || `楽しく学べる${contentTabs.find(t => t.id === (mat.content?.[0] ?? ""))?.label}の教材です。`}
          </div>

          {/* グレーボックス */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            {[
              { label: tmm("age"), value: mat.ageGroup || "－" },
              { label: tmm("duration"), value: mat.studyTime || "－" },
              { label: tmm("method"), value: (mat.method ?? []).map(m => methodTabs.find(t => t.id === m)?.label).filter(Boolean).join("・") || "－" },
              { label: tmm("content"), value: (mat.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・") || "－" },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#f7f7f7", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* お気に入りボタン */}
          <div style={{ position: "relative", marginTop: 16 }}>
            <button onClick={handleFav} style={{ width: "100%", padding: "11px", marginBottom: 10, borderRadius: 10, border: "0.5px solid rgba(200,170,240,0.4)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 600, color: isLoggedIn && isFav ? "#c9a0f0" : "#999" }}>
              {!isLoggedIn ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#bbb" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="#bbb" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? "#c9a0f0" : "none"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/></svg>
              )}
              {!isLoggedIn ? tmm("add_fav") : isFav ? tmm("added_fav") : tmm("add_fav")}
            </button>
            {favTooltip && (
              <>
                <div onClick={() => setFavTooltip(false)} style={{ position: "fixed", inset: 0, zIndex: 249 }} />
                <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 250, background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", padding: "14px 16px", width: 220, border: "0.5px solid rgba(200,170,240,0.25)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}><BrandIcon name="lock" size={13} color="#bbb" />お気に入り機能</div>
                  <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7, marginBottom: 12 }}>ログインするとお気に入りに保存できます。</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { onOpenAuth ? onOpenAuth("signup") : (window.location.href = "/"); }} style={{ flex: 1, fontSize: 10, fontWeight: 700, padding: "6px 0", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>新規登録</button>
                    <button onClick={() => { onOpenAuth ? onOpenAuth("login") : (window.location.href = "/"); }} style={{ flex: 1, fontSize: 10, fontWeight: 600, padding: "6px 0", borderRadius: 7, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer" }}>ログイン</button>
                  </div>
                </div>
              </>
            )}
            {favLimitTooltip && (
              <>
                <div onClick={() => setFavLimitTooltip(false)} style={{ position: "fixed", inset: 0, zIndex: 249 }} />
                <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 250, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.16)", padding: "16px 18px", width: 280, border: "0.5px solid rgba(200,170,240,0.3)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#7a50b0", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <BrandIcon name="star" size={13} color="#7a50b0" />お気に入りの上限に達しました
                  </div>
                  <div style={{ fontSize: 11, color: "#666", lineHeight: 1.8, marginBottom: 10 }}>
                    toolio free の方は最大5件まで登録可能です。この教材をお気に入り登録したい方は、お気に入り履歴で数の調整をしてください。
                  </div>
                  <button
                    onClick={() => { setFavLimitTooltip(false); onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent("toolio:navigate-mypage", { detail: { page: "fav" } })), 0); }}
                    style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "7px 0", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", marginBottom: 10 }}
                  >
                    お気に入り履歴を開く →
                  </button>
                  <div style={{ fontSize: 11, color: "#666", lineHeight: 1.8, marginBottom: 8 }}>
                    無制限でお気に入り登録したい方はプランのアップグレードをしてください。
                  </div>
                  <button
                    onClick={() => { setFavLimitTooltip(false); setShowPlanModal(true); }}
                    style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "7px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}
                  >
                    プランをアップグレードする →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ダウンロードボタン */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                if (canDl) { window.open(`/materials/${mat.id}`, "_blank"); onClose(); }
                else setDownTooltip(!downTooltip);
              }}
              style={{ width: "100%", padding: "13px", background: canDl ? "#a3c0ff" : "#f0eeff", color: canDl ? "white" : "#7F77DD", border: canDl ? "none" : "1px solid rgba(163,192,255,0.4)", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {!canDl && <BrandIcon name="lock" size={16} color="#7F77DD" />}
              {canDl ? tmm("download") : tmm("lock_download")}
            </button>
            {downTooltip && !canDl && (
              <>
                <div onClick={() => setDownTooltip(false)} style={{ position: "fixed", inset: 0, zIndex: 249 }} />
                <div style={{ position: "fixed", top: "50%", left: "calc(50% + 80px)", transform: "translateY(-50%)", zIndex: 300, background: "white", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", padding: "28px 32px", width: 380, border: "0.5px solid rgba(200,170,240,0.35)" }}>
                  <div style={{ fontSize: 13, color: "#7a50b0", fontWeight: 700, marginBottom: 10, lineHeight: 1.6 }}>
                    サブスクプランにアップグレードすると、この教材を今すぐ使えます。
                  </div>
                  {!isLoggedIn ? (
                    <>
                      <button onClick={() => { onOpenAuth ? onOpenAuth("signup") : (window.location.href = "/"); }} style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", marginBottom: 8 }}>無料で登録する</button>
                      <div style={{ textAlign: "center", fontSize: 11, color: "#bbb" }}>すでにアカウントをお持ちの方は<span onClick={() => { onOpenAuth ? onOpenAuth("login") : (window.location.href = "/"); }} style={{ color: "#9b6ed4", cursor: "pointer", marginLeft: 2 }}>ログイン</span></div>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setDownTooltip(false); setShowPlanModal(true); }} style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>プランをアップグレードする →</button>
                     {purchaseStep === "idle" && (
                      <>
                        <div style={{ textAlign: "center", fontSize: 11, color: "#bbb", margin: "6px 0" }}>または</div>
                        <button
                          onClick={() => setShowPurchaseConfirm(true)}
                          style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer" }}
                        >
                          ¥350 この教材を単品購入する
                        </button>
                      </>
                     )}
                      
                      {purchaseStep === "done" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                          <div style={{ fontSize: 11, color: "#3a8a5a", fontWeight: 700, textAlign: "center" }}>✓ 購入完了！</div>
                          <button onClick={() => { window.open(`/materials/${mat.id}`, "_blank"); onClose(); }} style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "#a3c0ff", color: "white", cursor: "pointer" }}>ダウンロードする</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    {showPurchaseConfirm && (
        <PurchaseConfirmModal
          mat={mat}
          onSuccess={() => {
            setShowPurchaseConfirm(false);
            setPurchaseStep("done");
          }}
          onClose={() => setShowPurchaseConfirm(false)}
        />
      )}

      {showPlanModal && (
        <PlanModal
          currentPlan={userPlan}
          requiredPlan={mat.requiredPlan}
          onSubscribed={() => {
            setShowPlanModal(false);
            setDownTooltip(false);
          }}
          onClose={() => setShowPlanModal(false)}
        />
      )}
      
    </div>
  );
}