import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | にほんごツール',
  description: 'にほんごツールのプライバシーポリシーです。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
