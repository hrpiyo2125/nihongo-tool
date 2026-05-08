"use client";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase";
import PlanSelector from "./PlanSelector";

type Props = {
  currentPlan: string;
  requiredPlan?: string;
  onSubscribed: () => void;
  onClose: () => void;
};

export default function PlanModal({ currentPlan, requiredPlan, onSubscribed, onClose }: Props) {
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [isPendingDeletion, setIsPendingDeletion] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("profiles").select("cancel_at_period_end, current_period_end, status").eq("id", session.user.id).single();
      if (data) {
        setCancelAtPeriodEnd(data.cancel_at_period_end ?? false);
        setCurrentPeriodEnd(data.current_period_end ?? null);
        setIsPendingDeletion(data.status === "pending_deletion");
      }
    })();
  }, []);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClose(); }}
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

        <PlanSelector
          currentPlan={currentPlan}
          requiredPlan={requiredPlan}
          cancelAtPeriodEnd={cancelAtPeriodEnd}
          currentPeriodEnd={currentPeriodEnd}
          isPendingDeletion={isPendingDeletion}
          onSubscribed={() => {
            onSubscribed();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
