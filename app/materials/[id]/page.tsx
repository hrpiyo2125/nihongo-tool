"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase";

const materials = [
  { id: 1,  title: "ひらがな練習シート",   content: "hiragana", method: "practice", tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#dbe8ff,#c8d8ff)", char: "あ", charColor: "#4a72c4", meta: "ひらがな · 練習 · A4" },
  { id: 2,  title: "ひらがなかるたセット", content: "hiragana", method: "karuta",   tag: "PICK", tagBg: "#ecdeff",  tagColor: "#7040b0", bg: "linear-gradient(135deg,#ecdeff,#ddc8ff)", char: "い", charColor: "#8a5cc4", meta: "ひらがな · かるた · A4" },
  { id: 3,  title: "ひらがなテスト①",     content: "hiragana", method: "test",     tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#ffd9ee,#ffc8e4)", char: "う", charColor: "#c44a88", meta: "ひらがな · テスト · A4" },
  { id: 4,  title: "ひらがなゲーム",       content: "hiragana", method: "game",     tag: "NEW",  tagBg: "#ffd9ee",  tagColor: "#a03070", bg: "linear-gradient(135deg,#d6f5e5,#c0ecd4)", char: "え", charColor: "#3a8a5a", meta: "ひらがな · ゲーム · A4" },
  { id: 5,  title: "ひらがななぞり書き",   content: "hiragana", method: "nazori",   tag: "無料",  tagBg: "#d6f5e5", tagColor: "#2a6a44", bg: "linear-gradient(135deg,#fff0ec,#ffe4d9)", char: "お", charColor: "#c47a4a", meta: "ひらがな · なぞり書き · A4" },
];

const sidePanels = [
  {
    id: "description", label: "解説",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {active && <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4b9b9"/><stop offset="50%" stopColor="#e49bfd"/><stop offset="100%" stopColor="#a3c0ff"/></linearGradient></defs>}
        <rect x="3" y="3" width="18" height="18" rx="3" stroke={active ? "url(#g1)" : "#555"} />
        <path d="M8 8h8M8 12h8M8 16h5" stroke={active ? "url(#g1)" : "#555"} />
      </svg>
    ),
    content: (
      <div style={{ padding: "20px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10 }}>この教材について</div>
        <p style={{ fontSize: 13, color: "#777", lineHeight: 1.9, marginBottom: 16 }}>ひらがな50音すべてを1枚にまとめた練習シートです。なぞり書きと自分で書く練習の両方ができます。</p>
        <p style={{ fontSize: 13, color: "#777", lineHeight: 1.9 }}>初めてひらがなを学ぶ子どもに最適な構成になっています。</p>
        <div style={{ marginTop: 20, padding: "12px 14px", background: "rgba(163,192,255,0.1)", borderRadius: 10, border: "0.5px solid rgba(163,192,255,0.3)" }}>
          <div style={{ fontSize: 11, color: "#a3c0ff", fontWeight: 700, marginBottom: 6 }}>対象年齢</div>
          <div style={{ fontSize: 13, color: "#555" }}>4〜7歳 / 幼稚園〜小学校低学年</div>
        </div>
      </div>
    ),
  },
  {
    id: "features", label: "特徴",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {active && <defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4b9b9"/><stop offset="50%" stopColor="#e49bfd"/><stop offset="100%" stopColor="#a3c0ff"/></linearGradient></defs>}
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke={active ? "url(#g2)" : "#555"} />
      </svg>
    ),
    content: (
      <div style={{ padding: "20px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 14 }}>この教材の特徴</div>
        {["授業でそのまま使えるA4サイズ","なぞり書き＋自由練習の2ステップ構成","手描きイラストで温かみのあるデザイン","白黒印刷でもきれいに出る高コントラスト","ふりがな付きで自習にも使える"].map((text, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
            <span style={{ color: "#e49bfd", fontSize: 12, flexShrink: 0, marginTop: 2 }}>✦</span>
            <span style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{text}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "howto", label: "使い方",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {active && <defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4b9b9"/><stop offset="50%" stopColor="#e49bfd"/><stop offset="100%" stopColor="#a3c0ff"/></linearGradient></defs>}
        <circle cx="12" cy="12" r="10" stroke={active ? "url(#g3)" : "#555"} />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={active ? "url(#g3)" : "#555"} />
        <circle cx="12" cy="17" r="0.8" fill={active ? "#e49bfd" : "#555"} strokeWidth="0" />
      </svg>
    ),
    content: (
      <div style={{ padding: "20px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 14 }}>使い方ガイド</div>
        {[
          { step: "01", title: "ダウンロード", desc: "右上のボタンからPDFをダウンロードします" },
          { step: "02", title: "印刷する", desc: "A4サイズで印刷。カラーでも白黒でもOK" },
          { step: "03", title: "なぞり書き", desc: "まず薄い文字をなぞって形を覚えます" },
          { step: "04", title: "自分で書く", desc: "空白のマスに自分で書いて練習します" },
        ].map((item) => (
          <div key={item.step} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0 }}>{item.step}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "related", label: "関連ツール",
    icon: (active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {active && <defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4b9b9"/><stop offset="50%" stopColor="#e49bfd"/><stop offset="100%" stopColor="#a3c0ff"/></linearGradient></defs>}
        <circle cx="6" cy="12" r="2" stroke={active ? "url(#g4)" : "#555"} />
        <circle cx="18" cy="6" r="2" stroke={active ? "url(#g4)" : "#555"} />
        <circle cx="18" cy="18" r="2" stroke={active ? "url(#g4)" : "#555"} />
        <path d="M8 11l8-4M8 13l8 4" stroke={active ? "url(#g4)" : "#555"} />
      </svg>
    ),
    content: (
      <div style={{ padding: "20px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 14 }}>関連する教材</div>
        {materials.slice(1, 5).map((mat) => (
          <div key={mat.id} style={{ display: "flex", gap: 10, marginBottom: 12, cursor: "pointer", padding: "8px 10px", borderRadius: 10, border: "0.5px solid #eee", background: "white" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: mat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: mat.charColor, fontWeight: 700, flexShrink: 0 }}>{mat.char}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 5, background: mat.tagBg, color: mat.tagColor, display: "inline-block", marginBottom: 3 }}>{mat.tag}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mat.title}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

// タグの色設定
function TagBadge({ tag }: { tag: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    "無料":  { bg: "#d6f5e5", color: "#2a6a44" },
    "PICK":  { bg: "#ecdeff", color: "#7040b0" },
    "NEW":   { bg: "#ffd9ee", color: "#a03070" },
    "有料":  { bg: "#fff0c8", color: "#8a6000" },
  };
  const s = styles[tag] ?? { bg: "#eee", color: "#555" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: s.bg, color: s.color, whiteSpace: "nowrap", flexShrink: 0 }}>
      {tag}
    </span>
  );
}

export default function MaterialDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const material = materials.find((m) => m.id === id) ?? materials[0];


  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [dlHover, setDlHover] = useState(false);
  const [favHover, setFavHover] = useState(false);
  const [homeHover, setHomeHover] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const supabase = createClient();
  supabase.auth.getSession().then(({ data: { session } }) => {
    setIsLoggedIn(!!session);
  });
}, []);

  // ズーム・ドラッグ
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setScale((s) => Math.min(4, Math.max(0.3, s - e.deltaY * 0.01)));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    setOffset({ x: dragStart.current.ox + e.clientX - dragStart.current.mx, y: dragStart.current.oy + e.clientY - dragStart.current.my });
  };
  const handleMouseUp = () => { setDragging(false); dragStart.current = null; };

  const SB_ICON_W = 64;
  const SB_PANEL_W = 393;
  const panelOpen = activePanel !== null;

  // 無料かどうか
  const isFree = material.tag === "無料";

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif",
      background: "#f0f0f0", overflow: "hidden",
    }}>

      {/* ===== HEADER ===== */}
      <header style={{
        flexShrink: 0,
        background: "linear-gradient(135deg, #f4b9b9 0%, #e49bfd 45%, #a3c0ff 100%)",
        padding: "0 16px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>

        {/* 左：ホーム → バッジ → 教材名 → メタ情報 → ダウンロード説明 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          {/* ホームボタン */}
          <button
            onClick={() => window.history.back()}
            onMouseEnter={() => setHomeHover(true)}
            onMouseLeave={() => setHomeHover(false)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: 8, border: "none",
              background: homeHover ? "rgba(255,255,255,0.22)" : "transparent",
              cursor: "pointer", transition: "background 0.15s", flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="white" />
              <path d="M9 22V12h6v10" stroke="white" />
            </svg>
          </button>

          {/* セパレーター */}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />

          {/* バッジ */}
          <TagBadge tag={material.tag} />

          {/* 教材名 */}
          <span style={{ fontSize: 15, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {material.title}
          </span>

          {/* メタ情報 */}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap", fontWeight: 400, flexShrink: 0 }}>
            {material.meta}
          </span>

          {/* セパレーター */}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />

          {/* ダウンロード説明テキスト */}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", fontWeight: 400, flexShrink: 0 }}>
            {isFree ? "このプリントは無料でダウンロードできます" : "このプリントはサブスク会員限定です"}
          </span>
        </div>

        {/* 右：お気に入り → ダウンロード */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
  onClick={() => {
    if (!isLoggedIn) {
      window.location.href = "/auth?reason=favorite";
      return;
    }
    setIsFav((v) => !v);
  }}
            onMouseEnter={() => setFavHover(true)}
            onMouseLeave={() => setFavHover(false)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              height: 34, padding: "0 12px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.55)",
              background: favHover ? "rgba(255,255,255,0.22)" : "transparent",
              cursor: "pointer", transition: "background 0.15s",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={isFav ? "white" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="white" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "white", whiteSpace: "nowrap" }}>{isFav ? "保存済み" : "お気に入り"}</span>
          </button>

          <button
            onMouseEnter={() => setDlHover(true)}
            onMouseLeave={() => setDlHover(false)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              height: 34, padding: "0 16px", borderRadius: 8, border: "none",
              background: dlHover ? "rgba(255,255,255,0.85)" : "white",
              cursor: "pointer", transition: "background 0.15s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v13M7 11l5 5 5-5" stroke="#333" />
              <path d="M4 20h16" stroke="#333" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#333", whiteSpace: "nowrap" }}>ダウンロード</span>
          </button>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* SIDEBAR（overlay） */}
        <aside
          style={{ display: "flex", position: "absolute", top: 0, left: 0, bottom: 0, zIndex: 20, overflow: "hidden" }}
          onMouseLeave={() => setActivePanel(null)}
        >
          <div style={{
            width: SB_ICON_W, background: "#f0f0f0",
            display: "flex", flexDirection: "column", alignItems: "center",
            paddingTop: 16, gap: 4, flexShrink: 0,
          }}>
            {sidePanels.map((panel) => {
              const active = activePanel === panel.id;
              return (
                <button
                  key={panel.id}
                  onMouseEnter={() => setActivePanel(panel.id)}
                  title={panel.label}
                  style={{
                    width: 46, height: 54,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                    border: "none", borderRadius: 10, background: "transparent",
                    cursor: "pointer", padding: 0,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: active ? "rgba(255,255,255,0.9)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                    boxShadow: active ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                  }}>
                    {panel.icon(active)}
                  </div>
                  <span style={{ fontSize: 9, color: "#666", fontWeight: 500, lineHeight: 1 }}>{panel.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{
            width: panelOpen ? SB_PANEL_W : 0,
            transition: "width 0.22s ease",
            overflow: "hidden", flexShrink: 0, background: "transparent",
          }}>
            <div style={{
              width: SB_PANEL_W,
              height: "calc(100% - 12px)",
              overflowY: "scroll",
              background: "white",
              borderRadius: "16px 16px 0 0",
              marginTop: 12,
              boxShadow: "0 -4px 24px rgba(200,150,150,0.12)",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,0,0,0.14) rgba(0,0,0,0.04)",
            }}>
              <div style={{ padding: "14px 18px 10px", borderBottom: "0.5px solid rgba(163,192,255,0.2)" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#9b6ed4" }}>
                  {sidePanels.find(p => p.id === activePanel)?.label}
                </span>
              </div>
              {sidePanels.find(p => p.id === activePanel)?.content}
            </div>
          </div>
        </aside>

        {/* MAIN（ズーム・ドラッグ・スクロール） */}
        <main
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            flex: 1, overflow: "auto",
            background: "#f0f0f0",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            minWidth: 0,
            cursor: dragging ? "grabbing" : "grab",
            userSelect: "none",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.14) rgba(0,0,0,0.04)",
          }}
        >
          <div style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "top center",
            transition: dragging ? "none" : "transform 0.1s",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 32, padding: "60px 40px 100px",
          }}>
            {/* 教材プレビュー（角丸なし・影あり） */}
            <div style={{
              width: 480,
              aspectRatio: "1 / 1.414",
              background: material.bg,
              borderRadius: 4,
              boxShadow: "0 16px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.25)" }} />
              <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 80, fontWeight: 700, color: material.charColor }}>{material.char}</div>
                <div style={{ fontSize: 14, color: "rgba(80,80,120,0.5)", marginTop: 8, letterSpacing: 2 }}>PREVIEW</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}