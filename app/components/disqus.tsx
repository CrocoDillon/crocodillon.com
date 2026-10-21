'use client'

import { useEffect, useState } from 'react'

type DisqusConfig = { page: { identifier: string; url: string; title: string } }
declare global {
  interface Window {
    DISQUS?: {
      reset: (options: {
        reload: boolean
        config: (this: DisqusConfig) => void
      }) => void
    }
    disqus_config?: (this: DisqusConfig) => void
  }
}

export function Disqus({ slug, title }: { slug: string; title: string }) {
  const [enabled, setEnabled] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!enabled) return
    function config(this: DisqusConfig) {
      this.page.identifier = slug
      this.page.url = `http://crocodillon.com/blog/${slug}`
      this.page.title = title
    }
    if (window.DISQUS) {
      window.DISQUS.reset({ reload: true, config })
      return
    }
    window.disqus_config = config
    const script = document.createElement('script')
    script.src = 'https://crocodillon.disqus.com/embed.js'
    script.async = true
    script.onerror = () => setFailed(true)
    document.body.appendChild(script)
    return () => {
      script.onerror = null
      script.remove()
    }
  }, [enabled, slug, title])

  return (
    <section
      aria-labelledby="discussion-heading"
      className="mt-16 border-t border-line pt-10"
    >
      <h2 id="discussion-heading" className="font-display text-3xl">
        Continue the conversation
      </h2>
      {!enabled ? (
        <div className="mt-5">
          <p className="mb-5 text-sm leading-relaxed text-muted">
            Questions, corrections, or something to add? The discussion lives on
            Disqus. Loading it connects to Disqus and its privacy policy
            applies.
          </p>
          <button
            type="button"
            onClick={() => setEnabled(true)}
            className="rounded-sm border border-ink px-5 py-2.5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
          >
            Load comments ↗
          </button>
        </div>
      ) : (
        <div className="mt-6" id="disqus_thread" />
      )}
      {failed ? (
        <p className="mt-4 text-sm text-muted">
          Disqus couldn’t load. Your browser may be blocking it.{' '}
          <a
            className="underline"
            href={`https://disqus.com/home/forums/crocodillon/`}
          >
            Open the discussion on Disqus.
          </a>
        </p>
      ) : null}
      <noscript>
        <p className="mt-4 text-sm text-muted">
          Enable JavaScript to load the Disqus discussion.
        </p>
      </noscript>
    </section>
  )
}
