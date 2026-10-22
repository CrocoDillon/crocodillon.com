import type { MDXComponents } from 'mdx/types'
import { Callout } from '@/components/callout'
import { ArticleImage } from '@/components/article-image'
import { SiteLink } from '@/components/site-link'

const components = {
  Callout,
  ArticleImage,
  SiteLink,
  a: SiteLink,
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
