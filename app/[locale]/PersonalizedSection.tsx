"use client";
import { useEffect, useRef, useState } from "react";
import MaterialCard from "./MaterialCard";
import { getCardStyle, planRank } from "../../lib/materialUtils";
import PlanModal from "../../components/PlanModal";

const CACHE_DAYS = 7;
const CACHE_KEY_PREFIX = "toolio_recs_";

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

type CacheEntry = {
  ids: string[];
  computedAt: number;
  userPlan: string;
};

type Props = {
  materials: Material[];
  favIds: string[];
  dlIds: string[];
  favIdsLoaded: boolean;
  userId: string;
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
    const matRank = planRank[mat.requiredPlan] ?? 0;
    const accessible = matRank <= userRank;
    return { mat, score, accessible };
  });

  scored.sort((a, b) => b.score - a.score || a.mat.id.localeCompare(b.mat.id));

  const sorted = scored.map((s) => s.mat);

  if (sorted.length >= 4) return sorted.slice(0, 4);

  // Fallback when history is empty or all materials already seen
  return materials
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, 4);
}

function loadCache(userId: string, userPlan: string): string[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + userId);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.userPlan !== userPlan) return null;
    const ageMs = Date.now() - entry.computedAt;
    if (ageMs > CACHE_DAYS * 24 * 60 * 60 * 1000) return null;
    return entry.ids;
  } catch {
    return null;
  }
}

function saveCache(userId: string, mats: Material[], userPlan: string) {
  try {
    const entry: CacheEntry = {
      ids: mats.map((m) => m.id),
      computedAt: Date.now(),
      userPlan,
    };
    localStorage.setItem(CACHE_KEY_PREFIX + userId, JSON.stringify(entry));
  } catch {
    // localStorage unavailable (e.g. private browsing storage full)
  }
}

function clearCache(userId: string) {
  try {
    localStorage.removeItem(CACHE_KEY_PREFIX + userId);
  } catch {
    // ignore
  }
}

export default function PersonalizedSection({
  materials,
  favIds,
  dlIds,
  favIdsLoaded,
  userId,
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
  const [personalizedMats, setPersonalizedMats] = useState<Material[]>([]);

  const isFreeUser = !userPlan || userPlan === "free";
  const isPaidUser = !isFreeUser;

  const computedRef = useRef(false);

  function computeAndCache(force = false) {
    if (!userId || materials.length === 0) return;

    if (!force) {
      const cachedIds = loadCache(userId, userPlan);
      if (cachedIds) {
        const resolved = cachedIds
          .map((id) => materials.find((m) => m.id === id))
          .filter((m): m is Material => m !== undefined);
        if (resolved.length > 0) {
          setPersonalizedMats(resolved);
          return;
        }
      }
    }

    const fresh = pickPersonalized(materials, favIds, dlIds, userPlan);
    saveCache(userId, fresh, userPlan);
    setPersonalizedMats(fresh);
  }

  useEffect(() => {
    if (!isPaidUser || materials.length === 0 || !favIdsLoaded || !userId) {
      if (!isPaidUser) {
        setPersonalizedMats([]);
        computedRef.current = false;
      }
      return;
    }
    if (computedRef.current) return;
    computedRef.current = true;
    computeAndCache(false);
  // favIds/dlIds intentionally excluded: snapshotted at first compute only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials, userPlan, isPaidUser, favIdsLoaded, userId]);

  if (!isLoggedIn) return null;

  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>あなたへのおすすめ</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#bbb", marginLeft: 4 }}>Recommended for you</span>
          {isPaidUser && personalizedMats.length > 0 && (
            <button
              onClick={() => {
                clearCache(userId);
                computedRef.current = false;
                computeAndCache(true);
              }}
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "#b48be8",
                background: "none",
                border: "0.5px solid #e0d0f8",
                borderRadius: 999,
                padding: "3px 12px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              更新する
            </button>
          )}
        </div>

        {isFreeUser ? (
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
