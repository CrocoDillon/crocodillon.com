/* eslint-disable @next/next/no-html-link-for-pages -- Feed endpoints return XML and need full navigation. */
import { ArrowIcon } from '@/components/icons'
import { site } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer
      id="about"
      className="mx-auto mt-24 max-w-6xl border-t border-line px-6 pt-14 pb-8 sm:mt-32 sm:px-10"
    >
      <div className="grid gap-8 pb-14 md:grid-cols-[1fr_auto] md:gap-20">
        <div className="max-w-xl">
          <p className="eyebrow mb-4">Behind the keyboard</p>
          <h2 className="font-display text-3xl tracking-tight">
            Hello, I’m Dillon.
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            A web developer from the Netherlands. I like understanding how
            things work, making things for the web, and writing down what I
            learn along the way.
          </p>
        </div>
        <div className="flex items-start gap-8 text-sm md:flex-col md:justify-center md:gap-3">
          <a
            href={site.github}
            className="inline-flex items-center gap-2 hover:text-moss"
          >
            Find me on GitHub <ArrowIcon className="size-4 -rotate-45" />
          </a>
          <a href="/blog/atom" className="hover:text-moss">
            Subscribe via Atom ↗
          </a>
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-6 font-mono text-[11px] text-muted">
        <span>© {new Date().getUTCFullYear()} Dillon de Voor</span>
        <span>Curiosity, documented.</span>
      </div>
    </footer>
  )
}
