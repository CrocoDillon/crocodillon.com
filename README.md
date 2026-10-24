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

The pnpm workspace configuration follows Reeflings and Carely: exact versions, a 48-hour minimum release age, and an explicit native build-script allowlist. Each article demo has its own workspace and lockfile; the commands above only install, build, and type-check the site. There is no test runner or test suite.

## Structure

- `app/`: routes, components, and shared library code. `@/` resolves to this directory.
- `content/articles/<slug>/index.mdx`: one article per folder, independent of its publication date.
- `content/articles/<slug>/images/`: co-located illustrations; each diagram is a single editable, theme-aware SVG.
- `content/articles/<slug>/demo/dist/`: committed demo HTML and build provenance, served through the publication-gated demo route.
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

### Draft review and scheduled publication

Both the public blog and the protected preview blog build from the default branch (`main`). Keep drafts in the repository alongside published articles:

- `draft: true`: visible only in preview, regardless of the date.
- `draft: false` (or omitted) with a future `publishedAt`: scheduled; visible only in preview until its date arrives.
- `draft: false` (or omitted) with a past `publishedAt`: included in the next successful public build.

Publication rules apply to article URLs, sharing cards, the homepage, archive, feeds, and sitemap. A future date alone does not start a deployment. A push can publish an eligible article earlier than the daily rebuild; the date is an eligibility time, not an exact release time.

Review articles at `https://preview.crocodillon.com`. The preview includes every article, status labels, and a `/drafts` publication queue. Dates and statuses reflect its latest build. It uses its own metadata URLs, blocks indexing, and disables analytics and Disqus. Preview feeds contain only published articles; the preview sitemap is empty. Vercel Authentication uses **Standard Protection** to protect non-production deployments, including the preview custom domain, while keeping the public production domains accessible. `noindex` is additional indexing guidance, not access protection.

Both deployments use the existing `crocodillon` Vercel project and its built-in **Production** and **Preview** environments. Set `ARTICLE_PREVIEW=true` only in Preview; production leaves it unset or false. Production cron secrets are scoped only to production. No separate project or custom environment is needed.

Vercel does not allow the Production branch to be assigned to a Preview domain. `.github/workflows/preview.yml` therefore fast-forwards a deployment-only `preview` branch to the same commit whenever `main` changes. It creates no commits and uses the short-lived GitHub workflow token with repository contents permission; no stored deployment credentials are needed. The workflow skips superseded runs and refuses non-fast-forward updates. Keep all editing and approvals on `main`; do not commit directly to `preview`.

Vercel's Git integration builds Production from `main` and Preview from the mirrored `preview` branch. `preview.crocodillon.com` follows that branch's latest Preview deployment. PR branches still get their own Preview deployments, but do not replace this domain. The branch sync is event-driven; all daily publication scheduling stays in Vercel Cron. To review locally, set `ARTICLE_PREVIEW=true` in `.env.local` and run `pnpm dev`. Restart after changing the flag.

The production environment runs Vercel Cron daily at **07:00 UTC** (`0 7 * * *` in `vercel.ts`). Its authenticated `/api/cron/publish` endpoint requests fresh Production and Preview builds through deploy hooks targeting `main` and `preview`, respectively. This keeps the public site and `preview.crocodillon.com` publication statuses in sync. Preview has no cron jobs of its own. The handler disables deploy-hook build caching so publication dates are evaluated again even when the commit has not changed. Both rebuilds are attempted independently; a missing or failing hook makes the cron request fail without preventing the other rebuild.

For a daily batch, use **04:00 UTC** on each intended publication day:

```yaml
publishedAt: '2026-11-01T04:00:00Z'
draft: false
```

The article becomes eligible three hours before the scheduled rebuild. In Amsterdam, the publication timestamp is 05:00 in winter / 06:00 in summer; the rebuild starts at 08:00 / 09:00 respectively. Both UTC times stay fixed across daylight saving changes. Review and approve a batch in one commit, assigning consecutive dates. No daily commits are needed. Keep existing published timestamps unchanged.

