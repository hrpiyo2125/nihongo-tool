"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ===== ロック済み教材プレビュー =====
const lockedMaterials = [
  { char: "い", bg: "linear-gradient(135deg,#ecdeff,#ddc8ff)", color: "#8a5cc4", title: "ひらがなかるたセット" },
  { char: "字", bg: "linear-gradient(135deg,#ffd9ee,#ffc8e4)", color: "#c44a88", title: "漢字テスト1年生" },
  { char: "＋", bg: "linear-gradient(135deg,#d6f5e5,#c0ecd4)", color: "#3a8a5a", title: "算数ゲームセット" },
  { char: "語", bg: "linear-gradient(135deg,#fff8e0,#fff0c8)", color: "#b08020", title: "語彙パズル上級" },
  { char: "文", bg: "linear-gradient(135deg,#dbe8ff,#c8d8ff)", color: "#4a72c4", title: "文法ドリル初級" },
  { char: "絵", bg: "linear-gradient(135deg,#e8f8ff,#d0f0ff)", color: "#4a9ac4", title: "絵本ぬりえセット" },
];

// ===== 社会的証明 =====
const proofItems = [
  { num: "500+", label: "利用中の\n先生・保護者" },
  { num: "120+", label: "教材の\nラインナップ" },
  { num: "15+",  label: "対応国・\n地域" },
];

