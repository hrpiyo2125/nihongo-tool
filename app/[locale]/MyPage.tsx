"use client";

import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "../../lib/supabase";
import { getCardStyle } from "../../lib/materialUtils";
import MaterialCard from "./MaterialCard";
import TeaserModal from "./TeaserModal";
import PlanSelector from "../../components/PlanSelector";
import BillingSection from "./BillingSection";
import { ProcessingOverlay } from "../../components/ProcessingOverlay";

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

function FavoritesSection({ allMaterials, isLoggedIn, contentTabs, methodTabs, locale, tmm, userPlan }: { allMaterials: Material[]; isLoggedIn: boolean; contentTabs: {id: string; label: string; char: string; color: string; imageSrc?: string | null}[]; methodTabs: {id: string; label: string; char: string}[];
  locale: string;
  tmm: (key: string) => string;
  userPlan: string;}) {
  const [favMaterials, setFavMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [teaserFavTooltip, setTeaserFavTooltip] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const { data } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id).order("created_at", { ascending: false });
      if (data) {
        const ids = data.map((d: { material_id: string }) => d.material_id);
        setFavIds(ids);
        setFavMaterials(allMaterials.filter((m) => ids.includes(m.id)));
      }
      setLoading(false);
    });
  }, [allMaterials]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { materialId, isFav } = (e as CustomEvent).detail;
      setFavIds(prev => isFav ? [...prev, materialId] : prev.filter(id => id !== materialId));
      setFavMaterials(prev => {
        if (isFav) {
          const mat = allMaterials.find(m => m.id === materialId);
          if (!mat || prev.some(m => m.id === materialId)) return prev;
          return [mat, ...prev];
        } else {
          return prev.filter(m => m.id !== materialId);
        }
      });
    };
    window.addEventListener("toolio:fav-change", handler);
    return () => window.removeEventListener("toolio:fav-change", handler);
  }, [allMaterials]);

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white" }}>
          <div className="skeleton" style={{ height: 110 }} />
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="skeleton" style={{ height: 13, width: "75%" }} />
            <div className="skeleton" style={{ height: 11, width: "50%" }} />
          </div>
        </div>
      ))}
    </div>
  );
  const isFreeUser = !userPlan || userPlan === "free";
  const displayedFavMaterials = isFreeUser ? favMaterials.slice(0, 5) : favMaterials;
  const hiddenFavCount = isFreeUser ? Math.max(0, favMaterials.length - 5) : 0;

  if (favMaterials.length === 0) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>♡</div>
      <div style={{ fontSize: 14 }}>お気に入りはまだありません</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>教材のハートボタンで保存できます</div>
    </div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        {displayedFavMaterials.map((mat) => (
  <MaterialCard
    key={mat.id}
    mat={mat}
    onClick={() => setTeaserMat(mat)}
    locale={locale}
    isLoggedIn={isLoggedIn}
    userPlan={userPlan}
    favIds={favIds}
    {...(() => { const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale); return { bg, char, charColor, tag, tagBg, tagColor }; })()}
    onFavToggle={async (mat) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      if (favIds.includes(mat.id)) {
        await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
        setFavIds((prev) => prev.filter((id) => id !== mat.id));
        setFavMaterials((prev) => prev.filter((m) => m.id !== mat.id));
        window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
      } else {
        await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
        setFavIds((prev) => [...prev, mat.id]);
        window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
      }
    }}
  />
))}
      </div>
      {hiddenFavCount > 0 && (
        <div style={{ marginTop: 16, padding: "14px 20px", borderRadius: 12, background: "linear-gradient(135deg,#f4f0ff,#fce8ff)", border: "1px solid #e0ccff", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#8a5cf6", fontWeight: 600, marginBottom: 4 }}>残り{hiddenFavCount}件のお気に入りがあります</div>
          <div style={{ fontSize: 12, color: "#a07ad4" }}>ライトプラン以上に登録いただくと復活します</div>
        </div>
      )}
     {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <TeaserModal
            mat={teaserMat}
            bg={bg} char={char} charColor={charColor}
            tag={tag} tagBg={tagBg} tagColor={tagColor}
            isLoggedIn={isLoggedIn}
            userPlan={userPlan}
            favIds={favIds}
            contentTabs={contentTabs}
            methodTabs={methodTabs}
            locale={locale}
            tmm={tmm}
            onClose={() => setTeaserMat(null)}
            onFavChange={(materialId, isFav) => {
              if (isFav) setFavIds(prev => [...prev, materialId]);
              else {
                setFavIds(prev => prev.filter(id => id !== materialId));
                setFavMaterials(prev => prev.filter(m => m.id !== materialId));
              }
            }}
          />
        );
      })()}
    </>
  );
}

