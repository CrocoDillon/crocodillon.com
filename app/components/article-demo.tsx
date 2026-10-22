'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'

export function ArticleDemo({
  title,
  penUrl,
  height = 760,
}: {
  title: string
  penUrl: string
  height?: number
}) {
  const [running, setRunning] = useState(false)
  const { resolvedTheme } = useTheme()
  const embed = new URL(penUrl)
  if (
    embed.origin !== 'https://codepen.io' ||
    !embed.pathname.includes('/pen/')
  ) {
    throw new Error('ArticleDemo requires a CodePen Pen URL.')
  }
  embed.pathname = embed.pathname.replace('/pen/', '/embed/')
  embed.search = new URLSearchParams({
    file: 'false',
    preview: 'true',
    'theme-id': resolvedTheme === 'dark' ? '-2' : '-3',
  }).toString()

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-sm border border-line">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-leaf px-5 py-3">
        <span className="text-sm font-medium text-ink">{title}</span>
        <a
          href={penUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-moss underline underline-offset-4"
        >
          Open in CodePen ↗
        </a>
      </div>
      {running ? (
        <iframe
          src={embed.toString()}
          title={title}
          className="block w-full border-0"
          style={{
            height,
            colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light',
          }}
          allow="fullscreen"
        />
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center gap-4 bg-paper p-6 text-center">
          <p className="m-0 text-sm text-muted">
            Try the working example and explore its code.
          </p>
          <button
            type="button"
            onClick={() => setRunning(true)}
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
