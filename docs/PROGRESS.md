# PROGRESS

Claude Code maintains this file. One section per phase.

---

## Phase 0 — Discovery & parity baseline

- **Status:** done
- **Date:** 2026-09-29

### Done

- **Audit scripts** in `audit/scripts/` (own `package.json`, Node + Playwright + cheerio),
  reusable by the parity tests in later phases: `crawl.mjs`, `extract.mjs`,
  `fixtures.mjs`, `screenshots.mjs`, `probe-api.mjs`.
- **Crawl** — 19 routes (13 seeds + 4 event details + 2 blog posts) with a desktop UA,
  plus a mobile-UA pass over the 13 seeds, into `audit/html/`. The site's own 8 CSS/JS
  assets are in `audit/assets/`. Summary in `audit/crawl-report.json`.
- **`audit/links.json`** — 1033 anchors across 19 pages, each tagged
  `topbar | header | mobile-nav | main | dock | footer` with text, href, target, rel,
  class and any `onclick`.
- **`audit/forms.json`** — every form on every page with action, method, and each
  field's name/type/required/placeholder/maxlength/pattern/options.
- **`audit/meta.json`** — title, description, OG, canonical, favicon, `h1` list per page.
- **`audit/interactions.md`** — full behavioral inventory read out of the live JS:
  every carousel and its options, the AJAX contact submit, the gallery tab mechanism
  with per-category counts, the event filter endpoint and payload, the video modal,
  the mobile menu, the floating dock, and a list of libraries bound to selectors that
  exist on no page.
- **`audit/backend.md`** — stack, known routes, the `/about_us` crash, the one existing
  JSON endpoint, both forms' contracts, and the production debug-mode exposure.
- **`audit/api-probe.json`** — 25 probed paths.
- **Screenshots** — 57 full-page captures (19 routes × 390/768/1440) in
  `audit/screenshots/before/`, no failures.
- **Fixtures** — 12 files in `src/fixtures/` (`settings, home, about, packages, offer,
  book-now, contact, gallery, events, event-details, posts, post-details`), real content
  only, media URLs absolute to the live site, shaped to `docs/03-ARCHITECTURE.md §5.2`.
- **`docs/01-SITE-AUDIT.md` §11** — verified facts, corrections, and an answer to every
  item in §10 "Unknowns".

### Deviations (and why)

Nothing was built this phase, so there are no implementation deviations. Two
**planned** deviations from the kit that need your sign-off before Phase 1:

1. **`/about_us` will render the About page instead of a 500.** `CLAUDE.md §2` says the
   alias "must keep working", but the live route is a *different* Laravel route that
   currently crashes. Reproducing a 500 would be absurd, so the plan is: `/about_us`
   renders the same page as `/about-us` with `canonical → /about-us`. See open
   question 2 — if `who_we_are.blade.php` is meant to be a genuinely different page,
   I need its content.
2. **Broken link targets are preserved but flagged, not silently fixed.** `/people-leading`
   (500), `/event-details/{id}` (404) and the Book Now download (no file path) are kept
   verbatim per the parity rule, each marked with a `// PARITY:` comment. Say the word
   and I will fix any of them behind `tests/parity/allowed-diffs.ts` with a reason.

### Parity notes (`// PARITY:` decisions recorded in the fixtures)

- Top bar phone/email are **plain text, not links**.
- Desktop nav "Ownership Packages" has **no `href` attribute at all** (not even `#`).
- Footer credit link has no `href`; footer Facebook is the relative, broken
  `www.facebook.com/indexecoresort`; TikTok is `#`.
- Dock: WhatsApp button → `web.whatsapp.com/send?phone=+8801700729312`; phone button →
  `tel:+8801700729312`; the panel displays `01711307580` but dials `+8801700729312`;
  a hidden `.fixed_footer_whatsapp_icon.d-none` widget points at `wa.me/+8801711307580`.
- Mobile "Call Now" → `tel:09638657301`, a third number.
- Hero slide 1 has an **empty subline and empty `<h1>`** — kept as data.
- Every package heading reads "Silver Ownership: N Shares".
- Contact hotline and all blog share links are `#`.
- Event comment block is rendered as **inert decoration** (no form, no endpoint).
- Home gallery "All" is capped at 12 while category tabs are uncapped.

### Open questions for the owner

1. **Do you have the Laravel source, and where?** Needed to confirm controller
   ordering/filters and the server-side validation rules for `/contact-form/submit`.
   Everything runs on fixtures until then.
