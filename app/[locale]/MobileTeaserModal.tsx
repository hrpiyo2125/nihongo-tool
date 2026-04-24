"use client";
import { useState } from "react";
import { createClient } from "../../lib/supabase";

const planRank: Record<string, number> = {
  free: 0, light: 1, standard: 2, premium: 3,
  "無料": 0, "ライト": 1, "スタンダード": 2, "プレミアム": 3,
};

function canDownload(userPlan: string, requiredPlan: string): boolean {
  return (planRank[userPlan] ?? 0) >= (planRank[requiredPlan] ?? 0);
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
  mat, bg, char, charColor, tag, tagBg, tagColor,
  isLoggedIn, userPlan, favIds: initialFavIds,
  contentTabs, methodTabs, locale, tmm,
  onClose, onFavChange, onOpenAuth,
}: Props) {
  const [favIds, setFavIds] = useState<string[]>(initialFavIds);
  const [favTooltip, setFavTooltip] = useState(false);
  const [downTooltip, setDownTooltip] = useState(false);

  const isFav = favIds.includes(mat.id);
  const canDl = canDownload(userPlan, mat.requiredPlan);

  const handleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) { setFavTooltip(!favTooltip); return; }
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
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "95vw", display: "block", overflow: "hidden", position: "relative", maxHeight: "88vh", fontSize: "80%" }} >
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, zIndex: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.08)", border: "none", cursor: "pointer", fontSize: 14, color: "#666" }}>✕</button>

        

        {/* 右：情報 */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "88vh" }}>
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
          
          {/* プレビュー */}
<div style={{ marginTop: 16, marginBottom: 8 }}>
  <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", padding: "4px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{ width: 100, height: 140, flexShrink: 0, background: bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: charColor, fontWeight: 700 }}>{char}</div>
    ))}
  </div>
</div>


          {/* グレーボックス */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            {[
              { label: tmm("age"), value: mat.ageGroup || "－" },
              { label: tmm("content"), value: (mat.content ?? []).map(c => contentTabs.find(t => t.id === c)?.label).filter(Boolean).join("・") || "－" },
              { label: tmm("method"), value: (mat.method ?? []).map(m => methodTabs.find(t => t.id === m)?.label).filter(Boolean).join("・") || "－" },
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
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 5 }}>🔒 お気に入り機能</div>
                  <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7, marginBottom: 12 }}>ログインするとお気に入りに保存できます。</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { onOpenAuth ? onOpenAuth("signup") : (window.location.href = "/auth"); }} style={{ flex: 1, fontSize: 10, fontWeight: 700, padding: "6px 0", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>新規登録</button>
                    <button onClick={() => { onOpenAuth ? onOpenAuth("login") : (window.location.href = "/auth?mode=login"); }} style={{ flex: 1, fontSize: 10, fontWeight: 600, padding: "6px 0", borderRadius: 7, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer" }}>ログイン</button>
                  </div>
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
              {!canDl && <span style={{ fontSize: 16 }}>🔒</span>}
              {canDl ? tmm("download") : tmm("lock_download")}
            </button>
            {downTooltip && !canDl && (
              <>
                <div onClick={() => setDownTooltip(false)} style={{ position: "fixed", inset: 0, zIndex: 249 }} />
                <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 250, background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", padding: "16px 18px", width: 260, border: "0.5px solid rgba(200,170,240,0.35)" }}>
                  <div style={{ fontSize: 12, color: "#7a50b0", fontWeight: 700, marginBottom: 6 }}>
                    {mat.requiredPlan === "light" ? "ライトプラン" : mat.requiredPlan === "standard" ? "スタンダードプラン" : "プレミアムプラン"}から使えます ✨
                  </div>
                  {!isLoggedIn ? (
                    <>
                      <div style={{ fontSize: 11, color: "#999", lineHeight: 1.7, marginBottom: 12 }}>登録するとすべての教材がダウンロードし放題になります。</div>
                      <button onClick={() => { onOpenAuth ? onOpenAuth("signup") : (window.location.href = "/auth"); }} style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", marginBottom: 8 }}>無料で登録する</button>
                      <div style={{ textAlign: "center", fontSize: 11, color: "#bbb" }}>すでにアカウントをお持ちの方は<span onClick={() => { onOpenAuth ? onOpenAuth("login") : (window.location.href = "/auth?mode=login"); }} style={{ color: "#9b6ed4", cursor: "pointer", marginLeft: 2 }}>ログイン</span></div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11, color: "#999", lineHeight: 1.7, marginBottom: 12 }}>プランをアップグレードするとダウンロードできます。</div>
                      <button onClick={() => { onClose(); window.location.href = "/plan"; }} style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>プランをアップグレードする →</button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}