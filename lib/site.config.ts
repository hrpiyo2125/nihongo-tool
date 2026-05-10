export const siteConfig = {
  name: "toolio",
  tagline: "子どもににほんごを教えるすべての人のための教材プラットホーム",
  description: "子どもににほんごを教えるすべての人のための教材プラットホーム。ひらがな・カタカナ・漢字・語彙など、授業やご家庭でそのまま使えるワークシートをダウンロードできます。",
  url: "https://nihongo-tool.com",
  supportEmail: "support@nihongo-tool.com",
} as const;

export const pageTitle = (page: string) => `${page} | ${siteConfig.name}`;
