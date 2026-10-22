import { isArticlePreview } from '@/lib/publication'

export async function GET(request: Request) {
  if (isArticlePreview) return new Response(null, { status: 404 })

  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const hook = URL.parse(process.env.PUBLISH_DEPLOY_HOOK_URL ?? '')
  if (
    !hook ||
    hook.protocol !== 'https:' ||
    hook.hostname !== 'api.vercel.com' ||
    !hook.pathname.startsWith('/v1/integrations/deploy/')
  ) {
    console.error('Daily publication rebuild: deploy hook is not configured.')
    return Response.json(
      { error: 'Rebuild is not configured' },
      { status: 503 }
    )
  }

  // Publication dates must be evaluated again, even when the Git commit is unchanged.
  hook.searchParams.set('buildCache', 'false')
  try {
    const response = await fetch(hook, {
      method: 'POST',
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) {
      console.error(
        'Daily publication rebuild: deploy hook returned',
        response.status
      )
      return Response.json({ error: 'Rebuild request failed' }, { status: 502 })
    }
    console.info('Daily publication rebuild requested.')
    return Response.json(
      { queued: true },
      {
        status: 202,
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  } catch {
    // Do not log the hook URL: it grants permission to trigger deployments.
    console.error('Daily publication rebuild: deploy hook request failed.')
    return Response.json({ error: 'Rebuild request failed' }, { status: 502 })
  }
}
