import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ThemeProvider } from '@/components/theme-provider'
import { site } from '@/lib/site-server'
import { isArticlePreview } from '@/lib/publication'
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
  robots: { index: !isArticlePreview, follow: !isArticlePreview },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-paper font-sans text-ink antialiased">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only z-50 bg-ink px-5 py-3 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          {isArticlePreview ? (
            <div className="border-b border-line bg-leaf px-6 py-3 text-center text-sm text-ink">
              Preview blog · Includes drafts and scheduled articles.{' '}
              <Link
                href="/drafts"
                className="font-medium text-moss underline underline-offset-4"
              >
                Review the queue →
              </Link>
            </div>
          ) : null}
          <SiteHeader />
          <main id="main" className="mx-auto max-w-6xl px-6 sm:px-10">
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
        {isArticlePreview ? null : <Analytics />}
      </body>
    </html>
  )
}