function PurchaseHistorySection({ allMaterials, locale, isLoggedIn, userPlan, contentTabs, methodTabs, tmm }: { allMaterials: Material[]; locale: string; isLoggedIn: boolean; userPlan: string; contentTabs: {id: string; label: string; char: string; color: string; imageSrc?: string | null}[]; methodTabs: {id: string; label: string; char: string; imageSrc?: string | null}[]; tmm: (key: string) => string }) {
  const [purchasedMaterials, setPurchasedMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [favIds, setFavIds] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const { data } = await supabase
        .from("purchases")
        .select("material_id")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (data) {
        const ids = [...new Set(data.map((d: { material_id: string }) => d.material_id))];
        setPurchasedMaterials(allMaterials.filter((m) => ids.includes(m.id)));
      }
      setLoading(false);
    });
  }, [allMaterials]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id);
      if (data) setFavIds(data.map((d: { material_id: string }) => d.material_id));
    });
  }, [isLoggedIn]);

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white" }}>
          <div className="skeleton" style={{ height: 110 }} />
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="skeleton" style={{ height: 13, width: "75%" }} />
            <div className="skeleton" style={{ height: 11, width: "50%" }} />
          </div>
        </div>
      ))}
    </div>
  );
  if (purchasedMaterials.length === 0) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🛒</div>
      <div style={{ fontSize: 14 }}>購入済みの教材はまだありません</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>単品購入した教材はここから再ダウンロードできます</div>
    </div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        {purchasedMaterials.map((mat) => (
          <MaterialCard
            key={mat.id}
            mat={mat}
            locale={locale}
            isLoggedIn={isLoggedIn}
            userPlan={userPlan}
            favIds={favIds}
            onClick={() => setTeaserMat(mat)}
            {...(() => { const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale); return { bg, char, charColor, tag, tagBg, tagColor }; })()}
            onFavToggle={async (mat) => {
              const supabase = createClient();
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return;
              if (favIds.includes(mat.id)) {
                await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
                setFavIds((prev) => prev.filter((id) => id !== mat.id));
                window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
              } else {
                await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
                setFavIds((prev) => [...prev, mat.id]);
                window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
              }
            }}
          />
        ))}
      </div>
      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <TeaserModal
            mat={teaserMat}
            bg={bg} char={char} charColor={charColor}
            tag={tag} tagBg={tagBg} tagColor={tagColor}
            isLoggedIn={isLoggedIn}
            userPlan={userPlan}
            favIds={favIds}
            contentTabs={contentTabs}
            methodTabs={methodTabs}
            locale={locale}
            tmm={tmm}
            onClose={() => setTeaserMat(null)}
            onFavChange={(materialId, isFav) => {
              if (isFav) setFavIds(prev => [...prev, materialId]);
              else setFavIds(prev => prev.filter(id => id !== materialId));
            }}
          />
        );
      })()}
    </>
  );
}

function DownloadHistorySection({ allMaterials, locale, isLoggedIn, userPlan, contentTabs, methodTabs, tmm }: { allMaterials: Material[]; locale: string; isLoggedIn: boolean; userPlan: string; contentTabs: {id: string; label: string; char: string; color: string; imageSrc?: string | null}[]; methodTabs: {id: string; label: string; char: string; imageSrc?: string | null}[]; tmm: (key: string) => string }) {
  const [historyMaterials, setHistoryMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [favIds, setFavIds] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      const { data } = await supabase.from("download_history").select("material_id").eq("user_id", session.user.id).order("created_at", { ascending: false });
      if (data) {
        const ids = [...new Set(data.map((d: { material_id: string }) => d.material_id))];
        setHistoryMaterials(allMaterials.filter((m) => ids.includes(m.id)));
      }
      setLoading(false);
    });
  }, [allMaterials]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id);
      if (data) setFavIds(data.map((d: { material_id: string }) => d.material_id));
    });
  }, [isLoggedIn]);

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white" }}>
          <div className="skeleton" style={{ height: 110 }} />
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="skeleton" style={{ height: 13, width: "75%" }} />
            <div className="skeleton" style={{ height: 11, width: "50%" }} />
          </div>
        </div>
      ))}
    </div>
  );
  const isFreeUserDl = !userPlan || userPlan === "free";
  const displayedHistoryMaterials = isFreeUserDl ? historyMaterials.slice(0, 5) : historyMaterials;
  const hiddenHistoryCount = isFreeUserDl ? Math.max(0, historyMaterials.length - 5) : 0;

  if (historyMaterials.length === 0) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>↓</div>
      <div style={{ fontSize: 14 }}>ダウンロード履歴はまだありません</div>
    </div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        {displayedHistoryMaterials.map((mat) => (
          <MaterialCard
            key={mat.id}
            mat={mat}
            locale={locale}
            isLoggedIn={isLoggedIn}
            userPlan={userPlan}
            favIds={favIds}
            onClick={() => setTeaserMat(mat)}
            {...(() => { const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale); return { bg, char, charColor, tag, tagBg, tagColor }; })()}
            onFavToggle={async (mat) => {
              const supabase = createClient();
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return;
              if (favIds.includes(mat.id)) {
                await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
                setFavIds((prev) => prev.filter((id) => id !== mat.id));
                window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
              } else {
                await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
                setFavIds((prev) => [...prev, mat.id]);
                window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
              }
            }}
          />
        ))}
      </div>
      {hiddenHistoryCount > 0 && (
        <div style={{ marginTop: 16, padding: "14px 20px", borderRadius: 12, background: "linear-gradient(135deg,#f4f0ff,#fce8ff)", border: "1px solid #e0ccff", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#8a5cf6", fontWeight: 600, marginBottom: 4 }}>残り{hiddenHistoryCount}件のダウンロード履歴があります</div>
          <div style={{ fontSize: 12, color: "#a07ad4" }}>ライトプラン以上に登録いただくと復活します</div>
        </div>
      )}
      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <TeaserModal
            mat={teaserMat}
            bg={bg} char={char} charColor={charColor}
            tag={tag} tagBg={tagBg} tagColor={tagColor}
            isLoggedIn={isLoggedIn}
            userPlan={userPlan}
            favIds={favIds}
            contentTabs={contentTabs}
            methodTabs={methodTabs}
            locale={locale}
            tmm={tmm}
            onClose={() => setTeaserMat(null)}
            onFavChange={(materialId, isFav) => {
              if (isFav) setFavIds(prev => [...prev, materialId]);
              else setFavIds(prev => prev.filter(id => id !== materialId));
            }}
          />
        );
      })()}
    </>
  );
}

