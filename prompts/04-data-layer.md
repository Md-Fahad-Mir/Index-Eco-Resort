# Phase 3 — Data layer

**Goal:** a typed, validated data layer that serves fixtures today and the Laravel API later, with no component knowing the difference.

## Tasks

1. `src/lib/data/schemas.ts`: zod schemas for every type in architecture §5.2, refined with what Phase 0 found (field names, optional fields). Export inferred types.
2. `src/lib/data/adapters/mock.ts`: reads `src/fixtures/*.json`, validates, returns data. Reproduces the live ordering and filtering exactly as documented in `audit/interactions.md` — `filterEvents({ start_date, end_date, category_id })` (inputs in `d-m-Y`, same guard, same empty result) over the fixtures, gallery category sets per pane.
3. `src/lib/data/adapters/laravel.ts`: same interface, `fetch` against `CMS_API_URL` with caching/revalidation tags (architecture §4). Implement against the endpoint list in architecture §5.3; mark each function `// TODO(api)` until the endpoint exists.
4. `src/lib/data/index.ts`: public functions — `getSettings, getHome, getAboutPage, getPackages, getPackage, getOffer, getBookNow, getEvents, filterEvents(params), getEvent, getRelatedEvents, getPosts, getPost, getBlogSidebar, getGallery, getContactPage`. `app/api/events/filter/route.ts` exposes `filterEvents` with the live param names for the client-side filter (Phase 9).
5. `src/lib/sanitize.ts`: allowlist sanitizer for CMS HTML (headings, p, strong, em, ul/ol/li, a[href], img[src|alt], blockquote, table elements, br, span). Links keep their href; external links get `rel`.
6. `src/lib/format.ts`: display helpers only (e.g. splitting "29 Sep 2026" into day + "SEP 2026" badge parts). Never change data meaning; raw time strings stay raw unless the original formats them.
7. If the Laravel source is available and I approved it: implement the read-only API endpoints and the contact form endpoint in Laravel exactly as architecture §5.3 describes, reusing existing queries/validation (there is no comment endpoint to mirror). Add Laravel feature tests. Otherwise skip and keep `DATA_SOURCE=mock`.
8. `src/app/api/revalidate/route.ts` (secret-protected, revalidates by tag).
9. Unit tests for schemas against fixtures and for the mock filters (events/gallery counts equal Phase 0 numbers).

## Acceptance criteria

- `DATA_SOURCE=mock pnpm build` succeeds; switching to `api` compiles.
- Tests prove: gallery category counts, event filter results and package ordering match `audit/` data.

Stop and report.
