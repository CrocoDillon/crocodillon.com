import 'server-only'
import { Feed } from 'feed'
import { getPosts } from '@/lib/posts'
import { site } from '@/lib/site-server'

export async function getFeed() {
  const posts = (await getPosts()).filter(post => post.status === 'published')
  const feed = new Feed({
    id: site.url,
    title: `${site.name}’s Blog`,
    description: site.description,
    link: site.url,
    language: 'en',
    copyright: `© ${site.author}`,
    updated: new Date(
      Math.max(
        ...posts.map(post => Date.parse(post.updatedAt ?? post.publishedAt))
      )
    ),
    feedLinks: { rss2: `${site.url}/blog/rss`, atom: `${site.url}/blog/atom` },
    author: { name: site.author, link: site.url },
  })
  for (const post of posts) {
    feed.addItem({
      id: `http://crocodillon.com/blog/${post.slug}`,
      link: `${site.url}/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      published: new Date(post.publishedAt),
      date: new Date(post.updatedAt ?? post.publishedAt),
      ...(post.image ? { image: site.url + post.image } : {}),
    })
  }
  return feed
}
