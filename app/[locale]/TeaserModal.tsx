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

function PdfPreview({ pdfUrl }: { pdfUrl: string }) {
  const [pages, setPages] = useState<any[]>([]);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(0);
  const [allRendered, setAllRendered] = useState(false);
  const mainRef = useRef<HTMLCanvasElement>(null);
  const thumbRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const loaded = pages.length > 0 && !failed;
  const ready = loaded && allRendered;

  useEffect(() => {
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
        const doc = await pdfjsLib.getDocument({ url: proxyUrl, withCredentials: false }).promise;
        const count = Math.min(doc.numPages, 3);
        const list = [];
        for (let i = 1; i <= count; i++) list.push(await doc.getPage(i));
        setPages(list);
      } catch {
        setFailed(true);
      }
    })();
  }, [pdfUrl]);

  useEffect(() => {
    const page = pages[selected];
    const canvas = mainRef.current;
    if (!page || !canvas) return;
    const viewport = page.getViewport({ scale: 2 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    page.render({ canvasContext: canvas.getContext("2d")!, viewport });
  }, [pages, selected]);

  // サムネイルを全枚描画してから一括表示
  useEffect(() => {
    if (pages.length === 0) return;
    let completed = 0;
    pages.forEach((page, i) => {
      const canvas = thumbRefs.current[i];
      if (!canvas) return;
      const viewport = page.getViewport({ scale: 0.6 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise.then(() => {
        completed++;
        if (completed === pages.length) setAllRendered(true);
      });
    });
  }, [pages]);

  const shimmer = "linear-gradient(90deg,#ece8f5 25%,#ddd8ee 50%,#ece8f5 75%)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0 }}>
      {/* メインプレビューエリア */}
      <div style={{ flex: 1, background: "#e8e4f0", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, minHeight: 0, position: "relative" }}>
        {/* スケルトン：ready になったら opacity 0 でフェードアウト */}
        <div style={{ position: "absolute", width: "80%", aspectRatio: "210/297", background: shimmer, backgroundSize: "200% 100%", animation: "toolio-shimmer 3s infinite", borderRadius: 8, opacity: ready ? 0 : 1, transition: "opacity 0.4s ease", pointerEvents: "none" }} />
        {/* canvas は常に DOM に存在、ready でフェードイン */}
        <canvas ref={mainRef} style={{ width: "80%", height: "auto", display: "block", borderRadius: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", opacity: ready ? 1 : 0, transition: "opacity 0.4s ease" }} />
      </div>
      {/* サムネイル行 */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexShrink: 0, height: 72, position: "relative" }}>
        {/* スケルトン3枚：ready でフェードアウト */}
        <div style={{ position: "absolute", inset: 0, display: "flex", gap: 8, justifyContent: "center", opacity: ready ? 0 : 1, transition: "opacity 0.4s ease", pointerEvents: "none" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 52, height: 72, borderRadius: 6, background: shimmer, backgroundSize: "200% 100%", animation: "toolio-shimmer 3s infinite", flexShrink: 0 }} />
          ))}
        </div>
        {/* canvas は loaded 後 DOM に配置、ready でフェードイン */}
        {loaded && pages.map((_, i) => (
          <div
            key={i}
            onClick={() => ready && setSelected(i)}
            style={{ width: 52, cursor: ready ? "pointer" : "default", borderRadius: 6, overflow: "hidden", border: selected === i ? "2px solid #9b6ed4" : "2px solid rgba(155,110,212,0.2)", boxShadow: selected === i ? "0 0 0 2px rgba(155,110,212,0.25)" : "none", background: "#fff", flexShrink: 0, opacity: ready ? 1 : 0, transition: "opacity 0.4s ease" }}
          >
            <canvas ref={el => { thumbRefs.current[i] = el; }} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        ))}
      </div>
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
  contentTabs, methodTabs, locale, tmm,
  onClose, onFavChange, onOpenAuth,
}: Props) {
  const [favIds, setFavIds] = useState<string[]>(initialFavIds);
  const [favTooltip, setFavTooltip] = useState(false);
  const [favLimitTooltip, setFavLimitTooltip] = useState(false);
  const [downTooltip, setDownTooltip] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<"idle" | "confirm" | "loading" | "done">("idle");
  
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [purchaseLockTooltip, setPurchaseLockTooltip] = useState(false);
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
            <PdfPreview pdfUrl={mat.pdfFile} />
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
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: tagBg, color: tagColor }}>{tag}</span>
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
                    <button onClick={() => { onOpenAuth ? onOpenAuth("signup") : (window.location.href = "/auth"); }} style={{ flex: 1, fontSize: 10, fontWeight: 700, padding: "6px 0", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>新規登録</button>
                    <button onClick={() => { onOpenAuth ? onOpenAuth("login") : (window.location.href = "/auth?mode=login"); }} style={{ flex: 1, fontSize: 10, fontWeight: 600, padding: "6px 0", borderRadius: 7, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer" }}>ログイン</button>
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
                    無料会員の方は最大5件まで登録可能です。この教材をお気に入り登録したい方は、お気に入り履歴で数の調整をしてください。
                  </div>
                  <button
                    onClick={() => { setFavLimitTooltip(false); onClose(); window.dispatchEvent(new CustomEvent("toolio:navigate-mypage", { detail: { page: "fav" } })); }}
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
                    {mat.requiredPlan === "light" ? "ライト" : mat.requiredPlan === "standard" ? "スタンダード" : "プレミアム"}プランにするとこの教材がすぐに使えます
                  </div>
                  {!isLoggedIn ? (
                    <>
                      <button onClick={() => { onOpenAuth ? onOpenAuth("signup") : (window.location.href = "/auth"); }} style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", marginBottom: 8 }}>無料で登録する</button>
                      <div style={{ textAlign: "center", fontSize: 11, color: "#bbb" }}>すでにアカウントをお持ちの方は<span onClick={() => { onOpenAuth ? onOpenAuth("login") : (window.location.href = "/auth?mode=login"); }} style={{ color: "#9b6ed4", cursor: "pointer", marginLeft: 2 }}>ログイン</span></div>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setDownTooltip(false); setShowPlanModal(true); }} style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", marginBottom: 8 }}>プランをアップグレードする →</button>
                     {purchaseStep === "idle" && (
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={() => {
                            if (isFreeUser) setPurchaseLockTooltip(prev => !prev);
                            else setShowPurchaseConfirm(true);
                          }}
                          style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: isFreeUser ? "#f8f5ff" : "white", color: "#9b6ed4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                        >
                          {isFreeUser && <BrandIcon name="lock" size={12} color="#9b6ed4" />}
                          ¥350 この教材を単品購入する
                        </button>
                        {purchaseLockTooltip && isFreeUser && (
                          <>
                            <div onClick={() => setPurchaseLockTooltip(false)} style={{ position: "fixed", inset: 0, zIndex: 349 }} />
                            <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 350, background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.16)", padding: "14px 16px", width: 280, border: "0.5px solid rgba(200,170,240,0.35)" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#7a50b0", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                                <BrandIcon name="lock" size={12} color="#7a50b0" />単品購入について
                              </div>
                              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>
                                単品購入はライトプラン会員の方以上が使用できます。この教材を単品購入したい方はライトプラン以上のプランにご登録ください。
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); setPurchaseLockTooltip(false); setDownTooltip(false); setShowPlanModal(true); }}
                                style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}
                              >
                                プランをアップグレードする →
                              </button>
                            </div>
                          </>
                        )}
                      </div>
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