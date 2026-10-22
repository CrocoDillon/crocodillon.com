import { notFound } from 'next/navigation'
import type { StaticImageData } from 'next/image'
import scaling from '../../../../../content/articles/mongodb-for-dbas-introduction/images/scaling.png'
import features from '../../../../../content/articles/mongodb-for-dbas-introduction/images/features-and-scalability.png'
import joins from '../../../../../content/articles/mongodb-for-dbas-introduction/images/joins-and-nesting.png'
import bson from '../../../../../content/articles/mongodb-for-dbas-introduction/images/bson-layout.png'
import hierarchy from '../../../../../content/articles/mongodb-for-dbas-crud/images/document-hierarchy.png'
import dataFiles from '../../../../../content/articles/mongodb-for-dbas-crud/images/data-file-layout.png'
import surrogatePairs from '../../../../../content/articles/parsing-emoji-unicode-in-javascript/images/utf16-surrogate-pairs.png'
import fontLoading from '../../../../../content/articles/non-blocking-web-fonts-using-localstorage/images/font-loading-flow.png'

// Keep published illustration URLs working after co-locating the source assets.
const images: Record<string, StaticImageData> = {
  'mongodb-for-dbas-introduction/mongodb-for-dbas__scaling.png': scaling,
  'mongodb-for-dbas-introduction/mongodb-for-dbas__features.png': features,
  'mongodb-for-dbas-introduction/mongodb-for-dbas__joins-vs-nesting.png': joins,
  'mongodb-for-dbas-introduction/mongodb-for-dbas__bson.png': bson,
  'mongodb-for-dbas-introduction/mongodb-for-dbas__structure.png': hierarchy,
  'mongodb-for-dbas-introduction/mongodb-for-dbas__data-files.png': dataFiles,
  'parsing-emoji-unicode-in-javascript/parsing-emoji-unicode-in-javascript__utf16-encoding.png':
    surrogatePairs,
  'non-blocking-web-fonts-using-localstorage/non-blocking-web-fonts-using-localstorage__the-guardian.png':
    fontLoading,
}

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(images).map(key => {
    const [slug, image] = key.split('/')
    return { slug, image }
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; image: string }> }
) {
  const { slug, image } = await params
  const asset = images[`${slug}/${image}`]
  if (!asset) notFound()
  return new Response(null, {
    status: 307,
    headers: { Location: asset.src, 'Cache-Control': 'public, max-age=3600' },
  })
}
