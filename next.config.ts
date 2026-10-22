import createMDX from '@next/mdx'
import { resolve } from 'node:path'
import type { NextConfig } from 'next'
import legacyRedirects from './app/lib/legacy-redirects.json'

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      'remark-frontmatter',
      'remark-gfm',
      resolve('app/lib/remark-site-links.ts'),
    ],
    rehypePlugins: [
      [
        'rehype-pretty-code',
        {
          theme: { light: 'github-light', dark: 'github-dark' },
          keepBackground: false,
        },
      ],
    ],
  },
})

const config: NextConfig = {
  poweredByHeader: false,
  images: { qualities: [75, 90] },
  turbopack: {
    rules: {
      '*.svg': {
        condition: { path: /content\/articles\// },
        loaders: [{ loader: '@svgr/webpack', options: { svgo: false } }],
        as: '*.js',
      },
    },
  },
  async redirects() {
    return [
      { source: '/contact', destination: '/', permanent: true },
      { source: '/webdesign', destination: '/', permanent: true },
      ...legacyRedirects,
      {
        source: '/demo/parsing-emoji-unicode-in-javascript/:path*',
        destination: '/demo/emoji/:path*',
        permanent: true,
      },
      {
        source:
          '/demo/JHsa6a6dwxahwax723cteyj12e-parsing-emoji-unicode-in-javascript/:path*',
        destination: '/demo/emoji/:path*',
        permanent: true,
      },
    ]
  },
}

export default withMDX(config)
