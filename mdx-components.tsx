import type { MDXComponents } from 'mdx/types'
import { Callout } from '@/components/callout'

const components = { Callout } satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
