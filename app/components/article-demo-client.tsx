'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { track } from '@vercel/analytics'

export type ArticleDemoProps = {
  title: string
  penUrl?: string
  slug: string
}

type DemoEvent = 'DemoRun' | 'DemoOpen'
type DemoSource = 'blog' | 'codepen'

export function ArticleDemoClient({
  title,
  penUrl,
  slug,
  analyticsEnabled,
}: ArticleDemoProps & { analyticsEnabled: boolean }) {
  const [running, setRunning] = useState(false)
  const [ready, setReady] = useState(false)
  const [contentHeight, setContentHeight] = useState<number>()
  const { resolvedTheme } = useTheme()
  const frame = useRef<HTMLIFrameElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const sentEvents = useRef(new Set<string>())
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light'

  function trackOnce(name: DemoEvent, source: DemoSource) {
    if (!analyticsEnabled) return
    const key = `${slug}:${name}:${source}`
    if (sentEvents.current.has(key)) return
    sentEvents.current.add(key)
    track(name, { article: slug, source })
  }

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
      setReady(true)
    }

    window.addEventListener('message', resize)
    return () => window.removeEventListener('message', resize)
  }, [running])

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-sm border border-line">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-leaf px-5 py-3">
        <span className="text-sm font-medium text-ink">{title}</span>
        {penUrl ? (
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
        ) : null}
      </div>
      <div
        ref={panel}
        className="relative overflow-hidden bg-paper transition-[height] duration-500 ease-in-out motion-reduce:transition-none"
        style={{ height: contentHeight }}
        aria-busy={running && !ready}
      >
        {running ? (
          <>
            <iframe
              ref={frame}
              src={`/demo/${encodeURIComponent(slug)}`}
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              onLoad={sendTheme}
              title={title}
              className="absolute inset-0 block h-full w-full border-0 transition-opacity duration-300 motion-reduce:transition-none"
              style={{ opacity: ready ? 1 : 0, colorScheme: theme }}
              aria-hidden={!ready}
              inert={!ready}
            />
            {!ready ? <DemoLoading /> : null}
          </>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="m-0 text-sm text-muted">
              Try the working example and explore its code.
            </p>
            <button
              type="button"
              onClick={() => {
                // Keep the exact idle-panel height until the sandbox reports its size.
                setContentHeight(panel.current!.getBoundingClientRect().height)
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
      </div>
    </figure>
  )
}

function DemoLoading() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
      role="status"
    >
      <div
        className="relative grid size-12 place-items-center rounded-full bg-leaf text-moss"
        aria-hidden="true"
      >
        <span className="absolute inset-0 rounded-full border border-moss/25 border-t-moss motion-safe:animate-spin" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-5"
        >
          <path
            d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p className="m-0 text-sm font-medium text-ink">
          Getting the example ready
        </p>
        <p className="mt-1.5 mb-0 text-xs text-muted">
          A little room to experiment.
        </p>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="h-0.5 w-6 rounded-full bg-moss/60 motion-safe:animate-pulse" />
        <span className="h-0.5 w-6 rounded-full bg-moss/30 [animation-delay:150ms] motion-safe:animate-pulse" />
        <span className="h-0.5 w-6 rounded-full bg-moss/15 [animation-delay:300ms] motion-safe:animate-pulse" />
      </div>
    </div>
  )
}
