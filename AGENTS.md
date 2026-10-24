# Working conventions

- Read [STYLE.md](STYLE.md) before drafting articles or creating images. It defines Dillon's voice and the visual style.
- Use pnpm; keep exact versions, the 48-hour release age, and explicit build permissions in `pnpm-workspace.yaml`.
- Keep application code in root `app/`; `@/` resolves there. Prefer TypeScript configs; PostCSS lives in `package.json`.
- Articles: `content/articles/<slug>/index.mdx`. Co-locate images and editable SVGs in `content/articles/<slug>/images/`. Preserve published URLs, feeds, redirects, and Disqus identifiers.
- Commit messages use lowercase conventional commits.
- This repository is public: keep backups, SQL, credentials, account details, and visitor data out of commits and uploads.
- Verify relevant changes with build, lint, and types; don't introduce a test suite unless requested. Read bundled `node_modules/next/dist/docs/` when changing framework behavior.

## Toolchain and architecture

- Use Node.js 24 and the pnpm version pinned in `package.json`. Root commands do not install, compile, or type-check article demos.
- Keep pages statically generated and prefer Server Components; add `'use client'` only for browser state or APIs. Compile only trusted, reviewed MDX, which can execute JavaScript.
- Keep `mdx-components.tsx` at the project root. PostCSS stays in `package.json` because the installed Next.js version does not discover `postcss.config.ts`.
- Theme colors live in `app/globals.css`; preserve system/light/dark behavior and avoid theme hydration mismatches. Sharing-card rendering lives in `app/lib/social-image.tsx` and uses bundled fonts.

## Articles and publication

- Required frontmatter: `slug`, `title`, `description`, `publishedAt`, and `excerpt`. Optional: `updatedAt`, `image`, and `draft`. Match folder and slug; quote UTC timestamps and preserve existing published timestamps.
- Sharing images are generated at `/blog/<slug>/share.png`; normally omit the `image` override. Import SVGs as theme-aware React components and raster images through `<ArticleImage>`; follow `STYLE.md`.
- Use fenced-code metadata such as `ts title="app.ts"`. Keep snippet filenames consistent with comments marking virtual files and inline templates in demo sources.
- `draft: true` stays out of the public site regardless of date. A future `publishedAt` schedules eligibility; eligible articles appear after a successful build. Apply these rules to article/demo routes, sharing cards, listings, feeds, and sitemap. See `app/lib/posts.ts` and `app/lib/publication.ts`.
- For daily batches, use `04:00 UTC` on consecutive publication days, with `draft: false`. The daily rebuild starts at `07:00 UTC`; timestamps do not trigger deployments or guarantee an exact release time. A push can publish an eligible article sooner. Check cron/deployment logs after failures.
- Draft source committed to this public repository is publicly readable, even when the review website requires authentication.

## Deployment and review

- Use the existing `crocodillon` Vercel project with built-in Production and Preview environments. Production builds from `main`; `.github/workflows/preview.yml` fast-forwards the deployment-only `preview` branch to the same commit. Do not edit or commit directly to `preview`, force its mirror, or add stored workflow credentials.
- Review at `https://preview.crocodillon.com`, including the `/drafts` queue. Keep non-production deployments protected with Vercel Authentication. Preview uses its own metadata URLs, blocks indexing, disables analytics/Disqus, exposes only published articles in feeds, and has an empty sitemap. Statuses reflect the latest build.
- Set `ARTICLE_PREVIEW=true` only for Preview or local review in `.env.local`; restart the local server after changing it. Production leaves it unset or false. Public and review URL selection lives in `app/lib/site.ts` and `app/lib/site-server.ts`.
- Production-only settings: `CRON_SECRET`, `PUBLISH_DEPLOY_HOOK_URL` (targeting `main`), and `PREVIEW_DEPLOY_HOOK_URL` (targeting `preview`). Store values in Vercel, never Git, logs, responses, or Preview. There is no tracked environment template.
- `vercel.ts` schedules `/api/cron/publish` at `0 7 * * *` in Production only. Preserve bearer authentication, independent attempts of both hooks, and disabled hook build caching so unchanged commits reevaluate dates.
- Keep the apex domain canonical and redirect `www`. Preserve `.vercelignore` exclusions for local artifacts, environment files, and temporary files.

## Demo builds and sandbox contracts

- Each `content/articles/<slug>/demo/` owns its package manifest, workspace config, and lockfile. Pin dependencies independently; keep demo frameworks out of the blog's dependency graph.
- Install and type-check within the selected demo, then run `pnpm demo:build <slug>`. Commit sources, lockfiles, `dist/index.html`, and `dist/build.json` together. The site consumes committed artifacts and never rebuilds missing demos. Preserve working artifacts if an old toolchain stops building.
- `app/lib/demo-document.ts` replaces `/demo/theme.css` and `/demo/frame.js` insertion slots with current shared CSS, embedded font, and bridge. Preserve the slots and CSS order: Material, shared theme, example styles. Shared CSS/bridge edits need no demo rebuild.
- Parent: `app/components/article-demo-client.tsx`; child: `content/demos/frame.js`. Preserve `{ type: 'article-demo-theme', theme: 'light' | 'dark' }` and `{ type: 'article-demo-resize', height: number }`. Validate sending windows and finite heights of 200–5000 CSS pixels; opaque sandbox origins require `'*'`. Breaking changes need versioned slots and backward compatibility for committed artifacts.
- Keep the iframe on demand, preserve idle height until a validated resize reveals it, and respect reduced motion. Preserve `sandbox="allow-scripts"` and the CSP in `app/demo/[slug]/route.ts`: no external scripts/styles, network connections, or same-origin access. Angular JIT's `unsafe-eval` allowance applies only inside the sandbox. Keep form values inside it.

## CodePen and analytics

- Commit `codepen.json` and `codepen.lock.json` with demo sources. Use `pnpm demo:sync <slug> --dry-run` before syncing; first creation requires `--create`. Reuse the existing Pen ID, reconcile remote edits, and preserve version conflict checks and build/readback verification in `scripts/sync-codepen.mjs`.
- Supply `CODEPEN_API_KEY` only through the local shell; keep it out of Git, command-line arguments, browser code, frontmatter, and Vercel. Site builds need no key. Sync is an explicit writing step; respect creation allowances and remember Pens are public even for draft articles.
- Upload the original `index.html`, `index.css`, and `index.ts`; let CodePen compile TypeScript. Keep pinned browser imports/compiler settings. Run demo type checks separately; CodePen compilation does not check npm declarations or Angular templates.
- Re-sync after publication to add the article backlink, which requires a public HTTP 200 response. CodePen receives a snapshot of `content/demos/theme.css`; re-sync to adopt theme changes.
- Keep Web Analytics mounted once in the root layout. Preserve production/published-only `DemoRun` (`blog`) and `DemoOpen` (`codepen`) events with only `{ article: slug, source }`, once per source per mounted article view. Keep analytics out of the sandbox and do not collect form values or persistent visitor identifiers. Event/page-view ratios measure actions, not unique visitors.

## Legacy compatibility

- Preserve `/blog/<slug>`, `/blog/rss`, `/blog/atom`, and historical feed entry IDs. Keep old illustration URLs and emoji demos redirected, and `/contact` and `/webdesign` redirected home.
- Preserve the `crocodillon` Disqus forum, original slug identifiers, and historical thread URLs. Keep comments lazy-loaded and refresh their theme when the resolved site theme changes.
