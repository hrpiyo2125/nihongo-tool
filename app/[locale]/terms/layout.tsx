import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site.config'

export const metadata: Metadata = {
  title: pageTitle('利用規約'),
  description: 'toolioの利用規約です。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
