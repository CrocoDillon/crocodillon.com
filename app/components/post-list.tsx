import Link from 'next/link'
import { ArrowIcon } from '@/components/icons'
import type { Post } from '@/lib/posts'
import { formatDate } from '@/lib/site'

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ol className="divide-y divide-line">
      {posts.map(post => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="group grid gap-3 py-7 sm:grid-cols-[120px_1fr_24px] sm:gap-6 sm:py-8"
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
              <p className="mt-3 font-mono text-[11px] text-muted">
                {post.readingMinutes} min read
              </p>
            </div>
            <ArrowIcon className="hidden size-5 self-center text-muted transition-transform group-hover:translate-x-1 group-hover:text-moss sm:block" />
          </Link>
        </li>
      ))}
    </ol>
  )
}
