import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'よくある質問 | にほんごツール',
  description: 'にほんごツールのよくある質問ページです。サービス内容・アカウント登録・教材の使い方・料金プランの違い・動作環境など、利用者からよくいただく質問と回答をカテゴリ別にまとめています。海外在住の日本語教師・保護者の方からのご質問にも幅広くお答えしています。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
