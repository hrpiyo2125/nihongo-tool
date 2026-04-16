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
        @keyframes fade-msg { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .proc-ring {
          width:80px; height:80px; border-radius:50%;
          background: conic-gradient(from 0deg, #f4b9b9, #e49bfd, #a3c0ff, #f4b9b9);
          animation: spin-slow 2s linear infinite;
          margin: 0 auto 20px;
          display:flex; align-items:center; justify-content:center;
        }
        .proc-ring-inner {
          width:64px; height:64px; border-radius:50%; background:white;
          display:flex; align-items:center; justify-content:center;
        }
        .proc-msg { animation: fade-msg 0.35s ease-out; }
        .proc-dots span {
          display:inline-block;
          animation: bounce 1.2s ease-in-out infinite;
        }
        .proc-dots span:nth-child(2){ animation-delay:0.2s; }
        .proc-dots span:nth-child(3){ animation-delay:0.4s; }
      `}</style>

      <div className="proc-ring">
        <div className="proc-ring-inner">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="3" stroke="#e49bfd" />
            <path d="M2 10h20" stroke="#e49bfd" />
            <path d="M6 15h4" stroke="#e49bfd" />
          </svg>
        </div>
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
        @keyframes circle-in {
          from { stroke-dashoffset: 157; opacity: 0.4; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        @keyframes check-in {
          0%   { stroke-dashoffset: 40; opacity: 0; }
          40%  { opacity: 1; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes success-scale {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes rise { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .success-svg { animation: success-scale 0.55s cubic-bezier(.34,1.56,.64,1) both; }
        .success-circle {
          stroke-dasharray: 157;
          stroke-dashoffset: 157;
          animation: circle-in 0.5s ease-out 0.05s both;
        }
        .success-check {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: check-in 0.4s ease-out 0.45s both;
        }
        .success-text { animation: rise 0.5s ease-out 0.55s both; }
      `}</style>

      <div className="success-svg" style={{ display: "inline-block" }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <defs>
            <linearGradient id="grad-success" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f4b9b9" />
              <stop offset="50%" stopColor="#e49bfd" />
              <stop offset="100%" stopColor="#a3c0ff" />
            </linearGradient>
          </defs>
          {/* 背景円 */}
          <circle cx="40" cy="40" r="38" fill="url(#grad-success)" opacity="0.12" />
          {/* アウトライン円 */}
          <circle
            className="success-circle"
            cx="40" cy="40" r="25"
            stroke="url(#grad-success)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
          {/* チェックマーク */}
          <path
            className="success-check"
            d="M28 40l9 9 15-16"
            stroke="url(#grad-success)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      <div className="success-text">
        <div style={{ fontSize: 20, fontWeight: 800, color: "#333", marginTop: 16, marginBottom: 8 }}>
          完了しました
        </div>
        {label && (
          <div style={{ fontSize: 13, color: "#999", lineHeight: 1.8, whiteSpace: "pre-line" }}>{label}</div>
        )}
      </div>
    </div>
  );
}
