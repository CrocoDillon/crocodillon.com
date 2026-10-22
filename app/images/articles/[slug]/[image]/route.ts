import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { notFound } from 'next/navigation'

// Published PNG links now lead to the co-located, theme-aware SVG source.
const aliases: Record<string, string> = {
  'mongodb-for-dbas-introduction/mongodb-for-dbas__scaling.png':
    'mongodb-for-dbas-introduction/scaling.svg',
  'mongodb-for-dbas-introduction/mongodb-for-dbas__features.png':
    'mongodb-for-dbas-introduction/features-and-scalability.svg',
  'mongodb-for-dbas-introduction/mongodb-for-dbas__joins-vs-nesting.png':
    'mongodb-for-dbas-introduction/joins-and-nesting.svg',
  'mongodb-for-dbas-introduction/mongodb-for-dbas__bson.png':
    'mongodb-for-dbas-introduction/bson-layout.svg',
  'mongodb-for-dbas-introduction/mongodb-for-dbas__structure.png':
    'mongodb-for-dbas-crud/document-hierarchy.svg',
  'mongodb-for-dbas-introduction/mongodb-for-dbas__data-files.png':
    'mongodb-for-dbas-crud/data-file-layout.svg',
  'parsing-emoji-unicode-in-javascript/parsing-emoji-unicode-in-javascript__utf16-encoding.png':
    'parsing-emoji-unicode-in-javascript/utf16-surrogate-pairs.svg',
  'non-blocking-web-fonts-using-localstorage/non-blocking-web-fonts-using-localstorage__the-guardian.png':
    'non-blocking-web-fonts-using-localstorage/font-loading-flow.svg',
}
const diagrams = new Set(Object.values(aliases))

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return [...Object.keys(aliases), ...diagrams].map(key => {
    const [slug, image] = key.split('/')
    return { slug, image }
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; image: string }> }
) {
  const { slug, image } = await params
  const key = `${slug}/${image}`
  if (aliases[key]) {
    return new Response(null, {
      status: 307,
      headers: { Location: `/images/articles/${aliases[key]}` },
    })
  }
  if (!diagrams.has(key)) notFound()
  const svg = await readFile(
    path.join(process.cwd(), 'content/articles', slug, 'images', image),
    'utf8'
  )
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