2. **`/about_us`** — should it render the About page (my plan), or is
   `who_we_are.blade.php` a distinct page whose content I should reproduce? If the
   latter, I need the intended content; it has never rendered successfully.
3. **May I add read-only `/api/v1/*` endpoints** to Laravel, plus a CSRF-exempt form
   proxy (architecture §5.3)?
4. **Where is the admin panel?** `/admin` and `/login` both 404.
5. **The booking-form PDF** — the Book Now button points at `/public/storage` with no
   file. Which file should it download?
6. **The contact page form's response.** I deliberately did not submit to your live
   `/contact-form/submit` — it would create a real inquiry and possibly send mail.
   What happens after a successful page-form POST: redirect, flash message, or JSON?
7. **Hosting** — confirm Next.js on the apex domain with Laravel on
   `cms.indexecoresort.com` behind fallback rewrites.
8. **pnpm is not installed** on this machine. I'll enable it via `corepack` in Phase 1
   unless you'd rather use npm.

### ⚠️ Needs attention regardless of the redesign

- **`APP_DEBUG=true` in production.** Every 404/500 returns a full Laravel stack trace;
  `/about_us` serves a 641KB Ignition page exposing server paths, Blade source and the
  SQL that ran. No credentials were exposed in what I captured, and none were stored in
  this repo. Set `APP_DEBUG=false` and `php artisan config:cache` before cut-over.
- **Mobile "About Us" is a 500** for every visitor today.
- **The Events breadcrumb "Home"** links to `/people-leading`, which is a 500.
- **Filtering events breaks the links** — AJAX cards point at `/event-details/{id}` (404).
- **The Book Now download is broken** — no file path.

### New content issues for the admin panel (beyond audit §9)

Vision/Mission/Approach tabs share identical body text and "Our Approach" repeats
"Our Vision"'s heading · the only testimonial is placeholder data ("jack sparrow /
Actor", avatar `alt="Vikram Patel"` hotlinked from a theme demo) · the glance slider
calls the 20-share tier "ডায়মন্ড" while it is sold as "Signature" · the "Swimming pool"
gallery category is on Home but missing from `/gallery`, and "Indoor" is empty on both
· blog and event detail pages have no `<h1>`, Home has two (one blank) · ~200KB of
CSS/JS loads on every page for libraries that are never used.

### Next

Phase 1 — `prompts/02-project-setup.md`. **Waiting for your go-ahead.**

---

## Phase 0 follow-up — owner decisions applied, kit updated to reality

- **Date:** 2026-09-29

### 1. Repo layout (owner instruction §1)

- The empty app folder the owner created is **`services/frontend/`** (plural) at `Index Eco Resort/`, next to a `.gitignore` and (since this session) a `.git` — so **`Index Eco Resort/` is the repo root**, not the kit folder. The message said `service/frontend`; the existing `services/` was used.
- Moved `CLAUDE.md`, `README.md`, `docs/`, `prompts/`, `audit/` (and the Phase 0 `src/fixtures`) out of `index-eco-resort-nextjs-kit/` to the repo root; removed the then-empty kit folder.
- Added root `pnpm-workspace.yaml` (`services/frontend`, `audit/scripts`; `allowBuilds` for `sharp` / `unrs-resolver`) and a root `package.json` with `pnpm --filter` shortcuts.
- `audit/scripts` is now a workspace package (its npm lockfile/node_modules were removed; `pnpm install` at the root installs it). Added a `fixtures` script; `fixtures.mjs` writes to `services/frontend/src/fixtures/`.
- Fixtures now live in `services/frontend/src/fixtures/`; the root `src/` is gone.
- Playwright lives in `services/frontend/tests/` and reads baselines from `../../audit/` (`tests/helpers/audit.ts`).

### 2. Answers (owner instruction §2) — **the placeholders were still unfilled**

The `<…>` fields for Laravel source, API permission, admin URL and the contact-form policy came through as template text. Defaults used until answered: **no Laravel source in the repo (verified), fixtures only; no API work; nothing submitted to the live contact form.** pnpm, hosting plan and `APP_DEBUG` were clear and are applied/recorded.

### 3. Parity policy → `CLAUDE.md` rule 9

Added verbatim as non-negotiable **9 a–f** (working behavior identical · `#` kept · 404/500 targets → evident working target in `tests/parity/allowed-diffs.ts` · decorative UI behind a flag + OWNER-REPORT · one non-empty `<h1>`, blog title as `<h1>`, empty CMS nodes not rendered · PDF URL as data, never invented). Rule 5's flag list now includes `eventCommentForm`.