Vercel Cron is best effort and does not retry failed invocations. Publication happens when the resulting deployment succeeds, so the three-hour gap is the normal lag rather than a guaranteed maximum. Check Vercel's cron and deployment logs if an article is late; run the job manually or redeploy after fixing a failure. Choosing a publication time after the daily cron can defer publication until the next day.

Production requires three Vercel-only secrets: `CRON_SECRET` (a random bearer secret Vercel adds to cron requests), `PUBLISH_DEPLOY_HOOK_URL` (the project's deploy hook for `main`), and `PREVIEW_DEPLOY_HOOK_URL` (the same project's deploy hook for `preview`). Keep all three out of Git and preview environments. The endpoint rejects requests when its secret is missing and never returns hook URLs. `.env.example` documents the keys without values.

This repository is public: drafts committed here are publicly readable as source, even though the preview website requires authentication.

Use standard fenced code blocks such as ` ```javascript `. GFM tables and footnotes are supported. Code highlighting happens during compilation. MDX uses JSX: write `className`, self-close images, and use React style objects. Only trusted, reviewed repository content is compiled, because MDX can execute JavaScript.

Add global article components to `mdx-components.tsx`, or import components directly in an individual MDX file. Most components should remain Server Components; add `'use client'` only when browser state or APIs are needed.

Import diagrams as React components, for example `import RequestFlow from './images/request-flow.svg'` and `<RequestFlow />`. SVGR compiles article SVGs with Turbopack; inline diagrams inherit the site's CSS theme colors and render with the article, with no separate image request or blur placeholder. Keep titles/descriptions and scoped styles in the SVG source.

For photos and screenshots, use relative static raster imports with `<ArticleImage>` for responsive loading, dimensions, and automatic blur placeholders. Images don't need to live in `public/`. See [STYLE.md](STYLE.md) for examples of both.

## Interactive article examples

Demo sources live beside their article in `content/articles/<slug>/demo/`.
`codepen.json` lists the source files and Pen metadata; `codepen.lock.json` records
the Pen ID, saved version, URLs, and hashes of the last sync. Commit both with
the source and article. Edit the repository sources, then sync while preparing
the draft:

```sh
pnpm demo:sync angular-date-time-controls-with-ngcontrol --dry-run
pnpm demo:sync angular-date-time-controls-with-ngcontrol
```

Set `CODEPEN_API_KEY` in the local shell first. Keep it out of Git, command-line
arguments, article frontmatter, browser code, and Vercel. The website and its
builds need no CodePen key and make no CodePen API calls.

The first creation requires `--create`. Before creating, the command searches
for the demo’s stable identity tag to recover a Pen whose ID was not recorded
after an interrupted request. Once a Pen exists, updates reuse its ID. Unchanged
sources and versions need one read and no write. Changes outside Git stop the
sync for reconciliation; writes use `expected_version_id` to reject concurrent
edits. Each update sends all changed source files in one version, waits for its
build, and reads back the compiler’s resulting files. A failed build retains the
Pen ID so fixing it does not consume another creation.

Sync is an explicit writing step, independent of pushes, preview builds, and the
daily publication cron. Batch the initial creations across days to stay within
the account’s allowance; use updates for revisions. A free Pen is public even
when its article is still a draft.

After the article’s public deployment succeeds, re-run `pnpm demo:sync <slug>`
to add its backlink inside the Pen. Sync checks that the article is neither a
draft nor scheduled and that its public URL returns HTTP 200. Until then, the
Pen has no article backlink. Standard UTM parameters (`utm_source=codepen`,
`utm_medium=referral`, and the article slug as `utm_campaign`) attribute arrivals
without adding an analytics script to the Pen or its sandbox. Native UTM
dashboard filtering requires Web Analytics Plus or Enterprise. There is no
custom arrival event; campaign attribution is left to Web Analytics.

Vercel Web Analytics custom events require Pro or Enterprise and are enabled
only for published articles on Production deployments:

- `DemoRun`, source `blog`: the reader presses “Run example”. This records intent, not a
  guarantee that the demo finished loading.
- `DemoOpen`, source `codepen`: the reader follows the article’s CodePen link.

Each event carries only `{ article: slug, source }` and is sent at most once per
source per mounted article view. Only known sources are accepted. No form values, custom visitor IDs, or persistent tracking state
are collected. Development and Preview send none of these events, and the
sandbox never sends analytics events or page views. Compare each event’s count,
filtered by article, with that article’s page views over the same date range.
The ratio describes actions per page view, not unique-person conversion; ad
blockers and failed loads can prevent collection. No UTM-filtering add-on is
needed for these two interaction events.

`content/demos/theme.css` supplies the blog palette, typography, spacing,
light/dark colors, and Material system-token overrides. It is copied into each
Pen during sync, so published demos use a snapshot of the shared style. Re-sync
an example to adopt later theme changes. On-site demos link to `/demo/theme.css`,
served separately by the blog with the font embedded as a data URL. Theme edits
do not change or rebuild the compiled demo artifacts.
Local demo styles cover only that example’s layout. Pin its package versions
independently of the blog.

The Angular demo uploads three editable source files: `index.html`, `index.css`,
and the original `index.ts`. CodePen’s TypeScript Block compiles it. The compiler
creates its own configuration files; sync pins their dependencies and compiler
settings after scaffolding. A generated import map resolves the pinned browser
packages. CodePen emits TypeScript without checking npm declarations; full
TypeScript checking runs independently in the selected demo using the commands
below. This does not perform Angular template checking.

Embed a synced demo with the registered MDX component:

```mdx
import demo from './demo/codepen.lock.json'

