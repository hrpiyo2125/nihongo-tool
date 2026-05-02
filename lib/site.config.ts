export const siteConfig = {
  name: "toolio",
  tagline: "こどもに日本語を教える人のための教材・ツールダウンロードサイト",
  description: "こどもに日本語を教える人のための教材・ツールダウンロードサイト。授業やレッスンで使えるワークシートや教材をすぐにダウンロードして活用できます。",
  url: "https://nihongo-tool.com",
  supportEmail: "support@nihongo-tool.com",
} as const;

export const pageTitle = (page: string) => `${page} | ${siteConfig.name}`;
