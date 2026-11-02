# CrocoDillon

Source for [crocodillon.com](https://crocodillon.com), Dillon's blog. Built with Next.js, React, MDX, and Tailwind CSS.

## Development

Use the pnpm version pinned in `package.json`.

```sh
pnpm install
pnpm dev
```

Run checks and build the site:

```sh
pnpm lint
pnpm check-types
pnpm format:check
pnpm build
```

Use `pnpm start` to serve the production build locally.

## Structure

- `app/`: routes, components, and shared code; `@/` resolves here.
- `content/articles/<slug>/index.mdx`: articles.
- `content/articles/<slug>/images/`: article images and editable SVGs.
- `content/articles/<slug>/demo/`: independent demo projects and compiled output.
- `content/demos/`: shared demo styles and iframe bridge.
- `mdx-components.tsx`: shared article components.

## Articles

Each article has its own folder, with frontmatter and MDX in `index.mdx`. Follow an existing article for the format, and see [STYLE.md](STYLE.md) for writing and image conventions.

Use fenced code blocks for snippets, import SVG diagrams as React components, and use `<ArticleImage>` for photos and screenshots. Shared components are registered in `mdx-components.tsx`.

### Tags

Use one to three tags for the subjects an article teaches or discusses, rather than every technology it mentions:

```yaml
tags: ['css', 'javascript', 'performance']
```

Tag slugs, display names, and descriptions live in `app/lib/tags.ts`. Add a new entry when an article focuses on a subject that needs its own destination. Tags are optional and default to an empty list. Unknown slugs, duplicate tags, and values other than arrays fail the build.

The archive links to static topic pages at `/blog/tags/<tag>`, and articles link to their topics. Counts, listings, generated routes, and sitemap entries follow article publication rules. Empty topics have no public page or navigation entry. Preview includes draft and scheduled articles in its topics and keeps its sitemap empty.

## Demos

Demos have their own dependencies and lockfiles. Root commands check and build the blog; work on a demo separately:

```sh
pnpm --dir content/articles/<slug>/demo install --frozen-lockfile
pnpm --dir content/articles/<slug>/demo check-types
pnpm demo:build <slug>
```

Commit demo sources, lockfiles, and updated `dist/` files together. Embed examples with `<ArticleDemo>`; readers load them on demand in a sandboxed iframe. CodePen sync is available through `pnpm demo:sync <slug>`.

## Compatibility

Existing article URLs, RSS and Atom feeds, redirects, and Disqus thread identifiers are preserved.
