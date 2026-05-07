import { MetadataRoute } from 'next'
import { getMaterials } from '@/lib/notion'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nihongo-tool.com'

// localePrefix: 'as-needed' なので ja はプレフィックスなし、en は /en プレフィックスあり
const locales = ['', '/en']

const staticPaths = [
  '',
  '/about',
  '/guide',
  '/faq',
  '/plan',
  '/privacy',
  '/terms',
  '/tokushoho',
]

const categoryPaths = [
  'hiragana','katakana','kanji','joshi','kaiwa','season','food','animal','body','color','number','adjective','verb','conjunction','grammar','familiar','kotoba','vegefruit','myself',
  'drill','test','card','nurie','roleplay','bingo','interview','presentation','sentence','essay','check','sugoroku','poster',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}${locale}${path}`,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1.0 : 0.8,
    }))
  )

  const categoryEntries: MetadataRoute.Sitemap = categoryPaths.flatMap((cat) =>
    locales.map((locale) => ({
      url: `${BASE_URL}${locale}/${cat}`,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  )

  return [...staticEntries, ...categoryEntries]
}
