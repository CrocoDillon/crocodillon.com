/* eslint-disable @next/next/no-html-link-for-pages -- Feed endpoints return XML and need full navigation. */
import Link from 'next/link'
import { CrocodileMark, RssIcon } from '@/components/icons'

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-6 border-b border-line px-6 py-7 sm:px-10">
      <Link
        href="/"
        className="flex items-center gap-2.5 text-xl font-semibold tracking-tight"
        aria-label="CrocoDillon home"
      >
        <CrocodileMark className="size-9 text-moss" />
        crocodillon<span className="-ml-2 text-moss">.</span>
      </Link>
      <nav
        aria-label="Main navigation"
        className="flex items-center gap-6 text-sm sm:gap-8"
      >
        <Link href="/blog" className="hover:text-moss">
          Writing
        </Link>
        <Link href="/#about" className="hover:text-moss">
          About
        </Link>
        <a
          href="/blog/rss"
          className="text-muted hover:text-moss"
          aria-label="Subscribe via RSS"
        >
          <RssIcon className="size-5" />
        </a>
      </nav>
    </header>
  )
}
