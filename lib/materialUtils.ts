// ===== プランランク =====
export const planRank: Record<string, number> = {
  free: 0, light: 1, standard: 2, premium: 3,
  "無料": 0, "ライト": 1, "スタンダード": 2, "プレミアム": 3,
};

export function canDownload(
  userPlan: string,
  requiredPlan: string,
  purchasedIds: string[] = [],
  materialId: string = ""
): boolean {
  if (purchasedIds.includes(materialId)) return true;
  return (planRank[userPlan] ?? 0) >= (planRank[requiredPlan] ?? 0);
}

// ===== カードスタイル =====
const bgMap: Record<string, string> = {
  hiragana: "linear-gradient(135deg,#dbe8ff,#c8d8ff)",
  katakana: "linear-gradient(135deg,#ecdeff,#ddc8ff)",
  kanji:    "linear-gradient(135deg,#ffd9ee,#ffc8e4)",
  math:     "linear-gradient(135deg,#d6f5e5,#c0ecd4)",
  vocab:    "linear-gradient(135deg,#fff8e0,#ffedb0)",
  grammar:  "linear-gradient(135deg,#fff0ec,#ffd8d0)",
  picture:  "linear-gradient(135deg,#e8f8ff,#c8eeff)",
  song:     "linear-gradient(135deg,#edfff0,#c8f0d0)",
  daily:    "linear-gradient(135deg,#f8e8ff,#ecd0ff)",
  season:   "linear-gradient(135deg,#e8efff,#d0dcff)",
  number:   "linear-gradient(135deg,#f0e8ff,#d8c8ff)",
  food:     "linear-gradient(135deg,#fff0e8,#ffe0d0)",
  animal:   "linear-gradient(135deg,#e8f8ee,#d0f0dc)",
  body:     "linear-gradient(135deg,#ffe8f4,#ffd0e8)",
  color:    "linear-gradient(135deg,#f0e8ff,#e0d0ff)",
  joshi:    "linear-gradient(135deg,#fff0ec,#ffd8d0)",
  bunkei:   "linear-gradient(135deg,#f0ffe8,#d8f0c8)",
  aisatsu:  "linear-gradient(135deg,#e8f8ff,#c8eeff)",
  kaiwa:    "linear-gradient(135deg,#f8e8ff,#ecd0ff)",
};

const charMap: Record<string, string> = {
  hiragana: "あ", katakana: "ア", kanji: "字", math: "＋",
  vocab: "語", grammar: "文", picture: "絵", song: "♪",
  daily: "日", season: "季", number: "数",
  food: "🍎", animal: "🐾", body: "💪", color: "🔵",
  joshi: "は", bunkei: "文", aisatsu: "👋", kaiwa: "話",
};

const charColorMap: Record<string, string> = {
  hiragana: "#4a72c4", katakana: "#8a5cc4", kanji: "#c44a88", math: "#3a8a5a",
  vocab: "#b08020", grammar: "#c05040", picture: "#4090c0", song: "#3a8a5a",
  daily: "#9040c0", season: "#4a72c4", number: "#7040c0",
  food: "#c06020", animal: "#3a8a5a", body: "#c44a88", color: "#7040c0",
  joshi: "#c05040", bunkei: "#3a8a5a", aisatsu: "#4090c0", kaiwa: "#9040c0",
};

type MaterialForStyle = {
  content?: string[];
  requiredPlan?: string;
  isPickup?: boolean;
  isNew?: boolean;
  bg?: string;
  char?: string;
  charColor?: string;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
};

export function getCardStyle(mat: MaterialForStyle, locale: string = "ja") {
  const firstContent = mat.content?.[0] ?? "hiragana";
  const bg = mat.bg ?? bgMap[firstContent] ?? "linear-gradient(135deg,#e8efff,#d0dcff)";
  const char = mat.char ?? charMap[firstContent] ?? "✦";
  const charColor = mat.charColor ?? charColorMap[firstContent] ?? "#4a72c4";

  let tag = mat.tag ?? "無料";
  let tagBg = mat.tagBg ?? "#d6f5e5";
  let tagColor = mat.tagColor ?? "#2a6a44";

  if (!mat.tag) {
    if (mat.isPickup) {
      tag = "PICK"; tagBg = "#ecdeff"; tagColor = "#7040b0";
    } else if (mat.isNew) {
      tag = "NEW"; tagBg = "#ffd9ee"; tagColor = "#a03070";
    } else if (mat.requiredPlan === "free" || mat.requiredPlan === "無料") {
      tag = locale === "ja" ? "無料" : "Free"; tagBg = "#d6f5e5"; tagColor = "#2a6a44";
    } else if (mat.requiredPlan === "light" || mat.requiredPlan === "ライト") {
      tag = locale === "ja" ? "ライト" : "Light"; tagBg = "#fff8e0"; tagColor = "#a07800";
    } else if (mat.requiredPlan === "standard" || mat.requiredPlan === "スタンダード") {
      tag = locale === "ja" ? "スタンダード" : "Standard"; tagBg = "#e8efff"; tagColor = "#3a5a9a";
    } else if (mat.requiredPlan === "premium" || mat.requiredPlan === "プレミアム") {
      tag = locale === "ja" ? "プレミアム" : "Premium"; tagBg = "#fce4f8"; tagColor = "#8a2090";
    }
  }

  return { bg, char, charColor, tag, tagBg, tagColor };
}
type MaterialForTag = {
  requiredPlan?: string;
  isPickup?: boolean;
  isNew?: boolean;
};

export function getTag(mat: MaterialForTag) {
  if (mat.isPickup) return { tag: "PICK", tagBg: "#ecdeff", tagColor: "#7040b0" };
  if (mat.isNew) return { tag: "NEW", tagBg: "#ffd9ee", tagColor: "#a03070" };
  if (mat.requiredPlan === "free" || mat.requiredPlan === "無料") return { tag: "無料", tagBg: "#d6f5e5", tagColor: "#2a6a44" };
  if (mat.requiredPlan === "light" || mat.requiredPlan === "ライト") return { tag: "ライト", tagBg: "#fff8e0", tagColor: "#a07800" };
  if (mat.requiredPlan === "standard" || mat.requiredPlan === "スタンダード") return { tag: "スタンダード", tagBg: "#e8efff", tagColor: "#3a5a9a" };
  if (mat.requiredPlan === "premium" || mat.requiredPlan === "プレミアム") return { tag: "プレミアム", tagBg: "#fce4f8", tagColor: "#8a2090" };
  return { tag: "無料", tagBg: "#d6f5e5", tagColor: "#2a6a44" };
}