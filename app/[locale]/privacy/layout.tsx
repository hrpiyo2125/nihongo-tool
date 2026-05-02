import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site.config'

export const metadata: Metadata = {
  title: pageTitle('プライバシーポリシー'),
  description: 'toolioのプライバシーポリシーです。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
