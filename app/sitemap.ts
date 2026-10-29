import type { MetadataRoute } from 'next'
import { getPosts, getTags } from '@/lib/posts'
import { site } from '@/lib/site-server'
import { isArticlePreview } from '@/lib/publication'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isArticlePreview) return []
  const [posts, topics] = await Promise.all([getPosts(), getTags()])
  return [
    { url: site.url },
    { url: `${site.url}/blog` },
    ...topics.map(topic => ({ url: `${site.url}/blog/tags/${topic.slug}` })),
    ...posts.map(post => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
    })),
  ]
}