<ArticleDemo title="A working example" slug="my-article" penUrl={demo.editorUrl} />
```

The article renders a static placeholder and link. Its iframe is added only
after “Run example” is pressed, keeping sandbox startup out of initial article
loading. `/demo/<slug>` serves the self-hosted example; CodePen is the optional
editor. Demo routes follow the same draft and scheduling rules as their articles.
On activation, the panel keeps its measured idle height and shows a loading
state while the iframe loads invisibly. Only a validated content-height message
reveals the example and resizes the panel; there is no guessed initial height.
Loading and resizing animations respect reduced-motion preferences.

`pnpm install`, `pnpm dev`, `pnpm build`, and `pnpm check-types` at the repository
root do not install, compile, or type-check demos. Each demo has an independent
`package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`, including pinned
esbuild and TypeScript versions. Old demo dependencies are absent from the site's
lockfile. The site reads committed `demo/dist/index.html` files; no demo compiler
or installed demo dependencies are needed to deploy them.

To work on one demo, replace the example slug in these commands:

```sh
pnpm --dir content/articles/angular-date-time-controls-with-ngcontrol/demo install --frozen-lockfile
pnpm --dir content/articles/angular-date-time-controls-with-ngcontrol/demo check-types
pnpm demo:build angular-date-time-controls-with-ngcontrol
```

The build requires an explicit article slug and only replaces that demo's
`dist/index.html` and `dist/build.json` after compilation succeeds. Alternatively,
run `pnpm build` inside that demo's directory. Commit its source, lockfile, and
updated `dist/` together, then reload the article during local development.
`build.json` records the source/toolchain hashes and Node version used to produce
the HTML. Preserve the existing artifact if an old toolchain stops building;
unrelated site deployments continue to use it. Add a new demo's compiled artifact
before publishing its article; missing artifacts are not automatically rebuilt.

The demo build inlines JavaScript, Material CSS, and example-specific styles into
one HTML document. The shared theme loads separately from `/demo/theme.css`,
between Material CSS and the example's styles to preserve their cascade. Angular
is never imported by the blog's React components.

The parent event handlers live in `app/components/article-demo-client.tsx`.
The child bridge lives in `content/demos/frame.js`, served by the site at
`/demo/frame.js` and referenced by the frozen HTML rather than bundled into it.
Both sides can therefore be updated with a site deployment without rebuilding
demo dependencies. Preserve these contracts for all committed demos:

- Parent → child: `{ type: 'article-demo-theme', theme: 'light' | 'dark' }`;
  the child applies `data-theme` to its document root.
- Child → parent: `{ type: 'article-demo-resize', height: number }`, measured in
  CSS pixels. The parent accepts finite heights from 200 through 5000.
- The parent checks the sending iframe window; the child checks `event.source`
  against `parent`. Sandboxed origins require `'*'` as the target origin.

Keep message names, payload meanings, and the bridge's expected DOM structure
compatible with existing artifacts. Additive changes can use the same bridge;
breaking changes need a versioned bridge URL and support for older messages in
the parent. Shared CSS and bridge edits need only a site rebuild. CodePen keeps
its separate three-file sync workflow.

The iframe uses `sandbox="allow-scripts"`, with no same-origin access, forms,
popups, or top-level navigation. Its CSP permits same-origin stylesheets and the
shared bridge script while blocking fetch/XHR connections and external assets.
Angular JIT needs `unsafe-eval` inside this isolated document; this permission
does not apply to the containing blog. Messages update the demo’s theme without
resetting its form and resize the iframe to its content, avoiding nested page
scrollbars. The parent checks the sending window and accepts only a bounded
height; form values stay inside the sandbox. Only reviewed repository code is bundled;
this is not an editor or a service for executing visitor-submitted code.

Give article snippets an application filename using fenced code metadata, for
example `ts title="app.ts"` or `html title="app.html"`. When CodePen combines
these files into `index.ts`, mark each virtual TypeScript file with a line comment
and each inline template with an HTML comment, using the same names as the article.

See CodePen’s [API documentation](https://blog.codepen.io/docs/api/api-v2/)
for current limits, build behavior, and key rotation.

## Appearance

The site follows the system color scheme by default. The header toggle saves a light or dark preference; **Auto** restores the system preference. `next-themes` applies the theme with a synchronous inline script before visible content, and the toggle uses CSS-controlled icons to keep server and client markup identical. Pages remain statically generated.

Theme colors live in `app/globals.css`. Code blocks use GitHub Light and GitHub Dark palettes generated together at build time, with CSS selecting the matching token colors.

OG and Twitter cards share a 2400 × 1260 lossless PNG template in `app/lib/social-image.tsx`, with locally bundled fonts. All article cards are generated at build time; the site-wide fallback is `/opengraph-image`.

## Legacy compatibility

`/blog/<slug>`, `/blog/rss`, and `/blog/atom` are preserved. Old illustration URLs redirect to the SVG sources through a statically generated compatibility route, and the original emoji-demo routes redirect to their new locations. `/contact` and `/webdesign` redirect home. Feeds retain historical entry IDs to avoid duplicate subscriptions.

Disqus uses the existing `crocodillon` forum, original slug identifiers, and historical thread URLs. Comments load automatically when the discussion approaches the viewport. Once loaded, the comment frame refreshes when the resolved color theme changes. The contact form and old financial/contact details are removed.

## Deployment

Deploy this repository as a Next.js project on Vercel, using Node.js 24 and pnpm. The public site URL is set in `app/lib/site.ts`; `app/lib/site-server.ts` selects the preview URL for review builds. See the draft review and scheduled publication instructions above for the preview flag and production cron secrets.

Use the Vercel Git integration for subsequent pushes. Domain registration can stay at VDX: hosting migration requires DNS changes, not a registrar transfer. Configure the apex domain as canonical and redirect `www` to it when connecting domains.

Vercel Web Analytics is mounted once in the root layout and tracks page views, including client-side navigation. Enable Web Analytics for the Vercel project before deploying; no analytics keys or environment variables are needed.

Git deployments use the committed repository. `.vercelignore` keeps local QA artifacts, environment files, and temporary files out of CLI uploads. Vercel already ignores standard build output and dependency directories.

Configuration files use TypeScript where supported. ESLint uses `eslint.config.ts` with `jiti`; Next.js and Prettier also use TypeScript. The installed Next.js version does not discover `postcss.config.ts`, so the small PostCSS configuration lives in `package.json` instead.
