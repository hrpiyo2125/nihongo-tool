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

  if (categories.length === 0) return null;

  return (
    <div style={{ padding: "24px 20px 80px", display: "flex", flexDirection: "column" as const, gap: 28 }}>
      {categories.map((cat) => (
        <div key={cat.label}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b07de0", letterSpacing: 1, marginBottom: 10 }}>{cat.label}</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {cat.faqs.map((faq, i) => {
              const key = `${cat.label}-${i}`;
              const open = openIndex === key;
              return (
                <div key={key} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 12, overflow: "hidden" }}>
                  <button onClick={() => setOpenIndex(open ? null : key)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" as const, gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#444", lineHeight: 1.5 }}>{faq.q}</span>
                    <span style={{ fontSize: 18, color: "#c9a0f0", flexShrink: 0, display: "inline-block", transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "none" }}>›</span>
                  </button>
                  {open && (
                    <div style={{ padding: "0 16px 14px", fontSize: 13, color: "#777", lineHeight: 1.8, borderTop: "0.5px solid rgba(200,170,240,0.15)" }}>
                      <div style={{ paddingTop: 10 }}>{faq.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export { FaqSection };
