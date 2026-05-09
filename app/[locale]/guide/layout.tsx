import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site.config'

export const metadata: Metadata = {
  title: pageTitle('授業づくりガイド'),
  description: 'toolioの教材を使った授業づくりのヒントや、目的別の教材活用方法を紹介します。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