### 4. `/about_us` — comparison done; **it is a different page → decision needed before Phase 6**

From the Ignition capture (`audit/html/about_us.html`): route `who.we.are` → `HomeController@whoWeAre` → `resources/views/frontend/page/who_we_are.blade.php`. The controller queries `who_we_ares` (latest row), `core_values` and `core_value_images`, and passes `$data = ['whoWeAre' => …, 'coreValues' => …]`. The view (lines 12–42 are all the capture holds) renders a page hero "About Us" (breadcrumb Home → `#`), then an about-style collage reading `$data->photo_one/two/three` and a video play button.

The decisive part: the `WhoWeAre` model's actual columns are **`id, video, description, core_purpose, core_purpose_bg_video, created_at, updated_at`** — there is no `photo_one/two/three` at all — and the row's values are `core_purpose = "Why Buy Our Share"`, `description = "Why investing in our shares ensures value and growth"`, `video = video/admin/whoWeAre/….png` (the building image). That is exactly Home's **Why Buy Our Share** block. So `who_we_are.blade.php` was written against a model shape that doesn't exist; the page has never rendered and cannot render as coded, and its data is the Why-Buy block plus the six core values — not the About page's content (About block from `admin/about/`, plans, vision/mission).

**Recommendation:** treat `/about_us` as the mobile menu's "About Us" link (its label) → render the About page there with `canonical → /about-us`; alternative: a permanent redirect to `/about-us`. Either is one allowed-diff entry. Nothing is built at `/about_us` until you choose.

### 5. Kit updates (owner instruction §4) — every change

| File | Change |
|---|---|
| `CLAUDE.md` | Repo layout + path convention; rule 2 (`/about_us` pending), rule 5 (flag list), **rule 9**; commands (`services/frontend` / `pnpm --filter frontend`); workflow step 3/5; docs map (+ `OWNER-REPORT.md`, `audit/`); definition of done (allowed-diffs) |
| `docs/01-SITE-AUDIT.md` | Inline markers: §3 `/about_us`, **§4.6 marquee not reproducible**, §5.1 hero = 2-slide carousel, §5.7 comment block decorative, **§5.8 no pagination**, §7 rows (hero, comment form, event filters, marquee), **§9.14 gallery duplicates not reproducible** (§11 already held the verified facts) |
| `docs/03-ARCHITECTURE.md` | Header note; §2 tree → monorepo (`about_us` pending, `api/events/filter`, `HeroCarousel`, `tests/`); §3 rows for `/about_us` and `/event` (AJAX via data layer, same params, links to `/events/{slug}`) + the Phase 1 dynamic-segment finding; §4 `/event` bullet; §5.2 (`announcement` removed, top-bar text, `EventDetail.comments` decorative, `BookNow` note); §5.3 comment endpoint removed; §6 forms (two schemas, no comment form); §10 test paths, regions, seeded allowed diffs, filter cases |
| `docs/04-PARITY-CHECKLIST.md` | Header note; **Announcement item removed**; hero carousel item; gallery counts; `/about_us` pending; Book Now PDF (rule 9f); events filters/params, cards → `/events/{slug}`, no pagination + empty-state text; comment block not rendered; related events; blogs no pagination, title as `<h1>`; hotline `#`; allowed-diffs wording; new gate "exactly one non-empty `<h1>`"; "Removed after Phase 0" footer |
| `prompts/00` | Reading list (+ PROGRESS/audit, §11 precedence); flag path; rule 9 line; commands cwd |
| `prompts/02` | Rewritten for `services/frontend/` + workspace: `--help` first, fixtures move, tests location, `eventCommentForm` flag, acceptance |
| `prompts/04` | `filterEvents(params)` + `/api/events/filter`; no comment endpoint |
| `prompts/05` | **AnnouncementBar removed** (goal, layout composition, item 10); TopBar plain text; `/about_us` pending; Events breadcrumb → `/`; footer parity notes; test path |
| `prompts/06` | **Hero rebuilt as the same 2-slide carousel** (media, order, 6000 ms, video-once-then-advance) with the design-system treatment, pause control, one `<h1>`; gallery counts as live |
| `prompts/07` | `/about_us` pending (build nothing); VM identical-text note |
| `prompts/08` | Route strategy per the Phase 1 finding (static folders, fallback test) |
| `prompts/09` | **AnnouncementBar removed**; PDF per rule 9f; acceptance |
| `prompts/10` | Breadcrumb → `/`; **filters through the data layer, same params/`d-m-Y`/guard/empty state, results → `/events/{slug}`**; no pagination; comment block behind flag; related events; acceptance |
| `prompts/11` | No pagination; **title as `<h1>`**; no comment form |
| `prompts/12` | Gallery tabs as live; contact form rules as live (no client `required`), hotline `#` |
| `prompts/14` | sitemap/robots; `/about_us` per decision |
| `prompts/15` | OWNER-REPORT is finalized (started now); rule-9 items listed |
| `README.md` | Repo-layout note (Bangla) — file since removed by the owner |
| `docs/OWNER-REPORT.md` | **New, living**: decisions needed, admin-panel content fixes, not-rendered decorative UI, server/hosting |

