"use client";
import Link from "next/link";

const section = (label: string, value: string) => ({ label, value });

const rows = [
  section("販売事業者名", "●●（個人事業主）"),
  section("運営責任者", "●●"),
  section("所在地", "請求があった場合、遅滞なく開示します"),
  section("電話番号", "請求があった場合、遅滞なく開示します"),
  section("メールアドレス", "support@nihongo-tool.com"),
  section("販売URL", "https://nihongo-tool.com"),
  section("販売価格", "各プランページに表示する金額（税込）"),
  section("販売価格以外の費用", "インターネット接続料金・通信費はお客様負担となります"),
  section("支払方法", "クレジットカード決済（Visa・Mastercard・American Express・JCB）"),
  section("支払時期", "サブスクリプション登録時に初回課金。以降、月次または年次で自動更新"),
  section("サービス提供時期", "お支払い完了後、即時ご利用いただけます"),
  section("返品・解約について", "サービスの性質上、原則として返金はいたしかねます。解約はマイページよりいつでも可能です。解約後は次回更新日まで引き続きご利用いただけます。"),
  section("動作環境", "最新バージョンのChrome・Safari・Firefox・Edgeを推奨します"),
];

export default function TokushohoPage() {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif", background: "#f8f4f4" }}>
      {/* ヘッダー */}
      <div style={{ padding: "48px 0 36px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 80%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#bbb", textDecoration: "none", marginBottom: 24 }}>
          ← ホームに戻る
        </Link>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 10 }}>Legal</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          特定商取引法に基づく表記
        </h1>
        <p style={{ fontSize: 13, color: "#bbb", marginTop: 10 }}>Act on Specified Commercial Transactions</p>
      </div>

      {/* 本文 */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ background: "white", borderRadius: 16, border: "0.5px solid rgba(200,170,240,0.2)", overflow: "hidden" }}>
          {rows.map((row, i) => (
            <div key={row.label} style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderBottom: i < rows.length - 1 ? "0.5px solid rgba(0,0,0,0.05)" : "none" }}>
              <div style={{ padding: "18px 20px", background: "rgba(163,192,255,0.06)", fontSize: 13, fontWeight: 700, color: "#7a50b0", display: "flex", alignItems: "flex-start" }}>
                {row.label}
              </div>
              <div style={{ padding: "18px 24px", fontSize: 14, color: "#555", lineHeight: 1.8 }}>
                {row.value}
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#ccc", marginTop: 40 }}>
          最終更新日：2026年●月●日
        </p>
      </div>
    </div>
  );
}
