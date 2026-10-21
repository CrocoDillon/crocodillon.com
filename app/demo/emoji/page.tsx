import '../../../public/demo/emoji/css/emoji.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { EmojiDemo } from '@/components/emoji-demo'

export const metadata: Metadata = {
  title: 'Emoji parser demo',
  description: 'Try the Unicode emoji parser from the original article.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/demo/emoji' },
}

export default function Demo() {
  return (
    <section className="mx-auto max-w-3xl py-16">
      <Link
        href="/blog/parsing-emoji-unicode-in-javascript"
        className="font-mono text-xs text-muted hover:text-moss"
      >
        ← Back to the article
      </Link>
      <p className="eyebrow mt-12 mb-5">An experiment from 2014</p>
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
        A little emoji magic.
      </h1>
      <p className="mt-6 leading-relaxed text-muted">
        A live version of the original Unicode replacement technique. Type a few
        emoji and see them rendered with the archived image set. Everything
        stays in this browser.
      </p>
      <EmojiDemo />
    </section>
  )
}
