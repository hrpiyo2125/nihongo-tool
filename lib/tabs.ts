// ===== 多言語ラベル =====
export const contentTabLabels: Record<string, Record<string, string>> = {
  ja: { all: "すべて", hiragana: "ひらがな", katakana: "カタカナ", kanji: "漢字", joshi: "助詞", kaiwa: "場面会話", season: "季節・行事", food: "食べ物", animal: "動物", body: "体・健康", color: "色・形", number: "数・算数", adjective: "形容詞", verb: "動詞", conjunction: "接続詞", grammar: "文法", familiar: "身近なもの", kotoba: "ことば", vegefruit: "やさい・くだもの" },
  en: { all: "All", hiragana: "Hiragana", katakana: "Katakana", kanji: "Kanji", joshi: "Particles", kaiwa: "Conversations", season: "Seasons & Events", food: "Food", animal: "Animals", body: "Body & Health", color: "Colors & Shapes", number: "Numbers", adjective: "Adjectives", verb: "Verbs", conjunction: "Conjunctions", grammar: "Grammar", familiar: "Familiar Things", kotoba: "Words", vegefruit: "Vegetables & Fruits" },
};

export const methodTabLabels: Record<string, Record<string, string>> = {
  ja: { all: "すべて", drill: "ドリル", test: "テスト", card: "カード", nurie: "ぬりえ", roleplay: "ロールプレイ", bingo: "ビンゴ", interview: "インタビュー", sentence: "文づくり", essay: "作文", check: "チェック", sugoroku: "すごろく", poster: "ポスター" },
  en: { all: "All", drill: "Drill", test: "Test", card: "Cards", nurie: "Coloring", roleplay: "Role Play", bingo: "Bingo", interview: "Interview", sentence: "Sentence Making", essay: "Essay", check: "Check", sugoroku: "Sugoroku", poster: "Poster" },
};

// ===== コンテンツタブ定義 =====
export function getContentTabs(cl: Record<string, string>) {
  return [
    { id: "all",      label: cl.all,      char: "✦", color: "#e8efff", imageSrc: "/all.png" },
    { id: "hiragana", label: cl.hiragana, char: "あ", color: "#e8efff", imageSrc: "/hiragana.png" },
    { id: "katakana", label: cl.katakana, char: "ア", color: "#f0e8ff", imageSrc: "/katakana.png" },
    { id: "kanji",    label: cl.kanji,    char: "字", color: "#ffe8f4", imageSrc: "/kanji.png" },
    { id: "joshi",      label: cl.joshi,      char: "は", color: "#fff0ec", imageSrc: "/joshi.png" },
    { id: "kaiwa",      label: cl.kaiwa,      char: "話", color: "#f8e8ff", imageSrc: "/kaiwa.png" },
    { id: "season",     label: cl.season,     char: "季", color: "#e8efff", imageSrc: "/season.png" },
    { id: "food",       label: cl.food,       char: "🍎", color: "#fff0e8", imageSrc: "/food.png" },
    { id: "animal",     label: cl.animal,     char: "🐾", color: "#e8f8ee", imageSrc: "/animal.png" },
    { id: "body",       label: cl.body,       char: "💪", color: "#ffe8f4", imageSrc: "/body.png" },
    { id: "color",      label: cl.color,      char: "🔵", color: "#f0e8ff", imageSrc: "/color.png" },
    { id: "number",     label: cl.number,     char: "数", color: "#e8f8ff", imageSrc: "/number.png" },
    { id: "adjective",  label: cl.adjective,  char: "い", color: "#fff8e0", imageSrc: null },
    { id: "verb",       label: cl.verb,       char: "動", color: "#e8f8ee", imageSrc: null },
    { id: "conjunction",label: cl.conjunction,char: "接", color: "#f0e8ff", imageSrc: null },
    { id: "grammar",    label: cl.grammar,    char: "文", color: "#f0ffe8", imageSrc: null },
    { id: "familiar",   label: cl.familiar,   char: "🏠", color: "#e8efff", imageSrc: null },
    { id: "kotoba",     label: cl.kotoba,     char: "語", color: "#fff0e8", imageSrc: null },
    { id: "vegefruit",  label: cl.vegefruit,  char: "🥦", color: "#e8f8ee", imageSrc: null },
  ];
}

// ===== メソッドタブ定義 =====
export function getMethodTabs(ml: Record<string, string>) {
  return [
    { id: "all",      label: ml.all,      char: "✦", imageSrc: "/all.png" },
    { id: "drill",    label: ml.drill,    char: "✏", imageSrc: "/method_drill.png" },
    { id: "test",     label: ml.test,     char: "✓", imageSrc: "/method_test.png" },
    { id: "card",     label: ml.card,     char: "🃏", imageSrc: "/method_card.png" },
    { id: "nurie",     label: ml.nurie,     char: "◎", imageSrc: null },
    { id: "roleplay",  label: ml.roleplay,  char: "🎭", imageSrc: "/method_roleplay.png" },
    { id: "bingo",     label: ml.bingo,     char: "🎯", imageSrc: null },
    { id: "interview", label: ml.interview, char: "🎤", imageSrc: null },
    { id: "sentence",  label: ml.sentence,  char: "文", imageSrc: null },
    { id: "essay",     label: ml.essay,     char: "✍", imageSrc: null },
    { id: "check",     label: ml.check,     char: "✓", imageSrc: null },
    { id: "sugoroku",  label: ml.sugoroku,  char: "🎲", imageSrc: null },
    { id: "poster",    label: ml.poster,    char: "📄", imageSrc: null },
  ];
}

// 固定の日本語タブ（materials/[id]用）
export const contentTabsJa = getContentTabs(contentTabLabels.ja);
export const methodTabsJa = getMethodTabs(methodTabLabels.ja);