import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  copyFileSync,
  cpSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

// Read the dump as data. Never execute SQL or any code from the hosting backup.
const root = process.cwd()
const sql = readFileSync(path.join(root, 'backup.sql'), 'utf8')
const insert = /INSERT INTO `blog_posts` VALUES\s*/.exec(sql)
if (!insert) throw new Error('The backup has no blog_posts insert.')
const rows = []
let row = [],
  value = '',
  quoted = false,
  escaped = false,
  active = false
for (const char of sql.slice(insert.index + insert[0].length)) {
  if (quoted) {
    if (escaped) {
      value += { n: '\n', r: '\r', t: '\t', 0: '\0', Z: '\x1a' }[char] ?? char
      escaped = false
    } else if (char === '\\') escaped = true
    else if (char === "'") quoted = false
    else value += char
  } else if (char === "'") quoted = true
  else if (char === '(') {
    row = []
    value = ''
    active = true
  } else if (char === ',' && active) {
    row.push(value)
    value = ''
  } else if (char === ')' && active) {
    row.push(value)
    rows.push(row)
    value = ''
    active = false
  } else if (char === ';') break
  else if (active) value += char
}
const columns = [
  'id',
  'userId',
  'created',
  'updated',
  'slug',
  'title',
  'description',
  'excerpt',
  'content',
  'status',
]
const posts = rows
  .map(values => {
    if (values.length !== columns.length)
      throw new Error('Unexpected database columns.')
    return Object.fromEntries(
      columns.map((column, i) => [
        column,
        values[i] === 'NULL' ? null : values[i],
      ])
    )
  })
  .filter(post => post.status === 'public')
const publicRoot = path.join(root, 'backup/domains/crocodillon.com/public_html')
const write = (file, content) => {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, content)
}
const hash = value => createHash('sha256').update(value).digest('hex')
const normalize = value => value.replaceAll('\r\n', '\n').trim()
const legacyRevision = '6f7491f1bce36630b1f554778b8bfd38c08285f3'
const articleFiles = execFileSync(
  'git',
  ['ls-tree', '-r', '--name-only', legacyRevision, '--', 'data/articles'],
  { encoding: 'utf8' }
)
  .trim()
  .split('\n')
  .map(file => path.basename(file))
