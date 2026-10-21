import { getFeed } from '@/lib/feeds'

export const dynamic = 'force-static'

export async function GET() {
  return new Response((await getFeed()).atom1(), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  })
}
