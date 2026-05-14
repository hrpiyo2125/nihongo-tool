"use client";
import { useState } from "react";
import { FORM_TOPICS, FORM_SCHEMAS, buildSummary, validateForm } from "@/lib/formSchemas";

function IconPencil({ size = 14, color = "#9b6ed4" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function IconCheck({ size = 22, color = "#22c55e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

type Phase = "select" | "input" | "confirm" | "done";

type Props = {
  onSubmit: (topic: string, summary: string) => Promise<void>;
  onBack?: () => void;
};

export default function RequestForm({ onSubmit, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string[]>>({});
  const [formOtherTexts, setFormOtherTexts] = useState<Record<string, string>>({});
  const [textareaValue, setTextareaValue] = useState("");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const outlineBtn = (color = "#9b6ed4"): React.CSSProperties => ({
    padding: "9px 14px", borderRadius: 20, border: `1.5px solid ${color}`,
    background: "white", color, cursor: "pointer", fontSize: 13,
    fontWeight: 600, textAlign: "left" as const, width: "100%",
  });

  function resetForm() {
    setPhase("select");
    setSelectedTopic(null);
    setFormValues({});
    setFormOtherTexts({});
    setTextareaValue("");
    setSummary("");
  }

  function handleTopicSelect(topic: string) {
    setSelectedTopic(topic);
    setFormValues({});
    setFormOtherTexts({});
    setTextareaValue("");
    setPhase("input");
  }

  function handleNext() {
    if (!selectedTopic) return;
    if (!validateForm(selectedTopic, formValues, formOtherTexts, textareaValue)) return;
    setSummary(buildSummary(selectedTopic, formValues, formOtherTexts, textareaValue));
    setPhase("confirm");
  }

  async function handleConfirm() {
    if (!selectedTopic || submitting) return;
    setSubmitting(true);
    await onSubmit(selectedTopic, summary);
    setSubmitting(false);
    setPhase("done");
  }

  const isReady = selectedTopic ? validateForm(selectedTopic, formValues, formOtherTexts, textareaValue) : false;

  if (phase === "done") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 16px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconCheck size={26} color="#22c55e" />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#333", margin: 0 }}>送信しました！</p>
        <p style={{ fontSize: 13, color: "#888", textAlign: "center", lineHeight: 1.7, margin: 0 }}>
          ご連絡ありがとうございます。<br />内容を確認してご対応いたします。
        </p>
        <button
          onClick={resetForm}
          style={{ padding: "9px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          別の件を送る
        </button>
      </div>
    );
  }

  if (phase === "confirm") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px" }}>
        <p style={{ fontSize: 13, color: "#9b6ed4", fontWeight: 700, margin: 0 }}>送信内容の確認</p>
        <div style={{ background: "white", borderRadius: 12, border: "1.5px solid rgba(155,110,212,0.3)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700 }}>{selectedTopic}</span>
          <p style={{ fontSize: 13, color: "#333", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{summary}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPhase("input")} style={{ ...outlineBtn("#9b6ed4"), flex: 1, textAlign: "center" as const }}>修正する</button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            style={{ flex: 1, padding: "9px 14px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            {submitting ? "送信中..." : "この内容で送信する"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "input" && selectedTopic) {
    const schema = FORM_SCHEMAS[selectedTopic] ?? [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => { resetForm(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9b6ed4", fontSize: 12 }}>← 戻る</button>
          <p style={{ fontSize: 13, color: "#9b6ed4", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
            <IconPencil size={13} /> {selectedTopic}
          </p>
        </div>

        {schema.map((field) => (
          <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 12, color: "#555", fontWeight: 700, margin: 0 }}>
              {field.label}
              {field.required && <span style={{ color: "#e49bfd", marginLeft: 4 }}>*</span>}
            </p>

            {(field.type === "multiselect" || field.type === "select") && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {field.options.map((opt) => {
                  const selected = (formValues[field.id] ?? []).includes(opt.value);
                  return (
                    <div key={opt.value} style={{ display: "flex", flexDirection: "column", gap: 4, width: opt.hasOther ? "100%" : "auto" }}>
                      <button
                        onClick={() => {
                          setFormValues((prev) => {
                            const cur = prev[field.id] ?? [];
                            if (field.type === "select") {
                              return { ...prev, [field.id]: selected ? [] : [opt.value] };
                            }
                            return { ...prev, [field.id]: selected ? cur.filter((v) => v !== opt.value) : [...cur, opt.value] };
                          });
                        }}
                        style={{
                          padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                          border: `1.5px solid ${selected ? "#9b6ed4" : "rgba(155,110,212,0.3)"}`,
                          background: selected ? "#f5f0ff" : "white",
                          color: selected ? "#9b6ed4" : "#666",
                        }}
                      >{opt.value}</button>
                      {opt.hasOther && selected && (
                        <input
                          type="text"
                          placeholder="具体的に記入してください（必須）"
                          value={formOtherTexts[field.id] ?? ""}
                          onChange={(e) => setFormOtherTexts((prev) => ({ ...prev, [field.id]: e.target.value }))}
                          style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid rgba(155,110,212,0.4)", fontSize: 13, outline: "none", background: "white" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {field.type === "textarea" && (
              <textarea
                rows={4}
                placeholder={field.placeholder}
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                style={{ padding: "10px 13px", borderRadius: 12, border: "1.5px solid rgba(155,110,212,0.4)", fontSize: 13, resize: "none", outline: "none", lineHeight: 1.6, background: "white" }}
              />
            )}
          </div>
        ))}

        <button
          onClick={handleNext}
          disabled={!isReady}
          style={{ padding: "11px 0", borderRadius: 20, border: "none", background: isReady ? "linear-gradient(135deg,#f4b9b9,#e49bfd)" : "#e5e5e5", color: isReady ? "white" : "#bbb", cursor: isReady ? "pointer" : "default", fontSize: 13, fontWeight: 700 }}
        >
          確認する
        </button>
      </div>
    );
  }

  // select フェーズ
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px" }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0 8px", color: "#9b6ed4", fontSize: 12, textAlign: "left" }}>← 戻る</button>
      )}
      <p style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, margin: "0 0 6px", letterSpacing: 0.3 }}>カテゴリを選んでください</p>
      {FORM_TOPICS.map((t) => (
        <button key={t} style={outlineBtn()} onClick={() => handleTopicSelect(t)}>{t}</button>
      ))}
    </div>
  );
}
