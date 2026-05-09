"use client";
import { useState, useEffect } from "react";

type Faq = { q: string; a: string };
type Category = { label: string; faqs: Faq[] };

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/legal-content")
      .then(r => r.json())
      .then(data => {
        const faqs: { question: string; answer: string; category: string }[] = data.faqs ?? [];
        if (faqs.length === 0) return;
        const catMap = new Map<string, Faq[]>();
        faqs.forEach(f => {
          const cat = f.category || 'その他';
          if (!catMap.has(cat)) catMap.set(cat, []);
          catMap.get(cat)!.push({ q: f.question, a: f.answer });
        });
        setCategories(Array.from(catMap.entries()).map(([label, faqs]) => ({ label, faqs })));
      });
  }, []);

  if (categories.length === 0) return (
    <div style={{ display: "flex", flexDirection: "column" as const }}>
      <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>よくある質問</h2>
      </div>
      <div style={{ padding: "36px 48px 64px", display: "flex", flexDirection: "column" as const, gap: 16 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 52, borderRadius: 12, background: "rgba(200,170,240,0.08)", border: "0.5px solid rgba(200,170,240,0.15)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" as const }}>
      <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>よくある質問</h2>
      </div>
      <div style={{ padding: "36px 48px 64px", display: "flex", flexDirection: "column" as const, gap: 32 }}>
        {categories.map((cat) => (
          <div key={cat.label}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#b07de0", letterSpacing: 1, marginBottom: 12 }}>{cat.label}</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {cat.faqs.map((faq, i) => {
                const key = `${cat.label}-${i}`;
                const open = openIndex === key;
                return (
                  <div key={key} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 12, overflow: "hidden" }}>
                    <button onClick={() => setOpenIndex(open ? null : key)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" as const, gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#444", lineHeight: 1.5 }}>{faq.q}</span>
                      <span style={{ fontSize: 16, color: "#c9a0f0", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>›</span>
                    </button>
                    {open && (
                      <div style={{ padding: "0 20px 16px", fontSize: 13, color: "#777", lineHeight: 1.8, borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
                        <div style={{ paddingTop: 12 }}>{faq.a}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export { FaqSection };
