import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site.config'

export const metadata: Metadata = {
  title: pageTitle('使い方ガイド'),
  description: 'toolioの使い方・操作方法をわかりやすく解説します。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
