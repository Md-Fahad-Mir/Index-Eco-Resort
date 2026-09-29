# CLAUDE.md — INDEX Eco Resort · Next.js Premium Frontend

## Mission

Rebuild the public website of **https://indexecoresort.com** as a Next.js frontend with a premium, luxury design — **without changing any existing feature, content, route, link target or form field.** This is a design upgrade, not a product change.

**Scope (set 2026-09-29): the Next.js frontend only.** There is no Laravel source and no backend work in this project. The old site is a Laravel app whose behaviour and content were captured in Phase 0; a **Django backend will be built later, by someone else**. Until it exists the site runs entirely on the Phase 0 snapshot (`src/fixtures/` + `public/media/`), which is also what will seed the Django database.

**The zod schemas in `src/lib/data/schemas.ts` are the contract Django will implement.** Field names, text values and slugs stay exactly as captured, and Django must be able to reproduce every current URL. `pnpm contract:export` publishes that contract to `docs/api-contract/` and `docs/API-CONTRACT.md` for the backend developer.

## Repo layout (set after Phase 0, 2026-09-29)

```
.                              ← repo root: git, pnpm workspace
├─ CLAUDE.md · README.md
├─ pnpm-workspace.yaml · package.json
├─ docs/                       # kit docs, PROGRESS.md, OWNER-REPORT.md (final phase)
├─ prompts/                    # one prompt per phase, run in order
├─ audit/                      # Phase 0 baseline: html/, links.json, forms.json, meta.json,
│                              #   interactions.md, backend.md, screenshots/, scripts/ (workspace package)
└─ services/
   └─ frontend/                # the Next.js app — every app command runs here
      ├─ src/ …                # structure in docs/03-ARCHITECTURE.md §2
      ├─ src/fixtures/         # Phase 0 content, used when DATA_SOURCE=mock
      └─ tests/                # Playwright parity / a11y / visual; baselines read from ../../audit/
```

**Path convention:** `docs/`, `prompts/`, `audit/` and `services/` are repo-root paths. Every other relative path in these docs and prompts (`src/…`, `tests/…`, `next.config.*`, `.env*`, `package.json`) is relative to `services/frontend/`.

## Non-negotiables (re-read before every task)

1. **Parity first.** Every page, section, link, form field, validation rule, button target, filter, slider, tab, modal, lightbox, video, download and contact action that exists on the live site must exist in the new site and behave the same way. Sources of truth: `docs/01-SITE-AUDIT.md` (§11 overrides earlier sections), `docs/04-PARITY-CHECKLIST.md`, and the Phase 0 outputs in `audit/`.
2. **URLs are frozen.** Every public path stays exactly as it is today (route map in `docs/03-ARCHITECTURE.md §3`), including odd ones like `/gold-ownership-2`, `/event` (list) vs `/events/{slug}` (detail) and `/blog-details/{slug}`. `/about_us` stays a working URL, as a permanent redirect to `/about-us` (rule 9c). The future Django backend must serve these same paths. A legacy fallback to the old site is available but **opt-in** via `LEGACY_ORIGIN` and unset by default.
3. **Content is data.** Never hardcode CMS content in components. All copy, images, packages, events, posts, gallery items and settings come through `src/lib/data/*`, and every media URL through `assetUrl()`. Render what the data says — including the known content mistakes listed in `docs/01-SITE-AUDIT.md §9` and §11.3. Do not "fix" them in code; the owner fixes them in the admin panel.
4. **Link targets are preserved verbatim**, including `href="#"`, `tel:` and `wa.me` values that differ from the visible number. Mark such places with `// PARITY:` comments.
5. **No new features.** Optional enhancements live in `src/config/features.ts` and are `false` by default (`smoothScroll`, `viewTransitions`, `offerPosterLightbox`, `eventCommentForm`). Accessibility requirements (e.g. a pause control for the autoplay hero, focus management, skip link) are not "features" and are always on.
6. **What you may change:** layout, typography, color, spacing, imagery treatment, component styling, motion, responsiveness, accessibility, performance, semantic HTML, SEO metadata.
7. **Bilingual text.** Bangla and English appear everywhere, often mixed in one sentence. Follow the Bangla typography rules in `docs/02-DESIGN-SYSTEM.md §4` without exception.
8. **Premium includes speed and access.** Budgets in `docs/03-ARCHITECTURE.md §8`. WCAG 2.2 AA minimum.
9. **Parity means keeping what works. Errors are not features.**
   - a. Working behavior → identical.
   - b. `href="#"` placeholders → keep verbatim; the owner decides later.
   - c. Targets that return 404/500 on the live site → use the evident working target and record each in `tests/parity/allowed-diffs.ts` with its reason. Decided so far:
     - Events breadcrumb "Home" `/people-leading` → `/`
     - Filtered event cards → `/events/{slug}` (never `/event-details/{id}`)
     - `/about_us` → **permanent redirect to `/about-us`** (`next.config` `redirects`, `permanent: true`). The live route (`who.we.are`) returns 500 and its data is Home's "Why Buy Our Share" block, not About content — so no Who We Are page is built. The mobile nav's About link points at `/about-us`.
   - d. Decorative UI with no backend → not rendered, behind a feature flag (default `false`), listed in `docs/OWNER-REPORT.md`:
     - Event "Leave a Reply" form → `features.eventCommentForm = false`
   - e. Semantics are fixed in markup only: every page has exactly one non-empty `<h1>`; blog detail renders the post's own title as `<h1>`; empty CMS text nodes (hero slide 1 subline/title) are not rendered at all.
   - f. Booking form PDF: render whatever URL the data holds. If it has no file path, keep the button and flag it in `docs/OWNER-REPORT.md` so the owner uploads the file in the admin panel. Never invent a URL.

