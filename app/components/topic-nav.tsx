import Link from 'next/link'
import type { getTags } from '@/lib/posts'
import type { TagSlug } from '@/lib/tags'

export function TopicNav({
  topics,
  current,
}: {
  topics: Awaited<ReturnType<typeof getTags>>
  current?: TagSlug
}) {
  return (
    <nav
      aria-label="Browse by topic"
      className="mb-12 border-y border-line py-6"
    >
      <p className="eyebrow mb-4">Browse by topic</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-3 font-mono text-xs">
        <li>
          <Link
            href="/blog"
            aria-current={current ? undefined : 'page'}
            className={
              current
                ? 'text-muted hover:text-moss'
                : 'text-moss underline underline-offset-4'
            }
          >
            All writing
          </Link>
        </li>
        {topics.map(topic => (
          <li key={topic.slug}>
            <Link
              href={`/blog/tags/${topic.slug}`}
              aria-current={current === topic.slug ? 'page' : undefined}
              className={
                current === topic.slug
                  ? 'text-moss underline underline-offset-4'
                  : 'text-muted hover:text-moss'
              }
            >
              {topic.name} <span className="text-muted">({topic.count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
