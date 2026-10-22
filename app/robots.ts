import type { MetadataRoute } from 'next'
import { site } from '@/lib/site-server'
import { isArticlePreview } from '@/lib/publication'

export default function robots(): MetadataRoute.Robots {
  if (isArticlePreview) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/demo/' },
    sitemap: `${site.url}/sitemap.xml`,
  }
}