## Stack

- Next.js — latest stable, App Router, TypeScript `strict`, React Server Components by default
- Data: two adapters behind one interface — `mock` (the Phase 0 fixtures, the default) and `api` (a generic REST client against `API_BASE_URL`, written to the contract and unused until Django exists). No backend-specific code in either page or component.
- Tailwind CSS v4 (CSS-first `@theme` tokens in `src/styles/globals.css`)
- shadcn/ui on Radix primitives, fully restyled to our tokens (Dialog, Sheet, Tabs, Select, Popover, Calendar, NavigationMenu, Accordion, Tooltip, Sonner)
- `motion` (import from `motion/react`) for interaction and the few orchestrated moments
- Embla Carousel for every slider; yet-another-react-lightbox for image lightboxes
- react-hook-form + zod for forms (rules mirror what Phase 0 found in `audit/forms.json`); submissions go through `submitForm(kind, payload)`, which is mocked until Django exists
- lucide-react for UI icons; brand/social icons as local inline SVG components
- `next/font/google` — Tiro Bangla (display) + Anek Bangla (UI/body)
- Playwright (+ @axe-core/playwright) for parity, a11y and visual checks
- Package manager: **pnpm workspace** (root `pnpm-workspace.yaml`: `services/frontend`, `audit/scripts`)

Always check the installed Next.js version's docs before using caching, routing or config APIs — they changed between major versions. Do not guess API names.

## Commands

Run app commands inside `services/frontend/`, or from the repo root with `pnpm --filter frontend <script>`.

```bash
pnpm install        # at the repo root — installs both workspace packages
pnpm dev            # local dev
pnpm contract:export # regenerate docs/api-contract/*.json + docs/API-CONTRACT.md
pnpm fixtures:media  # mirror fixture media into public/media/ and rewrite URLs
pnpm build          # production build — must pass before any phase is "done"
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
pnpm test:e2e       # playwright parity + a11y tests (baselines: ../../audit/)
pnpm test:visual    # playwright screenshots → ../../audit/screenshots/after/
```

## Conventions

- Server Components by default; `"use client"` only on interactive leaves (carousel, tabs, dialog, tilt card, forms, filters).
- No raw hex values or ad-hoc font sizes in components — tokens only.
- One component per file, PascalCase. Page sections live in `src/components/sections/<page>/`.
- Every image goes through `<SmartImage>`, and every media URL through `assetUrl()` so `MEDIA_BASE_URL` can point at Django's media storage later.
- Every piece of CMS text that may contain Bangla goes through `<Text>` / `autoLang()` so it gets `lang="bn"` when needed.
- CMS HTML (blog/event bodies, rich descriptions) is sanitized, then rendered inside `<Prose>`.
- Internal links via `next/link`; external links get `rel="noopener noreferrer"` and keep their original target behavior.
- Keep components small, typed and documented with a one-line JSDoc stating what they render.

## Workflow for every phase

1. Read the phase prompt in `prompts/` and the docs it references.
2. Write a short plan (files to create/change, risks). Then implement.
3. In `services/frontend/`, run `pnpm lint && pnpm typecheck && pnpm build`. Fix everything; no warnings left behind.
4. Run the relevant Playwright checks. Take screenshots of changed routes at 390 / 768 / 1440 px into `audit/screenshots/after/` and compare with `audit/screenshots/before/` for **functional** parity (same content, same actions), not visual sameness.
5. Update `docs/PROGRESS.md`: what is done, any deviation and why, open questions for the owner. Anything for the owner's admin panel or hosting goes to `docs/OWNER-REPORT.md` as well.
6. Stop and report. Do not start the next phase on your own.

## Docs map

| File | What it holds |
|---|---|
| `docs/01-SITE-AUDIT.md` | Current site: routes, global chrome, every section of every page, data entities, interactions, known issues; **§11 = verified Phase 0 facts (override earlier sections)** |
| `docs/02-DESIGN-SYSTEM.md` | Design direction, tokens, typography, Bangla rules, layout, components, motion, a11y |
| `docs/03-ARCHITECTURE.md` | Folder structure, routing, data layer & API contract, forms, Laravel coexistence, performance, SEO, testing |
| `docs/04-PARITY-CHECKLIST.md` | Checklist used to sign off each page |
| `docs/PROGRESS.md` | Running log you maintain |
| `docs/OWNER-REPORT.md` | Everything the owner must fix/decide outside the code (content, hosting) — fed by every phase |
| `docs/API-CONTRACT.md` + `docs/api-contract/` | The handoff for the Django developer: endpoints, params, response shapes, form payloads, error format. Generated by `pnpm contract:export` |
| `audit/` | Phase 0 baseline (`README.md` inside lists every file) |
| `prompts/` | One prompt per phase, run in order |

## Definition of done (whole project)

- Every item in `docs/04-PARITY-CHECKLIST.md` is ticked.
- Automated link diff (old vs new hrefs per page) and form-field diff show no unexpected differences (only entries in `tests/parity/allowed-diffs.ts`, each with a reason).
- `pnpm contract:export` is current, so the Django developer can build against it.
- Lighthouse (mobile) ≥ 90 Performance, ≥ 95 Accessibility, ≥ 95 Best Practices, 100 SEO on Home, a package page, Events and a blog post.
- No console errors, no hydration warnings, no layout shift from fonts or images.
- Works with keyboard only, at 200% zoom, with `prefers-reduced-motion: reduce`, and at 320 px width.
