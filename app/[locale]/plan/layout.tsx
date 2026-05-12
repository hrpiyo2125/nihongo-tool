import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site.config'

export const metadata: Metadata = {
  title: pageTitle('料金プラン'),
  description: 'toolioの料金プランページです。無料プランと有料プランの違いや、ダウンロード制限、サポート内容などをご確認いただけます。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
