import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const articles = path.join(root, 'content/articles')
const output = path.join(root, '.demo-build')

// Clear only this workspace's generated output, including demos removed from Git.
if (path.dirname(output) !== root || path.basename(output) !== '.demo-build')
  throw new Error('Invalid demo output directory.')
await fs.rm(output, { recursive: true, force: true })

// Each demo is a separate workspace and bundle. Nothing imports Angular into Next.
for (const article of await fs.readdir(articles, { withFileTypes: true })) {
  if (!article.isDirectory()) continue
  const directory = path.join(articles, article.name, 'demo')
  try {
    await fs.access(path.join(directory, 'index.ts'))
  } catch (error) {
    if (error.code === 'ENOENT') continue
    throw error
  }

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
  const [template, material, theme, styles, font] = await Promise.all([
    fs.readFile(path.join(directory, 'index.html'), 'utf8'),
    fs.readFile(
      path.join(
        directory,
        'node_modules/@angular/material/prebuilt-themes/azure-blue.css'
      ),
      'utf8'
    ),
    fs.readFile(path.join(root, 'content/demos/theme.css'), 'utf8'),
    fs.readFile(path.join(directory, 'index.css'), 'utf8'),
    fs.readFile(
      path.join(
        root,
        'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2'
      )
    ),
  ])
  const css = [material, theme, styles]
    .join('\n')
    .replace(
      /https:\/\/cdn\.jsdelivr\.net\/npm\/@fontsource\/inter@5\.3\.0\/files\/inter-latin-400-normal\.woff2/g,
      `data:font/woff2;base64,${font.toString('base64')}`
    )
  // Inline assets work in an opaque-origin iframe without network access or cookies.
  const html = template
    .replace(
      /<link\s+rel="stylesheet"\s+href="https:\/\/cdn\.jsdelivr\.net\/npm\/@angular\/material@[^\"]+"\s*\/?>/,
      ''
    )
    .replace(
      '<link rel="stylesheet" href="./index.css" />',
      () => `<style>${css.replaceAll('</style', '<\\/style')}</style>`
    )
    .replace(
      '<script type="module" src="./index.ts"></script>',
      () =>
        `<script>${result.outputFiles[0].text.replaceAll('</script', '<\\/script')}</script>`
    )
    .replace(
      '</head>',
      '<script>' +
        (await fs.readFile(path.join(root, 'content/demos/frame.js'), 'utf8')) +
        '</script></head>'
    )
  await fs.mkdir(path.join(output, article.name), { recursive: true })
  await fs.writeFile(path.join(output, article.name, 'index.html'), html)
  console.log(
    `Built demo ${article.name} (${Math.round(Buffer.byteLength(html) / 1024)} kB).`
  )
}
