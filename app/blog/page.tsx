import type { Metadata } from 'next'
import { PostList } from '@/components/post-list'
import { getPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'The complete archive: JavaScript, browser behavior, MongoDB, and lessons from building for the web.',
  alternates: { canonical: '/blog' },
}

export default async function Blog() {
  const posts = await getPosts()
  const years = [...new Set(posts.map(post => post.publishedAt.slice(0, 4)))]
  const yearRange = years.length > 1 ? `${years.at(-1)}–${years[0]}` : years[0]
  return (
    <>
      <header className="pt-16 pb-14 sm:pt-24">
        <p className="eyebrow mb-5">The complete collection</p>
        <h1 className="font-display text-6xl tracking-tight sm:text-7xl">
          Writing<span className="text-moss">.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          An archive of experiments, explanations, and things that took a little
          figuring out.
        </p>
        <p className="mt-5 font-mono text-xs text-muted">
          {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          {yearRange ? ` · ${yearRange}` : ''}
        </p>
      </header>
      {years.map(year => (
        <section key={year} aria-labelledby={`year-${year}`} className="mb-12">
          <h2
            id={`year-${year}`}
            className="border-b border-ink pb-4 font-mono text-sm text-moss"
          >
            {year}
          </h2>
          <PostList
            posts={posts.filter(post => post.publishedAt.startsWith(year))}
          />
        </section>
      ))}
    </>
  )
}
