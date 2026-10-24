import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const dynamic = 'force-static'

export async function GET() {
  const [theme, font] = await Promise.all([
    readFile(path.join(process.cwd(), 'content/demos/theme.css'), 'utf8'),
    readFile(
      path.join(
        process.cwd(),
        'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2'
      )
    ),
  ])
  // Data URLs let the opaque-origin demo load fonts without CORS or CDN access.
  const css = theme.replaceAll(
    'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.3.0/files/inter-latin-400-normal.woff2',
    `data:font/woff2;base64,${font.toString('base64')}`
  )

  return new Response(css, {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
