import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export async function renderDemoDocument(html: string) {
  const [theme, bridge, font] = await Promise.all([
    readFile(path.join(process.cwd(), 'content/demos/theme.css'), 'utf8'),
    readFile(path.join(process.cwd(), 'content/demos/frame.js'), 'utf8'),
    readFile(
      path.join(
        process.cwd(),
        'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2'
      )
    ),
  ])
  const css = theme.replaceAll(
    'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.3.0/files/inter-latin-400-normal.woff2',
    `data:font/woff2;base64,${font.toString('base64')}`
  )

  // Resolve the frozen document's shared-asset slots during the site build.
  // Opaque-origin frames cannot authenticate asset requests to protected previews.
  return html
    .replace(
      '<link rel="stylesheet" href="/demo/theme.css" />',
      () => `<style>${css.replaceAll('</style', '<\\/style')}</style>`
    )
    .replace(
      '<script src="/demo/frame.js"></script>',
      () => `<script>${bridge.replaceAll('</script', '<\\/script')}</script>`
    )
}
