"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "../AuthContext";
import { getCardStyle } from "../../../lib/materialUtils";
import { getContentTabs, getMethodTabs, contentTabLabels, methodTabLabels } from "../../../lib/tabs";
import MaterialCard from "../MaterialCard";
import { FaqSection } from "../MobileTroubleGuide";
import { PrivacyContent, TermsContent, TokushohoContent, AboutContent } from "../LegalPagesContent";
import { BrandIcon } from "../../../components/BrandIcon";
import AuthModal, { AuthModalMode } from "../../../components/AuthModal";

type Material = {
  id: string; title: string; description: string;
  level: string[]; content: string[]; method: string[];
  ageGroup: string; requiredPlan: string; pdfFile?: string;
  isPickup: boolean; isRecommended: boolean; ranking: number | null; isNew: boolean;
};

function MoreContent() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = searchParams.get("section") ?? "";

  const { isLoggedIn, profile, favIds, purchasedIds, dlIds, setFavIds } = useAuth();
  const effectiveFavIds = (!profile.plan || profile.plan === "free") ? favIds.slice(0, 5) : favIds;

  const [materials, setMaterials] = useState<Material[]>([]);
  const [legalContent, setLegalContent] = useState<{ textContents: Record<string, string>; faqs: { question: string; answer: string; category: string }[] } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("signup");

  useEffect(() => {
    fetch("/api/materials").then(r => r.json()).then(data => setMaterials(Array.isArray(data) ? data : []));
    fetch("/api/legal-content").then(r => r.json()).then(data => setLegalContent(data));
  }, []);

  const goSection = (s: string) => router.push(`/${locale}/more?section=${s}`);
  const goBack = () => router.push(`/${locale}/more`);

  // セクション表示
  if (section === "guide") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="block md:hidden" style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", gap: 12 }}>
        <button onClick={goBack} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer" }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>よくある質問</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}><FaqSection /></div>
    </div>
  );

  if (section === "privacy") return (
    <PrivacyContent onBack={goBack} notionBody={legalContent?.textContents?.["プライバシーポリシー"]} />
  );
  if (section === "terms") return (
    <TermsContent onBack={goBack} notionBody={legalContent?.textContents?.["利用規約"]} />
  );
  if (section === "tokushoho") return (
    <TokushohoContent onBack={goBack} notionBody={legalContent?.textContents?.["特定商取引法"]} />
  );
  if (section === "about") return (
    <AboutContent onBack={goBack} notionBody={legalContent?.textContents?.["toolioとは"]} />
  );

  const dlMaterials = materials.filter(m => dlIds.includes(m.id));
  const purchasedMaterials = materials.filter(m => purchasedIds.includes(m.id));

  if (section === "dl") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", gap: 12 }}>
        <button onClick={goBack} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer" }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>ダウンロード履歴</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        {!isLoggedIn ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>↓</div>
            <div style={{ fontSize: 14, color: "#bbb", marginBottom: 20 }}>ログインするとダウンロード履歴を確認できます</div>
            <button onClick={() => { setAuthModalMode("signup"); setAuthModalOpen(true); }} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>ログイン / 新規登録</button>
          </div>
        ) : dlMaterials.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}><div style={{ fontSize: 32, marginBottom: 12 }}>↓</div><div>ダウンロード履歴はまだありません</div></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {dlMaterials.map(mat => { const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale); return <MaterialCard key={mat.id} mat={mat} onClick={() => {}} locale={locale} isLoggedIn={isLoggedIn} favIds={effectiveFavIds} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={() => {}} />; })}
          </div>
        )}
      </div>
      {authModalOpen && <AuthModal initialMode={authModalMode} onClose={() => setAuthModalOpen(false)} onLoggedIn={() => setAuthModalOpen(false)} />}
    </div>
  );

  if (section === "purchases") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "0.5px solid rgba(200,170,240,0.2)", gap: 12 }}>
        <button onClick={goBack} style={{ border: "none", background: "transparent", fontSize: 22, color: "#aaa", cursor: "pointer" }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>教材購入履歴</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        {!isLoggedIn ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <BrandIcon name="purchases" size={32} color="#e0d0f0" />
            <div style={{ fontSize: 14, color: "#bbb", marginTop: 12, marginBottom: 20 }}>ログインすると購入履歴を確認できます</div>
            <button onClick={() => { setAuthModalMode("signup"); setAuthModalOpen(true); }} style={{ fontSize: 13, padding: "10px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>ログイン / 新規登録</button>
          </div>
        ) : purchasedMaterials.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}><BrandIcon name="purchases" size={32} color="#e0d0f0" /><div style={{ marginTop: 12 }}>購入した教材はまだありません</div></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {purchasedMaterials.map(mat => { const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale); return <MaterialCard key={mat.id} mat={mat} onClick={() => {}} locale={locale} isLoggedIn={isLoggedIn} favIds={effectiveFavIds} bg={bg} char={char} charColor={charColor} tag={tag} tagBg={tagBg} tagColor={tagColor} onFavToggle={() => {}} />; })}
          </div>
        )}
      </div>
      {authModalOpen && <AuthModal initialMode={authModalMode} onClose={() => setAuthModalOpen(false)} onLoggedIn={() => setAuthModalOpen(false)} />}
    </div>
  );

  // メインメニュー
  const menuItems = [
    { icon: "download" as const, label: "ダウンロード履歴",  section: "dl" },
    { icon: "guide"    as const, label: "よくある質問",      section: "guide" },
    { icon: "purchases"as const, label: "教材購入履歴",      section: "purchases" },
  ];

  const legalItems = [
    { label: "toolioとは",   section: "about" },
    { label: "利用規約",     section: "terms" },
    { label: "プライバシー", section: "privacy" },
    { label: "特商法",       section: "tokushoho" },
  ];

  return (
    <div style={{ padding: "20px 20px" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#333", marginBottom: 24 }}>もっと見る</div>
      {menuItems.map(item => (
        <div key={item.label} onClick={() => goSection(item.section)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "0.5px solid rgba(200,170,240,0.2)", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <BrandIcon name={item.icon} size={20} color="#c9a0f0" />
            <span style={{ fontSize: 15, color: "#333", fontWeight: 500 }}>{item.label}</span>
          </div>
          <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
        </div>
      ))}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 0", marginTop: 32, paddingTop: 16, borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
        {legalItems.map((l, i, arr) => (
          <span key={l.label}>
            <button onClick={() => goSection(l.section)} style={{ fontSize: 11, color: "#ccc", background: "none", border: "none", cursor: "pointer", padding: 0 }}>{l.label}</button>
            {i < arr.length - 1 && <span style={{ fontSize: 11, color: "#ddd", margin: "0 6px" }}>|</span>}
          </span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#ccc", marginTop: 12, textAlign: "center" }}>© 2026 toolio</div>
    </div>
  );
}

export default function MorePage() {
  return <Suspense><MoreContent /></Suspense>;
}
