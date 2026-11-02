import Link from 'next/link'
import { ArrowIcon } from '@/components/icons'
import type { Post } from '@/lib/posts'
import { formatDate } from '@/lib/site'
import { PublicationStatusLabel } from '@/components/publication-status'
import { TagLinks } from '@/components/tag-links'

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ol className="divide-y divide-line">
      {posts.map(post => (
        <li key={post.slug} className="py-6 sm:py-7">
          <Link
            href={`/blog/${post.slug}`}
            className="group grid gap-3 sm:grid-cols-[120px_1fr_24px] sm:gap-6"
          >
            <time
              dateTime={post.publishedAt}
              className="pt-1.5 font-mono text-xs text-muted"
            >
              {formatDate(post.publishedAt)}
            </time>
            <div>
              <h3 className="text-xl leading-snug font-medium tracking-tight transition-colors group-hover:text-moss sm:text-2xl">
                {post.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                {post.description}
              </p>
            </div>
            <ArrowIcon className="hidden size-5 self-center text-muted transition-transform group-hover:translate-x-1 group-hover:text-moss sm:block" />
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted sm:ml-36">
            <span>{post.readingMinutes} min read</span>
            <PublicationStatusLabel status={post.status} />
            <TagLinks slugs={post.tags} />
          </div>
        </li>
      ))}
    </ol>
  )
}
