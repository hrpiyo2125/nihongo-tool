"use client";
import { useState, useRef, useEffect } from "react";
import { setCachedThumbnail } from "../../lib/pdfThumbnailCache";
import PlanModal from "../../components/PlanModal";
import { BrandIcon } from "../../components/BrandIcon";

// モバイルでPDF同時レンダリングを制限するキュー
const MAX_CONCURRENT = 2;
let activeCount = 0;
const queue: (() => void)[] = [];
function acquireSlot(fn: () => void) {
  if (activeCount < MAX_CONCURRENT) { activeCount++; fn(); }
  else queue.push(fn);
}
function releaseSlot() {
  activeCount--;
  const next = queue.shift();
  if (next) { activeCount++; next(); }
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

function PdfCardThumbnail({ pdfUrl, onReady }: { pdfUrl: string; onReady?: () => void }) {
  const [pdfPage, setPdfPage] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const readyCalled = useRef(false);

  // 画面に入ったら初めてPDFを読み込む
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "50px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    acquireSlot(async () => {
      try {
        if (cancelled) { releaseSlot(); return; }
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const doc = await pdfjsLib.getDocument({ url: `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`, withCredentials: false }).promise;
        if (!cancelled) setPdfPage(await doc.getPage(1));
      } catch (e) {
        console.error("PDF card thumbnail error:", e);
        if (!readyCalled.current) { readyCalled.current = true; onReady?.(); }
      } finally {
        releaseSlot();
      }
    });
    return () => { cancelled = true; };
  }, [visible, pdfUrl]);

  useEffect(() => {
    if (!pdfPage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const viewport = pdfPage.getViewport({ scale: 1.5 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const task = (pdfPage.render as any)({ canvasContext: canvas.getContext("2d")!, viewport, canvas });
    task.promise?.then(() => {
      try { setCachedThumbnail(pdfUrl, canvas.toDataURL()); } catch {}
      if (!readyCalled.current) { readyCalled.current = true; onReady?.(); }
    }).catch(() => {
      if (!readyCalled.current) { readyCalled.current = true; onReady?.(); }
    });
  }, [pdfPage]);

  return (
    <div ref={containerRef} style={{ height: 135, background: "#ece9f1", position: "relative", overflow: "hidden" }}>
      <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: 0, opacity: pdfPage ? 0 : 1, transition: "opacity 0.3s", pointerEvents: "none" }} />
      <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: "block", opacity: pdfPage ? 1 : 0, transition: "opacity 0.3s" }} />
    </div>
  );
}

type Props = {
  mat: Material & { thumbnailUrl?: string };
  onClick: () => void;
  locale: string;
  isLoggedIn?: boolean;
  userPlan?: string;
  favIds?: string[];
  purchasedIds?: string[];
  onFavToggle?: (mat: Material) => void;
  onOpenFavHistory?: () => void;
  bg: string;
  char: string;
  charColor: string;
  tag: string;
  tagBg: string;
  tagColor: string;
};

