/* eslint-disable @next/next/no-html-link-for-pages -- Feed endpoints return XML and need full navigation. */
'use client'

import { useEffect, useRef } from 'react'
import { RssIcon } from '@/components/icons'

export function FeedMenu() {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    function dismissOutside(event: PointerEvent) {
      const details = detailsRef.current
      if (details && !details.contains(event.target as Node)) {
        details.open = false
      }
    }

    function dismissOnEscape(event: KeyboardEvent) {
      const details = detailsRef.current
      if (event.key === 'Escape' && details?.open) {
        details.open = false
        details.querySelector('summary')?.focus()
      }
    }

    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [])

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        aria-label="Subscribe via RSS or Atom"
        title="Subscribe via RSS or Atom"
        className="flex cursor-pointer list-none items-center gap-1 rounded-sm p-2 text-muted hover:bg-leaf hover:text-moss [&::-webkit-details-marker]:hidden"
      >
        <RssIcon className="size-5" />
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="size-3 group-open:rotate-180"
        >
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </summary>
      <ul className="absolute right-0 z-10 mt-2 w-40 rounded-sm border border-line bg-paper p-1 shadow-sm">
        <li>
          <a
            href="/blog/rss"
            className="block rounded-sm px-3 py-2 hover:bg-leaf hover:text-moss"
          >
            RSS feed
          </a>
        </li>
        <li>
          <a
            href="/blog/atom"
            className="block rounded-sm px-3 py-2 hover:bg-leaf hover:text-moss"
          >
            Atom feed
          </a>
        </li>
      </ul>
    </details>
  )
}
