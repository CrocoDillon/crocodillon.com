import type { MDXComponents } from 'mdx/types'
import { Callout } from '@/components/callout'
import { ArticleImage } from '@/components/article-image'
import { ArticleDemo } from '@/components/article-demo'
import { SiteLink } from '@/components/site-link'

const components = {
  Callout,
  ArticleImage,
  ArticleDemo,
  SiteLink,
  a: SiteLink,
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
