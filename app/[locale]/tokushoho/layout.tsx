import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site.config'

export const metadata: Metadata = {
  title: pageTitle('特定商取引法に基づく表記'),
  description: 'toolioの特定商取引法に基づく表記です。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
