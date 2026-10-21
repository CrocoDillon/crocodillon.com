'use client'

import { useState } from 'react'

const pattern = /([\u{1f300}-\u{1f64f}\u{1f680}-\u{1f6ff}])/gu

export function EmojiDemo() {
  const [text, setText] = useState(
    'Hello, world! 😃 A little love for the web 💚 🚀'
  )
  const parts = text.split(pattern)
  return (
    <div className="mt-10">
      <label htmlFor="emoji-input" className="mb-3 block text-sm font-medium">
        Your text
      </label>
      <textarea
        id="emoji-input"
        value={text}
        onChange={event => setText(event.target.value)}
        rows={4}
        className="w-full resize-y rounded-sm border border-line bg-white/60 px-5 py-4 leading-relaxed focus:border-moss"
      />
      <div className="mt-6 rounded-sm border border-line bg-leaf p-6">
        <p className="eyebrow mb-4">Rendered with the original sprites</p>
        <div
          aria-live="polite"
          aria-atomic="true"
          className="text-xl leading-relaxed break-words whitespace-pre-wrap"
        >
          {parts.map((part, index) =>
            index % 2 ? (
              <span
                key={index}
                className="emoji"
                data-emoji={part}
                role="img"
                aria-label={part}
              />
            ) : (
              part
            )
          )}
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        This historical parser supports a subset of emoji. Newer characters may
        display natively or have no matching image.
      </p>
    </div>
  )
}
