# Project conventions

- Use pnpm and preserve `pnpm-workspace.yaml`: exact dependency versions, 48-hour release age, and explicit build-script permissions.
- Application routes, components, and libraries live in `app/`. `@/` maps to `app/`; do not introduce `src/`.
- Use strict TypeScript, Tailwind CSS, and Server Components by default. Match the Prettier configuration.
- Prefer `.ts` configuration files where supported. PostCSS configuration lives in `package.json` because this Next.js version does not load `postcss.config.ts`.
- Use lowercase conventional commit messages, for example `feat: migrate blog to next.js and mdx`.
- Articles live in `content/articles/<slug>/index.mdx`; article images in `public/images/articles/<slug>/`.
- Preserve published slugs, feeds, existing asset redirects, and Disqus thread identifiers.
- Do not add a test framework or test suite unless requested. Build, lint, and type-check relevant changes.
- This repository is public. Never commit or upload raw backups, SQL exports, account configuration, credentials, visitor messages, or logs. Inspect assets before moving them into `public/`.
- Next.js bundles version-matched documentation in `node_modules/next/dist/docs/`. Read the relevant documentation before changing framework behavior.
