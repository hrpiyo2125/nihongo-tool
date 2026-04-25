import { MetadataRoute } from 'next'
import { getMaterials } from '@/lib/notion'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nihongo-tool.com'

// localePrefix: 'as-needed' なので ja はプレフィックスなし、en は /en プレフィックスあり
const locales = ['', '/en']

const staticPaths = [
  '',
  '/guide',
  '/faq',
  '/plan',
  '/privacy',
  '/terms',
  '/tokushoho',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}${locale}${path}`,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1.0 : 0.8,
    }))
  )

  let materialEntries: MetadataRoute.Sitemap = []
  try {
    const materials = await getMaterials()
    materialEntries = materials.flatMap((material: { id: string }) =>
      locales.map((locale) => ({
        url: `${BASE_URL}${locale}/materials/${material.id}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    )
  } catch {
    // Notion APIが失敗してもサイトマップ全体は返す
  }

  return [...staticEntries, ...materialEntries]
}
