"use client";
import { useState, useEffect } from "react";
import TeaserModal from "./TeaserModal";
import { getCardStyle } from "../../lib/materialUtils";
import { contentTabsJa, methodTabsJa } from "../../lib/tabs";
import { useTranslations } from "next-intl";

type Announcement = {
  id: string;
  title: string;
  date: string;
  type: string;
  material_id: string | null;
  body?: string;
};

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
  usageBasic: string;
  usageMiddle: string;
  usageAdvanced: string;
  mockupImage?: string;
};

type Props = {
  announcement: Announcement;
  isLoggedIn: boolean;
  userPlan: string;
  favIds: string[];
  purchasedIds: string[];
  locale: string;
  onClose: () => void;
  onFavChange?: (materialId: string, isFav: boolean) => void;
  onOpenAuth?: (mode: "signup" | "login") => void;
};

export default function AnnouncementModal({
  announcement,
  isLoggedIn,
  userPlan,
  favIds,
  purchasedIds,
  locale,
  onClose,
  onFavChange,
  onOpenAuth,
}: Props) {
  const tmm = useTranslations("materials_modal");
  const [detail, setDetail] = useState<Announcement>(announcement);
  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState<Material | null>(null);
  const [showTeaser, setShowTeaser] = useState(false);

  useEffect(() => {
    fetch(`/api/announcements/${announcement.id}`)
      .then((r) => r.json())
      .then((data) => {
        setDetail(data);
        setLoading(false);
        if (data.material_id) {
          fetch(`/api/materials/${data.material_id}`)
            .then((r) => r.json())
            .then((mat) => setMaterial(mat))
            .catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  }, [announcement.id]);

  const contentTabs = contentTabsJa;
  const methodTabs = methodTabsJa;

  if (showTeaser && material) {
    const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(material as any, locale);
    return (
      <TeaserModal
        mat={material as any}
        bg={bg}
        char={char}
        charColor={charColor}
        tag={tag}
        tagBg={tagBg}
        tagColor={tagColor}
        isLoggedIn={isLoggedIn}
        userPlan={userPlan}
        favIds={favIds}
        purchasedIds={purchasedIds}
        contentTabs={contentTabs}
        methodTabs={methodTabs}
        locale={locale}
        tmm={(key) => tmm(key)}
        onClose={() => setShowTeaser(false)}
        onFavChange={onFavChange}
        onOpenAuth={onOpenAuth}
      />
    );
  }

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "white", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 640, maxHeight: "85vh", display: "flex", flexDirection: "column", position: "relative" }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 16, width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.08)", border: "none", cursor: "pointer", fontSize: 14, color: "#666", zIndex: 1 }}
        >
          ✕
        </button>

        {/* ハンドル */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e0e0e0" }} />
        </div>

        <div style={{ overflowY: "auto", padding: "20px 24px 40px" }}>
          <div style={{ fontSize: 11, color: "#bbb", marginBottom: 8 }}>{detail.date}</div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#222", margin: "0 0 20px", lineHeight: 1.5, paddingRight: 32 }}>
            {detail.title}
          </h2>

          {loading ? (
            <div style={{ color: "#bbb", fontSize: 13 }}>読み込み中...</div>
          ) : (
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {detail.body || ""}
            </div>
          )}

          {!loading && detail.type === "new_material" && (
            <div style={{ marginTop: 28 }}>
              {material ? (
                <button
                  onClick={() => setShowTeaser(true)}
                  style={{ width: "100%", padding: "14px 0", borderRadius: 12, background: "linear-gradient(135deg, #b48be8, #9b6ed4)", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}
                >
                  この教材を見る →
                </button>
              ) : (
                <div style={{ fontSize: 13, color: "#bbb" }}>教材情報を読み込み中...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