export default function PlanPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");

  const monthlyPrice = 1480;
  const yearlyMonthlyPrice = 1230;
  const yearlyTotal = 14800;

  const displayPrice = billing === "yearly" ? yearlyMonthlyPrice : monthlyPrice;

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif",
      background: "white",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "48px 16px 80px",
    }}>

      {/* ===== ヘッダー ===== */}
      <div style={{ width: "100%", maxWidth: 560, marginBottom: 36 }}>

        {/* 戻るボタン */}
        <button onClick={() => router.back()} style={{
          border: "none", background: "transparent", cursor: "pointer",
          fontSize: 13, color: "#bbb", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 4, padding: 0,
        }}>
          ‹ 戻る
        </button>

        <div style={{ fontSize: 26, fontWeight: 800, color: "#333", marginBottom: 6 }}>
          プランを選ぶ
        </div>
        <div style={{ fontSize: 13, color: "#bbb" }}>
          いつでもキャンセルできます。クレジットカード不要で無料から始められます。
        </div>
      </div>

      {/* ===== 月払い・年払いトグル ===== */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div style={{
          display: "flex", background: "#f5f0ff", borderRadius: 24,
          padding: 3, gap: 2,
        }}>
          {(["monthly", "yearly"] as const).map((b) => (
            <button key={b} onClick={() => setBilling(b)} style={{
              padding: "8px 20px", border: "none", borderRadius: 20, cursor: "pointer",
              fontSize: 13, fontWeight: billing === b ? 700 : 500,
              background: billing === b ? "white" : "transparent",
              color: billing === b ? "#7a50b0" : "#b090c8",
              boxShadow: billing === b ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}>
              {b === "monthly" ? "月払い" : "年払い"}
            </button>
          ))}
        </div>
        {billing === "yearly" && (
          <span style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 12,
            background: "#d6f5e5", color: "#2a6a44", fontWeight: 700,
          }}>
            2ヶ月分おトク
          </span>
        )}
      </div>

      {/* ===== プランカード ===== */}
      <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>

        {/* 無料プラン */}
        <div style={{
          border: "0.5px solid #eee", borderRadius: 16, padding: "20px 24px",
          background: "white",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 4 }}>無料プラン</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#888" }}>
                ¥0 <span style={{ fontSize: 13, fontWeight: 400, color: "#bbb" }}>/月</span>
              </div>
            </div>
            <span style={{
              fontSize: 10, padding: "3px 10px", borderRadius: 10,
              background: "#f1efea", color: "#888", fontWeight: 600,
            }}>現在のプラン</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { ok: true,  text: "無料教材をすべてダウンロード" },
              { ok: true,  text: "お気に入り5件まで保存" },
              { ok: false, text: "体系的カリキュラムセット" },
              { ok: false, text: "サブスク限定教材（60点以上）" },
              { ok: false, text: "お気に入り無制限" },
              { ok: false, text: "毎月の新教材追加" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                  background: item.ok ? "#e49bfd" : "#eee",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {item.ok ? (
                    <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                  ) : (
                    <svg width="8" height="8" viewBox="0 0 10 10"><path d="M3 5h4" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  )}
                </div>
                <span style={{ fontSize: 13, color: item.ok ? "#444" : "#ccc" }}>{item.text}</span>
                {!item.ok && (
                  <svg width="12" height="12" viewBox="0 0 14 16" style={{ flexShrink: 0 }}>
                    <rect x="2" y="6" width="10" height="9" rx="2" fill="none" stroke="#ddd" strokeWidth="1.2"/>
                    <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" fill="none" stroke="#ddd" strokeWidth="1.2"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* サブスクプラン */}
        <div style={{
          border: "1.5px solid #c9a0f0", borderRadius: 16, padding: "20px 24px",
          background: "#fdf8ff", position: "relative",
        }}>
          {/* おすすめバッジ */}
          <div style={{
            position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
            background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
            color: "white", fontSize: 11, fontWeight: 700,
            padding: "3px 16px", borderRadius: 12, whiteSpace: "nowrap",
          }}>
            おすすめ
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#7a50b0", marginBottom: 4 }}>サブスクプラン</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: "#7a50b0" }}>
                  ¥{displayPrice.toLocaleString()}
                </span>
                <span style={{ fontSize: 13, color: "#bbb" }}>/月</span>
                {billing === "yearly" && (
                  <span style={{ fontSize: 12, color: "#ccc", textDecoration: "line-through" }}>
                    ¥{monthlyPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 年払い注釈 */}
          {billing === "yearly" && (
            <div style={{
              fontSize: 11, color: "#b090c8", marginBottom: 14,
              padding: "5px 10px", background: "rgba(228,155,253,0.08)",
              borderRadius: 6, border: "0.5px solid rgba(228,155,253,0.2)",
            }}>
              年払い ¥{yearlyTotal.toLocaleString()} · 月払いより2ヶ月分おトク
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "無料教材 + サブスク限定教材をすべてダウンロード",
              "体系的カリキュラムセット（レベル別）",
              "お気に入り無制限",
              "毎月新教材を追加",
              "先行リリース教材へのアクセス",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                </div>
                <span style={{ fontSize: 13, color: "#555" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CTAボタン ===== */}
      <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
        <button style={{
          width: "100%", height: 52, borderRadius: 28, border: "none",
          background: "linear-gradient(135deg,#f4b9b9,#e49bfd)",
          color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer",
        }}>
          サブスクプランで始める →
        </button>
        <button onClick={() => router.push("/")} style={{
          width: "100%", height: 40, borderRadius: 28, border: "none",
          background: "transparent", color: "#bbb", fontSize: 13, cursor: "pointer",
        }}>
          まず無料で使ってみる
        </button>
      </div>

      {/* ===== 社会的証明 ===== */}
      <div style={{
        width: "100%", maxWidth: 560,
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
        marginBottom: 40,
      }}>
        {proofItems.map((item) => (
          <div key={item.num} style={{
            textAlign: "center", padding: "14px 8px",
            background: "#fdf8ff", borderRadius: 12,
            border: "0.5px solid rgba(228,155,253,0.2)",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#9b6ed4", marginBottom: 4 }}>
              {item.num}
            </div>
            <div style={{ fontSize: 11, color: "#bbb", lineHeight: 1.5, whiteSpace: "pre-line" }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* ===== ロック済み教材プレビュー ===== */}
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 12 }}>
          サブスクで使える教材（一部）
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
        }}>
          {lockedMaterials.map((mat) => (
            <div key={mat.title} style={{
              borderRadius: 12, overflow: "hidden",
              border: "0.5px solid #eee", background: "white",
            }}>
              <div style={{
                height: 80, background: mat.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, color: mat.color, fontWeight: 700,
                position: "relative",
              }}>
                {mat.char}
                {/* ロックオーバーレイ */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(255,255,255,0.55)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="16" height="20" viewBox="0 0 16 20">
                    <rect x="1" y="8" width="14" height="11" rx="3" fill="none" stroke="#c9a0f0" strokeWidth="1.5"/>
                    <path d="M4 8V5.5a4 4 0 018 0V8" fill="none" stroke="#c9a0f0" strokeWidth="1.5"/>
                    <circle cx="8" cy="14" r="1.5" fill="#c9a0f0"/>
                  </svg>
                </div>
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#555", lineHeight: 1.4 }}>
                  {mat.title}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 10 }}>
          他にも60点以上の教材が使い放題
        </div>
      </div>
    </div>
  );
}
