import { getTextContents } from '@/lib/notion'
import { AboutContent } from '../LegalPagesContent'

export default async function AboutPage() {
  let notionBody: string | undefined
  try {
    const texts = await getTextContents()
    notionBody = texts['toolioとは']
  } catch {
    // fallback to static content
  }

  return <AboutContent onBack={() => {}} notionBody={notionBody} />
}
