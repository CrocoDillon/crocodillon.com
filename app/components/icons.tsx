import type { SVGProps } from 'react'

export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.768-.244.768-.543 0-.267-.01-.975-.015-1.914-3.13.68-3.79-1.508-3.79-1.508-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.078-.685.078-.685 1.13.08 1.724 1.16 1.724 1.16 1.005 1.723 2.638 1.225 3.28.937.102-.728.393-1.225.715-1.507-2.499-.284-5.126-1.25-5.126-5.563 0-1.229.44-2.233 1.16-3.02-.116-.284-.502-1.43.11-2.98 0 0 .945-.303 3.094 1.153A10.79 10.79 0 0 1 12 6.178c.956.004 1.918.13 2.817.379 2.148-1.456 3.091-1.153 3.091-1.153.614 1.55.228 2.696.112 2.98.722.787 1.158 1.791 1.158 3.02 0 4.324-2.632 5.276-5.139 5.555.404.35.764 1.043.764 2.1 0 1.516-.014 2.739-.014 3.111 0 .302.202.653.774.542A11.251 11.251 0 0 0 12 .75Z" />
    </svg>
  )
}

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
