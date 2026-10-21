import createMDX from '@next/mdx'
import type { NextConfig } from 'next'
import legacyRedirects from './app/lib/legacy-redirects.json'

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-frontmatter', 'remark-gfm'],
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
