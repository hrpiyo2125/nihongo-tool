"use client";
import { BrandIcon } from "../../components/BrandIcon";

type Props = {
  userIconRef: React.RefObject<HTMLDivElement | null>;
  sbOpen: boolean;
  userInitial: string;
  avatarUrl?: string | null;
  userName: string;
  userPlan: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onRouterPush: (href: string) => void;
  onLogout: () => void;
  tm: (key: string) => string;
};

export default function UserMenuPopup({
  userIconRef, userInitial, avatarUrl, userName, onClose, onNavigate, onRouterPush, onLogout, sbOpen, userPlan, cancelAtPeriodEnd, currentPeriodEnd, tm,
}: Props) {
  const el = userIconRef.current; if (!el) return null;
  const rect = el.getBoundingClientRect(); if (!rect) return null;

  return (
    <div style={{
      position: "fixed",
      left: sbOpen ? 200 : 80,
      bottom: window.innerHeight - rect.bottom - 8,
      width: 240,
      background: "white",
      borderRadius: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
      border: "0.5px solid rgba(200,170,240,0.25)",
      zIndex: 50,
      overflow: "hidden",
    }}>
      <div style={{ padding: "16px 18px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden" }}>
          {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userInitial}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{userName}</div>
          <div style={{ fontSize: 11, color: "#aaa" }}>
            {userPlan === "light" ? "ライトプラン" : userPlan === "standard" ? "スタンダードプラン" : userPlan === "premium" ? "プレミアムプラン" : tm("free_plan")}
            {cancelAtPeriodEnd && currentPeriodEnd && (
              <span style={{ fontSize: 10, color: "#a04020", display: "block" }}>
                {new Date(currentPeriodEnd).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}まで利用可能
              </span>
            )}
          </div>
        </div>
      </div>
      {[
        { icon: "user" as const, label: tm("profile"), page: "settings-profile" },
        { icon: "plan" as const, label: tm("plan"), page: "plan" },
        { icon: "billing" as const, label: tm("billing"), page: "settings-billing" },
        { icon: "bell" as const, label: tm("notifications"), page: "settings-notifications" },
      ].map((item) => (
        <button key={item.label} onClick={() => onNavigate(item.page)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: 13, color: "#444", borderBottom: "0.5px solid rgba(200,170,240,0.1)" }}>
          <BrandIcon name={item.icon} size={17} color="#c9a0f0" />{item.label}
        </button>
      ))}
      <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: 13, color: "#e49bfd" }}>
        <BrandIcon name="logout" size={17} color="#e49bfd" />{tm("logout")}
      </button>
    </div>
  );
}
