"use client";
import { useMemo, useState } from "react";
import MaterialCard from "./MaterialCard";
import { getCardStyle, planRank } from "../../lib/materialUtils";
import PlanModal from "../../components/PlanModal";

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

type Props = {
  materials: Material[];
  favIds: string[];
  dlIds: string[];
  userPlan: string;
  isLoggedIn: boolean;
  purchasedIds: string[];
  locale: string;
  onCardClick: (mat: Material) => void;
  onFavToggle: (mat: Material) => void;
  onPlanChanged?: () => void;
  columns?: number;
};

function pickPersonalized(
  materials: Material[],
  favIds: string[],
  dlIds: string[],
  userPlan: string
): Material[] {
  const userRank = planRank[userPlan] ?? 0;
  const historyIds = new Set([...favIds, ...dlIds]);
  const historyMats = materials.filter((m) => historyIds.has(m.id));

  // Count content/method affinities from user's history
  const contentFreq: Record<string, number> = {};
  const methodFreq: Record<string, number> = {};
  for (const mat of historyMats) {
    for (const c of mat.content) contentFreq[c] = (contentFreq[c] ?? 0) + 1;
    for (const m of mat.method) methodFreq[m] = (methodFreq[m] ?? 0) + 1;
  }

  const candidates = materials.filter((m) => !historyIds.has(m.id));

  const scored = candidates.map((mat) => {
    let score = 0;
    for (const c of mat.content) score += (contentFreq[c] ?? 0) * 2;
    for (const m of mat.method) score += (methodFreq[m] ?? 0);
    // Small random jitter to avoid identical-score ties always picking same items
    score += Math.random() * 0.5;
    const matRank = planRank[mat.requiredPlan] ?? 0;
    const accessible = matRank <= userRank;
    return { mat, score, accessible };
  });

  scored.sort((a, b) => b.score - a.score);

  const accessible = scored.filter((s) => s.accessible).map((s) => s.mat);
  const needUpgrade = scored.filter((s) => !s.accessible).map((s) => s.mat);

  // Target: 4 accessible + 4 requiring upgrade (50/50)
  // If no upgrade materials exist (e.g. premium user), fill with accessible
  const accessiblePick = accessible.slice(0, 4);
  const upgradePick = needUpgrade.slice(0, 4);

  const result: Material[] = [];
  const maxLen = Math.max(accessiblePick.length, upgradePick.length);
  for (let i = 0; i < maxLen; i++) {
    if (accessiblePick[i]) result.push(accessiblePick[i]);
    if (upgradePick[i]) result.push(upgradePick[i]);
  }

  if (result.length > 0) return result.slice(0, 8);

  // Fallback: 50/50 split from all materials (e.g. no history, or all materials already seen)
  const allAccessible = materials
    .filter((m) => (planRank[m.requiredPlan] ?? 0) <= userRank)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  const allNeedUpgrade = materials
    .filter((m) => (planRank[m.requiredPlan] ?? 0) > userRank)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  const fallback: Material[] = [];
  const fallbackLen = Math.max(allAccessible.length, allNeedUpgrade.length);
  for (let i = 0; i < fallbackLen; i++) {
    if (allAccessible[i]) fallback.push(allAccessible[i]);
    if (allNeedUpgrade[i]) fallback.push(allNeedUpgrade[i]);
  }
  return fallback.slice(0, 8);
}

export default function PersonalizedSection({
  materials,
  favIds,
  dlIds,
  userPlan,
  isLoggedIn,
  purchasedIds,
  locale,
  onCardClick,
  onFavToggle,
  onPlanChanged,
  columns = 4,
}: Props) {
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const isFreeUser = !userPlan || userPlan === "free";
  const isPaidUser = !isFreeUser;

  const personalizedMats = useMemo(() => {
    if (!isPaidUser || materials.length === 0) return [];
    return pickPersonalized(materials, favIds, dlIds, userPlan);
  }, [materials, favIds, dlIds, userPlan, isPaidUser]);

  // Don't show if not logged in
  if (!isLoggedIn) return null;

  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>あなたへのおすすめ</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#bbb", marginLeft: 4 }}>Recommended for you</span>
        </div>

        {isFreeUser ? (
          // Free user: show locked state
          <div style={{
            border: "0.5px solid #eee",
            borderRadius: 14,
            background: "linear-gradient(135deg,#fafafa,#f5f0ff)",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>✨</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#555" }}>
              この機能はライトプラン以上の方がご利用いただけます
            </div>
            <div style={{ fontSize: 13, color: "#999", maxWidth: 400, lineHeight: 1.7 }}>
              お気に入りやダウンロード履歴をもとに、あなたにぴったりの教材を自動でご提案します。
            </div>
            <button
              onClick={() => setPlanModalOpen(true)}
              style={{
                marginTop: 6,
                padding: "10px 28px",
                borderRadius: 999,
                background: "linear-gradient(135deg,#c084fc,#818cf8)",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(140,80,220,0.18)",
              }}
            >
              プランをアップグレード
            </button>
          </div>
        ) : personalizedMats.length === 0 ? (
          <div style={{ color: "#bbb", fontSize: 13, padding: "24px 0" }}>
            おすすめ教材を読み込み中です。しばらくお待ちください。
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns},1fr)`, gap: columns <= 2 ? 12 : 18 }}>
            {personalizedMats.map((mat) => {
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
                  bg={bg}
                  char={char}
                  charColor={charColor}
                  tag={tag}
                  tagBg={tagBg}
                  tagColor={tagColor}
                  onFavToggle={onFavToggle}
                />
              );
            })}
          </div>
        )}
      </div>

      {planModalOpen && (
        <PlanModal
          onClose={() => setPlanModalOpen(false)}
          currentPlan={userPlan}
          onSubscribed={() => {
            setPlanModalOpen(false);
            onPlanChanged?.();
          }}
        />
      )}
    </>
  );
}