export default function MaterialCard({
  mat, onClick, isLoggedIn, userPlan, favIds, purchasedIds = [], onFavToggle, onOpenFavHistory,
  bg, char, charColor, tag, tagBg, tagColor,
}: Props) {
  const isPurchased = purchasedIds.includes(mat.id);
  const uniqueFavCount = new Set(favIds ?? []).size;
  const isFreeUser = !userPlan || userPlan === "free";
  const atFavLimit = isFreeUser && !favIds?.includes(mat.id) && uniqueFavCount >= 5;
  const [limitTooltip, setLimitTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const [showPlanModal, setShowPlanModal] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const TOOLTIP_W = 260;
  const TOOLTIP_H = 210;
  const MARGIN = 8;

  const openLimitTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!limitTooltip && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // 横: ボタン右端に揃え、はみ出したらビューポート内に収める
      const left = Math.max(MARGIN, Math.min(rect.right - TOOLTIP_W, vw - TOOLTIP_W - MARGIN));
      // 縦: 下に空きがあれば下、なければ上
      const pos = vh - rect.bottom >= TOOLTIP_H + MARGIN
        ? { top: rect.bottom + 6 }
        : { bottom: vh - rect.top + 6 };
      setTooltipPos({ left, ...pos });
    }
    setLimitTooltip(prev => !prev);
  };

  return (
    <div onClick={onClick} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer", position: "relative" }}>
      {(mat.requiredPlan === "subscribe" || isPurchased) && (
        <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, display: "flex", alignItems: "center", gap: 4 }}>
          {mat.requiredPlan === "subscribe" && (
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(200,180,230,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M2 8l5 4 5-7 5 7 5-4-2 9H4L2 8z" fill="#c9a0f0" stroke="#c9a0f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="4" y="17" width="16" height="2.5" rx="1" fill="#c9a0f0"/>
              </svg>
            </div>
          )}
          {isPurchased && (
            <div style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#e8f4ff", color: "#3a7abf", border: "0.5px solid rgba(58,122,191,0.3)" }}>
              購入済み
            </div>
          )}
        </div>
      )}
      {isLoggedIn && onFavToggle && (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
          <button
            ref={btnRef}
            onClick={(e) => {
              e.stopPropagation();
              if (atFavLimit) { openLimitTooltip(e); return; }
              onFavToggle(mat);
            }}
            style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(200,180,230,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={favIds?.includes(mat.id) ? "#c9a0f0" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/>
            </svg>
          </button>
        </div>
      )}
      {mat.thumbnailUrl ? (
        <div style={{ height: 135, position: "relative", overflow: "hidden" }}>
          <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: 0, pointerEvents: "none" }} />
          <img src={mat.thumbnailUrl} alt="" loading="lazy" style={{ width: "100%", height: 135, objectFit: "cover", display: "block", position: "relative" }} onLoad={(e) => { const prev = (e.target as HTMLElement).previousElementSibling as HTMLElement; if (prev) prev.style.opacity = "0"; }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      ) : mat.pdfFile && mat.pdfFile.length > 0 ? (
        <PdfCardThumbnail pdfUrl={mat.pdfFile} />
      ) : (
        <div style={{ height: 135, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: charColor, fontWeight: 700 }}>{char}</div>
      )}
      <div style={{ padding: "10px 12px 14px" }}>
        {tag && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: tagBg, color: tagColor, display: "inline-block", marginBottom: 6 }}>{tag}</span>}
        {(mat.level ?? []).length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
            {(mat.level ?? []).map((lv: string) => (
              <span key={lv} style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070" }}>{lv}</span>
            ))}
          </div>
        )}
        <div style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
      </div>

      {limitTooltip && (
        <>
          <div onClick={(e) => { e.stopPropagation(); setLimitTooltip(false); }} style={{ position: "fixed", inset: 0, zIndex: 249 }} />
          <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", top: tooltipPos.top, bottom: tooltipPos.bottom, left: tooltipPos.left, zIndex: 250, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.16)", padding: "14px 16px", width: 260, border: "0.5px solid rgba(200,170,240,0.3)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#7a50b0", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <BrandIcon name="star" size={13} color="#7a50b0" />お気に入りの上限に達しました
            </div>
            <div style={{ fontSize: 11, color: "#666", lineHeight: 1.8, marginBottom: 10 }}>
              toolio free の方は最大5件まで登録可能です。この教材をお気に入り登録したい方は、お気に入り履歴で数の調整をしてください。
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setLimitTooltip(false); onOpenFavHistory ? onOpenFavHistory() : window.dispatchEvent(new CustomEvent("toolio:navigate-mypage", { detail: { page: "fav" } })); }}
              style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "7px 0", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", marginBottom: 8 }}
            >
              お気に入り履歴を開く →
            </button>
            <div style={{ fontSize: 11, color: "#666", lineHeight: 1.8, marginBottom: 8 }}>
              無制限でお気に入り登録したい方はプランのアップグレードをしてください。
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setLimitTooltip(false); setShowPlanModal(true); }}
              style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "7px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}
            >
              プランをアップグレードする →
            </button>
          </div>
        </>
      )}

      {showPlanModal && (
        <PlanModal
          currentPlan={userPlan ?? "free"}
          onSubscribed={() => setShowPlanModal(false)}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </div>
  );
}
