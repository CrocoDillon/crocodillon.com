import type { MDXComponents } from 'mdx/types'
import { Callout } from '@/components/callout'
import { ArticleImage } from '@/components/article-image'

const components = { Callout, ArticleImage } satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
