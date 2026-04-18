"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { createClient } from "../../../lib/supabase";

export default function WelcomeBackPage() {
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [reactivating, setReactivating] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [counts, setCounts] = useState({ favorites: 0, downloads: 0, purchases: 0 });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = `/${locale}/auth`;
        return;
      }

      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, status")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.status !== "deleted") {
        window.location.href = `/${locale}`;
        return;
      }

      setUserName(profile.full_name || session.user.email || "");

      const [favRes, dlRes, purchRes] = await Promise.all([
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", session.user.id),
        supabase.from("download_history").select("id", { count: "exact", head: true }).eq("user_id", session.user.id),
        supabase.from("purchases").select("id", { count: "exact", head: true }).eq("user_id", session.user.id),
      ]);

      setCounts({
        favorites: favRes.count ?? 0,
        downloads: dlRes.count ?? 0,
        purchases: purchRes.count ?? 0,
      });

      setLoading(false);
    });
  }, [locale]);

  const handleReactivate = async () => {
    setReactivating(true);
    const res = await fetch("/api/auth/reactivate-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      window.location.href = `/${locale}`;
    } else {
      setReactivating(false);
      alert("エラーが発生しました。もう一度お試しください。");
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = `/${locale}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#fce8f8,#ede8ff,#e8f0ff)" }}>
        <div style={{ fontSize: 14, color: "#b090c8" }}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#fce8f8 0%,#ede8ff 50%,#e8f0ff 100%)",
      fontFamily: "'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif",
      padding: "24px 16px",
    }}>
      <div style={{
        width: "100%", maxWidth: 440,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderRadius: 24, border: "0.5px solid rgba(200,180,230,0.4)",
        boxShadow: "0 8px 48px rgba(180,130,210,0.14)",
        padding: "48px 40px 40px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>

        <h1 style={{
          fontSize: 26, fontWeight: 800, marginBottom: 8,
          background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          おかえりなさい！
        </h1>

        <p style={{ fontSize: 14, color: "#7a50b0", fontWeight: 600, marginBottom: 4 }}>
          {userName} さん
        </p>
        <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7, marginBottom: 28 }}>
          以前のデータがそのまま保存されています。<br />
          アカウントを再開しますか？
        </p>

        {/* データ件数 */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10,
          marginBottom: 32,
        }}>
          {[
            { label: "お気に入り", count: counts.favorites, emoji: "♡" },
            { label: "ダウンロード", count: counts.downloads, emoji: "↓" },
            { label: "購入済み", count: counts.purchases, emoji: "🛒" },
          ].map((item) => (
            <div key={item.label} style={{
              background: "linear-gradient(135deg,rgba(244,185,185,0.12),rgba(228,155,253,0.12))",
              border: "0.5px solid rgba(228,155,253,0.3)",
              borderRadius: 14, padding: "16px 8px",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{item.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#9b6ed4", lineHeight: 1 }}>{item.count}</div>
              <div style={{ fontSize: 11, color: "#b090c8", marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleReactivate}
          disabled={reactivating}
          style={{
            width: "100%", height: 52, borderRadius: 26, border: "none",
            background: reactivating ? "#e0d0f0" : "linear-gradient(135deg,#f4b9b9,#e49bfd)",
            color: "white", fontSize: 15, fontWeight: 800,
            cursor: reactivating ? "not-allowed" : "pointer",
            marginBottom: 12, transition: "all 0.15s",
            boxShadow: "0 4px 16px rgba(228,155,253,0.35)",
          }}
        >
          {reactivating ? "再開中..." : "アカウントを再開する →"}
        </button>

        <button
          onClick={handleSignOut}
          style={{
            width: "100%", height: 44, borderRadius: 22, border: "0.5px solid rgba(200,180,230,0.4)",
            background: "transparent", color: "#b090c8", fontSize: 13, fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ログアウト
        </button>

        <p style={{ fontSize: 11, color: "#ccc", marginTop: 16, lineHeight: 1.6 }}>
          再開しない場合はログアウトしてください。<br />
          データはそのまま保持されます。
        </p>
      </div>
    </div>
  );
}
