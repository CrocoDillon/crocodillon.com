import 'server-only'
import fs from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import matter from 'gray-matter'
import { isArticlePreview, type PublicationStatus } from '@/lib/publication'
import { isTagSlug, tags, type TagSlug } from '@/lib/tags'

export interface Post {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  excerpt: string
  image: string
  readingMinutes: number
  status: PublicationStatus
  tags: TagSlug[]
}

const directory = path.join(process.cwd(), 'content/articles')

export const getPosts = cache(async (): Promise<Post[]> => {
  const now = Date.now()
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const posts = await Promise.all(
    entries
      .filter(entry => entry.isDirectory())
      .map(async entry => {
        const source = await fs.readFile(
          path.join(directory, entry.name, 'index.mdx'),
          'utf8'
        )
        const { data, content } = matter(source)
        for (const key of [
          'slug',
          'title',
          'description',
          'publishedAt',
          'excerpt',
        ]) {
          if (typeof data[key] !== 'string' || !data[key].trim())
            throw new Error(`${entry.name}: missing ${key}`)
        }
        if (
          data.slug !== entry.name ||
          !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)
        )
          throw new Error(`Invalid slug: ${entry.name}`)
        for (const value of [data.publishedAt, data.updatedAt].filter(
          Boolean
        )) {
          if (
            typeof value !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(value) ||
            Number.isNaN(Date.parse(value))
          )
            throw new Error(`Invalid date: ${entry.name}`)
        }
        if (data.image) {
          if (
            typeof data.image !== 'string' ||
            !data.image.startsWith('/images/')
          )
            throw new Error(`Invalid image: ${entry.name}`)
          await fs.access(path.join(process.cwd(), 'public', data.image))
        }
        if (data.draft !== undefined && typeof data.draft !== 'boolean')
          throw new Error(`${entry.name}: draft must be a boolean`)
        const postTags: unknown = data.tags === undefined ? [] : data.tags
        if (!Array.isArray(postTags) || !postTags.every(isTagSlug))
          throw new Error(
            `${entry.name}: tags must be an array of known tag slugs`
          )
        if (new Set(postTags).size !== postTags.length)
          throw new Error(`${entry.name}: duplicate tags`)
        const status: PublicationStatus =
          data.draft === true
            ? 'draft'
            : Date.parse(data.publishedAt) > now
              ? 'scheduled'
              : 'published'
        if (!isArticlePreview && status !== 'published') return null
        return {
          slug: data.slug,
          title: data.title,
          description: data.description,
          publishedAt: data.publishedAt,
          updatedAt: data.updatedAt,
          excerpt: data.excerpt,
          image: data.image ?? `/blog/${data.slug}/share.png`,
          status,
          tags: postTags,
          readingMinutes: Math.max(
            1,
            Math.ceil(content.split(/\s+/).length / 220)
          ),
        } satisfies Post
      })
  )
  return posts
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
})

export async function getPost(slug: string) {
  return (await getPosts()).find(post => post.slug === slug)
}

export const getTags = cache(async () => {
  const posts = await getPosts()
  return (Object.keys(tags) as TagSlug[])
    .map(slug => ({
      slug,
      ...tags[slug],
      count: posts.filter(post => post.tags.includes(slug)).length,
    }))
    .filter(tag => tag.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
})
