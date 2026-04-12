// ===== 多言語ラベル =====
export const contentTabLabels: Record<string, Record<string, string>> = {
  ja: { all: "すべて", hiragana: "ひらがな", katakana: "カタカナ", kanji: "漢字", vocab: "語彙", joshi: "助詞", bunkei: "文型", aisatsu: "あいさつ", kaiwa: "場面会話", season: "季節・行事", food: "食べ物", animal: "動物", body: "体・健康", color: "色・形", number: "数・算数" },
  en: { all: "All", hiragana: "Hiragana", katakana: "Katakana", kanji: "Kanji", vocab: "Vocabulary", joshi: "Particles", bunkei: "Sentence Patterns", aisatsu: "Greetings", kaiwa: "Conversations", season: "Seasons & Events", food: "Food", animal: "Animals", body: "Body & Health", color: "Colors & Shapes", number: "Numbers" },
};

export const methodTabLabels: Record<string, Record<string, string>> = {
  ja: { all: "すべて", drill: "ドリル", test: "テスト", card: "カード", karuta: "かるた", game: "ゲーム", nurie: "ぬりえ", reading: "読み物", music: "うた", roleplay: "ロールプレイ" },
  en: { all: "All", drill: "Drill", test: "Test", card: "Cards", karuta: "Karuta", game: "Game", nurie: "Coloring", reading: "Reading", music: "Song", roleplay: "Role Play" },
};

// ===== コンテンツタブ定義 =====
export function getContentTabs(cl: Record<string, string>) {
  return [
    { id: "all",      label: cl.all,      char: "✦", color: "#e8efff", imageSrc: "/all.png" },
    { id: "hiragana", label: cl.hiragana, char: "あ", color: "#e8efff", imageSrc: "/hiragana.png" },
    { id: "katakana", label: cl.katakana, char: "ア", color: "#f0e8ff", imageSrc: "/katakana.png" },
    { id: "kanji",    label: cl.kanji,    char: "字", color: "#ffe8f4", imageSrc: "/kanji.png" },
    { id: "vocab",    label: cl.vocab,    char: "語", color: "#fff8e0", imageSrc: "/vocab.png" },
    { id: "joshi",    label: cl.joshi,    char: "は", color: "#fff0ec", imageSrc: "/joshi.png" },
    { id: "bunkei",   label: cl.bunkei,   char: "文", color: "#f0ffe8", imageSrc: "/bunkei.png" },
    { id: "aisatsu",  label: cl.aisatsu,  char: "👋", color: "#e8f8ff", imageSrc: "/aisatsu.png" },
    { id: "kaiwa",    label: cl.kaiwa,    char: "話", color: "#f8e8ff", imageSrc: "/kaiwa.png" },
    { id: "season",   label: cl.season,   char: "季", color: "#e8efff", imageSrc: "/season.png" },
    { id: "food",     label: cl.food,     char: "🍎", color: "#fff0e8", imageSrc: "/food.png" },
    { id: "animal",   label: cl.animal,   char: "🐾", color: "#e8f8ee", imageSrc: "/animal.png" },
    { id: "body",     label: cl.body,     char: "💪", color: "#ffe8f4", imageSrc: "/body.png" },
    { id: "color",    label: cl.color,    char: "🔵", color: "#f0e8ff", imageSrc: "/color.png" },
    { id: "number",   label: cl.number,   char: "数", color: "#e8f8ff", imageSrc: "/number.png" },
  ];
}

// ===== メソッドタブ定義 =====
export function getMethodTabs(ml: Record<string, string>) {
  return [
    { id: "all",      label: ml.all,      char: "✦", imageSrc: "/all.png" },
    { id: "drill",    label: ml.drill,    char: "✏", imageSrc: "/method_drill.png" },
    { id: "test",     label: ml.test,     char: "✓", imageSrc: "/method_test.png" },
    { id: "card",     label: ml.card,     char: "🃏", imageSrc: "/method_card.png" },
    { id: "karuta",   label: ml.karuta,   char: "札", imageSrc: null },
    { id: "game",     label: ml.game,     char: "▶", imageSrc: null },
    { id: "nurie",    label: ml.nurie,    char: "◎", imageSrc: null },
    { id: "reading",  label: ml.reading,  char: "本", imageSrc: "/method_reading.png" },
    { id: "music",    label: ml.music,    char: "♪", imageSrc: null },
    { id: "roleplay", label: ml.roleplay, char: "🎭", imageSrc: "/method_roleplay.png" },
  ];
}

// 固定の日本語タブ（materials/[id]用）
export const contentTabsJa = getContentTabs(contentTabLabels.ja);
export const methodTabsJa = getMethodTabs(methodTabLabels.ja);