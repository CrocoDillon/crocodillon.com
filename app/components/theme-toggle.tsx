'use client'

import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Appearance"
    >
      <button
        type="button"
        aria-label="Toggle light and dark theme"
        title="Toggle light and dark theme"
        className="rounded-sm p-2 text-muted hover:bg-leaf hover:text-moss"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="size-5 dark:hidden"
        >
          <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="hidden size-5 dark:block"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Use system theme"
        title="Use system theme"
        className="rounded-sm px-2 py-2 text-xs text-muted hover:bg-leaf hover:text-moss"
        onClick={() => setTheme('system')}
      >
        Auto
      </button>
    </div>
  )
}
