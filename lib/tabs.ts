// ===== 多言語ラベル =====
export const contentTabLabels: Record<string, Record<string, string>> = {
  ja: { all: "すべて", hiragana: "ひらがな", katakana: "カタカナ", kanji: "漢字", joshi: "助詞", kaiwa: "場面会話", season: "季節・行事", food: "食べ物", animal: "動物", body: "体・健康", color: "色・形", number: "数・算数", adjective: "形容詞", verb: "動詞", conjunction: "接続詞", grammar: "文法", familiar: "身近なもの", kotoba: "ことば", vegefruit: "やさい・くだもの", myself: "自分のこと" },
  en: { all: "All", hiragana: "Hiragana", katakana: "Katakana", kanji: "Kanji", joshi: "Particles", kaiwa: "Conversations", season: "Seasons & Events", food: "Food", animal: "Animals", body: "Body & Health", color: "Colors & Shapes", number: "Numbers", adjective: "Adjectives", verb: "Verbs", conjunction: "Conjunctions", grammar: "Grammar", familiar: "Familiar Things", kotoba: "Words", vegefruit: "Vegetables & Fruits", myself: "About Myself" },
};

export const methodTabLabels: Record<string, Record<string, string>> = {
  ja: { all: "すべて", drill: "ドリル", test: "テスト", card: "カード", nurie: "ぬりえ", roleplay: "ロールプレイ", bingo: "ビンゴ", interview: "インタビュー", presentation: "プレゼンテーション", sentence: "文づくり", essay: "作文", check: "チェック", sugoroku: "すごろく", poster: "ポスター" },
  en: { all: "All", drill: "Drill", test: "Test", card: "Cards", nurie: "Coloring", roleplay: "Role Play", bingo: "Bingo", interview: "Interview", presentation: "Presentation", sentence: "Sentence Making", essay: "Essay", check: "Check", sugoroku: "Sugoroku", poster: "Poster" },
};

// ===== コンテンツタブ定義 =====
export function getContentTabs(cl: Record<string, string>) {
  return [
    { id: "all",        label: cl.all,        char: "✦", color: "#e8efff", imageSrc: "/contents/14_all.png" },
    { id: "hiragana",   label: cl.hiragana,   char: "あ", color: "#e8efff", imageSrc: "/contents/12_hiragana.png" },
    { id: "katakana",   label: cl.katakana,   char: "ア", color: "#f0e8ff", imageSrc: "/contents/4_kanakana.png" },
    { id: "kanji",      label: cl.kanji,      char: "字", color: "#ffe8f4", imageSrc: "/contents/3_kanji.png" },
    { id: "joshi",      label: cl.joshi,      char: "は", color: "#fff0ec", imageSrc: "/contents/5_joshi.png" },
    { id: "kaiwa",      label: cl.kaiwa,      char: "話", color: "#f8e8ff", imageSrc: "/contents/8_kaiwa.png" },
    { id: "season",     label: cl.season,     char: "季", color: "#e8efff", imageSrc: "/contents/17_season.png" },
    { id: "food",       label: cl.food,       char: "🍎", color: "#fff0e8", imageSrc: "/contents/15_food.png" },
    { id: "animal",     label: cl.animal,     char: "🐾", color: "#e8f8ee", imageSrc: "/contents/1_animal.png" },
    { id: "body",       label: cl.body,       char: "💪", color: "#ffe8f4", imageSrc: "/contents/9_body.png" },
    { id: "color",      label: cl.color,      char: "🔵", color: "#f0e8ff", imageSrc: "/contents/18_color.png" },
    { id: "number",     label: cl.number,     char: "数", color: "#e8f8ff", imageSrc: "/contents/13_number.png" },
    { id: "adjective",  label: cl.adjective,  char: "い", color: "#fff8e0", imageSrc: "/contents/2_keiyoushi.png" },
    { id: "verb",       label: cl.verb,       char: "動", color: "#e8f8ee", imageSrc: "/contents/6_doushi.png" },
    { id: "conjunction",label: cl.conjunction,char: "接", color: "#f0e8ff", imageSrc: "/contents/10_setsuzokushi.png" },
    { id: "grammar",    label: cl.grammar,    char: "文", color: "#f0ffe8", imageSrc: "/contents/16_bunpo.png" },
    { id: "familiar",   label: cl.familiar,   char: "🏠", color: "#e8efff", imageSrc: "/contents/7_mijika.png" },
    { id: "kotoba",     label: cl.kotoba,     char: "語", color: "#fff0e8", imageSrc: "/contents/19_word.png" },
    { id: "vegefruit",  label: cl.vegefruit,  char: "🥦", color: "#e8f8ee", imageSrc: "/contents/11_yasai.png" },
    { id: "myself",     label: cl.myself,     char: "👤", color: "#e8efff", imageSrc: "/contents/myself.png" },
  ];
}

// ===== メソッドタブ定義 =====
export function getMethodTabs(ml: Record<string, string>) {
  return [
    { id: "all",      label: ml.all,      char: "✦", imageSrc: "/contents/14_all.png" },
    { id: "drill",    label: ml.drill,    char: "✏", imageSrc: "/method/10_drill.png" },
    { id: "test",     label: ml.test,     char: "✓", imageSrc: "/method/13_test.png" },
    { id: "card",     label: ml.card,     char: "🃏", imageSrc: "/method/9_card.png" },
    { id: "nurie",     label: ml.nurie,     char: "◎", imageSrc: "/method/2_nurie.png" },
    { id: "roleplay",  label: ml.roleplay,  char: "🎭", imageSrc: "/method/6_roleplay.png" },
    { id: "bingo",     label: ml.bingo,     char: "🎯", imageSrc: "/method/12_bingo.png" },
    { id: "interview",    label: ml.interview,    char: "🎤", imageSrc: "/method/4_interview.png" },
    { id: "presentation", label: ml.presentation, char: "📊", imageSrc: "/method/presentation.png" },
    { id: "sentence",  label: ml.sentence,  char: "文", imageSrc: "/method/5_sentense.png" },
    { id: "essay",     label: ml.essay,     char: "✍", imageSrc: "/method/1_sakubun.png" },
    { id: "check",     label: ml.check,     char: "✓", imageSrc: "/method/3_checklist.png" },
    { id: "sugoroku",  label: ml.sugoroku,  char: "🎲", imageSrc: "/method/7_sugoroku.png" },
    { id: "poster",    label: ml.poster,    char: "📄", imageSrc: "/method/8_poster.png" },
  ];
}

// 固定の日本語タブ（materials/[id]用）
export const contentTabsJa = getContentTabs(contentTabLabels.ja);
export const methodTabsJa = getMethodTabs(methodTabLabels.ja);