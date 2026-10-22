import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Disqus } from '@/components/disqus'
import { getPost, getPosts } from '@/lib/posts'
import { formatDate, site } from '@/lib/site'

export const dynamicParams = false

export async function generateStaticParams() {
  return (await getPosts()).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `/blog/${slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [site.author],
      images: [{ url: post.image, width: 2400, height: 1260, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [{ url: post.image, alt: post.title }],
    },
  }
}

export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const { default: Content } = await import(
    `../../../content/articles/${slug}/index.mdx`
  )
  const posts = await getPosts()
  const next =
    posts[(posts.findIndex(item => item.slug === slug) + 1) % posts.length]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Person', name: site.author, url: site.github },
    mainEntityOfPage: `${site.url}/blog/${slug}`,
    ...(post.image ? { image: site.url + post.image } : {}),
  }
  return (
    <div className="mx-auto max-w-3xl pt-10 sm:pt-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-moss"
      >
        ← All writing
      </Link>
      <article className="mt-10 sm:mt-14">
        <header>
          <p className="eyebrow mb-5">From the field notes</p>
          <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl md:text-6xl">
            {post.title}
          </h1>
          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-muted">
            <span>Dillon de Voor</span>
            <span aria-hidden="true">/</span>
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            <span aria-hidden="true">/</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          {/* The legacy archive contains articles from 2013–2016. */}
          {post.publishedAt < '2017-01-01T00:00:00Z' ? (
            <p className="mt-8 border-y border-line py-4 text-xs leading-relaxed text-muted">
              A note from the archive. Written in {post.publishedAt.slice(0, 4)}
              ; tools and APIs may have changed since publication.
            </p>
          ) : null}
        </header>
        <div className="prose mt-10 max-w-none article-prose prose-neutral sm:mt-12">
          <Content />
        </div>
        {post.updatedAt ? (
          <p className="mt-10 font-mono text-xs text-muted">
            Last updated{' '}
            <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
          </p>
        ) : null}
      </article>
      <Disqus key={slug} slug={slug} title={post.title} />
      <aside className="mt-14 border-t border-line pt-8">
        <p className="eyebrow mb-3">Another rabbit hole</p>
        <Link
          href={`/blog/${next.slug}`}
          className="font-display text-2xl hover:text-moss"
        >
          {next.title} →
        </Link>
      </aside>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replaceAll('<', '\\u003c'),
        }}
      />
    </div>
  )
}
