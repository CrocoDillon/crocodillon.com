import type { MetadataRoute } from 'next'
import { getPosts } from '@/lib/posts'
import { site } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: site.url },
    { url: `${site.url}/blog` },
    ...(await getPosts()).map(post => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
    })),
  ]
}
