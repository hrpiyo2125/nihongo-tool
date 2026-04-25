import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プラン・料金 | にほんごツール',
  description: 'にほんごツールの料金プランをご確認ください。無料プランからプレミアムプランまで用途に合わせてお選びいただけます。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
