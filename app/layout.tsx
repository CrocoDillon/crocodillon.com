import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { site } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'CrocoDillon — Notes from the web',
    template: '%s — CrocoDillon',
  },
  description: site.description,
  authors: [{ name: site.author, url: site.github }],
  alternates: {
    types: {
      'application/rss+xml': '/blog/rss',
      'application/atom+xml': '/blog/atom',
    },
  },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_US',
    title: 'CrocoDillon — Notes from the web',
    description: site.description,
    images: ['/opengraph-image'],
  },
  twitter: { card: 'summary_large_image', creator: '@CrocoDillon' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only z-50 bg-ink px-5 py-3 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto max-w-6xl px-6 sm:px-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