### Root `.gitignore` — kit stays untracked (owner's choice, observed mid-session)

During this session the owner added `CLAUDE.md` to the root `.gitignore` and removed the kit `README.md`, so git versions **only `services/`, `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.gitignore`**; `CLAUDE.md`, `docs/`, `prompts/` and `audit/` stay local. Consequences to be aware of (no action taken): a fresh clone has no `audit/scripts` workspace package and no `../../audit/` baselines, so `pnpm test:e2e`/`test:visual` only run on a machine that has the kit folders; `docs/PROGRESS.md` and `docs/OWNER-REPORT.md` are local-only too. If that changes, `!/docs/`, `!/prompts/`, `!/audit/` in `.gitignore` is all it takes (`audit/` ≈ 65 MB, mostly screenshots and crawl HTML).

---

## Phase 1 — Project setup

- **Status:** done
- **Date:** 2026-09-29
- **Done:**
  - `pnpm create next-app@latest` 16.3.6 (flags from `--help`): `--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --disable-git --yes` → **Next 16.3.6 (Turbopack), React 19.2.8, Tailwind 4.3.3, TypeScript 5.9.3, ESLint 9**.
  - create-next-app wrote a *nested* `pnpm-workspace.yaml` + lockfile (pnpm 12 stores its `allowBuilds` there) which made the app its own workspace root; removed them, moved `allowBuilds` to the root file, reinstalled from the root → one lockfile, both packages resolved.
  - `tsconfig`: `strict`, **`noUncheckedIndexedAccess`**, target ES2022, alias `@/*` → `src/*`.
  - Runtime deps: `motion`, `embla-carousel-react`, `yet-another-react-lightbox`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `clsx`, `tailwind-merge`, `isomorphic-dompurify`, `date-fns`. Dev: `@playwright/test` 1.63, `@axe-core/playwright`, `prettier`, `prettier-plugin-tailwindcss`.
  - shadcn 4.21 (`init -b radix -p nova --css-variables`, `add dialog sheet tabs select popover calendar navigation-menu accordion tooltip sonner`; `calendar` pulled in `button`). Styling untouched until Phase 2. `src/lib/utils.ts` re-exports `cn` from shadcn's `cn` package.
  - Folder structure from architecture §2 (`.gitkeep` in empty dirs); `src/config/features.ts` (`smoothScroll`, `viewTransitions`, `offerPosterLightbox`, `eventCommentForm` — all `false`); `src/config/site.ts`; `src/lib/data/index.ts` placeholder; fixtures moved in.
  - `next.config.ts`: `images.remotePatterns` (`indexecoresort.com` + the `LARAVEL_ORIGIN` host under `/public/**`, `i.ytimg.com`, `demo.awaikenthemes.com` for the two hotlinked CMS images), AVIF/WebP, **`rewrites().fallback` → `LARAVEL_ORIGIN/:path*`**, security headers (CSP, nosniff, referrer, frame, permissions), `poweredByHeader: false`.
  - `.env.example` (architecture §11; `DATA_SOURCE=mock`, `LARAVEL_ORIGIN=https://indexecoresort.com` until the CMS moves) + a local `.env.local` (git-ignored); `.env.example` un-ignored.
  - Scripts: `dev build start lint typecheck format format:check test:e2e test:visual`; Prettier config.
  - Playwright: `playwright.config.ts` (projects `parity-desktop` 1440, `parity-mobile` iPhone 13 on Chromium, `visual`; web server = `pnpm start`), `tests/helpers/{audit,routes}.ts`, `tests/parity/fallback.spec.ts` (3), `tests/parity/routes.spec.ts` (200 + exactly one non-empty `<h1>` + no console errors, per owned route), `tests/a11y/axe.spec.ts` (no serious/critical), `tests/visual/screenshots.spec.ts` (18 routes × 390/768/1440 → `audit/screenshots/after/`, Phase 0 naming).
  - `globals.css` moved to `src/styles/globals.css` (CLAUDE.md), `components.json` and the layout import updated. Placeholder `/` page with one `<h1>`; site metadata title.
