# Phase 3 — Data layer & API contract

**Goal:** a typed, validated data layer that serves the Phase 0 snapshot today and a Django backend later, with no component knowing the difference — plus the contract document Django will be built against.

There is **no backend work in this project**. Everything below is frontend.

## Tasks

1. **`src/lib/data/schemas.ts`** — zod schemas for every type in architecture §5.2, refined with what Phase 0 found (exact field names, optional fields, the values that are `null` or `"#"` on the live site). Export inferred types. **These schemas are the contract Django implements**, so names and shapes are deliberate, not incidental.
2. **`src/lib/data/adapters/mock.ts`** — reads `src/fixtures/*.json`, validates, returns data. Reproduces the live ordering and filtering documented in `audit/interactions.md`: `filterEvents({ start_date, end_date, category_id })` with `d-m-Y` inputs, the same one-date-without-category guard, the same empty result; gallery category sets per pane.
3. **`src/lib/data/adapters/api.ts`** — the same interface as a **generic REST client** against `API_BASE_URL`, written to the contract in architecture §5.3. No backend-specific code and no hand-maintained endpoint list beyond the contract. Uses the installed Next.js version's caching primitives with tags.
4. **`src/lib/data/index.ts`** — public functions: `getSettings, getHome, getAboutPage, getPackages, getPackage, getOffer, getBookNow, getEvents, filterEvents(params), getEvent, getRelatedEvents, getPosts, getPost, getBlogSidebar, getGallery, getContactPage`. `app/api/events/filter/route.ts` exposes `filterEvents` with the live param names for the client-side filter (Phase 9).
5. **`src/lib/forms.ts`** — `submitForm(kind, payload)`: mock waits ~600ms, logs the payload in development only and returns success; api POSTs to `{API_BASE_URL}/forms/{kind}` and maps `422 {"errors": {...}}` back onto fields.
6. **Build guard + preview banner** — a production build with `DATA_SOURCE=mock` fails unless `PREVIEW_MODE=true`; in preview mode the site shows a slim bar: "Preview — forms are not sent".
7. **`src/lib/assets.ts`** — `assetUrl()` resolving every media path against `MEDIA_BASE_URL` (empty = the local `public/media/` mirror). `SmartImage` and every other media consumer go through it.
8. **`pnpm fixtures:media`** — mirrors everything the fixtures reference into `public/media/` with the original relative paths and rewrites the fixture URLs. Re-runnable; leaves a URL alone if the file cannot be fetched, so gaps stay visible.
9. **`pnpm contract:export`** — JSON Schemas from the zod schemas into `docs/api-contract/`, plus `docs/API-CONTRACT.md` listing every endpoint, its query params (events filter: `start_date`, `end_date`, `category_id`, `d-m-Y`), response shapes, form payloads and the validation-error format (`422` with `{"errors": {"field": ["message"]}}`). This is the handoff for the Django developer.
10. **`src/lib/sanitize.ts`** and **`src/lib/format.ts`** — the CMS HTML allowlist sanitizer (already built in Phase 2) and display-only helpers (e.g. splitting a date into day + "MON YYYY" badge parts). Never change data meaning; raw time strings stay raw.
11. **`src/app/api/revalidate/route.ts`** — secret-protected, revalidates by tag.
12. **Tests** — schemas parse every fixture; mock filters reproduce the Phase 0 numbers (gallery counts per category, event filter results, package order); `submitForm` mock returns success without a network call.

## Acceptance criteria

- `pnpm build` succeeds on fixtures in preview mode and fails without it; switching `DATA_SOURCE=api` compiles.
- Tests prove gallery category counts, event filter results and package ordering match `audit/`.
- `docs/API-CONTRACT.md` and `docs/api-contract/*.json` are generated and current.

Stop and report.
