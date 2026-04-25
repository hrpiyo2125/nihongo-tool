import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'よくある質問 | にほんごツール',
  description: 'にほんごツールに関するよくある質問と回答をまとめています。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
