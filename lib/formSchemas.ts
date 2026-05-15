export type FormFieldDef =
  | { id: string; label: string; type: "multiselect" | "select"; options: { value: string; hasOther?: boolean }[]; required?: boolean }
  | { id: string; label: string; type: "textarea"; placeholder: string; required?: boolean };

export const FORM_TOPICS = [
  "教材のリクエスト",
  "フィードバック",
  "その他・お問い合わせ",
] as const;

export const FORM_SCHEMAS: Record<string, FormFieldDef[]> = {
  "教材のリクエスト": [
    {
      id: "level", label: "日本語レベル（複数選択可）", type: "multiselect", required: true,
      options: [
        { value: "入門" }, { value: "初級" }, { value: "初中級" },
        { value: "中級" }, { value: "上級" }, { value: "その他", hasOther: true },
      ],
    },
    {
      id: "kind", label: "教材の種類（複数選択可）", type: "multiselect", required: true,
      options: [
        { value: "プリント" }, { value: "ドリル" }, { value: "カード" },
        { value: "その他", hasOther: true },
      ],
    },
    { id: "detail", label: "リクエスト内容", type: "textarea", placeholder: "どのような教材をご希望ですか？", required: true },
  ],
  "フィードバック": [
    {
      id: "kind", label: "フィードバックの種類", type: "select", required: true,
      options: [{ value: "改善要望" }, { value: "不具合報告" }, { value: "良かった点" }, { value: "その他" }],
    },
    { id: "detail", label: "詳細", type: "textarea", placeholder: "内容を自由にご記入ください", required: true },
  ],
  "その他・お問い合わせ": [
    { id: "detail", label: "お問い合わせ内容", type: "textarea", placeholder: "内容を自由にご記入ください", required: true },
  ],
};

export function buildSummary(topic: string, formValues: Record<string, string[]>, formOtherTexts: Record<string, string>, textareaValue: string): string {
  const schema = FORM_SCHEMAS[topic] ?? [];
  return schema.map((field) => {
    if (field.type === "textarea") return `【${field.label}】\n${textareaValue.trim()}`;
    const vals = formValues[field.id] ?? [];
    const display = vals.map((v) =>
      v === "その他" && formOtherTexts[field.id]
        ? `その他（${formOtherTexts[field.id]}）`
        : v
    ).join("、");
    return `【${field.label}】${display}`;
  }).join("\n");
}

export function validateForm(topic: string, formValues: Record<string, string[]>, formOtherTexts: Record<string, string>, textareaValue: string): boolean {
  const schema = FORM_SCHEMAS[topic] ?? [];
  return schema.every((field) => {
    if (!field.required) return true;
    if (field.type === "textarea") return textareaValue.trim().length > 0;
    const vals = formValues[field.id] ?? [];
    if (vals.length === 0) return false;
    const hasOtherOption = field.options.some((opt) => opt.value === "その他" && opt.hasOther);
    if (hasOtherOption && vals.includes("その他")) return (formOtherTexts[field.id] ?? "").trim().length > 0;
    return true;
  });
}
