"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "../../lib/supabase";
import { useAuth } from "./AuthContext";
import { BrandIcon } from "../../components/BrandIcon";
import AuthModal, { AuthModalMode } from "../../components/AuthModal";
import UserMenuPopup from "./UserMenuPopup";
import GuestLoginPopup from "./GuestLoginPopup";
import { useRef } from "react";

const ACTIVE_COLOR = "#7a50b0";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("nav");
  const tm = useTranslations("mypage");

  const { isLoggedIn, userName, userInitial, avatarUrl, profile, loadProfile } = useAuth();

  const [sbOpen, setSbOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("signup");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const userIconRef = useRef<HTMLDivElement | null>(null);

  const switchLanguage = () => {
    const nextLocale = locale === "ja" ? "en" : "ja";
    const base = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${nextLocale}${base}`);
  };

  const openAuth = (mode: AuthModalMode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // アクティブ判定
  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname.startsWith(href);
  };

  const desktopNavItems = [
    {
      id: "home", href: `/${locale}`,
      label: t("home"),
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <path d="M9 22V12h6v10" stroke={active ? ACTIVE_COLOR : "#bbb"} />
        </svg>
      ),
    },
    {
      id: "materials", href: `/${locale}/materials`,
      label: t("materials"),
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <rect x="14" y="3" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <rect x="3" y="14" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <rect x="14" y="14" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} />
        </svg>
      ),
    },
    {
      id: "dl", href: `/${locale}/more?section=dl`,
      label: t("dl"),
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v13M7 11l5 5 5-5" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <path d="M4 20h16" stroke={active ? ACTIVE_COLOR : "#bbb"} />
        </svg>
      ),
    },
    {
      id: "purchases", href: `/${locale}/more?section=purchases`,
      label: t("purchases"),
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <path d="M2 10h20" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <path d="M6 15h4" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <path d="M14 15h4" stroke={active ? ACTIVE_COLOR : "#bbb"} />
        </svg>
      ),
    },
    {
      id: "fav", href: `/${locale}/favorites`,
      label: t("fav"),
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={active ? ACTIVE_COLOR : "#bbb"} />
        </svg>
      ),
    },
    {
      id: "guide", href: `/${locale}/more?section=guide`,
      label: t("guide"),
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <circle cx="12" cy="17" r="0.8" fill={active ? ACTIVE_COLOR : "#bbb"} strokeWidth="0" />
        </svg>
      ),
    },
  ];

  const mobileTabItems = [
    {
      id: "home", href: `/${locale}`,
      label: "ホーム",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <path d="M9 22V12h6v10" stroke={active ? ACTIVE_COLOR : "#bbb"} />
        </svg>
      ),
    },
    {
      id: "materials", href: `/${locale}/materials`,
      label: "教材",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <rect x="14" y="3" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <rect x="3" y="14" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} />
          <rect x="14" y="14" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} />
        </svg>
      ),
    },
    {
      id: "favorites", href: `/${locale}/favorites`,
      label: "お気に入り",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={active ? ACTIVE_COLOR : "#bbb"} />
        </svg>
      ),
    },
    {
      id: "more", href: `/${locale}/more`,
      label: "もっと見る",
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="12" r="1.5" fill={active ? ACTIVE_COLOR : "#bbb"} />
          <circle cx="12" cy="12" r="1.5" fill={active ? ACTIVE_COLOR : "#bbb"} />
          <circle cx="19" cy="12" r="1.5" fill={active ? ACTIVE_COLOR : "#bbb"} />
        </svg>
      ),
    },
  ];

  const SB_CLOSED = 72;
  const SB_OPEN = 300;

  const navSections = [
    { section: t("main"),    items: desktopNavItems.slice(0, 2) },
    { section: t("mypage"),  items: desktopNavItems.slice(2, 5) },
    { section: t("service"), items: desktopNavItems.slice(5) },
  ];

  return (
    <>
      {/* ─── デスクトップレイアウト（md以上） ─── */}
      <div className="hidden md:flex" style={{ height: "100vh", background: "#f8f4f4", overflow: "hidden", position: "relative" }}>
        {/* サイドバー */}
        <aside style={{ width: sbOpen ? SB_OPEN : SB_CLOSED, transition: "width 0.22s ease", background: "transparent", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "visible", zIndex: 10 }}>
          <nav aria-label="サイト内リンク" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
            <Link href="/faq">よくある質問</Link>
            <Link href="/terms">利用規約</Link>
            <Link href="/privacy">プライバシーポリシー</Link>
            <Link href="/tokushoho">特定商取引法に基づく表示</Link>
          </nav>
          <div style={{ flexShrink: 0 }}>
            {sbOpen ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
                <img src="/toolio_logo.png" alt="toolio" style={{ height: 52, width: "auto", objectFit: "contain", display: "block" }} />
                <button onClick={() => setSbOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#aaa", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>‹</button>
              </div>
            ) : (
              <button onClick={() => setSbOpen(true)} style={{ width: "100%", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#aaa" strokeWidth="2"><path d="M6 3l5 5-5 5" /></svg>
              </button>
            )}
          </div>
          <div className="toolio-scroll-y" style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
            {navSections.map(({ section, items }) => (
              <div key={section}>
                {sbOpen && <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#c0a0a0", padding: "8px 18px 3px", whiteSpace: "nowrap" }}>{section}</div>}
                {items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.id} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: sbOpen ? "9px 14px" : "9px 0", justifyContent: sbOpen ? "flex-start" : "center", borderRadius: 10, margin: sbOpen ? "1px 8px" : "1px 4px", whiteSpace: "nowrap", textDecoration: "none" }}>
                      <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 10, background: active ? "rgba(163,192,255,0.15)" : "transparent", transition: "background 0.15s" }}>
                        {item.icon(active)}
                      </div>
                      {sbOpen && <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#7040b0" : "#666" }}>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 6px", flexShrink: 0, position: "relative" }}>
            {guestMenuOpen && !isLoggedIn && (
              <>
                <div onClick={() => setGuestMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
                <GuestLoginPopup
                  userIconRef={userIconRef}
                  onClose={() => setGuestMenuOpen(false)}
                  onOpenAuth={(mode) => { setGuestMenuOpen(false); openAuth(mode); }}
                  sbOpen={sbOpen}
                />
              </>
            )}
            {userMenuOpen && isLoggedIn && (
              <>
                <div onClick={() => setUserMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
                <UserMenuPopup
                  userIconRef={userIconRef}
                  userInitial={userInitial}
                  avatarUrl={avatarUrl}
                  userName={userName}
                  onClose={() => setUserMenuOpen(false)}
                  onNavigate={(page) => { setUserMenuOpen(false); router.push(`/${locale}/mypage?section=${page}`); }}
                  onRouterPush={(href) => { setUserMenuOpen(false); router.push(href); }}
                  onLogout={async () => {
                    setUserMenuOpen(false);
                    const supabase = createClient();
                    await supabase.auth.signOut();
                  }}
                  sbOpen={sbOpen}
                  userPlan={profile.plan ?? "free"}
                  cancelAtPeriodEnd={profile.cancel_at_period_end ?? false}
                  currentPeriodEnd={profile.current_period_end ?? null}
                  tm={tm}
                />
              </>
            )}
            <div ref={userIconRef} onClick={() => { if (!isLoggedIn) { setGuestMenuOpen(!guestMenuOpen); } else { setUserMenuOpen(!userMenuOpen); } }} style={{ display: "flex", alignItems: "center", gap: 8, padding: sbOpen ? "6px 10px" : "6px 0", justifyContent: sbOpen ? "flex-start" : "center", borderRadius: 10, cursor: "pointer", background: userMenuOpen ? "rgba(163,192,255,0.1)" : "transparent" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden" }}>
                {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userInitial}
              </div>
              {sbOpen && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#555", whiteSpace: "nowrap" }}>{isLoggedIn ? userName : "ゲスト"}</div>
                  <div style={{ fontSize: 11, color: "#999" }}>
                    {isLoggedIn ? (
                      <>
                        {profile.plan === "light" ? "ライトプラン" : profile.plan === "standard" ? "スタンダードプラン" : profile.plan === "premium" ? "プレミアムプラン" : "無料プラン"}
                        {profile.cancel_at_period_end && profile.current_period_end && (
                          <span style={{ fontSize: 10, color: "#a04020", display: "block" }}>
                            {new Date(profile.current_period_end).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}まで利用可能
                          </span>
                        )}
                      </>
                    ) : "未登録"}
                  </div>
                </div>
              )}
              {sbOpen && isLoggedIn && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>}
            </div>
            <div style={{ display: "flex", justifyContent: sbOpen ? "stretch" : "center", marginTop: 4 }}>
              <button onClick={switchLanguage} style={{ fontSize: sbOpen ? 11 : 14, padding: sbOpen ? "5px 10px" : "5px 6px", width: sbOpen ? "100%" : "auto", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 8, background: "rgba(255,255,255,0.4)", color: "#888", cursor: "pointer" }}>
                {sbOpen ? (locale === "ja" ? "🌐 日本語 / EN" : "🌐 EN / 日本語") : "🌐"}
              </button>
            </div>
            {sbOpen && (
              <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "10px 0 4px", flexWrap: "wrap" }}>
                {[
                  { label: "toolioとは", href: `/${locale}/more?section=about` },
                  { label: "利用規約",   href: `/${locale}/more?section=terms` },
                  { label: "プライバシー", href: `/${locale}/more?section=privacy` },
                  { label: "特商法",     href: `/${locale}/more?section=tokushoho` },
                ].map((l, i, arr) => (
                  <span key={l.label}>
                    <Link href={l.href} style={{ fontSize: 11, color: "#ccc", textDecoration: "none" }}>{l.label}</Link>
                    {i < arr.length - 1 && <span style={{ fontSize: 11, color: "#ddd", margin: "0 6px" }}>|</span>}
                  </span>
                ))}
              </div>
            )}
            <div style={{ textAlign: "center", padding: "2px 0 8px", fontSize: 11, color: "#ccc" }}>© 2026 toolio</div>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main id="main-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0, background: "white", borderRadius: "16px 16px 0 0", margin: "12px 12px 0 0", boxShadow: "0 -4px 24px rgba(200,150,150,0.15)" }}>
          {children}
        </main>
      </div>

      {/* ─── モバイルレイアウト（md未満） ─── */}
      <div className="flex flex-col md:hidden" style={{ height: "100dvh", background: "white", overflow: "hidden" }}>
        {/* モバイルヘッダー */}
        <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: "white", borderBottom: "0.5px solid rgba(200,170,240,0.2)" }}>
          <Link href={`/${locale}`}>
            <img src="/toolio_logo.png" alt="toolio" style={{ height: 32, objectFit: "contain" }} />
          </Link>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { if (!isLoggedIn) { setGuestMenuOpen(!guestMenuOpen); } else { router.push(`/${locale}/mypage`); } }}
              style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer", overflow: "hidden", padding: 0 }}
            >
              {isLoggedIn && avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : isLoggedIn ? userInitial : "?"}
            </button>
            {guestMenuOpen && !isLoggedIn && (
              <>
                <div onClick={() => setGuestMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
                <div style={{ position: "absolute", top: 44, right: 0, zIndex: 60, width: 220, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "0.5px solid rgba(200,170,240,0.25)", overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px 10px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", fontSize: 13, fontWeight: 700, color: "#555" }}>ログインしますか？</div>
                  <button onClick={() => { setGuestMenuOpen(false); openAuth("login"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#444", borderBottom: "0.5px solid rgba(200,170,240,0.1)" }}>
                    <BrandIcon name="key" size={14} color="#c9a0f0" />ログイン
                  </button>
                  <button onClick={() => { setGuestMenuOpen(false); openAuth("signup"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#7040b0" }}>
                    <BrandIcon name="sparkle" size={14} color="#9b6ed4" />新規登録
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ページコンテンツ */}
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 56, paddingBottom: 80, WebkitOverflowScrolling: "touch" }}>
          {children}
        </div>

        {/* ボトムタブバー */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 80, background: "white", borderTop: "0.5px solid rgba(200,170,240,0.25)", display: "flex", alignItems: "center", justifyContent: "space-around", paddingBottom: "env(safe-area-inset-bottom, 16px)", zIndex: 50 }}>
          {mobileTabItems.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link key={tab.id} href={tab.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 16px", textDecoration: "none" }}>
                {tab.icon(active)}
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? ACTIVE_COLOR : "#bbb" }}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── 認証モーダル（全ページ共通） ─── */}
      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onLoggedIn={() => setAuthModalOpen(false)}
        />
      )}
    </>
  );
}
