import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '使い方ガイド | にほんごツール',
  description: 'にほんごツールの使い方・操作方法をわかりやすく解説します。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