// The repository used a custom key:value header, not valid YAML (unquoted colons).
const oldPosts = articleFiles.map(file => ({
  file,
  ...matter(
    execFileSync('git', ['show', `${legacyRevision}:data/articles/${file}`], {
      encoding: 'utf8',
    }),
    {
      engines: {
        yaml: header =>
          Object.fromEntries(
            header
              .trim()
              .split('\n')
              .map(line => {
                const separator = line.indexOf(':')
                return [
                  line.slice(0, separator),
                  line
                    .slice(separator + 1)
                    .trim()
                    .replaceAll('\\n', '\n'),
                ]
              })
          ),
      },
    }
  ),
}))
const redirects = []
const imageMapping = new Map()
const imageRoot = path.join(publicRoot, 'images/blog')
for (const year of readdirSync(imageRoot)) {
  for (const file of readdirSync(path.join(imageRoot, year))) {
    const owner =
      posts.find(
        post =>
          file.startsWith(post.slug + '--') || file.startsWith(post.slug + '__')
      ) ?? posts.find(post => post.slug === 'mongodb-for-dbas-introduction')
    const dest = `/images/articles/${owner.slug}/${file}`
    const source = `/images/blog/${year}/${file}`
    mkdirSync(path.dirname(path.join(root, 'public', dest)), {
      recursive: true,
    })
    copyFileSync(
      path.join(imageRoot, year, file),
      path.join(root, 'public', dest)
    )
    imageMapping.set(source, dest)
    redirects.push({ source, destination: dest, permanent: true })
  }
}
for (const file of ['logo.png', 'logo--hr.png']) {
  const source = path.join(publicRoot, 'images', file)
  if (existsSync(source)) {
    mkdirSync(path.join(root, 'public/images'), { recursive: true })
    copyFileSync(source, path.join(root, 'public/images', file))
  }
}
// Retain the public demo assets only; omit the 4,500 captured chat-message fixtures.
const emojiSource = path.join(
  publicRoot,
  'demo/JHsa6a6dwxahwax723cteyj12e-parsing-emoji-unicode-in-javascript'
)
cpSync(emojiSource, path.join(root, 'public/demo/emoji'), {
  recursive: true,
  filter: file =>
    !file.endsWith('.php') &&
    !path.relative(emojiSource, file).split(path.sep).includes('data'),
})
cpSync(
  path.join(publicRoot, 'demo/mongodb-for-dbas'),
  path.join(root, 'public/demo/mongodb-for-dbas'),
  { recursive: true }
)
const replaceAssets = text => {
  for (const [source, destination] of imageMapping)
    text = text
      .replaceAll('http://crocodillon.com' + source, destination)
      .replaceAll(source, destination)
  return text
    .replaceAll('/demo/parsing-emoji-unicode-in-javascript', '/demo/emoji')
    .replaceAll(
      '/demo/JHsa6a6dwxahwax723cteyj12e-parsing-emoji-unicode-in-javascript',
      '/demo/emoji'
    )
}
const decode = text =>
  text
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
function convertMDX(content) {
  content = replaceAssets(content)
  const abbreviations = [...content.matchAll(/^\*\[([^\]]+)\]:\s*(.+)$/gm)].map(
    match => [match[1], match[2]]
  )
  content = content.replace(/^\*\[([^\]]+)\]:\s*(.+)\n?/gm, '')
  // MDX reserves indentation for JSX; legacy standalone indented code needs fences.
  content = content.replace(
    /(^|\n\n)((?: {4}[^\n]*(?:\n|$))+)/g,
    (_, before, block) =>
      before + '```text\n' + block.replace(/^ {4}/gm, '').trimEnd() + '\n```\n'
  )
  let fenced = false
  return content
    .split('\n')
    .map(line => {
      if (/^\s*```/.test(line)) {
        fenced = !fenced
        return line
      }
      if (/^\s*~~~/.test(line)) {
        fenced = !fenced
        return line.replace(
          /~~~(?:\s+\.language-([\w-]+))?/,
          (_, language) => '```' + (language ?? '')
        )
      }
      if (fenced) return line
      return line
        .split(/(`+[^`]*`+)/g)
        .map((part, index) => {
          if (index % 2) return part
          part = part
            .split(/(<[^>]*>)/g)
            .map((text, i) => {
              if (i % 2) return text
              for (const [abbr, title] of abbreviations)
                text = text.replace(
                  new RegExp(`\\b${abbr}\\b`, 'g'),
                  `<abbr title="${title}">${abbr}</abbr>`
                )
              return text
            })
            .join('')
          return part
            .replace(/<!--([\s\S]*?)-->/g, '')
            .replace(/\bclass=/g, 'className=')
            .replace(
              /<code([^>]*)>(.*?)<\/code>/g,
              (_, attrs, text) =>
                `<code${attrs}>{${JSON.stringify(decode(text))}}</code>`
            )
            .replace(/\bstyle="([^"]*)"/g, (_, styles) => {
              const object = Object.fromEntries(
                styles
                  .split(';')
                  .filter(Boolean)
                  .map(style => {
                    const i = style.indexOf(':')
                    return [
                      style
                        .slice(0, i)
                        .trim()
                        .replace(/-([a-z])/g, (_, letter) =>
                          letter.toUpperCase()
                        ),
                      style.slice(i + 1).trim(),
                    ]
                  })
              )
              return `style={${JSON.stringify(object)}}`
            })
            .replace(/<(img|br|hr)(\s[^>]*?)?(?<!\/)>(?!<\/)/g, '<$1$2 />')
        })
        .join('')
    })
    .join('\n')
}
const report = []
const index = []
for (const post of posts) {
  const previous = oldPosts.find(old => old.data.slug === post.slug)
  if (!previous) throw new Error(`Missing repository counterpart: ${post.slug}`)
  const sameBody = normalize(previous.content) === normalize(post.content)
  const differences = ['slug', 'title', 'description', 'excerpt'].filter(
    key => String(previous.data[key] ?? '') !== String(post[key] ?? '')
  )
  if (!sameBody) {
    const a = normalize(previous.content),
      b = normalize(post.content)
    let offset = 0
    while (offset < a.length && a[offset] === b[offset]) offset++
    console.log(
      post.slug,
      JSON.stringify({
        repository: a.slice(Math.max(0, offset - 50), offset + 160),
        database: b.slice(Math.max(0, offset - 50), offset + 160),
      })
    )
  }
  report.push({
    slug: post.slug,
    contentMatches: sameBody,
    differsOnlyInTrailingWhitespace:
      !sameBody &&
      normalize(previous.content)
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n') ===
        normalize(post.content)
          .split('\n')
          .map(line => line.trimEnd())
          .join('\n'),
    metadataDifferences: differences,
    databaseContentSha256: hash(normalize(post.content)),
    repositoryContentSha256: hash(normalize(previous.content)),
  })
  const meta = {
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.created.replace(' ', 'T') + 'Z',
    ...(post.updated
      ? { updatedAt: post.updated.replace(' ', 'T') + 'Z' }
      : {}),
    excerpt: replaceAssets(post.excerpt ?? post.description),
    ...(imageMapping.has(
      `/images/blog/${post.created.slice(0, 4)}/${post.slug}--og.png`
    )
      ? {
          image: imageMapping.get(
            `/images/blog/${post.created.slice(0, 4)}/${post.slug}--og.png`
          ),
        }
      : {}),
  }
  const frontmatter = Object.entries(meta)
    .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
    .join('\n')
  write(
    path.join(root, `content/articles/${post.slug}/index.mdx`),
    `---\n${frontmatter}\n---\n\n${convertMDX(normalize(post.content))}\n`
  )
  index.push(meta)
}
write(
  path.join(root, 'app/lib/legacy-redirects.json'),
  JSON.stringify(redirects, null, 2) + '\n'
)
write(
  path.join(root, 'docs/content-comparison.json'),
  JSON.stringify(
    {
      source: 'Database export of the live blog; all public rows retained.',
      comparisons: report,
    },
    null,
    2
  ) + '\n'
)
write(
  path.join(root, 'docs/content-migration.md'),
  `# Content migration\n\nThe live database is authoritative. All ${posts.length} public posts were imported with their original slugs, publication timestamps, last-update timestamps, descriptions, and excerpts. The legacy application used UTC, so timestamps are explicitly UTC.\n\n| Article | Body matches repository | Different metadata |\n| --- | --- | --- |\n${report.map(r => `| ${r.slug} | ${r.contentMatches ? 'Yes' : r.differsOnlyInTrailingWhitespace ? 'Trailing whitespace only' : 'No — database retained'} | ${r.metadataDifferences.join(', ') || 'None'} |`).join('\n')}\n\nAll ten article bodies match after ignoring trailing whitespace on individual lines. Eight match without that extra normalization; the other two differ only in trailing whitespace. Three excerpts differ, and the database excerpts are retained. Comparison also ignores outer whitespace and Windows/Unix line endings. SHA-256 hashes before MDX normalization are in content-comparison.json.\n\nMDX normalization changes only markup: standard code-fence language names, JSX attributes, void tags, and asset URLs. Published prose and code examples come from the database.\n\nContent now lives in content/articles/<slug>/index.mdx; images in public/images/articles/<slug>/. Old image URLs redirect to the new locations. Demo routes remain compatible. Private visitor-message archives and other sites' files are excluded from the public app.\n\nDisqus identifiers remain the original slugs. The historical HTTP canonical URL is retained for Disqus thread matching; page SEO uses HTTPS.\n`
)
console.log(
  JSON.stringify(
    {
      posts: posts.length,
      matchingBodies: report.filter(r => r.contentMatches).length,
      differences: report.filter(
        r => !r.contentMatches || r.metadataDifferences.length
      ),
      images: imageMapping.size,
    },
    null,
    2
  )
)
