"use client";
import { useEffect, useState } from "react";

type Props = {
  messages: string[];
  intervalMs?: number;
};

export function ProcessingOverlay({ messages, intervalMs = 2200 }: Props) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(prev => (prev + 1) % messages.length);
        setVisible(true);
      }, 350);
    }, intervalMs);
    return () => clearInterval(cycle);
  }, [messages.length, intervalMs]);

  return (
    <div style={{ textAlign: "center", padding: "40px 24px" }}>
      <style>{`
        @keyframes spin-slow { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-ring {
          0%{transform:scale(0.85);opacity:0.6}
          50%{transform:scale(1);opacity:1}
          100%{transform:scale(0.85);opacity:0.6}
        }
        @keyframes fade-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .proc-icon { animation: bounce 1.8s ease-in-out infinite; display:inline-block; font-size:52px; }
        .proc-ring {
          width:80px; height:80px; border-radius:50%;
          background: conic-gradient(from 0deg, #f4b9b9, #e49bfd, #a3c0ff, #f4b9b9);
          animation: spin-slow 2s linear infinite;
          margin: 0 auto 20px;
          display:flex; align-items:center; justify-content:center;
        }
        .proc-ring-inner {
          width:64px; height:64px; border-radius:50%; background:white;
          display:flex; align-items:center; justify-content:center; font-size:28px;
        }
        .proc-msg { animation: fade-in 0.35s ease-out; }
        .proc-dots span {
          display:inline-block;
          animation: bounce 1.2s ease-in-out infinite;
        }
        .proc-dots span:nth-child(2){ animation-delay:0.2s; }
        .proc-dots span:nth-child(3){ animation-delay:0.4s; }
      `}</style>

      <div className="proc-ring">
        <div className="proc-ring-inner">💳</div>
      </div>

      {visible && (
        <div className="proc-msg">
          <div style={{ fontSize: 15, fontWeight: 700, color: "#555", marginBottom: 6 }}>
            {messages[idx]}
          </div>
        </div>
      )}

      <div className="proc-dots" style={{ marginTop: 16, color: "#d0a0f0", fontSize: 20, letterSpacing: 6 }}>
        <span>·</span><span>·</span><span>·</span>
      </div>
    </div>
  );
}

export function SuccessOverlay({ label }: { label?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 24px" }}>
      <style>{`
        @keyframes pop-in {
          0%{transform:scale(0.5);opacity:0}
          70%{transform:scale(1.15);opacity:1}
          100%{transform:scale(1)}
        }
        @keyframes wag { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
        .success-icon { animation: pop-in 0.6s cubic-bezier(.34,1.56,.64,1) forwards, wag 0.5s ease-in-out 0.7s 3; display:inline-block; font-size:64px; }
        @keyframes rise { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .success-text { animation: rise 0.5s ease-out 0.5s both; }
      `}</style>

      <div className="success-icon">🐷</div>

      <div className="success-text">
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginTop: 20, marginBottom: 8 }}>
          完了しました！
        </div>
        {label && (
          <div style={{ fontSize: 13, color: "#999", lineHeight: 1.8 }}>{label}</div>
        )}
      </div>
    </div>
  );
}
