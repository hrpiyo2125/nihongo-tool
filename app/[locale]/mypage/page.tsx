"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "../AuthContext";
import { getContentTabs, getMethodTabs, contentTabLabels, methodTabLabels } from "../../../lib/tabs";
import MyPage from "../MyPage";
import PlanSelector from "../../../components/PlanSelector";
import AuthModal, { AuthModalMode } from "../../../components/AuthModal";

type Material = {
  id: string; title: string; description: string;
  level: string[]; content: string[]; method: string[];
  ageGroup: string; requiredPlan: string; pdfFile?: string;
  isPickup: boolean; isRecommended: boolean; ranking: number | null; isNew: boolean;
};

function MyPageContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const section = searchParams.get("section") ?? "settings-profile";
  const tm = useTranslations("mypage");
  const tmm = useTranslations("materials_modal");

  const { isLoggedIn, userEmail, userName, userInitial, avatarUrl, profile, loadProfile,
          setUserName, setUserInitial, setAvatarUrl, updateProfile } = useAuth();

  const cl = contentTabLabels[locale] ?? contentTabLabels.ja;
  const ml = methodTabLabels[locale] ?? methodTabLabels.ja;
  const contentTabs = getContentTabs(cl);
  const methodTabs = getMethodTabs(ml);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("signup");

  useEffect(() => {
    fetch("/api/materials").then(r => r.json()).then(data => setMaterials(Array.isArray(data) ? data : []));
  }, []);

  if (!isLoggedIn) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 40 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
        <div style={{ fontSize: 14, color: "#bbb", marginBottom: 20 }}>ログインしてください</div>
        <button onClick={() => { setAuthModalMode("login"); setAuthModalOpen(true); }}
          style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>
          ログイン
        </button>
        {authModalOpen && <AuthModal initialMode={authModalMode} onClose={() => setAuthModalOpen(false)} onLoggedIn={() => setAuthModalOpen(false)} />}
      </div>
    </div>
  );

  // プランページは共通コンポーネント
  if (section === "settings-plan") return (
    <div style={{ padding: "24px 20px 56px" }}>
      <PlanSelector
        currentPlan={profile?.plan ?? "free"}
        cancelAtPeriodEnd={profile?.cancel_at_period_end ?? false}
        currentPeriodEnd={profile?.current_period_end ?? null}
        isPendingDeletion={profile?.status === "pending_deletion"}
        onSubscribed={async () => { await loadProfile(); }}
      />
    </div>
  );

  return (
    <MyPage
      activePage={section}
      setActivePage={() => {}}
      isLoggedIn={isLoggedIn}
      userInitial={userInitial}
      setUserInitial={setUserInitial}
      avatarUrl={avatarUrl}
      setAvatarUrl={setAvatarUrl}
      userName={userName}
      setUserName={setUserName}
      userEmail={userEmail}
      profile={profile}
      updateProfile={updateProfile}
      editingField={editingField}
      setEditingField={setEditingField}
      editingValue={editingValue}
      setEditingValue={setEditingValue}
      materials={materials}
      contentTabs={contentTabs}
      methodTabs={methodTabs}
      locale={locale}
      tmm={tmm}
      tm={tm}
      navItems={[]}
      mobileMode={true}
      onPlanChanged={loadProfile}
      onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }}
    />
  );
}

export default function MyPageRoute() {
  return <Suspense><MyPageContent /></Suspense>;
}
