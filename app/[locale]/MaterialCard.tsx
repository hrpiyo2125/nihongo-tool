"use client";
import { useState } from "react";
import PlanModal from "../../components/PlanModal";
import { BrandIcon } from "../../components/BrandIcon";

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

type Props = {
  mat: Material;
  onClick: () => void;
  locale: string;
  isLoggedIn?: boolean;
  userPlan?: string;
  favIds?: string[];
  purchasedIds?: string[];
  onFavToggle?: (mat: Material) => void;
  bg: string;
  char: string;
  charColor: string;
  tag: string;
  tagBg: string;
  tagColor: string;
};

export default function MaterialCard({
  mat, onClick, isLoggedIn, userPlan, favIds, purchasedIds = [], onFavToggle,
  bg, char, charColor, tag, tagBg, tagColor,
}: Props) {
  const isPurchased = purchasedIds.includes(mat.id);
  const isFreeUser = !userPlan || userPlan === "free";
  const atFavLimit = isFreeUser && !favIds?.includes(mat.id) && (favIds?.length ?? 0) >= 5;
  const [limitTooltip, setLimitTooltip] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  return (
    <div onClick={onClick} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer", position: "relative" }}>
      {isPurchased && (
        <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#e8f4ff", color: "#3a7abf", border: "0.5px solid rgba(58,122,191,0.3)" }}>
          購入済み
        </div>
      )}
      {isLoggedIn && onFavToggle && (
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (atFavLimit) { setLimitTooltip(prev => !prev); return; }
              onFavToggle(mat);
            }}
            style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(200,180,230,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={favIds?.includes(mat.id) ? "#c9a0f0" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/>
            </svg>
          </button>
          {limitTooltip && (
            <>
              <div onClick={(e) => { e.stopPropagation(); setLimitTooltip(false); }} style={{ position: "fixed", inset: 0, zIndex: 249 }} />
              <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 250, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.16)", padding: "14px 16px", width: 260, border: "0.5px solid rgba(200,170,240,0.3)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#7a50b0", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  <BrandIcon name="star" size={13} color="#7a50b0" />お気に入りの上限に達しました
                </div>
                <div style={{ fontSize: 11, color: "#666", lineHeight: 1.8, marginBottom: 10 }}>
                  無料会員の方は最大5件まで登録可能です。この教材をお気に入り登録したい方は、お気に入り履歴で数の調整をしてください。
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setLimitTooltip(false); window.dispatchEvent(new CustomEvent("toolio:navigate-mypage", { detail: { page: "fav" } })); }}
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
        </div>
      )}
      <div style={{ height: 135, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: charColor, fontWeight: 700 }}>{char}</div>
      <div style={{ padding: "10px 12px 14px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: tagBg, color: tagColor, display: "inline-block", marginBottom: 6 }}>{tag}</span>
        {(mat.level ?? []).length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
            {(mat.level ?? []).map((lv: string) => (
              <span key={lv} style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070" }}>{lv}</span>
            ))}
          </div>
        )}
        <div style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
      </div>
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
