'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

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
  const { resolvedTheme } = useTheme()
  const sectionRef = useRef<HTMLElement>(null)
  const scriptRef = useRef<HTMLScriptElement>(null)
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let fallbackFrame: number | undefined
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(
            entries => {
              if (entries.some(entry => entry.isIntersecting)) {
                observer?.disconnect()
                setVisible(true)
              }
            },
            { rootMargin: '200px 0px' }
          )
    if (observer) observer.observe(section)
    else fallbackFrame = requestAnimationFrame(() => setVisible(true))

    return () => {
      observer?.disconnect()
      if (fallbackFrame !== undefined) cancelAnimationFrame(fallbackFrame)
      const script = scriptRef.current
      if (script) {
        script.onerror = null
        script.remove()
        scriptRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!visible || !resolvedTheme) return

    // next-themes applies its DOM styles in an effect. Wait until they are
    // applied before Disqus samples the inherited colors again.
    const frame = requestAnimationFrame(() => {
      function config(this: DisqusConfig) {
        this.page.identifier = slug
        this.page.url = `http://crocodillon.com/blog/${slug}`
        this.page.title = title
      }
      window.disqus_config = config
      if (window.DISQUS) {
        window.DISQUS.reset({ reload: true, config })
        return
      }
      // Reuse an in-flight script if the theme changes before it finishes.
      if (scriptRef.current) return
      setFailed(false)
      const script = document.createElement('script')
      scriptRef.current = script
      script.src = 'https://crocodillon.disqus.com/embed.js'
      script.async = true
      script.onerror = () => {
        setFailed(true)
        scriptRef.current = null
        script.remove()
      }
      document.body.appendChild(script)
    })
    return () => cancelAnimationFrame(frame)
  }, [visible, resolvedTheme, slug, title])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="discussion-heading"
      className="mt-16 border-t border-line pt-10"
    >
      <h2 id="discussion-heading" className="font-display text-3xl">
        Continue the conversation
      </h2>
      <p className="mt-5 text-sm leading-relaxed text-muted">
        Questions, corrections, or something to add? Join the discussion below.
        Comments are powered by{' '}
        <a
          href="https://disqus.com/privacy-policy/"
          className="underline underline-offset-2"
        >
          Disqus
        </a>
        .
      </p>
      <div className="mt-6 min-h-28" id="disqus_thread" />
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
