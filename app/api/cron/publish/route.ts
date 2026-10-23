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

  const targets = [
    { name: 'production', url: process.env.PUBLISH_DEPLOY_HOOK_URL },
    { name: 'preview', url: process.env.PREVIEW_DEPLOY_HOOK_URL },
  ]
  // Attempt both rebuilds even if one hook is missing or fails.
  const statuses = await Promise.all(
    targets.map(async ({ name, url }) => {
      const hook = URL.parse(url ?? '')
      if (
        !hook ||
        hook.protocol !== 'https:' ||
        hook.hostname !== 'api.vercel.com' ||
        !hook.pathname.startsWith('/v1/integrations/deploy/')
      ) {
        console.error(`Daily ${name} rebuild: deploy hook is not configured.`)
        return 503
      }

      // Reevaluate publication dates even when the Git commit is unchanged.
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
            `Daily ${name} rebuild: deploy hook returned`,
            response.status
          )
          return 502
        }
        console.info(`Daily ${name} rebuild requested.`)
        return 202
      } catch {
        // Do not log the hook URL: it grants permission to trigger deployments.
        console.error(`Daily ${name} rebuild: deploy hook request failed.`)
        return 502
      }
    })
  )
  const failure = statuses.find(status => status !== 202)
  if (failure) {
    return Response.json(
      {
        error:
          failure === 503
            ? 'Rebuild is not configured'
            : 'Rebuild request failed',
      },
      { status: failure, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return Response.json(
    { queued: true },
    { status: 202, headers: { 'Cache-Control': 'no-store' } }
  )
}
