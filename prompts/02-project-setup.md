# Phase 1 — Project setup

**Goal:** a clean, strict, production-ready Next.js foundation that matches `docs/03-ARCHITECTURE.md`, living in **`services/frontend/`** inside the pnpm workspace (root `pnpm-workspace.yaml`: `services/frontend`, `audit/scripts`). Run every app command inside `services/frontend/`.

## Tasks

1. Check `pnpm create next-app@latest --help` for the installed version's flags, then scaffold into the empty `services/frontend/` (App Router, TypeScript, ESLint, Tailwind CSS v4, `src/` dir, alias `@/*`, pnpm). Check the installed version's docs for any config/API you use.
2. TypeScript `strict`, `noUncheckedIndexedAccess`. Path alias `@/*` → `src/*`.
3. Install: `motion`, `embla-carousel-react`, `yet-another-react-lightbox`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `clsx`, `tailwind-merge`, `isomorphic-dompurify` (or `sanitize-html`), `date-fns`. Dev: `@playwright/test`, `@axe-core/playwright`, `prettier`, `prettier-plugin-tailwindcss`.
4. Initialize shadcn/ui and add: dialog, sheet, tabs, select, popover, calendar, navigation-menu, accordion, tooltip, sonner. Leave their styling for Phase 2.
5. Create the folder structure from architecture §2 with placeholder `index.ts` files where helpful. Create `src/config/features.ts` (all `false`: `smoothScroll`, `viewTransitions`, `offerPosterLightbox`, `eventCommentForm`). Move the Phase 0 fixtures from the repo-root `src/fixtures/` into `services/frontend/src/fixtures/` and delete the root `src/`; point `audit/scripts/fixtures.mjs` at the new location.
6. `next.config`: `images.remotePatterns` for the media host(s) and `i.ytimg.com`; an **opt-in** fallback rewrite to `LEGACY_ORIGIN` (unset by default, architecture §7); security headers (CSP allowing YouTube-nocookie, Google Maps embed, the media host).
7. `.env.example` with the variables from architecture §11. `DATA_SOURCE=mock` by default.
8. Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `test:e2e`, `test:visual`. Playwright lives in `services/frontend/tests/` and reads baselines from `../../audit/`; the Phase 0 scripts stay in `audit/scripts/` as a workspace package (installed by the root `pnpm install`).
9. Add a "Phase 1" section to `docs/PROGRESS.md`.

## Acceptance criteria

- Inside `services/frontend/`: `pnpm build` passes with zero warnings; `pnpm typecheck` and `pnpm lint` clean. `pnpm install` at the repo root installs both workspace packages.
- A request to an unknown path in `pnpm start` is proxied to `LARAVEL_ORIGIN` (verify with a quick test pointing `LARAVEL_ORIGIN` at the live site).

Stop and report.
