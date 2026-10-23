'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { track } from '@vercel/analytics'

export type ArticleDemoProps = {
  title: string
  penUrl: string
  slug: string
  height?: number
}

type DemoEvent = 'DemoRun' | 'DemoOpen' | 'ArticleArrival'
type DemoSource = 'blog' | 'codepen'

export function ArticleDemoClient({
  title,
  penUrl,
  slug,
  height = 1000,
  analyticsEnabled,
}: ArticleDemoProps & { analyticsEnabled: boolean }) {
  const [running, setRunning] = useState(false)
  const [contentHeight, setContentHeight] = useState(height)
  const { resolvedTheme } = useTheme()
  const frame = useRef<HTMLIFrameElement>(null)
  const sentEvents = useRef(new Set<string>())
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light'

  function trackOnce(name: DemoEvent, source: DemoSource) {
    if (!analyticsEnabled) return
    const key = `${slug}:${name}:${source}`
    if (sentEvents.current.has(key)) return
    sentEvents.current.add(key)
    track(name, { article: slug, source })
  }

  useEffect(() => {
    if (!analyticsEnabled) return
    if (
      new URL(window.location.href).searchParams.get('utm_source') !== 'codepen'
    )
      return
    const key = `${slug}:ArticleArrival:codepen`
    if (sentEvents.current.has(key)) return
    sentEvents.current.add(key)
    track('ArticleArrival', { article: slug, source: 'codepen' })
  }, [analyticsEnabled, slug])

  function sendTheme() {
    // A sandbox without allow-same-origin has an opaque origin, requiring '*'.
    frame.current?.contentWindow?.postMessage(
      { type: 'article-demo-theme', theme },
      '*'
    )
  }

  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { type: 'article-demo-theme', theme },
      '*'
    )
  }, [theme])

  useEffect(() => {
    if (!running) return

    function resize(event: MessageEvent) {
      // Sandboxed documents have an opaque origin; check the sending window.
      if (event.source !== frame.current?.contentWindow) return
      if (event.data?.type !== 'article-demo-resize') return
      const nextHeight = event.data.height
      if (typeof nextHeight !== 'number' || !Number.isFinite(nextHeight)) return
      if (nextHeight < 200 || nextHeight > 5000) return
      setContentHeight(Math.ceil(nextHeight))
    }

    window.addEventListener('message', resize)
    return () => window.removeEventListener('message', resize)
  }, [running])

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-sm border border-line">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-leaf px-5 py-3">
        <span className="text-sm font-medium text-ink">{title}</span>
        <a
          href={penUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackOnce('DemoOpen', 'codepen')}
          onAuxClick={event => {
            if (event.button === 1) trackOnce('DemoOpen', 'codepen')
          }}
          className="text-xs text-moss underline underline-offset-4"
        >
          Open in CodePen ↗
        </a>
      </div>
      {running ? (
        <iframe
          ref={frame}
          src={`/demo/${encodeURIComponent(slug)}`}
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          onLoad={sendTheme}
          title={title}
          className="block w-full border-0"
          style={{
            height: contentHeight,
            colorScheme: theme,
          }}
        />
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center gap-4 bg-paper p-6 text-center">
          <p className="m-0 text-sm text-muted">
            Try the working example and explore its code.
          </p>
          <button
            type="button"
            onClick={() => {
              trackOnce('DemoRun', 'blog')
              setRunning(true)
            }}
            className="rounded-sm border border-moss bg-moss px-5 py-2.5 text-sm font-medium text-paper hover:opacity-90"
            aria-label={`Run ${title}`}
          >
            Run example
          </button>
        </div>
      )}
    </figure>
  )
}
