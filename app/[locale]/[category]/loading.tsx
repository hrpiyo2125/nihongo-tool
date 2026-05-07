export default function CategoryLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "white", overflow: "hidden", fontFamily: "'Hiragino Sans','Yu Gothic','Noto Sans JP',sans-serif" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .sk {
          background: linear-gradient(90deg, #ede8f5 25%, #f5f0ff 50%, #ede8f5 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 8px;
        }
      `}</style>

      {/* ヘッダー */}
      <div style={{ height: 56, borderBottom: "0.5px solid rgba(200,170,240,0.2)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0 }}>
        <div className="sk" style={{ width: 80, height: 28 }} />
        <div style={{ flex: 1 }} />
        <div className="sk" style={{ width: 32, height: 32, borderRadius: "50%" }} />
      </div>

      {/* タブ */}
      <div style={{ padding: "12px 16px 0", display: "flex", gap: 8, flexShrink: 0 }}>
        {[80, 64, 72, 56, 68].map((w, i) => (
          <div key={i} className="sk" style={{ width: w, height: 32, borderRadius: 20 }} />
        ))}
      </div>

      {/* カードグリッド */}
      <div style={{ flex: 1, padding: "16px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, alignContent: "start", overflowY: "hidden" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ borderRadius: 14, overflow: "hidden", border: "0.5px solid rgba(200,170,240,0.2)" }}>
            <div className="sk" style={{ width: "100%", aspectRatio: "4/3", borderRadius: 0 }} />
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="sk" style={{ height: 13, width: "85%" }} />
              <div className="sk" style={{ height: 11, width: "60%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
