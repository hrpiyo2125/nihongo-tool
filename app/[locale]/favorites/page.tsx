"use client";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { createClient } from "../../../lib/supabase";
import { useAuth } from "../AuthContext";
import { getCardStyle } from "../../../lib/materialUtils";
import { getContentTabs, getMethodTabs, contentTabLabels, methodTabLabels } from "../../../lib/tabs";
import MaterialCard from "../MaterialCard";
import MobileTeaserModal from "../MobileTeaserModal";
import TeaserModal from "../TeaserModal";
import AuthModal, { AuthModalMode } from "../../../components/AuthModal";
import { useTranslations } from "next-intl";

type Material = {
  id: string; title: string; description: string;
  level: string[]; content: string[]; method: string[];
  ageGroup: string; requiredPlan: string; pdfFile?: string;
  isPickup: boolean; isRecommended: boolean; ranking: number | null; isNew: boolean;
};

export default function FavoritesPage() {
  const locale = useLocale();
  const tmm = useTranslations("materials_modal");
  const { isLoggedIn, profile, favIds, purchasedIds, setFavIds } = useAuth();
  const effectiveFavIds = (!profile.plan || profile.plan === "free") ? favIds.slice(0, 5) : favIds;
  const cl = contentTabLabels[locale] ?? contentTabLabels.ja;
  const ml = methodTabLabels[locale] ?? methodTabLabels.ja;
  const contentTabs = getContentTabs(cl);
  const methodTabs = getMethodTabs(ml);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("signup");

  useEffect(() => {
    fetch("/api/materials").then(r => r.json()).then(data => setMaterials(Array.isArray(data) ? data : []));
  }, []);

  const toggleFav = async (mat: Material) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (favIds.includes(mat.id)) {
      await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
      setFavIds(prev => prev.filter(id => id !== mat.id));
    } else {
      await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
      setFavIds(prev => [...prev, mat.id]);
    }
  };

  const favMaterials = materials.filter(m => favIds.includes(m.id));

  const emptyState = (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>♡</div>
      <div style={{ fontSize: 14, color: "#bbb", marginBottom: 20 }}>
        {isLoggedIn ? "お気に入りはまだありません" : "ログインするとお気に入りを保存できます"}
      </div>
      {!isLoggedIn && (
        <button onClick={() => { setAuthModalMode("signup"); setAuthModalOpen(true); }}
          style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>
          ログイン / 新規登録
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ─── デスクトップ ─── */}
      <div className="hidden md:block" style={{ padding: "40px 36px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#333", marginBottom: 24 }}>お気に入り</h1>
        {favMaterials.length === 0 ? emptyState : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {favMaterials.map(mat => {
              const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
              return <MaterialCard key={mat.id} mat={mat} onClick={() => setTeaserMat(mat)} locale={locale}
                isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"} favIds={effectiveFavIds}
                purchasedIds={purchasedIds} bg={bg} char={char} charColor={charColor}
                tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={toggleFav} />;
            })}
          </div>
        )}
      </div>

      {/* ─── モバイル ─── */}
      <div className="block md:hidden" style={{ padding: "20px 20px" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#333", marginBottom: 20 }}>お気に入り</div>
        {favMaterials.length === 0 ? emptyState : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {favMaterials.map(mat => {
              const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
              return <MaterialCard key={mat.id} mat={mat} onClick={() => setTeaserMat(mat)} locale={locale}
                isLoggedIn={isLoggedIn} favIds={effectiveFavIds} bg={bg} char={char}
                charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={toggleFav} />;
            })}
          </div>
        )}
      </div>

      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <>
            <div className="hidden md:block">
              <TeaserModal mat={teaserMat} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor}
                isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"} favIds={favIds} purchasedIds={purchasedIds}
                contentTabs={contentTabs} methodTabs={methodTabs} locale={locale} tmm={tmm}
                onClose={() => setTeaserMat(null)}
                onFavChange={(id, isFav) => setFavIds(prev => isFav ? [...prev, id] : prev.filter(x => x !== id))}
                onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }} />
            </div>
            <div className="block md:hidden">
              <MobileTeaserModal mat={teaserMat} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor}
                isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"} favIds={effectiveFavIds} purchasedIds={purchasedIds}
                contentTabs={contentTabs} methodTabs={methodTabs} locale={locale} tmm={tmm}
                onClose={() => setTeaserMat(null)}
                onFavChange={(id, isFav) => setFavIds(prev => isFav ? [...prev, id] : prev.filter(x => x !== id))}
                onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }}
                onOpenPlanModal={() => {}} onOpenPurchaseConfirm={() => {}} />
            </div>
          </>
        );
      })()}

      {authModalOpen && (
        <AuthModal initialMode={authModalMode} onClose={() => setAuthModalOpen(false)} onLoggedIn={() => setAuthModalOpen(false)} />
      )}
    </>
  );
}
