"use client";
import { useTranslations } from "next-intl";
import { BrandIcon } from "../../components/BrandIcon";
import { AuthModalMode } from "../../components/AuthModal";

type Props = {
  userIconRef: React.RefObject<HTMLDivElement | null>;
  sbOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode: AuthModalMode) => void;
};

export default function GuestLoginPopup({ userIconRef, onClose, onOpenAuth, sbOpen }: Props) {
  const th = useTranslations("home");
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
      <div style={{ padding: "14px 18px 10px", borderBottom: "0.5px solid rgba(200,170,240,0.15)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{th("login_prompt")}</div>
      </div>
      <button onClick={() => { onClose(); onOpenAuth("login"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: 13, color: "#444", borderBottom: "0.5px solid rgba(200,170,240,0.1)" }}>
        <BrandIcon name="key" size={17} color="#c9a0f0" />{th("login")}
      </button>
      <button onClick={() => { onClose(); onOpenAuth("signup"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: 13, color: "#7040b0" }}>
        <BrandIcon name="sparkle" size={17} color="#9b6ed4" />{th("login_prompt_signup")}
      </button>
    </div>
  );
}
