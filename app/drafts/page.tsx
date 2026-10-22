import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostList } from '@/components/post-list'
import { getPosts } from '@/lib/posts'
import { isArticlePreview } from '@/lib/publication'

export const metadata: Metadata = {
  title: 'Publication queue',
  robots: { index: false, follow: false },
}

export default async function Drafts() {
  if (!isArticlePreview) notFound()

  const posts = await getPosts()
  const drafts = posts.filter(post => post.status === 'draft')
  const scheduled = posts
    .filter(post => post.status === 'scheduled')
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))

  return (
    <>
      <header className="pt-16 pb-12 sm:pt-24">
        <p className="eyebrow mb-5">Before it goes live</p>
        <h1 className="font-display text-4xl tracking-tight sm:text-6xl">
          Publication queue<span className="text-moss">.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Read drafts in their final layout and check the order of upcoming
          articles. Dates and statuses reflect the latest preview build.
        </p>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          Publishing is controlled through frontmatter. For the daily rebuild at
          07:00 UTC, use a publication time of 04:00 UTC on the intended day.
        </p>
      </header>
      <section aria-labelledby="scheduled-heading" className="mb-12">
        <h2
          id="scheduled-heading"
          className="border-b border-ink pb-4 text-xl font-medium"
        >
          Scheduled · {scheduled.length}
        </h2>
        {scheduled.length ? (
          <PostList posts={scheduled} />
        ) : (
          <p className="py-7 text-muted">No articles scheduled yet.</p>
        )}
      </section>
      <section aria-labelledby="drafts-heading" className="mb-12">
        <h2
          id="drafts-heading"
          className="border-b border-ink pb-4 text-xl font-medium"
        >
          Drafts · {drafts.length}
        </h2>
        {drafts.length ? (
          <PostList posts={drafts} />
        ) : (
          <p className="py-7 text-muted">No drafts waiting for review.</p>
        )}
      </section>
    </>
  )
}
