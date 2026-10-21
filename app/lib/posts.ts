import 'server-only'
import fs from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import matter from 'gray-matter'

export interface Post {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  excerpt: string
  image?: string
  readingMinutes: number
}

const directory = path.join(process.cwd(), 'content/articles')

export const getPosts = cache(async (): Promise<Post[]> => {
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
        if (data.draft === true) return null
        return {
          slug: data.slug,
          title: data.title,
          description: data.description,
          publishedAt: data.publishedAt,
          updatedAt: data.updatedAt,
          excerpt: data.excerpt,
          image: data.image,
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
