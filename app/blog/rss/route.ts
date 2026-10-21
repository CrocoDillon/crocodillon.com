import { getFeed } from '@/lib/feeds'

export const dynamic = 'force-static'

export async function GET() {
  return new Response((await getFeed()).rss2(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
