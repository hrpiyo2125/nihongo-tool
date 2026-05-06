"use client";

export type ItemType = {
  label: string;
  char: string;
  color: string;
  imageSrc?: string | null;
  isMore?: boolean;
  contentId?: string;
  methodId?: string;
};

export default function IconItem({ item, onClick }: { item: ItemType; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0, width: 76 }}>
      <div style={{ width: 62, height: 62, borderRadius: "50%", background: item.isMore ? "white" : item.color, border: item.isMore ? "1.5px dashed #c9a0f0" : "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: item.isMore ? 20 : item.char.length > 1 ? 15 : 22, fontWeight: 700, color: item.isMore ? "#b090d0" : "#555", flexShrink: 0 }}>
        {item.imageSrc ? <img src={item.imageSrc} alt={item.label} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : item.char}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#777", textAlign: "center", lineHeight: 1.3, width: "100%" }}>{item.label}</span>
    </div>
  );
}
