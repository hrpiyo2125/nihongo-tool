import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プラン・料金 | にほんごツール',
  description: 'にほんごツールの料金プランページです。無料プラン・ライトプラン（月額500円）・スタンダードプラン（月額980円）・プレミアムプラン（月額1,480円）の4種類をご用意しています。いつでもプランの変更・解約が可能です。海外の日本語教師・保護者の方に最適な教材プラットフォームです。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
