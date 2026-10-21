# Working conventions

- Read [STYLE.md](STYLE.md) before drafting articles or creating images. It defines Dillon's voice and the visual style.
- Use pnpm; keep exact versions, the 48-hour release age, and explicit build permissions in `pnpm-workspace.yaml`.
- Keep application code in root `app/`; `@/` resolves there. Prefer TypeScript configs; PostCSS lives in `package.json`.
- Articles: `content/articles/<slug>/index.mdx`. Images: `public/images/articles/<slug>/`. Preserve published URLs, feeds, redirects, and Disqus identifiers.
- Commit messages use lowercase conventional commits.
- This repository is public: keep backups, SQL, credentials, account details, and visitor data out of commits and uploads.
- Verify relevant changes with build, lint, and types; don't introduce a test suite unless requested. Read bundled `node_modules/next/dist/docs/` when changing framework behavior.
