import type { Metadata } from 'next'
import { pageTitle } from '@/lib/site.config'

export const metadata: Metadata = {
  title: pageTitle('よくある質問'),
  description: 'toolioのよくある質問ページです。サービス内容・アカウント登録・教材の使い方・料金プランの違い・動作環境など、利用者からよくいただく質問と回答をカテゴリ別にまとめています。海外在住でこどもに日本語を教えている方からのご質問にも幅広くお答えしています。',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
