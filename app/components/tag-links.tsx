import Link from 'next/link'
import { tags, type TagSlug } from '@/lib/tags'

export function TagLinks({
  slugs,
  className = '',
}: {
  slugs: TagSlug[]
  className?: string
}) {
  if (!slugs.length) return null

  return (
    <ul
      aria-label="Topics"
      className={`flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-muted ${className}`}
    >
      {slugs.map(slug => (
        <li key={slug}>
          <Link
            href={`/blog/tags/${slug}`}
            rel="tag"
            className="underline decoration-line underline-offset-4 hover:text-moss hover:decoration-moss"
          >
            {tags[slug].name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
