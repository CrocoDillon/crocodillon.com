import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostList } from '@/components/post-list'
import { TopicNav } from '@/components/topic-nav'
import { getPosts, getTags } from '@/lib/posts'

export const dynamicParams = false

export async function generateStaticParams() {
  return (await getTags()).map(({ slug }) => ({ tag: slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const topic = (await getTags()).find(topic => topic.slug === tag)
  if (!topic) notFound()

  return {
    title: `${topic.name} articles`,
    description: topic.description,
    alternates: { canonical: `/blog/tags/${topic.slug}` },
    openGraph: {
      title: `${topic.name} articles`,
      description: topic.description,
      url: `/blog/tags/${topic.slug}`,
    },
    twitter: {
      title: `${topic.name} articles`,
      description: topic.description,
    },
  }
}

export default async function Topic({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const [topics, allPosts] = await Promise.all([getTags(), getPosts()])
  const topic = topics.find(topic => topic.slug === tag)
  if (!topic) notFound()
  const posts = allPosts.filter(post => post.tags.includes(topic.slug))

  return (
    <>
      <header className="pt-16 pb-14 sm:pt-24">
        <p className="eyebrow mb-5">From the field notes</p>
        <h1 className="font-display text-5xl tracking-tight wrap-anywhere sm:text-7xl">
          {topic.name}
          <span className="text-moss">.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {topic.description}
        </p>
        <p className="mt-5 font-mono text-xs text-muted">
          {posts.length} {posts.length === 1 ? 'article' : 'articles'}
        </p>
      </header>
      <TopicNav topics={topics} current={topic.slug} />
      <section aria-labelledby="topic-articles-heading" className="mb-12">
        <h2 id="topic-articles-heading" className="sr-only">
          {topic.name} articles
        </h2>
        <PostList posts={posts} />
      </section>
    </>
  )
}
