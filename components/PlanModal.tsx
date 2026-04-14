"use client";
import PlanSelector from "./PlanSelector";

type Props = {
  currentPlan: string;
  onSubscribed: () => void;
  onClose: () => void;
};

export default function PlanModal({ currentPlan, onSubscribed, onClose }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 24,
          width: "100%",
          maxWidth: 700,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "36px 28px 28px",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.08)",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: "#666",
          }}
        >✕</button>

        <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 4, textAlign: "center" }}>
          プランを選ぶ
        </div>
        <div style={{ fontSize: 12, color: "#bbb", textAlign: "center", marginBottom: 24 }}>
          いつでもキャンセル可能です
        </div>

        <PlanSelector
          currentPlan={currentPlan}
          onSubscribed={() => {
            onSubscribed();
            onClose();
          }}
        />
      </div>
    </div>
  );
}