- **Verification:** `pnpm format` · `pnpm lint` clean · `pnpm typecheck` clean · `pnpm build` **zero warnings** (2 static routes) · production server: `/` served by Next with the headers and no `x-powered-by`; `/events/filter` → Laravel JSON 200; `/public/storage/...png` → 200 `image/png`; unknown single-segment path → **Laravel's JSON 404** (not Next's) · `pnpm test:e2e` **10/10** (desktop + mobile) · home screenshots 3/3.
- **Deviations (and why):**
  - **CSP is static** (`script-src 'self' 'unsafe-inline'`, `'unsafe-eval'` only in dev): per the Next 16 docs, nonces require dynamic rendering, which would defeat static/ISR pages. Revisit in Phase 13 if we ever go dynamic.
  - The mobile Playwright project runs `iPhone 13` on **Chromium**, not its default WebKit: WebKit honours `upgrade-insecure-requests` on `http://localhost` and fails TLS (that was the one failing test before the change).
  - Fonts are still the scaffold's Geist; Phase 2 owns fonts/tokens. shadcn's font step left `--font-sans: var(--font-sans)` self-referential in `globals.css` — Phase 2 replaces that file's theme entirely.
  - Playwright's `webServer.command` is `node node_modules/next/dist/bin/next start`, **not** `pnpm start`: via pnpm, Next 16's real `next-server` child outlives its parent, keeps the inherited stdio pipes open, and Playwright's teardown hangs until its timeout while the server leaks on the port (observed three times today; `pnpm test:e2e` now finishes in ~3 s with a clean shutdown). `pnpm start` itself is fine for humans.
  - create-next-app added `AGENTS.md` (regenerated by `next dev`) and a `CLAUDE.md` that just imports it — kept; they point at the Next 16 docs in `node_modules/next/dist/docs/`, which is where every API used here was checked (`rewrites.fallback`, `headers`, `remotePatterns`, CSP guide, `revalidateTag(tag, profile)` two-arg form for Phase 3).
