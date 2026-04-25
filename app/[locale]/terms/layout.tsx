import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 | にほんごツール',
  description: 'にほんごツールの利用規約です。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
