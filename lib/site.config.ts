export const siteConfig = {
  name: "toolio",
  tagline: "「こんな授業やりたい」がすぐに見つかる日本語教材プラットフォーム",
  description: "ご家庭でも・学校でも。すぐに使えて、たのしい日本語教材がそろっています。ひらがな・カタカナ・漢字・語彙など、授業やご家庭でそのまま使えるワークシートをダウンロードできます。",
  url: "https://nihongo-tool.com",
  supportEmail: "support@nihongo-tool.com",
} as const;

export const pageTitle = (page: string) => `${page} | ${siteConfig.name}`;