type MyPageProps = {
  activePage: string;
  setActivePage: (page: string) => void;
  isLoggedIn: boolean;
  userInitial: string;
  setUserInitial: (initial: string) => void;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  profile: Record<string, any>;
  setProfile: Dispatch<SetStateAction<Record<string, any>>>;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  editingValue: string;
  setEditingValue: (value: string) => void;
  materials: Material[];
  contentTabs: { id: string; label: string; char: string; color: string; imageSrc: string | null }[];
  methodTabs: { id: string; label: string; char: string; imageSrc: string | null }[];
  locale: string;
  tmm: (key: string) => string;
  tm: (key: string) => string;
  navItems: { id: string; label: string }[];
  onPlanChanged?: () => Promise<void>;
  onOpenAuth?: (mode: "signup" | "login") => void;
  mobileMode?: boolean;
};

export default function MyPage({
  activePage,
  setActivePage,
  isLoggedIn,
  userInitial,
  setUserInitial,
  avatarUrl,
  setAvatarUrl,
  userName,
  setUserName,
  userEmail,
  profile,
  setProfile,
  editingField,
  setEditingField,
  editingValue,
  setEditingValue,
  materials,
  contentTabs,
  methodTabs,
  locale,
  tmm,
  tm,
  navItems,
  onPlanChanged,
  onOpenAuth,
  mobileMode,
}: MyPageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const PRESET_AVATARS = [
    "/avatars/preset/avatar1.png",
    "/avatars/preset/avatar2.png",
    "/avatars/preset/avatar3.png",
    "/avatars/preset/avatar4.png",
    "/avatars/preset/avatar5.png",
    "/avatars/preset/avatar6.png",
    "/avatars/preset/avatar7.png",
    "/avatars/preset/avatar8.png",
  ];
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [draftResidence, setDraftResidence] = useState({ country: "", city: "" });
  const [draftOccupation, setDraftOccupation] = useState("");
  const [draftOccupationOther, setDraftOccupationOther] = useState("");
  const [draftPurpose, setDraftPurpose] = useState<string[]>([]);
  const [draftPurposeOther, setDraftPurposeOther] = useState("");
  const [savingSection, setSavingSection] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"closed" | "checklist" | "confirm" | "done">("closed");
  const [deleteChecks, setDeleteChecks] = useState({ data: false, subscription: false, return: false });
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePeriodEnd, setDeletePeriodEnd] = useState<string | null>(null);
  const allChecked = deleteChecks.data && deleteChecks.subscription && deleteChecks.return;
  const [confirmFreePlan, setConfirmFreePlan] = useState(false);
  const [freePlanLoading, setFreePlanLoading] = useState(false);
  const [freePlanSuccess, setFreePlanSuccess] = useState(false);
  const [freePlanError, setFreePlanError] = useState<string | null>(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailNew, setEmailNew] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handlePresetSelect = async (presetUrl: string) => {
    setShowPresetPicker(false);
    setAvatarError(null);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from("profiles").update({ avatar_url: presetUrl }).eq("id", session.user.id);
    if (error) { setAvatarError("プロフィールの保存に失敗しました。もう一度お試しください。"); return; }
    setAvatarUrl(presetUrl);
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    setAvatarError(null);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setUploadingAvatar(false); return; }
    const path = `${session.user.id}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      setAvatarError("画像のアップロードに失敗しました。もう一度お試しください。");
      setUploadingAvatar(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: dbError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", session.user.id);
    if (dbError) {
      setAvatarError("プロフィールの保存に失敗しました。もう一度お試しください。");
      setUploadingAvatar(false);
      return;
    }
    setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
    setUploadingAvatar(false);
  };

  const handleFreePlan = async () => {
    setFreePlanLoading(true);
    setFreePlanError(null);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setFreePlanLoading(false); return; }
    try {
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev: any) => ({ ...prev, cancel_at_period_end: true, current_period_end: data.currentPeriodEnd ?? prev.current_period_end }));
        setFreePlanSuccess(true);
        setFreePlanLoading(false);
        setTimeout(() => { setFreePlanSuccess(false); setConfirmFreePlan(false); }, 2500);
      } else {
        setFreePlanError("エラーが発生しました。しばらく経ってから再度お試しください。");
        setFreePlanLoading(false);
      }
    } catch {
      setFreePlanError("エラーが発生しました。しばらく経ってから再度お試しください。");
      setFreePlanLoading(false);
    }
  };

  if (activePage === "settings-profile") return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {!mobileMode && (
        <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>{tm("profile_title")}</h2>
        </div>
      )}
      <div style={{ padding: mobileMode ? "20px 16px 48px" : "32px 48px 56px", display: "flex", flexDirection: "column" as const, gap: 20, maxWidth: mobileMode ? undefined : 600, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14 }}>
          <div
            onClick={() => !uploadingAvatar && setShowPresetPicker(true)}
            style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden", cursor: "pointer", position: "relative" }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : userInitial}
            {uploadingAvatar && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 20, height: 20, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setShowPresetPicker(false); handleAvatarUpload(f); } e.target.value = ""; }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>{userName}</div>
              {profile.status === "pending_deletion" && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fff0e8", color: "#a04020", whiteSpace: "nowrap" }}>退会予約済み</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 10 }}>
              {profile.plan === "light" ? "ライトプラン" : profile.plan === "standard" ? "スタンダードプラン" : profile.plan === "premium" ? "プレミアムプラン" : tm("free_plan")}
            </div>
            <button onClick={() => setShowPresetPicker(true)} disabled={uploadingAvatar} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: uploadingAvatar ? "#ccc" : "#9b6ed4", cursor: uploadingAvatar ? "not-allowed" : "pointer", fontWeight: 600 }}>{uploadingAvatar ? "アップロード中..." : tm("change_photo")}</button>
            {avatarError && <div style={{ fontSize: 11, color: "#e05050", marginTop: 6 }}>{avatarError}</div>}
          </div>
        </div>
        {showPresetPicker && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowPresetPicker(false)}>
            <div style={{ background: "white", borderRadius: 18, padding: 24, maxWidth: 340, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>アイコンを選択</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                {PRESET_AVATARS.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    onClick={() => handlePresetSelect(url)}
                    style={{ width: "100%", aspectRatio: "1", borderRadius: "50%", cursor: "pointer", border: avatarUrl === url ? "3px solid #9b6ed4" : "3px solid transparent", boxSizing: "border-box" as const }}
                  />
                ))}
              </div>
              <button onClick={() => fileInputRef.current?.click()} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>自分の写真をアップロード</button>
            </div>
          </div>
        )}
        {/* 名前 / 学習レベル */}
        {[
          { label: tm("name"), value: profile.full_name || userName, col: "full_name" },
          { label: tm("student_level"), value: profile.student_level || tm("not_registered"), col: "student_level" },
        ].map((field) => (
          <div key={field.label} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{field.label}</div>
              {editingField === field.label ? (
                <input
                  autoFocus
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  style={{ fontSize: 14, fontWeight: 600, color: "#333", border: "0.5px solid rgba(200,170,240,0.5)", borderRadius: 8, padding: "6px 10px", width: "100%", outline: "none" }}
                />
              ) : (
                <div style={{ fontSize: 14, fontWeight: 600, color: field.value === "未設定" ? "#ccc" : "#333" }}>{field.value}</div>
              )}
            </div>
            {editingField === field.label ? (
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  disabled={savingProfile}
                  onClick={async () => {
                    setSavingProfile(true);
                    const supabase = createClient();
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) { setSavingProfile(false); return; }
                    const col = field.col;
                    const value = editingValue;
                    await supabase.from("profiles").upsert({ id: session.user.id, [col]: value });
                    setProfile((prev) => ({ ...prev, [col]: value }));
                    if (col === "full_name") { setUserName(editingValue); if (editingValue) setUserInitial(editingValue.charAt(0).toUpperCase()); }
                    setSavingProfile(false);
                    setEditingField(null);
                  }}
                  style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "none", background: savingProfile ? "#ccc" : "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: savingProfile ? "not-allowed" : "pointer", fontWeight: 700 }}
                >{savingProfile ? "保存中..." : tm("save")}</button>
                <button onClick={() => setEditingField(null)} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}>{tm("cancel")}</button>
              </div>
            ) : (
              <button onClick={() => { setEditingField(field.label); setEditingValue(field.value === "未設定" ? "" : field.value); }} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>編集</button>
            )}
          </div>
        ))}

        {/* メールアドレス */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>メールアドレス</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{userEmail || "—"}</div>
          </div>
          <button onClick={() => { setEmailModal(true); setEmailNew(""); setEmailError(null); setEmailSent(false); }} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>変更</button>
        </div>

        {/* パスワード */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>パスワード</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>••••••••</div>
          </div>
          <button onClick={() => { setPwModal(true); setPwNew(""); setPwConfirm(""); setPwError(null); setPwSuccess(false); }} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>変更</button>
        </div>

        {/* 居住地 */}
        {(() => {
          const isEditing = editingSection === "residence";
          const summary = profile.country ? (profile.city ? `${profile.country}・${profile.city}` : profile.country) : "未設定";
          return (
            <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isEditing ? 16 : 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{tm("residence")}</div>
                  {!isEditing && <div style={{ fontSize: 14, fontWeight: 600, color: summary === "未設定" ? "#ccc" : "#333" }}>{summary}</div>}
                </div>
                {!isEditing ? (
                  <button onClick={() => { setDraftResidence({ country: profile.country || "", city: profile.city || "" }); setEditingSection("residence"); }} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>編集</button>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button disabled={savingSection} onClick={async () => {
                      setSavingSection(true);
                      const supabase = createClient();
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session) await supabase.from("profiles").upsert({ id: session.user.id, country: draftResidence.country, city: draftResidence.city });
                      setProfile((prev: any) => ({ ...prev, country: draftResidence.country, city: draftResidence.city }));
                      setSavingSection(false);
                      setEditingSection(null);
                    }} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "none", background: savingSection ? "#ccc" : "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: savingSection ? "not-allowed" : "pointer", fontWeight: 700 }}>{savingSection ? "保存中..." : tm("save")}</button>
                    <button onClick={() => setEditingSection(null)} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}>{tm("cancel")}</button>
                  </div>
                )}
              </div>
              {isEditing && (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#bbb", marginBottom: 6 }}>{tm("country")}</div>
                    <select value={draftResidence.country} onChange={(e) => setDraftResidence(prev => ({ ...prev, country: e.target.value, city: "" }))} style={{ width: "100%", fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", color: "#555", background: "white" }}>
                      <option value="">{tm("select_country")}</option>
                      {["日本", "オーストラリア", "アメリカ", "カナダ", "イギリス", "ニュージーランド", "シンガポール", "マレーシア", "台湾", "韓国", "中国", "タイ", "フランス", "ドイツ", "その他"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {draftResidence.country && (
                    <div>
                      <div style={{ fontSize: 11, color: "#bbb", marginBottom: 6 }}>{tm("city")}</div>
                      <input placeholder={tm("enter_city")} value={draftResidence.city} onChange={(e) => setDraftResidence(prev => ({ ...prev, city: e.target.value }))} style={{ width: "100%", fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", color: "#555" }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* 職業 */}
        {(() => {
          const isEditing = editingSection === "occupation";
          const occOpts = [tm("occ_teacher"), tm("occ_parent"), tm("occ_school"), tm("occ_school_owner"), tm("occ_other")];
          const summary = profile.occupation || "未設定";
          return (
            <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isEditing ? 16 : 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{tm("occupation")}</div>
                  {!isEditing && <div style={{ fontSize: 14, fontWeight: 600, color: summary === "未設定" ? "#ccc" : "#333" }}>{summary}</div>}
                </div>
                {!isEditing ? (
                  <button onClick={() => { setDraftOccupation(profile.occupation || ""); setDraftOccupationOther(profile.occupation_other || ""); setEditingSection("occupation"); }} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>編集</button>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button disabled={savingSection} onClick={async () => {
                      setSavingSection(true);
                      const supabase = createClient();
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session) await supabase.from("profiles").upsert({ id: session.user.id, occupation: draftOccupation, occupation_other: draftOccupationOther });
                      setProfile((prev: any) => ({ ...prev, occupation: draftOccupation, occupation_other: draftOccupationOther }));
                      setSavingSection(false);
                      setEditingSection(null);
                    }} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "none", background: savingSection ? "#ccc" : "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: savingSection ? "not-allowed" : "pointer", fontWeight: 700 }}>{savingSection ? "保存中..." : tm("save")}</button>
                    <button onClick={() => setEditingSection(null)} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}>{tm("cancel")}</button>
                  </div>
                )}
              </div>
              {isEditing && (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                  {occOpts.map((opt) => (
                    <div key={opt} onClick={() => setDraftOccupation(opt)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${draftOccupation === opt ? "#e49bfd" : "#ddd"}`, background: draftOccupation === opt ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "white", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {draftOccupation === opt && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                      </div>
                      <span style={{ fontSize: 13, color: draftOccupation === opt ? "#7a50b0" : "#555", fontWeight: draftOccupation === opt ? 700 : 400 }}>{opt}</span>
                    </div>
                  ))}
                  {draftOccupation === tm("occ_other") && (
                    <input placeholder="職業を入力してください" value={draftOccupationOther} onChange={(e) => setDraftOccupationOther(e.target.value)} style={{ marginTop: 4, fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", width: "100%" }} />
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* 利用目的 */}
        {(() => {
          const isEditing = editingSection === "purpose";
          const purposeOpts = [tm("purpose_lesson"), tm("purpose_home"), tm("purpose_research"), tm("purpose_other")];
          const summary = (profile.purpose as string[] | undefined)?.length ? (profile.purpose as string[]).join("・") : "未設定";
          return (
            <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isEditing ? 16 : 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{tm("purpose")}</div>
                  {!isEditing && <div style={{ fontSize: 14, fontWeight: 600, color: summary === "未設定" ? "#ccc" : "#333" }}>{summary}</div>}
                </div>
                {!isEditing ? (
                  <button onClick={() => { setDraftPurpose(profile.purpose ? [...profile.purpose] : []); setDraftPurposeOther(profile.purpose_other || ""); setEditingSection("purpose"); }} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>編集</button>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button disabled={savingSection} onClick={async () => {
                      setSavingSection(true);
                      const supabase = createClient();
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session) await supabase.from("profiles").upsert({ id: session.user.id, purpose: draftPurpose, purpose_other: draftPurposeOther });
                      setProfile((prev: any) => ({ ...prev, purpose: draftPurpose, purpose_other: draftPurposeOther }));
                      setSavingSection(false);
                      setEditingSection(null);
                    }} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "none", background: savingSection ? "#ccc" : "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: savingSection ? "not-allowed" : "pointer", fontWeight: 700 }}>{savingSection ? "保存中..." : tm("save")}</button>
                    <button onClick={() => setEditingSection(null)} style={{ fontSize: 12, padding: "7px 18px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}>{tm("cancel")}</button>
                  </div>
                )}
              </div>
              {isEditing && (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                  {purposeOpts.map((opt) => {
                    const checked = draftPurpose.includes(opt);
                    return (
                      <div key={opt} onClick={() => setDraftPurpose(prev => checked ? prev.filter(p => p !== opt) : [...prev, opt])} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? "#e49bfd" : "#ddd"}`, background: checked ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "white", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                        </div>
                        <span style={{ fontSize: 13, color: checked ? "#7a50b0" : "#555", fontWeight: checked ? 700 : 400 }}>{opt}</span>
                      </div>
                    );
                  })}
                  {draftPurpose.includes(tm("purpose_other")) && (
                    <input placeholder="利用目的を入力してください" value={draftPurposeOther} onChange={(e) => setDraftPurposeOther(e.target.value)} style={{ marginTop: 4, fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", width: "100%" }} />
                  )}
                </div>
              )}
            </div>
          );
        })()}
        <div style={{ paddingTop: 16, borderTop: "0.5px solid rgba(200,170,240,0.15)", display: "flex", flexDirection: "column", gap: 10 }}>
          {profile?.plan !== "free" && !profile?.cancel_at_period_end && profile?.status !== "pending_deletion" && (
            <button
              onClick={() => { setConfirmFreePlan(true); setFreePlanError(null); }}
              style={{ fontSize: 13, padding: "11px 0", borderRadius: 12, border: "0.5px solid rgba(163,192,255,0.6)", background: "white", color: "#3a5a9a", cursor: "pointer", fontWeight: 600, width: "100%" }}
            >無料プランに変更する</button>
          )}
          {profile?.status !== "pending_deletion" && (
            <button
              onClick={() => { setDeleteStep("checklist"); setDeleteChecks({ data: false, subscription: false, return: false }); setDeleteError(null); }}
              style={{ fontSize: 13, padding: "11px 0", borderRadius: 12, border: "0.5px solid rgba(220,100,100,0.4)", background: "white", color: "#c44", cursor: "pointer", fontWeight: 600, width: "100%" }}
            >退会する</button>
          )}
          {profile?.status === "pending_deletion" && (
            <div style={{ fontSize: 12, color: "#a04020", background: "#fff0e8", padding: "10px 16px", borderRadius: 10, textAlign: "center" }}>退会予約済みです</div>
          )}
        </div>

        {/* メールアドレス変更モーダル */}
        {emailModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 16, maxWidth: 440, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)", padding: "36px 40px" }}>
              {emailSent ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>📧</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#333", marginBottom: 12 }}>確認メールを送信しました</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.85, marginBottom: 8, textAlign: "left", background: "#f8f6ff", borderRadius: 10, padding: "16px 18px", border: "0.5px solid rgba(200,170,240,0.3)" }}>
                    <div style={{ fontWeight: 700, color: "#7a50b0", marginBottom: 8 }}>📌 変更を完了するには</div>
                    <div>新しいメールアドレス（<strong style={{ color: "#333" }}>{emailNew}</strong>）に確認メールが届きます。</div>
                    <div style={{ marginTop: 8 }}>メール内の「<strong>メールアドレスを変更する</strong>」リンクをクリックすると、変更が反映されます。</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#aaa", marginBottom: 20, lineHeight: 1.7 }}>
                    リンクをクリックするまでは、現在のメールアドレスのままです。<br />メールが届かない場合は迷惑メールフォルダをご確認ください。
                  </div>
                  <button onClick={() => setEmailModal(false)} style={{ fontSize: 13, padding: "10px 32px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>確認しました</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 20 }}>メールアドレスの変更</div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>現在のメールアドレス</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#888", padding: "10px 12px", borderRadius: 8, background: "#f5f5f5" }}>{userEmail}</div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>新しいメールアドレス</div>
                    <input
                      type="email"
                      value={emailNew}
                      onChange={(e) => setEmailNew(e.target.value)}
                      placeholder="new@example.com"
                      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", boxSizing: "border-box" as const }}
                    />
                  </div>
                  {emailError && <div style={{ fontSize: 12, color: "#a02020", background: "#ffe8e8", padding: "8px 12px", borderRadius: 8, marginBottom: 14 }}>{emailError}</div>}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => setEmailModal(false)} style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}>キャンセル</button>
                    <button
                      disabled={emailLoading}
                      onClick={async () => {
                        if (!emailNew || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNew)) { setEmailError("正しいメールアドレスを入力してください"); return; }
                        if (emailNew === userEmail) { setEmailError("現在と同じメールアドレスです"); return; }
                        setEmailLoading(true); setEmailError(null);
                        const supabase = createClient();
                        const { error } = await supabase.auth.updateUser({ email: emailNew });
                        if (error) { setEmailError("変更に失敗しました。しばらく経ってから再度お試しください"); setEmailLoading(false); return; }
                        setEmailLoading(false); setEmailSent(true);
                      }}
                      style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "none", background: emailLoading ? "#ccc" : "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: emailLoading ? "not-allowed" : "pointer", fontWeight: 700 }}
                    >{emailLoading ? "送信中..." : "確認メールを送信"}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* パスワード変更モーダル */}
        {pwModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 16, maxWidth: 420, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)", padding: "36px 40px" }}>
              {pwSuccess ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#333", marginBottom: 8 }}>パスワードを変更しました</div>
                  <button onClick={() => setPwModal(false)} style={{ marginTop: 16, fontSize: 13, padding: "10px 32px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>閉じる</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 20 }}>パスワードの変更</div>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>新しいパスワード</div>
                      <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} placeholder="8文字以上" style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", boxSizing: "border-box" as const }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>新しいパスワード（確認）</div>
                      <input type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} placeholder="もう一度入力" style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 8, border: "0.5px solid rgba(200,170,240,0.5)", outline: "none", boxSizing: "border-box" as const }} />
                    </div>
                  </div>
                  {pwError && <div style={{ fontSize: 12, color: "#a02020", background: "#ffe8e8", padding: "8px 12px", borderRadius: 8, marginBottom: 14 }}>{pwError}</div>}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => setPwModal(false)} style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}>キャンセル</button>
                    <button disabled={pwLoading} onClick={async () => {
                      if (pwNew.length < 8) { setPwError("パスワードは8文字以上で入力してください"); return; }
                      if (pwNew !== pwConfirm) { setPwError("パスワードが一致しません"); return; }
                      setPwLoading(true); setPwError(null);
                      const supabase = createClient();
                      const { error } = await supabase.auth.updateUser({ password: pwNew });
                      if (error) { setPwError("変更に失敗しました。もう一度お試しください"); setPwLoading(false); return; }
                      setPwLoading(false); setPwSuccess(true);
                    }} style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "none", background: pwLoading ? "#ccc" : "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: pwLoading ? "not-allowed" : "pointer", fontWeight: 700 }}>{pwLoading ? "変更中..." : "変更する"}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 無料プランに変更する確認モーダル */}
        {confirmFreePlan && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 16, maxWidth: 420, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)", overflow: "hidden" }}>
              {freePlanLoading ? (
                <ProcessingOverlay messages={["変更処理中...", "もう少しで完了します", "データを更新しています"]} />
              ) : freePlanSuccess ? (
                <div style={{ padding: "36px 40px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#333", marginBottom: 8 }}>変更予約が完了しました</div>
                  <div style={{ fontSize: 13, color: "#888" }}>現在のプランの期間終了後、無料プランへ移行します。</div>
                </div>
              ) : (
                <div style={{ padding: "36px 40px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 12 }}>無料プランへの変更を確認</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
                    変更予約をすると、<strong>{profile?.current_period_end ? new Date(profile.current_period_end).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }) : "現在の期間終了日"}</strong> までご利用いただけます。<br />
                    期間終了後は無料プランに移行します。
                  </div>
                  {freePlanError && (
                    <div style={{ fontSize: 12, color: "#a02020", background: "#ffe8e8", padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>{freePlanError}</div>
                  )}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => { setConfirmFreePlan(false); setFreePlanError(null); }}
                      style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}
                    >キャンセル</button>
                    <button
                      onClick={handleFreePlan}
                      style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#a3c0ff,#7aa0f0)", color: "white", cursor: "pointer", fontWeight: 700 }}
                    >無料プランに変更する</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ステップ1: チェックリストモーダル */}
        {deleteStep === "checklist" && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 16, padding: "36px 40px", maxWidth: 460, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 8 }}>アカウント削除の前に確認してください</div>
              <div style={{ fontSize: 13, color: "#999", marginBottom: 24, lineHeight: 1.6 }}>以下の内容をすべて確認してチェックを入れてください。</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                {([
                  { key: "data" as const, label: "お気に入り・ダウンロード履歴・購入履歴などのデータはすべて保存されます。いつでも再開できます。" },
                  { key: "subscription" as const, label: "有料プランに加入中の場合は、退会時に自動的に無料プランに変更されます（返金なし）。期間終了まではご利用いただけます。" },
                  { key: "return" as const, label: "同じメールアドレスでいつでも再開できます。再ログイン後にアカウントの復元が案内されます。" },
                ]).map(({ key, label }) => (
                  <div
                    key={key}
                    onClick={() => setDeleteChecks(prev => ({ ...prev, [key]: !prev[key] }))}
                    style={{ display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${deleteChecks[key] ? "#e49bfd" : "#eee"}`, background: deleteChecks[key] ? "rgba(228,155,253,0.06)" : "white", transition: "all 0.15s" }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${deleteChecks[key] ? "#e49bfd" : "#ccc"}`, background: deleteChecks[key] ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "white", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                      {deleteChecks[key] && <svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    </div>
                    <span style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setDeleteStep("closed")}
                  style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}
                >キャンセル</button>
                <button
                  disabled={!allChecked}
                  onClick={() => setDeleteStep("confirm")}
                  style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "none", background: allChecked ? "#e55" : "#eee", color: allChecked ? "white" : "#bbb", cursor: allChecked ? "pointer" : "not-allowed", fontWeight: 700, transition: "all 0.15s" }}
                >次へ →</button>
              </div>
            </div>
          </div>
        )}

        {/* ステップ2: 最終確認モーダル */}
        {deleteStep === "confirm" && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 16, maxWidth: 420, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)", overflow: "hidden" }}>
              {deletingAccount ? (
                <ProcessingOverlay messages={["アカウントを削除しています...", "データを削除しています...", "もう少しで完了します"]} />
              ) : (
                <div style={{ padding: "36px 40px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#c33", marginBottom: 12 }}>退会しますか？</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8, marginBottom: 20 }}>
                    退会後も、同じメールアドレスで再ログインするといつでもアカウントを再開できます。データはすべて保持されます。
                  </div>
                  {deleteError && (
                    <div style={{ fontSize: 12, color: "#a02020", background: "#ffe8e8", padding: "8px 12px", borderRadius: 8, marginBottom: 16 }}>
                      {deleteError}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setDeleteStep("checklist")}
                      style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}
                    >戻る</button>
                    <button
                      onClick={async () => {
                        setDeletingAccount(true);
                        setDeleteError(null);
                        const supabase = createClient();
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) { setDeletingAccount(false); return; }
                        const controller = new AbortController();
                        const timeout = setTimeout(() => controller.abort(), 20000);
                        try {
                          const res = await fetch("/api/auth/delete-account", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId: session.user.id }),
                            signal: controller.signal,
                          });
                          clearTimeout(timeout);
                          const data = await res.json();
                          if (res.ok && data.success) {
                            if (data.status === 'pending_deletion') {
                              setDeletePeriodEnd(profile?.current_period_end ?? null);
                              setDeleteStep("done");
                              setDeletingAccount(false);
                            } else {
                              await supabase.auth.signOut({ scope: 'local' });
                              window.location.href = `/${locale}`;
                            }
                          } else {
                            setDeleteError(data.error ?? "削除に失敗しました。しばらく経ってから再度お試しください。");
                            setDeletingAccount(false);
                          }
                        } catch (e: any) {
                          clearTimeout(timeout);
                          if (e?.name === "AbortError") {
                            setDeleteError("処理がタイムアウトしました。しばらく経ってから再度お試しください。");
                          } else {
                            setDeleteError("通信エラーが発生しました。しばらく経ってから再度お試しください。");
                          }
                          setDeletingAccount(false);
                        }
                      }}
                      style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "none", background: "#e55", color: "white", cursor: "pointer", fontWeight: 700 }}
                    >退会する</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ステップ3: 退会予約完了（サブスク期間中） */}
        {deleteStep === "done" && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 16, maxWidth: 420, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)", padding: "40px 40px 36px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#333", marginBottom: 20 }}>退会予約が完了しました！</div>
              {deletePeriodEnd ? (() => {
                const d = new Date(deletePeriodEnd);
                const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
                return (
                  <div style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 28 }}>
                    <span style={{ fontWeight: 700, color: "#7a50b0" }}>{dateStr}</span>まで現在のプランでお使いいただけます。<br />
                    {dateStr}になったら、自動的にtoolioから退会されます。<br /><br />
                    <span style={{ color: "#aaa", fontSize: 13 }}>いつでも戻ってきてください。お待ちしています。</span>
                  </div>
                );
              })() : (
                <div style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 28 }}>
                  現在のプランの期間が終了したら、自動的にtoolioから退会されます。<br /><br />
                  <span style={{ color: "#aaa", fontSize: 13 }}>いつでも戻ってきてください。お待ちしています。</span>
                </div>
              )}
              <button
                onClick={() => { setDeleteStep("closed"); window.location.reload(); }}
                style={{ fontSize: 14, padding: "12px 32px", borderRadius: 24, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}
              >閉じる</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (activePage === "settings-billing") return (
    <BillingSection
      profile={profile as any}
      onChangePlan={() => setActivePage("plan")}
      onProfileUpdate={(updates) => setProfile((prev: any) => ({ ...prev, ...updates }))}
      mobileMode={mobileMode}
    />
  );

  return (
    <div>
      <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4, display: "inline-block" }}>
            {activePage === "plan" ? tm("plan") : navItems.find(n => n.id === activePage)?.label}
          </h2>
          {(activePage === "fav" || activePage === "dl") && (
            <span style={{ fontSize: 11, color: "#bbb", fontWeight: 500 }}>
              {(profile?.plan === "free" || !profile?.plan)
                ? "無料プランの方は最大5件まで保存可能です"
                : "ライトプラン以上：無制限で保存できます"}
            </span>
          )}
        </div>
      </div>
      <div style={{ padding: "32px 48px 56px" }}>
        {activePage === "plan" ? (
          <PlanSelector
            currentPlan={profile?.plan ?? "free"}
            cancelAtPeriodEnd={profile?.cancel_at_period_end ?? false}
            currentPeriodEnd={profile?.current_period_end ?? null}
            isPendingDeletion={profile?.status === "pending_deletion"}
            onSubscribed={async () => {
              await onPlanChanged?.();
              setActivePage("home");
            }}
          />
        ) : !isLoggedIn ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            {activePage === "fav" ? (
              <div style={{ fontSize: 32, marginBottom: 12 }}>♡</div>
            ) : activePage === "dl" ? (
              <div style={{ fontSize: 32, marginBottom: 12 }}>↓</div>
            ) : (
              <div style={{ marginBottom: 12 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="#e0d0f0"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /><path d="M6 15h4" /><path d="M14 15h4" /></svg>
              </div>
            )}
            <div style={{ fontSize: 14, color: "#bbb", marginBottom: 20 }}>
              {activePage === "fav"
                ? "ログインするとお気に入りを保存できます"
                : activePage === "dl"
                ? "ログインするとダウンロード履歴を確認できます"
                : "ログインすると購入履歴を確認できます"}
            </div>
            <button onClick={() => onOpenAuth ? onOpenAuth("signup") : router.push("/auth")} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>ログイン / 新規登録</button>
          </div>
        ) : activePage === "fav" ? (
          <FavoritesSection allMaterials={materials} isLoggedIn={isLoggedIn} contentTabs={contentTabs} methodTabs={methodTabs} locale={locale} tmm={tmm} userPlan={profile.plan ?? "free"} />
        ) : activePage === "dl" ? (
          <DownloadHistorySection allMaterials={materials} locale={locale} isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"} contentTabs={contentTabs} methodTabs={methodTabs} tmm={tmm} />
        ) : activePage === "purchases" ? (
          <PurchaseHistorySection allMaterials={materials} locale={locale} isLoggedIn={isLoggedIn} userPlan={profile.plan ?? "free"} contentTabs={contentTabs} methodTabs={methodTabs} tmm={tmm} />
        ) : (
          <p style={{ fontSize: 15, color: "#bbb" }}>このページは準備中です。</p>
        )}
      </div>
    </div>
  );
}
