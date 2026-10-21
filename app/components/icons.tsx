import type { SVGProps } from 'react'

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  )
}

export function RssIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

export function CrocodileMark({
  eyeFill = 'var(--color-paper)',
  ...props
}: SVGProps<SVGSVGElement> & { eyeFill?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M5 18h4v-4h4v-4h4v4h4v-4h4v4h4v4h8v7H21v4H10v-4H5z" />
      <path d="M24 18h3v3h-3z" fill={eyeFill} />
    </svg>
  )
}
