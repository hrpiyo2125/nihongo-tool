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
  allIds: string[];  // full ranked candidate list
  page: number;      // which batch of 4 is currently shown
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
  isMobile?: boolean;
};

// Returns all materials ranked by affinity.
// Fresh candidates (not in history) come first, history materials appended after.
// This ensures the pool is always large enough for rotation and always 4 items per page.
function rankCandidates(
  materials: Material[],
  favIds: string[],
  dlIds: string[],
): Material[] {
  const historyIds = new Set([...favIds, ...dlIds]);
  const historyMats = materials.filter((m) => historyIds.has(m.id));

  const contentFreq: Record<string, number> = {};
  const methodFreq: Record<string, number> = {};
  for (const mat of historyMats) {
    for (const c of mat.content) contentFreq[c] = (contentFreq[c] ?? 0) + 1;
    for (const m of mat.method) methodFreq[m] = (methodFreq[m] ?? 0) + 1;
  }

  const fresh = materials.filter((m) => !historyIds.has(m.id));
  const scored = fresh.map((mat) => {
    let score = 0;
    for (const c of mat.content) score += (contentFreq[c] ?? 0) * 2;
    for (const m of mat.method) score += (methodFreq[m] ?? 0);
    return { mat, score };
  });
  scored.sort((a, b) => b.score - a.score || a.mat.id.localeCompare(b.mat.id));

  // Append history items at the end so the pool never runs short
  const sortedHistory = [...historyMats].sort((a, b) => a.id.localeCompare(b.id));
  return [...scored.map((s) => s.mat), ...sortedHistory];
}

// Always returns exactly 4 items; wraps around if the last page is short
function pageOf(allMats: Material[], page: number): Material[] {
  const total = allMats.length;
  if (total === 0) return [];
  if (total <= 4) return allMats.slice(0, total); // edge case: fewer than 4 total
  const totalPages = Math.ceil(total / 4);
  const safePage = page % totalPages;
  const slice = allMats.slice(safePage * 4, safePage * 4 + 4);
  // Last page may be short — fill from the start of the list
  if (slice.length < 4) {
    const used = new Set(slice.map((m) => m.id));
    const fill = allMats.filter((m) => !used.has(m.id)).slice(0, 4 - slice.length);
    return [...slice, ...fill];
  }
  return slice;
}

function loadCache(userId: string, userPlan: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + userId);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (entry.userPlan !== userPlan) return null;
    const ageMs = Date.now() - entry.computedAt;
    if (ageMs > CACHE_DAYS * 24 * 60 * 60 * 1000) return null;
    // Old cache format used 'ids' instead of 'allIds' — treat as invalid
    if (!Array.isArray(entry.allIds)) return null;
    return entry as CacheEntry;
  } catch {
    return null;
  }
}

function saveCache(userId: string, allMats: Material[], page: number, userPlan: string) {
  try {
    const entry: CacheEntry = {
      allIds: allMats.map((m) => m.id),
      page,
      computedAt: Date.now(),
      userPlan,
    };
    localStorage.setItem(CACHE_KEY_PREFIX + userId, JSON.stringify(entry));
  } catch {
    // localStorage unavailable
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
  isMobile = false,
}: Props) {
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [personalizedMats, setPersonalizedMats] = useState<Material[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const isFreeUser = !userPlan || userPlan === "free";
  const isPaidUser = !isFreeUser;

  const computedRef = useRef(false);

  function computeAndCache(nextPage?: number) {
    if (!userId || materials.length === 0) return;

    if (nextPage === undefined) {
      // Initial load: try cache first
      const cached = loadCache(userId, userPlan);
      if (cached) {
        const allMats = cached.allIds
          .map((id) => materials.find((m) => m.id === id))
          .filter((m): m is Material => m !== undefined);
        if (allMats.length > 0) {
          setPersonalizedMats(pageOf(allMats, cached.page));
          return;
        }
      }
      // No valid cache: compute fresh at page 0
      const all = rankCandidates(materials, favIds, dlIds);
      saveCache(userId, all, 0, userPlan);
      setPersonalizedMats(pageOf(all, 0));
    } else {
      // Manual refresh: advance to next page
      const cached = loadCache(userId, userPlan);
      let all: Material[];
      if (cached && cached.allIds.length > 0) {
        all = cached.allIds
          .map((id) => materials.find((m) => m.id === id))
          .filter((m): m is Material => m !== undefined);
        if (all.length < 4) {
          // allIds may have stale/deleted materials; recompute
          all = rankCandidates(materials, favIds, dlIds);
        }
      } else {
        all = rankCandidates(materials, favIds, dlIds);
      }
      const totalPages = Math.ceil(all.length / 4);
      const page = totalPages > 1 ? nextPage % totalPages : 0;
      saveCache(userId, all, page, userPlan);
      setPersonalizedMats(pageOf(all, page));
    }
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
    computeAndCache();
  // favIds/dlIds intentionally excluded: snapshotted at first compute only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials, userPlan, isPaidUser, favIdsLoaded, userId]);

  if (!isLoggedIn) return null;

  return (
    <>
      <div style={{ marginBottom: isMobile ? 40 : 0 }}>
        <div style={{ position: "relative", marginBottom: isMobile ? 18 : 32, display: isMobile ? "flex" : "block", alignItems: isMobile ? "center" : undefined }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "flex-start" : "center", gap: 8, flex: isMobile ? 1 : undefined }}>
            {!isMobile && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#a3c0ff)", flexShrink: 0 }} />}
            <div style={{ textAlign: isMobile ? "left" : "left" }}>
              <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: isMobile ? 4 : 0, fontFamily: "var(--font-libre)" }}>Recommended for you</div>
              <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>あなたへのおすすめ</div>
            </div>
          </div>
          {isPaidUser && personalizedMats.length > 0 && (
            <button
              onClick={() => {
                const next = currentPage + 1;
                setCurrentPage(next);
                computeAndCache(next);
              }}
              style={{
                position: isMobile ? "static" : "absolute",
                right: isMobile ? undefined : 0,
                top: isMobile ? undefined : "50%",
                transform: isMobile ? undefined : "translateY(-50%)",
                flexShrink: isMobile ? 0 : undefined,
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
