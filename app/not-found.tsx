import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="py-24 sm:py-32">
      <p className="eyebrow mb-6">404 · A dead end</p>
      <h1 className="font-display text-5xl tracking-tight sm:text-7xl">
        Lost in the weeds?
      </h1>
      <p className="mt-6 text-muted">
        That page isn’t here. There are still a few good rabbit holes in the
        archive.
      </p>
      <Link
        href="/blog"
        className="mt-8 inline-flex border-b border-moss pb-1 text-sm text-moss"
      >
        Back to the writing →
      </Link>
    </section>
  )
}