- **Finding for Phase 7 (tested, not assumed):** with a temporary root `app/[slug]/page.tsx` calling `notFound()`, `/this-path-does-not-exist-anywhere` returned **Next's 404 HTML** instead of Laravel's JSON — a root dynamic segment swallows the fallback for every unknown single-segment path (two-segment paths still fall back). Recorded in architecture §3 with three options and a recommendation (static route folders + shared template); `prompts/08` updated. Temporary route removed, clean rebuild done.
- **Parity notes:** none new (no CMS content rendered yet). `/about_us` is a **pending route** in `tests/helpers/routes.ts`.
- **Screenshots:** `audit/screenshots/after/home@{390,768,1440}.png` (placeholder page).
- **Open questions for the owner:**
  1. The four unfilled §2 answers (Laravel source path · API permission · admin URL · contact-form test policy).
  2. `/about_us`: render About with canonical, or 301 to `/about-us`? (§4 above)
  3. Root `.gitignore`: un-ignore `docs/`, `prompts/`, `audit/`, or keep them out of git?
  4. `pnpm` is at `~/.npm-global/bin`, which is not on PATH for non-interactive shells on this machine (`corepack enable` can't write to `/usr/local/bin`). Adding `export PATH="$HOME/.npm-global/bin:$PATH"` to your shell profile fixes it; I prefix it per command meanwhile.
- **Next:** Phase 2 — `prompts/03-design-system.md`. **Waiting for your go-ahead.**

---

## Phase 1 follow-up — decisions applied

- **Date:** 2026-09-29

### 1. `/about_us` → permanent redirect

`next.config` `redirects` sends `/about_us` → `/about-us` with `permanent: true` (Next emits **308**). No Who We Are page is built; the `WhoWeAre` record stays the source of Home's "Why Buy Our Share" block. The mobile nav's About item will point at `/about-us` (Phase 4). Recorded in `tests/parity/allowed-diffs.ts` with the reason *"live /about_us returns 500"*, covered by a test in `tests/parity/fallback.spec.ts`, and propagated to `CLAUDE.md` rule 2/9c, `docs/01-SITE-AUDIT.md` §3 + §11.1, `docs/03-ARCHITECTURE.md` §2/§3, `docs/04-PARITY-CHECKLIST.md`, `prompts/05`, `prompts/07`, `prompts/14` and `docs/OWNER-REPORT.md` (A1 → resolved).

### 2. Ownership routing — static route folders

`prompts/08` and architecture §3 already specify one folder per package sharing a template. Added:

- **`tests/parity/ownership-routes.spec.ts`** — fails when package data holds a slug with no `src/app/(site)/<slug>/page.tsx`, and checks each built route returns 200 with its package name as `<h1>`. It stays skipped until Phase 7 creates the first folder, then guards every package from then on.
- **`docs/OWNER-REPORT.md` §C** — in plain language: a newly added package is served by Laravel in the old design until its route folder is added; nothing 404s, and CI catches it.

### 3. `tests/parity/allowed-diffs.ts`

The central, typed registry of intentional differences. Seeded with 7 entries across rules 9c/9d/9e (the `/about_us` redirect, the mobile About link, the Events breadcrumb, filtered event cards, the decorative comment block, Home's empty `<h1>`, the blog title). Each carries `rule`, `routes`, `live`, `ours`, `reason` and an optional `ownerAction`.

### 4. CSP and WebKit

`upgrade-insecure-requests` is now sent **only when the deployment is served over https**, derived from `NEXT_PUBLIC_SITE_URL`. That is the honest axis: on an http origin the directive is meaningless, and WebKit applies it to `http://localhost` and fails TLS on every subresource. Gating it on *phase* would not have worked — Playwright serves the **production** build, which is exactly where the directive lives.

- `next.config.ts` is now a phase function (`PHASE_DEVELOPMENT_SERVER`), because the file is evaluated **before** `next start` sets `NODE_ENV` — read from `process.env`, production looked like development. Verified: production → `script-src 'self' 'unsafe-inline'` + `upgrade-insecure-requests`; dev → adds `'unsafe-eval'`, `ws:`, and drops the upgrade.
- **`parity-mobile-webkit` re-enabled** alongside Chromium mobile; `pnpm test:e2e` runs all three projects.

### 5. Git — kit versioned, secrets redacted first

**Scan of `audit/*.json` and `audit/*.md` before staging:**

| Found | Action |
|---|---|
| **19 live Laravel CSRF tokens** (`_token` hidden-field values, one per crawled page, in `forms.json`) | Replaced with `<redacted: per-request CSRF token>`. `audit/scripts/extract.mjs` now redacts `_token` **at capture time**, so a re-crawl cannot reintroduce them. |
| **Absolute server path** `/home/indexeco/indexecoresort.com` (the hosting account name) in `backend.md` and the `/about_us` error title in `meta.json` | Replaced with `<app-root>`. |
| SQL from the debug page (`who_we_ares`, `core_values`, `core_value_images`) in `backend.md` | **Kept.** These are table names from the client's own schema, needed for the Phase 3 data contract, and are not credentials. Say the word and I will drop them. |
| `address` hidden field value `"N/A"` | **Kept — it is a parity fact.** The contact modal always submits `address=N/A`. This also corrected the Phase 0 note that called the field "empty" (fixed in `interactions.md` and `backend.md`). |
| `links.json`, `crawl-report.json`, `api-probe.json`; emails/phones | Clean — only the business contact details that are published on the site. |

Re-scan after redaction: 0 server paths, 0 token-shaped strings.

**Final `.gitignore`** (repo root) — tracked: `CLAUDE.md`, `docs/`, `prompts/`, `audit/scripts/`, `audit/*.json`, `audit/*.md`, `services/`. Ignored: `audit/html/` (3.2 MB), `audit/assets/` (364 KB), `audit/screenshots/` (63 MB), `Website Screenshort/` (94 MB), plus deps, build output and env files (`!.env.example`).

```gitignore
# ── Dependencies ──────────────────────────────────────────────────────────
node_modules/

# ── Build & tooling output ────────────────────────────────────────────────
.next/
out/
build/
*.tsbuildinfo
next-env.d.ts
tests/.report/
tests/.results/

# ── Environment ───────────────────────────────────────────────────────────
.env
.env.*
!.env.example

# ── OS / editor cruft ─────────────────────────────────────────────────────
.DS_Store
Thumbs.db

# ── Phase 0 audit ─────────────────────────────────────────────────────────
# Tracked: the findings (audit/*.json, audit/*.md) and audit/scripts/.
# Ignored: the bulky raw captures below (~66 MB). Regenerate them with
#   pnpm audit:crawl && pnpm audit:extract && pnpm audit:shots
# Note: tests/visual writes into audit/screenshots/after/, so that stays local too.
audit/html/
audit/assets/
audit/screenshots/

# ── Owner-supplied reference material (not part of the build) ─────────────
/Website Screenshort/
```

39 kit files (≈0.5 MB) are **staged, not committed** — the commit is yours to make. Verified staged: no `node_modules`, no `.env*` except the example, none of the ignored bulk, and no CSRF token or server path in the staged content.

You committed Phase 1 from the IDE while this ran (HEAD = 70 files), so the app is already versioned.

### 5b. Note

`services/frontend/tests/.results-styleguide` was added to the app `.gitignore`.

---

## Phase 2 — Design system & primitives

- **Status:** done
- **Date:** 2026-09-29

### Done

- **Tokens** — `src/styles/globals.css` is the single source of raw values: the full Canopy & Brass palette, the fluid type scale with per-step line-heights, radius **by role** (btn 2 / media 4 / field 6 / panel 16 / pill 999), the three green-tinted shadows, the two easings, durations, section rhythm, container and measures. A second `@theme inline` block maps shadcn's semantic names (`--color-background`, `--color-primary`, `--color-border`, `--color-ring`, `--radius-*`) onto our palette, so every Radix primitive inherits the system. No dark *mode*: the palette has dark *tones*.
- **Fonts** — Tiro Bangla (400 + italic) and Anek Bangla (variable, `wdth` axis) via `next/font/google`, `subsets: ["bengali","latin"]`, `display: "swap"`, as `--font-tiro` / `--font-anek`. Both were confirmed present in the installed font data with exactly the weights, styles and axes the design system assumes — no fallback needed.
- **Language layer** — `src/lib/lang.ts` (`isBangla`, `autoLang`, `stripHtml`, `autoLangHtml`); `<Text>`, `<Paragraph>`, `<LangScope>`, `<Heading level size>` and `<Prose>` tag `lang="bn"` automatically. `autoLang` returns `undefined` rather than `"en"` so `:lang(bn)` still inherits into nested CMS markup.
- **Bangla rules in CSS** — zero tracking (`!important`), 1.85 body / 1.25 heading line-height, `font-synthesis: none`, no hyphens, and a 0.94em optical size at display/h1/h2 so mixed lines sit level.
- **Primitives** (`src/components/ui/`) — `Button` (primary / on-dark / outline, `asChild`, hover fill rising from a `::before` so only `transform` animates), `TextLink` (underline drawn from the left, optional arrow), `IconButton`, `Eyebrow` (Tiro italic for Latin, upright for Bangla, brass hairline), `SectionHeader` (split 6/5 layout), `Tag`, `Field`/`Input`/`Textarea`/`Checkbox` (56px controls, required marked in text, `role="alert"` errors), `Select`, `DatePicker`, `Tabs` (underline + segmented, shared-layout indicator), `Container`, `Section` (5 tones).
- **shadcn restyled** — the 11 vendor components moved to `src/components/primitives/` and now read our tokens; `components.json` `aliases.ui` updated so future `shadcn add` lands there.
- **Media** (`src/components/media/`) — `SmartImage` (required `sizes`, fixed ratio boxes, lichen-soft placeholder, graceful empty state), `Slider` (Embla, arrows, `02 / 05` fraction, progress bar, carousel roles), `Lightbox` (dynamic import), `VideoModal` (plays on open, pauses on close, Esc, focus return), `LiteYouTube` (i.ytimg poster, `youtube-nocookie` iframe only on click), `BackgroundVideo` (starts after idle, pauses off-screen and on tab hide, skips on Save-Data, visible pause control).
- **Motion** (`src/components/motion/`) — `MotionProvider` (LazyMotion + domAnimation, `strict`), `Reveal`, `MaskedLines`, `useReducedMotionSafe`. Every one has a reduced-motion branch.
- **`MembershipCard`** — the signature component, built now because the tilt video was requested: ±7° spring tilt on fine pointers, pointer-tracking `soft-light` sheen, a shadow that leans up to 12px opposite the tilt, real card corners (`4.5% / 7.1%`), a 600ms diagonal sweep on touch, static with a raised shadow under reduced motion, and focusable as a whole when linked.
- **Styleguide** `/styleguide` (`notFound()` in production) — colour, the scale in both scripts, the bilingual section, actions, fields with a live error, filters, both tab variants, the slider, prose and the card, all on **real fixture content**.

### Verification

`format:check` · `lint` · `typecheck` · `build` all clean. Main suite **39 passed / 6 skipped** across `parity-desktop`, `parity-mobile` and the restored `parity-mobile-webkit`. Styleguide suite **7 passed**, asserting in *computed* styles that: every `[lang="bn"]` node has `letter-spacing: normal`; the Book Now paragraph is `font-style: normal` (upright, unlike the live site) with a line-height ratio > 1.6 and a real Tiro family; the mixed heading uses one family; zero serious/critical axe violations; arrow-key tab navigation with an `index`-green focus ring; **no horizontal page scroll at 320 or 390 px**; and the card produces a genuine `matrix3d` under the pointer.

### Defects found and fixed while proving the system

1. **Case-insensitive filename collision** — `ui/Button.tsx` overwrote shadcn's `ui/button.tsx` on macOS (`core.ignorecase=true`), destroying three vendor files. Recovered from HEAD and restructured: vendor → `src/components/primitives/`, ours stays PascalCase in `ui/`. On a case-sensitive CI box this would have behaved differently — worth knowing.
2. **Invalid `aria-controls`** (critical, axe) — Radix builds tab ids from `value`, and CMS labels contain spaces ("Family Cottage"), which an IDREF may not. `Tabs` now normalises values internally, so callers can pass labels safely.
3. **Tabs rendered with nothing active** — the normaliser was applied to triggers and panels but not `defaultValue`, so no panel matched. (My patch script had silently no-op'd on that one line; asserts added.)
4. **Horizontal scroll at 320/390 px** — the segmented tab strip was 429px wide. `TabsList` now scrolls inside its own container; guarded by a test.
5. **`TextLink` underline painted the whole box** — `bg-current` sets a background *colour*; the draw-on-hover effect needs a background *image*. Now a `linear-gradient(currentColor, currentColor)` sized `0% 1px → 100% 1px`.
6. **Tab panels faded in on page load** — an unintended second page entrance (§9.2 allows one), and the cause of an intermittent axe contrast failure, because axe sampled text mid-fade. Panels now animate only after the visitor switches tabs; `settle()` additionally waits for `document.getAnimations()`.
7. **Type-scale samples showed the body face** — they were `<p>`, and the size tokens deliberately carry size only. The samples now opt into `font-display`, so the styleguide shows what headings actually look like.

Items 2, 4, 5 and 6 were real component defects that would have shipped into every page built on them.

### Deviations (and why)

- **`MembershipCard` built in Phase 2** rather than Phase 5, because the tilt video was requested. `prompts/06` still owns `PlanGrid` and the plan stage.
- **Styleguide runs under its own Playwright config** (`playwright.styleguide.config.ts`, `pnpm test:styleguide`) against a **dev** server, since it 404s in production by design. Next refuses a second dev server for one directory, so it reuses a running one via `STYLEGUIDE_BASE_URL` — that is how it was run here, against the `pnpm dev` server already open in your IDE, which was left untouched.
- **Hex values appear in the styleguide** as swatch *captions* (documentation text, not styling). Every style comes from tokens.
- `next.config.ts` and the `.env` example/local now carry `NEXT_PUBLIC_SITE_URL`; `.env.local` is set to `http://localhost:3000` so local builds match how they are served.

### Screenshots (`audit/screenshots/after/`)

| File | What it shows |
|---|---|
| `styleguide-1440.png` · `styleguide-390.png` | Full page, exactly 1440 and 390 wide (no horizontal overflow) |
| `styleguide-mixed-heading.png` | "Index Eco Resort কুয়াকাটার প্রাকৃতিক সৌন্দর্যে" — one voice, aligned baselines, conjuncts intact |
| `styleguide-booknow-bangla.png` | The Book Now paragraph on canopy, **upright** (faux-italic on the live site) |
| `styleguide-membership-card-tilt.png` · `.webm` | The card mid-tilt, and a short video of the pointer arc |

### Open questions for the owner

1. The four §2 answers (Laravel source path · API permission · admin URL · contact-form test policy) — you said you will answer before Phase 3, which is the phase that needs them.
2. Keep the schema SQL in `audit/backend.md`, or drop it? (see 5 above)
3. The kit is staged; commit when you are happy with the `.gitignore`.

### Next

Phase 3 — `prompts/04-data-layer.md`. **Waiting for your go-ahead.**
