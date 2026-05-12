import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site.config'

export const metadata: Metadata = {
  title: pageTitle('toolioとは'),
  description: 'toolioは、国内外でにほんごを学ぶこどもたちのための教材プラットフォームです。日本語教室・補習校の先生、海外在住の継承語家庭の保護者の方に向けて、ひらがな・カタカナ・漢字・語彙などの教材をPDFで無料ダウンロードできます。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
