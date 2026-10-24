import Link from 'next/link'
import type { ComponentProps } from 'react'
import { ArrowIcon } from '@/components/icons'
import { site } from '@/lib/site'

const siteHostname = new URL(site.url).hostname

export function SiteLink({
  href,
  children,
  target,
  rel,
  ...props
}: ComponentProps<'a'>) {
  const url = href ? URL.parse(href, site.url) : null
  const external =
    url !== null &&
    (url.protocol === 'https:' || url.protocol === 'http:') &&
    url.hostname !== siteHostname

  if (
    href &&
    url &&
    (url.protocol === 'https:' || url.protocol === 'http:') &&
    !external &&
    !href.startsWith('#') &&
    props.download === undefined
  ) {
    return (
      <Link {...props} href={href} target={target} rel={rel}>
        {children}
      </Link>
    )
  }

  return (
    <a
      {...props}
      href={href}
      target={external ? '_blank' : target}
      rel={
        external
          ? [
              ...new Set([
                ...(rel?.split(/\s+/) ?? []),
                'noopener',
                'noreferrer',
              ]),
            ]
              .filter(Boolean)
              .join(' ')
          : rel
      }
    >
      {children}
      {external ? (
        <>
          <ArrowIcon className="ml-1 inline-block size-3.5 -rotate-45 align-baseline" />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      ) : null}
    </a>
  )
}
