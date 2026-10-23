import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const hash = value =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')
const fileHash = files =>
  hash(
    files
      .map(({ path, content }) => ({ path, content }))
      .sort((a, b) => a.path.localeCompare(b.path))
  )
const metadataHash = ({ title, description, tags }) =>
  hash({ title, description, tags: [...tags].sort() })

export async function syncCodePen({
  slug,
  create = false,
  apiKey,
  dryRun = false,
  log = console.log,
}) {
  if (!/^[a-z0-9-]+$/.test(slug ?? ''))
    throw new Error('Provide a valid article slug.')
  const directory = path.join(root, 'content/articles', slug, 'demo')
  const config = JSON.parse(
    await fs.readFile(path.join(directory, 'codepen.json'), 'utf8')
  )
  const lockPath = path.join(directory, 'codepen.lock.json')
  let lock = {}
  try {
    lock = JSON.parse(await fs.readFile(lockPath, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const files = await Promise.all(
    config.files.map(async name => {
      if (name.includes('/') || name.includes('\\') || name.startsWith('.'))
        throw new Error(
          'Demo source files must be explicit filenames in the demo folder.'
        )
      let content = await fs.readFile(path.join(directory, name), 'utf8')
      if (name === 'index.css')
        content =
          (await fs.readFile(
            path.join(root, 'content/demos/theme.css'),
            'utf8'
          )) +
          '\n' +
          content
      return { path: '/' + name, content }
    })
  )
  // Pin browser imports without uploading a fourth editable source file.
  // CodePen's TypeScript Block compiles index.ts itself; never transpile it here.
  const { dependencies } = JSON.parse(
    await fs.readFile(path.join(directory, 'package.json'), 'utf8')
  )
  const imports = Object.fromEntries(
    Object.entries(dependencies).flatMap(([name, version]) => [
      [name, `https://esm.sh/*${name}@${version}`],
      [name + '/', `https://esm.sh/*${name}@${version}/`],
    ])
  )
  const html = files.find(file => file.path === '/index.html')
  html.content = html.content.replace(
    '</head>',
    `<script type="importmap">${JSON.stringify({ imports }, null, 2)}</script>\n  </head>`
  )
  const compiler = JSON.parse(
    await fs.readFile(path.join(directory, 'tsconfig.json'), 'utf8')
  )
  // CodePen compiles the original TS; npm declarations are checked locally.
  compiler.compilerOptions.noCheck = true
  const configuration = [
    {
      path: '/tsconfig.json',
      content: JSON.stringify(compiler, null, 2) + '\n',
    },
    {
      path: '/package.json',
      content: JSON.stringify({ dependencies }, null, 2) + '\n',
    },
  ]
  const sourceUrl = `https://github.com/CrocoDillon/crocodillon.com/tree/main/content/articles/${slug}/demo`
  const identityTag = 'demo-' + hash(config.key).slice(0, 12)
  const metadata = {
    title: config.title,
    description: `${config.description}\n\nSource: ${sourceUrl}`,
    tags: [...config.tags, identityTag],
  }
  const sourceHash = hash({ files, configuration, metadata })
  if (dryRun) {
    log(
      JSON.stringify({
        penId: lock.penId ?? null,
        localChanges: lock.sourceHash !== sourceHash,
        files: files.map(f => f.path),
      })
    )
    return lock
  }
  if (!apiKey)
    throw new Error(
      'Set CODEPEN_API_KEY in your shell. It is never needed by the website.'
    )
  const api = async (method, endpoint, body) => {
    const response = await fetch('https://api.codepen.io/v2/' + endpoint, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(65000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const result = await response.json()
    if (!response.ok)
      throw new Error(
        `CodePen ${response.status}: ${result.code ?? 'request failed'} — ${(result.message ?? '').replaceAll(apiKey, '[redacted]')}`
      )
    return result
  }
  const save = async () =>
    fs.writeFile(lockPath, JSON.stringify(lock, null, 2) + '\n')
  let pen
  let build
  if (!lock.penId) {
    const matches = await api(
      'GET',
      `pens?editor=V2&tags=${identityTag}&per_page=100`
    )
    if (matches.length > 1)
      throw new Error(
        'Multiple Pens match this demo. Select its penId in codepen.lock.json.'
      )
    if (matches.length === 1) {
      pen = matches[0]
      lock.penId = pen.id
      await save()
      log(`Recovered existing Pen ${pen.id}.`)
    } else {
      if (!create)
        throw new Error(
          'No Pen exists. Run again with --create to use one daily creation.'
        )
      pen = await api('POST', 'pens', {
        ...metadata,
        access: 'Public',
        files,
        wait: 45,
      })
      lock = { penId: pen.id, editorUrl: pen.urls.editor }
      // Record the ID even when the build fails, so retries update this Pen.
      await save()
      build = pen.build ?? pen.saved_version?.build
      log(`Created Pen ${pen.id}.`)
    }
  }
  if (!build) {
    pen = await api('GET', `pens/${lock.penId}`)
    if (lock.metadataHash && metadataHash(pen) !== lock.metadataHash) {
      throw new Error(
        'The Pen metadata was edited outside this repository. Reconcile it before syncing.'
      )
    }
    if (
      ['Queued', 'Running', 'Canceled'].includes(
        pen.saved_version?.build?.status
      )
    ) {
      throw new Error(
        'The current Pen build has not settled. Wait for it before syncing again.'
      )
    }
    if (
      lock.sourceHash === sourceHash &&
      lock.versionId === pen.saved_version.id &&
      metadataHash(pen) === metadataHash(metadata)
    ) {
      if (!lock.metadataHash) {
        lock.metadataHash = metadataHash(pen)
        await save()
      }
      log('No changes; no write or build needed.')
      return lock
    }
    const remoteFiles = await api('GET', `pens/${pen.id}/files`)
    const ownedPaths = lock.ownedPaths ?? files.map(file => file.path)
    const ownedRemote = remoteFiles.filter(f => ownedPaths.includes(f.path))
    if (lock.remoteHash && fileHash(ownedRemote) !== lock.remoteHash) {
      throw new Error(
        'The Pen was edited outside this repository. Copy those changes into the demo and reconcile codepen.lock.json before syncing.'
      )
    }
    if (
      lock.configurationHash &&
      fileHash(
        remoteFiles.filter(file =>
          configuration.some(config => config.path === file.path)
        )
      ) !== lock.configurationHash
    )
      throw new Error(
        'The CodePen compiler configuration was edited outside Git. Reconcile it before syncing.'
      )
    if (
      pen.title !== metadata.title ||
      pen.description !== metadata.description ||
      JSON.stringify([...pen.tags].sort()) !==
        JSON.stringify([...metadata.tags].sort())
    ) {
      await api('PATCH', `pens/${pen.id}`, metadata)
    }
    const written = await api('PUT', `pens/${pen.id}/files`, {
      files: [
        ...ownedRemote
          .filter(remote => !files.some(local => local.path === remote.path))
          .map(file => ({ path: file.path, delete: true })),
        ...files,
        // Compiler-created config files don't use the three editable-file slots.
        ...configuration.filter(config =>
          remoteFiles.some(file => file.path === config.path)
        ),
      ],
      expected_version_id: pen.saved_version.id,
      wait: 45,
    })
    build = written.build
  }
  async function settle(current) {
    for (let attempt = 0; attempt < 12; attempt++) {
      const next = current.status === 'Canceled' ? current.next_id : null
      if (!next && !['Queued', 'Running'].includes(current.status))
        return current
      await new Promise(resolve => setTimeout(resolve, 10000))
      current = await api('GET', `builds/${next ?? current.id}`)
    }
    throw new Error(
      'The CodePen build is still running. Wait before syncing again.'
    )
  }
  build = await settle(build)
  // The compiler may have added or patched configuration files. Read its head.
  pen = await api('GET', `pens/${lock.penId}`)
  let savedFiles = await api('GET', `pens/${lock.penId}/files`)
  const configChanges = configuration.filter(config =>
    savedFiles.some(
      file => file.path === config.path && file.content !== config.content
    )
  )
  if (configChanges.length) {
    const written = await api('PUT', `pens/${pen.id}/files`, {
      files: configChanges,
      expected_version_id: pen.saved_version.id,
      wait: 45,
    })
    build = await settle(written.build)
    pen = await api('GET', `pens/${lock.penId}`)
    savedFiles = await api('GET', `pens/${lock.penId}/files`)
  }
  lock = {
    penId: pen.id,
    editorUrl: pen.urls.editor,
    previewUrl: pen.urls.preview,
    versionId: pen.saved_version.id,
    metadataHash: metadataHash(pen),
    ...(build.status === 'Success' ? { sourceHash } : {}),
    remoteHash: fileHash(
      savedFiles.filter(f => files.some(local => local.path === f.path))
    ),
    ownedPaths: files.map(file => file.path),
    configurationHash: fileHash(
      savedFiles.filter(file =>
        configuration.some(config => config.path === file.path)
      )
    ),
  }
  await save()
  if (build.status !== 'Success') {
    const details = (build.errors ?? [])
      .map(error => `${error.path ?? ''}: ${error.message}`)
      .join('\n')
    throw new Error(`Pen saved, build ${build.status}. ${details}`)
  }
  log(`Build successful. ${lock.editorUrl}`)
  return lock
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const [slug, ...flags] = process.argv.slice(2)
  if (flags.some(flag => !['--create', '--dry-run'].includes(flag)))
    throw new Error('Supported flags: --create, --dry-run')
  syncCodePen({
    slug,
    create: flags.includes('--create'),
    dryRun: flags.includes('--dry-run'),
    apiKey: process.env.CODEPEN_API_KEY,
  }).catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
