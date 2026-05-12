import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nihongo-tool.com'

const locales = ['', '/en']

const staticPaths = [
  '',
  '/about',
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
      priority: path === '' ? 1.0 : path === '/plan' ? 0.9 : 0.8,
    }))
  )

  return staticEntries
}
