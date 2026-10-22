# CrocoDillon

A small, statically generated blog built with Next.js App Router, React, MDX, and Tailwind CSS. Content lives in Git; a deployment publishes changes. There is no application database or contact form.

## Development

Use Node.js 24 and the pnpm version pinned in `package.json`.

```sh
pnpm install
pnpm dev
```

```sh
pnpm lint
pnpm check-types
pnpm format:check
pnpm build
pnpm start
```

The pnpm workspace configuration follows Reeflings and Carely: exact versions, a 48-hour minimum release age, and an explicit native build-script allowlist. There is no test runner or test suite.

## Structure

- `app/`: routes, components, and shared library code. `@/` resolves to this directory.
- `content/articles/<slug>/index.mdx`: one article per folder, independent of its publication date.
- `content/articles/<slug>/images/`: co-located illustrations; each diagram is a single editable, theme-aware SVG.
- `public/demo/`: reviewed public assets for the legacy demos.
- `mdx-components.tsx`: the framework-required MDX component registry, at the project root.

See [STYLE.md](STYLE.md) for Dillon's writing voice and the article/social-image conventions.

## Writing an article

Create `content/articles/my-article/index.mdx`:

```mdx
---
slug: 'my-article'
title: 'An article title'
description: 'A short, plain-text summary used in listings, feeds, and metadata.'
publishedAt: '2026-10-22T10:00:00Z'
excerpt: 'An optional richer introduction for future layouts.'
---

Article text, Markdown, and React components go here.

<Callout title="A useful detail">
  This is a shared React component, available in every article.
</Callout>
```

Required frontmatter: `slug`, `title`, `description`, `publishedAt`, and `excerpt`. Optional: `updatedAt`, `image` (an explicit local sharing-image override), and `draft: true`. Quote timestamps and use UTC. Folder and slug must match. Published slugs are permanent. Sharing images are generated automatically at `/blog/<slug>/share.png`, so normally omit `image`.

Use standard fenced code blocks such as ` ```javascript `. GFM tables and footnotes are supported. Code highlighting happens during compilation. MDX uses JSX: write `className`, self-close images, and use React style objects. Only trusted, reviewed repository content is compiled, because MDX can execute JavaScript.

Add global article components to `mdx-components.tsx`, or import components directly in an individual MDX file. Most components should remain Server Components; add `'use client'` only when browser state or APIs are needed.

Import diagrams as React components, for example `import RequestFlow from './images/request-flow.svg'` and `<RequestFlow />`. SVGR compiles article SVGs with Turbopack; inline diagrams inherit the site's CSS theme colors and render with the article, with no separate image request or blur placeholder. Keep titles/descriptions and scoped styles in the SVG source.

For photos and screenshots, use relative static raster imports with `<ArticleImage>` for responsive loading, dimensions, and automatic blur placeholders. Images don't need to live in `public/`. See [STYLE.md](STYLE.md) for examples of both.

## Appearance

The site follows the system color scheme by default. The header toggle saves a light or dark preference; **Auto** restores the system preference. `next-themes` applies the theme with a synchronous inline script before visible content, and the toggle uses CSS-controlled icons to keep server and client markup identical. Pages remain statically generated.

Theme colors live in `app/globals.css`. Code blocks use GitHub Light and GitHub Dark palettes generated together at build time, with CSS selecting the matching token colors.

OG and Twitter cards share a 2400 × 1260 lossless PNG template in `app/lib/social-image.tsx`, with locally bundled fonts. All article cards are generated at build time; the site-wide fallback is `/opengraph-image`.

## Legacy compatibility

`/blog/<slug>`, `/blog/rss`, and `/blog/atom` are preserved. Old illustration URLs redirect to the SVG sources through a statically generated compatibility route, and the original emoji-demo routes redirect to their new locations. `/contact` and `/webdesign` redirect home. Feeds retain historical entry IDs to avoid duplicate subscriptions.

Disqus uses the existing `crocodillon` forum, original slug identifiers, and historical thread URLs. Comments load automatically when the discussion approaches the viewport. Once loaded, the comment frame refreshes when the resolved color theme changes. The contact form and old financial/contact details are removed.

## Deployment

Deploy this repository as a Next.js project on Vercel, using Node.js 24 and pnpm. No environment variables are required. The canonical site URL is set in `app/lib/site.ts`.

Use the Vercel Git integration for subsequent pushes. Domain registration can stay at VDX: hosting migration requires DNS changes, not a registrar transfer. Configure the apex domain as canonical and redirect `www` to it when connecting domains.

Vercel Web Analytics is mounted once in the root layout and tracks page views, including client-side navigation. Enable Web Analytics for the Vercel project before deploying; no analytics keys or environment variables are needed.

## Backup handling

This is a public repository. Raw hosting files and SQL exports remain local, ignored by Git and Vercel uploads. They contain credentials and visitor data. The deployment includes only the migrated public articles and reviewed assets.

Git deployments use the committed repository. `.vercelignore` is optional, but this checkout contains private local backups, so a small file excludes those and other local-only files from any future CLI upload. Vercel already ignores standard build output and dependency directories.

Configuration files use TypeScript where supported. ESLint uses `eslint.config.ts` with `jiti`; Next.js and Prettier also use TypeScript. The installed Next.js version does not discover `postcss.config.ts`, so the small PostCSS configuration lives in `package.json` instead.
