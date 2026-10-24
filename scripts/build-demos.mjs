import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const articles = path.join(root, 'content/articles')
const [argument, ...extra] = process.argv.slice(2)
const slug = argument ?? path.basename(path.dirname(process.cwd()))
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || extra.length)
  throw new Error('Usage: pnpm demo:build <article-slug>')
const directory = path.join(articles, slug, 'demo')
if (!argument && path.resolve(process.cwd()) !== directory)
  throw new Error('Usage: pnpm demo:build <article-slug>')
await fs.access(path.join(directory, 'index.ts'))

// Resolve the compiler from this demo, independently of the site's toolchain.
const require = createRequire(path.join(directory, 'package.json'))
const { build } = require('esbuild')
const result = await build({
  entryPoints: [path.join(directory, 'index.ts')],
  tsconfig: path.join(directory, 'tsconfig.json'),
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
  write: false,
  legalComments: 'inline',
  define: { ngDevMode: 'false' },
})
const [template, material, styles] = await Promise.all([
  fs.readFile(path.join(directory, 'index.html'), 'utf8'),
  fs.readFile(
    path.join(
      directory,
      'node_modules/@angular/material/prebuilt-themes/azure-blue.css'
    ),
    'utf8'
  ),
  fs.readFile(path.join(directory, 'index.css'), 'utf8'),
])
// Freeze framework CSS with the demo; the site owns the theme and frame bridge.
// Preserve the cascade: framework defaults, shared theme, demo-specific styles.
const html = template
  .replace(
    /<link\s+rel="stylesheet"\s+href="https:\/\/cdn\.jsdelivr\.net\/npm\/@angular\/material@[^\"]+"\s*\/?>/,
    () =>
      `<style>${material.replaceAll('</style', '<\\/style')}</style>\n` +
      '<link rel="stylesheet" href="/demo/theme.css" />'
  )
  .replace(
    '<link rel="stylesheet" href="./index.css" />',
    () => `<style>${styles.replaceAll('</style', '<\\/style')}</style>`
  )
  .replace(
    '<script type="module" src="./index.ts"></script>',
    () =>
      `<script>${result.outputFiles[0].text.replaceAll('</script', '<\\/script')}</script>`
  )
  .replace('</head>', '<script src="/demo/frame.js"></script></head>')
  .replaceAll('\r\n', '\n')

// Write only this demo, and only after compilation succeeds. Keep other artifacts.
const output = path.join(directory, 'dist')
const inputs = [
  'index.ts',
  'index.html',
  'index.css',
  'tsconfig.json',
  'package.json',
  'pnpm-lock.yaml',
]
const sha256 = value => createHash('sha256').update(value).digest('hex')
const sources = Object.fromEntries(
  await Promise.all(
    inputs.map(async name => [
      name,
      sha256(
        (await fs.readFile(path.join(directory, name), 'utf8')).replaceAll(
          '\r\n',
          '\n'
        )
      ),
    ])
  )
)
const provenance = {
  node: process.version,
  builder: sha256(
    (await fs.readFile(fileURLToPath(import.meta.url), 'utf8')).replaceAll(
      '\r\n',
      '\n'
    )
  ),
  sources,
  html: sha256(html),
}
await fs.mkdir(output, { recursive: true })
await fs.writeFile(path.join(output, 'index.html'), html)
await fs.writeFile(
  path.join(output, 'build.json'),
  JSON.stringify(provenance, null, 2) + '\n'
)
console.log(
  `Built demo ${slug} (${Math.round(Buffer.byteLength(html) / 1024)} kB).`
)
