import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowIcon } from '@/components/icons'
import { PostList } from '@/components/post-list'
import { getPosts } from '@/lib/posts'
import { formatDate } from '@/lib/site'
import { PublicationStatusLabel } from '@/components/publication-status'

export const metadata: Metadata = { alternates: { canonical: '/' } }

export default async function Home() {
  const [latest, ...posts] = await getPosts()
  return (
    <>
      <section className="grid gap-8 pt-16 pb-16 sm:pt-24 sm:pb-20 md:grid-cols-[1.6fr_1fr] md:items-end md:gap-16">
        <div>
          <p className="eyebrow mb-6 flex items-center gap-2.5">
            <span className="size-1.5 rounded-full bg-moss" />A developer’s
            field notes
          </p>
          <h1 className="font-display text-6xl leading-[1.02] tracking-[-0.045em] sm:text-8xl">
            Notes from
            <br />
            the <em className="font-normal text-moss">web.</em>
          </h1>
        </div>
        <div className="pb-1">
          <p className="max-w-sm text-lg leading-relaxed text-muted">
            Little discoveries. Useful rabbit holes.
            <br className="hidden lg:block" /> Things learned by building.
          </p>
          <p className="mt-5 font-mono text-xs text-muted">
            By Dillon de Voor · The Netherlands
          </p>
        </div>
      </section>
      <section
        aria-labelledby="featured-heading"
        className="relative overflow-hidden rounded-sm bg-leaf p-7 sm:p-10 md:p-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-24 size-80 rounded-full border border-moss/10 after:absolute after:inset-8 after:rounded-full after:border after:border-moss/10"
        />
        <div className="relative max-w-3xl">
          <p id="featured-heading" className="eyebrow mb-7 text-moss">
            The latest from the archive
          </p>
          <Link href={`/blog/${latest.slug}`} className="group">
            <h2 className="max-w-2xl font-display text-3xl leading-tight tracking-tight group-hover:text-moss sm:text-4xl md:text-5xl">
              {latest.title}
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">
              {latest.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="inline-flex items-center gap-3 text-sm font-medium">
                Read the article{' '}
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="font-mono text-[11px] text-muted">
                <time dateTime={latest.publishedAt}>
                  {formatDate(latest.publishedAt)}
                </time>{' '}
                · {latest.readingMinutes} min read
              </span>
              <PublicationStatusLabel status={latest.status} />
            </div>
          </Link>
        </div>
      </section>
      <section aria-labelledby="writing-heading" className="mt-16 sm:mt-20">
        <div className="flex items-center justify-between gap-4 border-b border-ink pb-5">
          <h2
            id="writing-heading"
            className="text-xl font-medium tracking-tight"
          >
            More field notes
          </h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-moss"
          >
            All writing <ArrowIcon className="size-4" />
          </Link>
        </div>
        <PostList posts={posts} />
      </section>
    </>
  )
}
