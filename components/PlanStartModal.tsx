"use client";

type Props = {
  planName: string;
  price: number;
  onConfirm: () => void;
  onClose: () => void;
};

export default function PlanStartModal({ planName, price, onConfirm, onClose }: Props) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 400, padding: "40px 32px", textAlign: "center", boxShadow: "0 16px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>✨</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginBottom: 8 }}>
          {planName}プランを始めますか？
        </div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 32, lineHeight: 1.8 }}>
          月額 ¥{price.toLocaleString()} で、<br />いつでもキャンセルできます。
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
          >
            はい、始めます
          </button>
          <button
            onClick={onClose}
            style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "transparent", color: "#bbb", fontSize: 13, cursor: "pointer" }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}