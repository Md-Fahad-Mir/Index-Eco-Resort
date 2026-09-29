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

---

## Architecture pivot — Laravel plan replaced by "frontend now, Django later"

- **Date:** 2026-09-29

Scope is now **the Next.js frontend only**. There is no Laravel source and no backend work; a Django backend comes later, built by someone else. The frontend became self-contained: it serves the Phase 0 snapshot and needs no other origin.

### Files changed

| File | Change |
|---|---|
| `CLAUDE.md` | Mission and scope rewritten; rule 2 (legacy fallback opt-in), rule 3 (`assetUrl`); stack gains the two-adapter line; commands gain `contract:export` / `fixtures:media`; docs map gains the contract; definition of done gains "contract is current" |
| `docs/03-ARCHITECTURE.md` | §1 rewritten (self-contained, schemas-as-contract, snapshot seeds Django); §2 tree (adapters, `scripts/`, `public/media/`, `docs/api-contract/`); §3 ownership back to one dynamic segment with the Phase 1 fallback finding kept as a caveat; §4 caching; §5.1 adapters + build guard; **§5.3 rewritten as the Django contract**; §6 forms → `submitForm`; §7 "Laravel coexistence" → "Legacy fallback (opt-in) and media"; §11 env vars; §12 deployment → Vercel preview now, cut-over later |
| `docs/01-SITE-AUDIT.md` | **§9.14 conclusion corrected** (see below) + two new findings (§27 missing Silver hero image, §28 broken gallery lightbox) |
| `docs/04-PARITY-CHECKLIST.md` | Fallback item now conditional on `LEGACY_ORIGIN`; gallery item notes the repaired lightbox |
| `docs/OWNER-REPORT.md` | Intro explains how the site runs today; §A2/A3/A4 resolved or reframed; §C rewritten (new packages get pages automatically); **new §E content snapshot**; §F deployment |
| `docs/API-CONTRACT.md` + `docs/api-contract/*.json` | **New** — 16 endpoints, 14 JSON Schemas, generated |
| `prompts/04-data-layer.md` | Rewritten for the new plan (no backend tasks; adds contract export, forms adapter, build guard, `assetUrl`, media mirror) |
| `prompts/02, 08, 15` | Setup: `LEGACY_ORIGIN` opt-in · Ownership: back to `[ownershipSlug]` · Handoff: preview-deploy guide now, cut-over later, snapshot/contract noted |
| `services/frontend/next.config.ts` | `LEGACY_ORIGIN` opt-in (unset ⇒ no fallback rewrite at all), `MEDIA_BASE_URL`, CSP/remotePatterns derived from those |
| `.env.example`, `.env.local` | New variables: `DATA_SOURCE`, `API_BASE_URL`, `MEDIA_BASE_URL`, `PREVIEW_MODE`, `LEGACY_ORIGIN` |
| `.gitattributes` | **New** — `*.mp4`, `*.webm`, `*.mov`, `*.pdf` via Git LFS |
| `audit/scripts/fixtures.mjs` | Repairs the 404 gallery lightbox links at capture time (rule 9c) |
| `tests/parity/allowed-diffs.ts` | New entry for the gallery lightbox repair; backend-specific wording removed |
| `tests/parity/fallback.spec.ts` | Legacy tests skip unless `LEGACY_ORIGIN` is set; new tests assert the app is self-contained and serves `/media/` |
| `tests/parity/packages.spec.ts` | Replaces `ownership-routes.spec.ts` — every package slug in the data must render |

### Correction to a Phase 0 conclusion

Phase 0 recorded audit §9.14 ("gallery renders items twice from two paths") as **not reproducible**. That was wrong, and mirroring the media exposed it: I had only checked `<img src>` (all of which do use the working `/public/storage/...` path). The **lightbox anchors in the category panes** use `/public/images/admin/gallery/...`, and **all 20 return 404** — so on the live site, clicking any gallery tile inside a category tab opens nothing. Only the "All" tab works. The fixture builder now repairs those links to the storage file of the same name (rule 9c, recorded in `allowed-diffs.ts`), and a test asserts no `/public/images/` link survives.

---

## Phase 3 — Data layer & API contract

- **Status:** done
- **Date:** 2026-09-29

### Done

- **`src/lib/data/schemas.ts`** — zod schemas for every entity, written as *the contract Django implements*. Captured quirks are encoded deliberately: `href` is nullable because some live links have no attribute at all; `topBar.phone.href` is typed `null` because it is plain text; `comments.enabled` is `z.literal(false)`; hidden form fields keep their literal value (`address: "N/A"`).
- **`adapters/mock.ts`** — serves the snapshot, validating every payload on the way out so the contract is enforced in both directions. `filterEvents` reproduces the live behaviour exactly: `d-m-Y` dates, the one-date-without-category guard, events with null dates never matching a range.
- **`adapters/api.ts`** — a generic REST client against `API_BASE_URL` with cache tags. Nothing in it is backend-specific; Django only has to match the contract.
- **`src/lib/data/index.ts`** — the 16 public functions. Server-side only, so fixtures never reach the client bundle.
- **`src/lib/forms.ts` + `app/api/forms/contact/route.ts`** — `submitForm(kind, payload)`. On the snapshot it waits ~600 ms, logs in development only and returns success; against a backend it POSTs and maps `422 {"errors": {...}}` back onto fields. Client forms post to the route handler rather than calling it directly, which keeps `API_BASE_URL` and `DATA_SOURCE` server-side.
- **Build guard** (`src/config/env.ts`) — a production build with `DATA_SOURCE=mock` throws unless `PREVIEW_MODE=true`, with an error that explains both ways out. **Verified**: refused without the flag, builds with it, and `DATA_SOURCE=api` compiles.
- **`PreviewBar`** — a slim brass bar, "Preview — forms are not sent", rendered only when the site really is on snapshot data in preview mode.
- **`src/lib/assets.ts`** — `assetUrl()` / `assetImage()` resolve media against `MEDIA_BASE_URL` (empty = the local mirror) and leave absolute URLs untouched, so un-mirrored gaps stay visible.
- **`pnpm fixtures:media`** — mirrored **75 files, 139.0 MB** into `public/media/` keeping original relative paths, and rewrote **110 URL occurrences** in the fixtures. Re-runnable and incremental; writes `public/media/MANIFEST.json`.
- **`pnpm contract:export`** — **14 JSON Schemas** + `docs/API-CONTRACT.md` (16 endpoints, the filter's parameters and `d-m-Y` rule, the contact payload, the `422` error shape, and an explicit note that there is no comment endpoint). zod 4 generates JSON Schema natively, so no extra dependency; Node 26 runs the `.mts` exporter without a TS runner (`tsx` and its esbuild build-script approval were added and then removed).
- **`app/api/events/filter/route.ts`** — the live parameter names, returning `{status, data}` as the old endpoint did. **`app/api/revalidate/route.ts`** — secret-protected, tag-validated, using Next 16's two-argument `revalidateTag(tag, "max")`.
- **`src/lib/format.ts`** — display-only helpers; raw CMS time strings stay raw.
- **12 data tests** (`tests/data/contract.spec.ts`, own Playwright project, no browser) proving: every fixture parses; package order and the "Silver Ownership" heading quirk; gallery counts `{9:11, 8:1, 6:2, 5:1, 4:0, 3:3, 2:2}` matching Phase 0; no `/public/images/` lightbox link survives; the filter's four behaviours; `d-m-Y` parsing rejects ISO; media points at the mirror; `submitForm` succeeds without a network call.

### Verification

`format:check` · `lint` · `typecheck` · `build` clean. Main suite **27 passed, 21 skipped** (the skips are exactly the opt-in legacy tests ×3 projects and the Phase-7 ownership tests ×3). Styleguide suite **7 passed**. Route handlers exercised against the production server: filter with and without a category, contact POST, revalidate rejecting a bad secret and accepting a good one, the preview bar in the HTML, and mirrored media served from `/media/`.

### Deviations (and why)

- **Two dependencies added then removed.** `zod-to-json-schema` targets zod 3; zod 4 has `z.toJSONSchema()` built in. `tsx` was unnecessary because Node 26 executes TypeScript natively — which also let me drop the esbuild build-script approval from the workspace.
- **`tsconfig` gained `allowImportingTsExtensions`** so the Node-run `.mts` exporter can import `schemas.ts` explicitly.
- **`getBlogSidebar(slug)`** takes a slug, because the sidebar is part of the post payload rather than a separate resource.
- **`public/media` is committed, not ignored** — it is the snapshot. `.gitattributes` routes video and PDF through Git LFS.

### ⚠️ Before committing the media

**`git-lfs` is not installed on this machine.** `.gitattributes` is correct (verified: `.mp4` → `filter: lfs`, `.jpg` → unspecified), but committing now would put the two videos (23.6 MB) into history as ordinary blobs, permanently. Run once first:

```bash
brew install git-lfs && git lfs install
```

I left `public/media` unstaged for that reason.

### Notes

- **I killed your `pnpm dev` server.** A port-cleanup step of mine (`kill` on whatever held :3000) took it down. The styleguide suite now starts its own dev server on :3100, so it no longer depends on yours.
- One media file could not be mirrored: the Silver package hero image **404s on your server**. There is no equivalent to fall back to, so the fixture keeps the original URL and the page will show a tinted panel. Logged for the owner.

### Open questions for the owner

1. `git-lfs` install, then commit the snapshot (above).
2. The booking-form PDF still has no file on the server, so nothing was mirrored for it and no URL was invented.
3. Ready to deploy a Vercel preview whenever you want one — `DATA_SOURCE=mock`, `PREVIEW_MODE=true`.

### Next

Phase 4 — `prompts/05-global-layout.md`. **Waiting for your go-ahead.**

---

## Phase 3 follow-up — housekeeping

- **Date:** 2026-09-29

### Git LFS and the first phase commit

`git-lfs` 3.8.0 is installed. `.gitattributes` now routes **the whole media tree** through LFS (`services/frontend/public/media/**`), images included, so the snapshot can be dropped once Django serves media without rewriting history. `MANIFEST.json` is excluded — it is small text and useful in diffs.

Verified before committing: **75 of 75** media files are LFS pointers (`git lfs ls-files`), a staged blob reads as a `version https://git-lfs.github.com/spec/v1` pointer rather than image bytes, and the non-LFS staged content is **0.6 MB**. Committed as `e45073e Phase 3: data layer, API contract, media snapshot`. From here each phase ends with a `Phase N: <summary>` commit once the gates pass. Nothing is ever pushed.

### Node pinned to the LTS line

The official schedule shows **Node 24 is the current Active LTS**; Node 26 (this machine's version) does not become LTS until 2026-10-28. So `.nvmrc` is `24` and `engines.node` is `24.x` in all three workspace packages.

To verify rather than assume, Node **v24.21.0 "Krypton"** was downloaded into the scratchpad and everything run against it: `lint`, `typecheck`, `build`, `contract:export`, `fixtures:media` and `test:data` — all pass. **Native TypeScript execution is not a Node 26 feature**: type stripping has been unflagged since 22.18/23.6, so `scripts/export-contract.mts` runs on the pinned LTS without `tsx`. No runner dependency was added.

`fixtures:media` now says plainly when there is nothing left to mirror, and explains how to refresh the snapshot (re-run the Phase 0 pipeline first, which restores the absolute URLs).

### Preview deployments are not indexable

`PREVIEW_MODE=true` now adds `X-Robots-Tag: noindex, nofollow` to **every** response and serves a disallow-all `robots.txt`; a production build allows crawling and points at the sitemap. `tests/parity/preview-mode.spec.ts` reads the mode **from the running server** rather than the test runner's environment (they are configured separately) and asserts the whole invariant: preview ⇒ noindex header + disallow-all + visible banner; production ⇒ allow.

---

## Phase 4 — Global layout

- **Status:** done
- **Date:** 2026-09-29

### Built

- **`(site)/layout.tsx`** — `SkipLink` → `SiteHeader` → `main#main` → `Footer`, plus one `FloatingDock` and one `ContactModal` shared through `ContactModalProvider`.
- **`TopBar`** — phone and email as **plain text, not links** (PARITY), social icon buttons; collapses when the header turns solid.
- **`SiteHeader`** — transparent over every hero with a gradient scrim for legibility over bright photographs, solid `canopy` at 92% with blur past 24px, 88→72px. Fixed, so the state change moves nothing (asserted).
- **`PackagesMenu`** — Radix NavigationMenu with each package's real card thumbnail, 150ms hover intent, full keyboard support. The trigger is a **button, not a link**, because the live item has no `href` at all.
- **`MobileNav`** — Radix Dialog sheet: focus trap, Escape, focus return, accordion for packages, Call Now + Book Now, socials, safe-area padding. Closes on navigation via click rather than an effect.
- **`FloatingDock`** — desktop vertical pill with sliding labels, mobile stacked buttons at `max(1rem, env(safe-area-inset-bottom))`, all three hrefs verbatim, steps aside while the contact form is in view.
- **`ContactModal` + `ContactForm`** — fields from the captured list, rules mirroring the live markup exactly (name/phone/email required; nothing else), posts to `/api/forms/contact`, success cross-fades to an SVG-drawn check with the site's own "✓ Message sent successfully!".
- **`PageHero` + `Breadcrumbs`** — photo with overlays, breadcrumb above a bottom-left title, slanted-rule separator. Events breadcrumb → `/` (allowed diff).
- **`Footer`** — all links from data including the relative/broken Facebook href, the `#` TikTok and the href-less credit line.
- **Placeholder pages for all 12 route patterns**, including `[ownershipSlug]` with `generateStaticParams` + `dynamicParams = false`. 20 routes prerender.
- **Local brand SVGs** for the seven networks — no icon font, no third-party request.

### The missing-image hero

The Silver package's hero 404s on the owner's server. Rather than a broken photo, the hero's **backdrop is always** a `canopy-deep` panel with a faint leaf-vein pattern and a soft brass glow; the photograph simply layers over it. If the file is missing — or any future URL breaks — the panel is what remains, with the same breadcrumb and title layout, so the page reads as designed. Implemented as an `onError` fallback rather than a data flag, so it also covers a URL that breaks later. Added to the styleguide.

### Defects found and fixed

1. **`tailwind-merge` silently dropped every custom font size.** `cn("text-h1", "text-mist")` kept only `text-mist` — it cannot tell a custom size from a custom colour, so the About hero's `<h1>` rendered at **17px instead of 72px**. `src/lib/utils.ts` now builds `cn` from `cn/config` with our font sizes, colours, radii and shadows registered. This was silently affecting every component that combined a size with a colour.
2. **Contact form submitted `address=""` instead of `"N/A"`.** The settings extractor never captured hidden-field *values* (only `forms.json` did). Fixed at capture time — and the CSRF token is still excluded.
3. **Focus was not returned** after closing the contact modal. It is opened programmatically, so Radix had no trigger to restore to. Now the opener is remembered and restored from `onCloseAutoFocus`. **WebKit needed more**: it does not focus a button on tap, so `document.activeElement` was `<body>` — the dock now passes its own element. Caught only because the tests run on WebKit.
4. **The packages dropdown announced "Membership Card Gold Ownership"** — the thumbnail's alt duplicated the label. Marked decorative.
5. **Two `setState`-in-effect violations** (mobile nav, dock) replaced with event handlers and derived state.
6. Mobile menu's last item sat flush against the sticky footer block; scroll padding added.
7. **Playwright worker contention** made `/offer` time out in the full run while passing in isolation — three browser projects against one server. Workers capped at 4 (2 in CI).

### Verification

`format:check` · `lint` · `typecheck` · `build` clean. Main suite **91 passed / 29 skipped**; styleguide **7 passed**.

- **Link parity** (`tests/parity/links.spec.ts`) passes on desktop and mobile for all five chrome regions across 8 routes. Both sides are normalised (`https://indexecoresort.com/offer` ≡ `/offer`), each component tags its own `data-region`, and both menus are opened before collecting. Allowed diffs now carry **explicit `hrefs`** so the test is exact rather than scraping prose.
- **`tests/parity/chrome.spec.ts`** — 34 tests across Chromium desktop, Chromium mobile and **WebKit mobile**: header scroll state with no layout shift, active-page marking, keyboard dropdown, mobile menu focus trap/Escape/focus return, About → `/about-us`, Call Now's third number, dock hrefs verbatim, safe-area inset ≥16px, 44px touch targets, modal validation → submit → success → focus return, the exact payload keys with `address="N/A"`, and axe on three routes.

### Allowed diffs added

The dock exposes **WhatsApp twice with different numbers** — the button uses `+8801700729312` while a hover panel and a `display:none` widget use `+8801711307580`. Shipping two WhatsApp buttons with contradicting numbers would pass the contradiction to visitors, so there is one action using the button's own destination. Recorded with the owner action, and added to OWNER-REPORT §B as item 15.

### Screenshots (`audit/screenshots/after/`)

`chrome-home@{390,768,1440}` · `chrome-about@{390,768,1440}` · `chrome-hero-missing-image` · `chrome-packages-menu@1440` · `chrome-mobile-nav@390` · `chrome-mobile-nav-webkit@390` · `chrome-contact-modal@390`

### Notes

- The styleguide suite needs a dev server; when one is already running for this directory Next refuses a second, so it was run with `STYLEGUIDE_BASE_URL` against the one on :3001.
- The contact form's placeholders repeated their labels word for word. The label is the accessibility requirement and stays; the duplicate placeholder is dropped when it only repeats it.

### Next

A Vercel preview deployment, once you have chosen the access protection. Then Phase 5 — `prompts/06-home.md`.

---

## Phase 4 follow-up — preview deployment prepared

- **Date:** 2026-09-29

### `docs/DEPLOY-PREVIEW.md`

The exact Vercel settings for this repo: Root Directory `services/frontend`,
**Include files outside the Root Directory** on (the lockfile and
`pnpm-workspace.yaml` are at the repo root), Node **24.x**, Git LFS enabled, and
`PREVIEW_MODE=true` / `DATA_SOURCE=mock` / `NEXT_PUBLIC_SITE_URL` on **both**
Production and Preview — with `LARAVEL_ORIGIN` and `LEGACY_ORIGIN` **absent**.

**Verified, not assumed:** `pnpm install --frozen-lockfile` succeeds at the repo
root, and a clean build with exactly those variables produces all 20 routes.
Running that build confirmed `X-Robots-Tag: noindex, nofollow`, a disallow-all
`robots.txt`, `/public/storage/*` → 404, unknown paths → 404, `/styleguide` →
404, `/media/...` served, and the preview bar present.

### `pnpm verify:preview <url>`

Thirty checks against a deployed URL, printed as a pass/fail table and exiting
non-zero on failure: indexability (noindex on HTML **and** API, robots.txt),
isolation (legacy media 404s, unknown paths are ours, **`/about-us` is rendered
by this app**, styleguide hidden), every route 200 with exactly one non-empty
`<h1>`, the preview banner, and media returning real `image/*` / `video/*`
rather than Git LFS pointers.

**Proven in both directions.** Against the build from those settings: **30/30
passed**. Against the Phase 1 deployment still live at
`index-eco-resort.vercel.app`: **15 failed** — including `legacy
/public/storage/* not served → HTTP 200` and `/about-us rendered by this app →
served the OLD Laravel page`. A verifier that has never failed proves nothing.

### ⚠️ What is live at `index-eco-resort.vercel.app` today

It is the **Phase 1** build, whose `LARAVEL_ORIGIN` defaulted to the live site
with a fallback rewrite. So that URL is currently a **public, crawlable mirror
of the client's site**: `/about-us` serves the real Laravel page (61 KB, old
markup), `/public/storage/*` serves the real CMS media, there is no
`X-Robots-Tag` and `/robots.txt` 404s. Deploying this phase replaces all of
that — `LEGACY_ORIGIN` is unset by default and preview mode locks crawlers out.

### Also

`tests/parity/packages.spec.ts` was still skipping itself behind a
`ROUTE_EXISTS = false` flag from Phase 3. The `[ownershipSlug]` route exists as
of Phase 4, so the guard is now active: 15 tests across the three projects,
checking each package slug renders and an unknown slug 404s.

**Suite: 106 passed / 14 skipped** — the only skips left are the opt-in legacy
fallback tests, which is correct with `LEGACY_ORIGIN` unset.

### Next

You push and deploy; then I run `pnpm verify:preview https://index-eco-resort.vercel.app` and report. Phase 5 (`prompts/06-home.md`) waits for your go.

---

## Phase 5 — Home page

- **Status:** done
- **Date:** 2026-09-29

### Built

All twelve sections from audit §5.1, in the tone order of design-system §2.3.
Four are **reusable**, as About, Gallery and the package pages depend on them:
`AboutBlock`, `GallerySection`, `CtaStrip` and `PlanGrid`/`PlansStage` (the
latter wrapping the Phase 2 `MembershipCard`). `PostCard` was also added for
`LatestPosts` and the blog phases.

**The hero** reproduces the live two-slide carousel: the settings video first,
then the banner image, rotating every 6 s — and the video slide advances when
the clip ends rather than on a timer, as the original's JS does. One control
pauses both the rotation and the video; autoplay also stops on hover and
keyboard focus, and never starts under reduced motion. The single `<h1>` lives
on the slide that has a title and is **never `aria-hidden` or `display:none`**,
so it stays in the accessibility tree while slide 1 shows — asserted by walking
the ancestors. Empty CMS fields render nothing at all.

### Data quirks kept as data (PARITY)

The "3454 / 45645645" test slide · "Chuti Resort Gazipur" in both room
descriptions · the tab labelled "Cottage" containing "Executive Suite" ·
"Strategic Investment Locatio" · the placeholder testimonial and the two avatars
hotlinked from a theme demo (now mirrored into the snapshot) · every `#` link.
All listed in `docs/OWNER-REPORT.md` §B. The gallery lightbox uses the Phase 3
repaired URLs.

### ffmpeg — not available, so skipped

`ffmpeg` is not installed, so no compressed mobile variant was produced, as you
said to skip in that case. **Before/after sizes: 18.0 MB → unchanged** (and the
About-block clip, 5.9 MB → unchanged).

That matters more than a missing nicety: an 18 MB autoplaying hero video is the
page's single largest performance liability. With it loading, Lighthouse mobile
measured **3.6 MB transferred and LCP 4.7 s**. So the video now autoplays only
where there is bandwidth for it — not on viewports under 1024 px, not on
Save-Data, not on a 2G/3G connection. Everywhere else the hero shows the
patterned canopy panel and the play control fetches the video on request. A test
asserts **zero video bytes on a phone-sized viewport**. Recorded for the owner
as §B15: a ~720p re-export under 4 MB would let it autoplay everywhere.

### Lighthouse (production build, `/`)

| Run | Perf | LCP | CLS | A11y | Best practices |
|---|---|---|---|---|---|
| **Mobile, real (devtools) throttling** | **92** | **1.9 s** | **0** | **99** | 100 |
| Mobile, Lighthouse default (simulated) | 79 | 4.7 s | 0.028 | 99 | 100 |
| Desktop, real throttling | 91 | 0.1 s | 0 | 99 | 100 |

**The gates are met under real throttling and not under the simulated model,**
so both are given. The simulated figure is Lantern's *estimate*, not a
measurement; a direct `PerformanceObserver` reading under emulated slow 4G put
LCP at **1,368 ms**, agreeing with the real-throttling run. I have not been able
to make the simulated number agree, and I would rather show you both than pick
the flattering one.

Getting there took two real fixes:

1. **Fonts were 700 KB and preloaded.** Dropping Anek's `wdth` axis cut the
   largest file 440 KB → 156 KB (total 700 → 384 KB), and `preload: false` kept
   the Bengali subsets off the critical path — `display: swap` already renders
   in the fallback first. That single change took mobile from 86 to **92** and
   LCP from 2.8 s to **1.9 s**. The cost: the design system's `wdth: 110` on
   small labels is gone; the inert declarations were removed rather than left to
   mislead, and the trade-off is documented in `src/app/layout.tsx`.
2. **The hero video**, as above.

SEO reads 58 because the preview build blocks indexing on purpose; the other
deduction is "links do not have descriptive text", which is the CMS's own
"READ MORE →" labels.

### Defects found and fixed

1. **The pause control was unclickable.** The highlights panel overlaps the hero
   by 64 px and sat on top of it, so the one control WCAG 2.2.2 requires could
   not be pressed at all. Found because the test tried to click it.
2. **The leaf-vein pattern was invisible everywhere.** The SVG used
   `stroke="currentColor"`, which does nothing when the file is loaded as a CSS
   `background-image` — an external SVG cannot inherit from the host document.
   It had been silently absent from the hero *and* from the Phase 4 missing-image
   page hero. Now an explicit stroke, with opacity doing the work.
3. **A star rating with `aria-label` on a bare `<div>`** — a prohibited
   attribute (axe, serious). Now `role="img"`.
4. Two `setState`-in-effect violations, replaced with derived state.
5. The gallery grid re-layout, tab panels and chips needed `exact` locators —
   "Cottage" matches "Family Cottage" too.

### A correction to Phase 0

I recorded that Home's gallery lets a category tab show **more** items than
"All". That is wrong: no single category (max 11) exceeds All (12). The real
oddity is that **8 of the 20 images are reachable only through a category tab
and never appear under "All"**. Corrected in the component comment and asserted
in the test.

### Verification

`format:check` · `lint` · `typecheck` · `build` clean. Suite **142 passed / 17
skipped** across Chromium desktop, Chromium mobile and WebKit mobile; styleguide
**7 passed**. Link parity now covers region **`main`** on `/` as well as the five
chrome regions. Reduced-motion and keyboard walkthroughs are tests, not claims:
nothing autoplays under `prefers-reduced-motion`, and tabbing lands on more than
twelve distinct controls without a trap.

### Allowed diffs added

Gallery tiles (and room photographs) are **buttons opening a lightbox** rather
than anchors to the raw `.jpg`. The design system specifies a lightbox with
caption, counter, keyboard and swipe; navigating to a bare image file leaves the
site with no caption and no way back. Recorded with a pattern covering every
image destination.

### Deviations

- **No compressed video variants** (ffmpeg absent), handled as above.
- **Anek's `wdth` axis dropped** for 284 KB, as above.
- **The hero's first paint is the patterned panel, not a video poster.** The CMS
  provides no poster image and no frame can be extracted without ffmpeg.

### Artifacts (`audit/screenshots/after/`)

`home@390.png` · `home@768.png` · `home@1440.png` ·
`home-scroll-1440.webm` · `home-scroll-390.webm` · `home-plans-card-tilt.webm`

### Next

Phase 6 — `prompts/07-about.md`. **Waiting for your go-ahead.** Say the word when
the preview is deployed and I will run `verify:preview` against it.

---

## Phase 5 follow-up — hero video on phones

- **Date:** 2026-09-29

ffmpeg is available, so the variants the CMS never provided are now derived from
the mirrored media by `pnpm media:variants` (re-runnable, originals untouched).

### Before / after

| File | Original | Phone encode | Poster |
|---|---|---|---|
| Hero background | **17.71 MB** (720×960, **with an AAC track it never plays**) | **3.54 MB** (−80%, audio dropped, faststart) | 104 KB |
| About block clip | **5.93 MB** (960×540, no audio) | **3.61 MB** (−39%, faststart) | 96 KB |

Both encodes are under the 4 MB target, keep their source resolution and
orientation, and `moov` sits before `mdat` (verified) so playback can start
before the file is whole.

**The posters are chosen, not guessed.** The script scores candidate frames
between 12% and 88% of each clip on brightness and saturation, penalises
blown-out frames, then hands the winner to ffmpeg's `thumbnail` filter to pick
the most representative frame nearby. The hero's poster came out as the
resort's own entrance gate at golden hour — much better than the fade-in the
clip opens on.

### What changed on the page

- The poster is the pre-video state **everywhere** — hero and the About dialog —
  served through `next/image`, `priority` on the first slide, and it is the LCP
  element. The patterned panel is now only the fallback for a video with no
  variants.
- `<source media="(max-width: 1023px)">` serves the phone encode below 1024px
  and the original above it; sources are not attached until loading is allowed,
  so the element has nothing to fetch before then.
- **Autoplay now waits for the largest paint**, via a `PerformanceObserver` on
  `largest-contentful-paint` (with an idle callback and a 3s floor as
  fallbacks) — previously it merely waited for idle.
- Save-Data and 2G/3G still get the poster only; the play control fetches on
  request.

### Lighthouse mobile, `/`

| Run | Perf | LCP | CLS | A11y | Video fetched |
|---|---|---|---|---|---|
| Real (devtools) throttling | **94** (was 92) | **1.9 s** | **0** | 99 | 0.00 MB |
| Simulated (Lighthouse default) | **87** (was 79) | 3.9 s (was 4.7 s) | 0.027 | 99 | 3.13 MB |

### The simulated-LCP gap — cause identified, no fix applied

Within the time budget, and the answer is in Lighthouse's own metrics:

```
observedLargestContentfulPaint:  116 ms      ← what it measured
largestContentfulPaint:        3,932 ms      ← what Lantern projected
firstContentfulPaint:          1,671 ms
```

**Lighthouse measured LCP at 116 ms and then modelled 3.9 s.** The
`largest-contentful-paint-element` audit is absent from the report entirely, so
it names no element — which is why I could not report a phase breakdown; there
is none to report.

The mechanism is visible in the request log: 20+ images are requested within
~130 ms of each other. That is not eager markup — I checked the rendered DOM and
**only 3 images are eager** (logo, hero poster, slide-2 banner, all above the
fold) while **37 below-fold images carry `loading="lazy"`**. Chrome's lazy-load
distance threshold widens on a fast connection, and Lighthouse's observation
pass runs *unthrottled*, so the browser pulls in far more than a real phone
would; Lantern then applies slow-4G timings to all of it. Under real throttling
the threshold narrows and the score is 94.

So the markup is right and the gap is a modelling artifact. Left alone for you
to confirm against the deployed URL with PageSpeed Insights, as agreed.

### Labels

`wdth: 110` was replaced by `letter-spacing: 0.02em` via a `.label-track` class
scoped `:not(:lang(bn))` — Bangla never gets tracking (§4.3). Applied to Button,
Field, Tag and Tabs.

### Tests

`home.spec.ts` now asserts: **no `.mp4` is requested before the recorded LCP**
(read from a real `PerformanceObserver`, not a fixed delay); **zero video bytes
with Save-Data on**, with the poster still visible; and that the phone encode is
offered at `(max-width: 1023px)` with the original as the fallback source.

Suite **149 passed / 16 skipped**.

---

## Phase 6 — About `/about-us`

- **Date:** 2026-09-30
- **Prompt:** `prompts/07-about.md`

Five sections, two of them components Home already owns:

```
PageHero  →  AboutBlock  →  PlansStage  →  VisionMissionTabs  →  CoreValues
(canopy-deep)   (mist)     (canopy-deep)       (mist)              (paper)
```

`AboutBlock` and `PlansStage` are imported unchanged from
`components/sections/home/` — no fork, no props bent to fit. The About block
picks up the derived poster from the phone-video work automatically, because
the poster is resolved from the video URL rather than passed in.

### Vision / Mission / Approach

A **split header**: eyebrow and H2 on the left, the segmented pill strip
opposite them, then the panel underneath. The strip lives inside
`SectionHeader`'s `aside`, so the section opens as one composed row instead of
three stacked bands.

- **Labels with spaces produce valid ids.** The Phase 2 fix in `Tabs` holds:
  `toValue()` turns "Our Vision" into `our-vision` for the `aria-controls`
  IDREF while the visible label stays as the CMS wrote it. A test now asserts
  the invariant directly — every `aria-controls` is whitespace-free and
  resolves to exactly one element.
- **Kickers render as stored.** "Our Vision", not "// OUR VISION": the live
  site's `//` is two skewed `<span>`s drawn by CSS, and the caps come from
  `text-transform`. Our eyebrow treatment (§3.3) is a brass hairline with no
  caps and no tracking, and the stored string passes through untouched. A test
  asserts the exact text.
- **Paragraphs are split only where the data has breaks.** `paragraphs()`
  splits on blank lines and nothing else; the lead-sized opener appears only
  when that yields more than one. Today every tab yields exactly one, and the
  test derives its expected count from the fixture, so the assertion follows
  the content instead of freezing today's answer.
- **`Reveal` runs on first view only.** Radix unmounts inactive panels, so
  without care the unveil replayed on every tab switch. `Tabs` now exports
  `useTabsSwitched()`; after the first switch the panel relies on the
  cross-fade the tab change already provides.

**A CMS finding worth its own line.** The "Our Approach" field holds *six*
paragraphs — the author's blank lines are in the stored value. The Laravel
template prints the field inside a single `<p>`, where HTML collapses them, so
the live page has always shown one block of text. Rendering six here would have
been the frontend inventing structure, which is exactly what rule 9a forbids, so
it stays one paragraph and the discovery is now OWNER-REPORT §B6 for the owner
to decide once Django serves the field.

### Core values

Six tiles, the CMS's order, `gold` → lichen and `dark` → canopy. Contrast comes
from §2.2: ink on lichen is 8.1:1 and lichen on canopy 7.3:1, so the body copy
passes AA on both. Hover draws a 1px brass rule across the top in 300ms — the
tile's only movement.

**One deliberate deviation.** The live site goes to **two columns** between
481px and 768px, which turns the checkerboard into two solid stripes: one
all-lichen column beside one all-canopy column. The alternation is the point of
the block, so the layout goes straight from one column to three. A test proves
it at 390, 768 and 1440: the order matches the fixture, no two neighbours share
a background, and the grid is never two columns.

### The h1 regression guard

Phase 4's tailwind-merge fault rendered this page's `<h1>` at 17px instead of
72px. The test now injects a probe element with `font-size: var(--text-h1)` and
compares computed sizes, so it holds at every viewport without hard-coding a
clamp result.

### Lighthouse mobile, `/about-us` (production build)

| Run | Perf | LCP | CLS | A11y | Best practices |
|---|---|---|---|---|---|
| Real (devtools) throttling | **96** | **1.6 s** | **0** | **100** | **100** |
| Simulated (Lighthouse default) | 78 | 5.6 s | 0.001 | 100 | 100 |

**This time the LCP element is identified.** Under 1.6 Mbps + 4× CPU
throttling, a buffered `PerformanceObserver` names it: the hero photograph,
painting at **880 ms**.

```
observedLargestContentfulPaint:  1,278 ms    ← what Lighthouse measured
largestContentfulPaint:          5,580 ms    ← what Lantern projected
```

The waterfall is already right: the image is requested **20 ms** after the
document at High priority (`priority` → `fetchpriority=high`), transfers
**27 KB** as AVIF, and finishes at 525 ms. Total page weight 0.70 MB, server
response 10 ms, nothing render-blocking. The gap is Lantern re-timing that
waterfall against a modelled slow-4G connection — and it is larger here than on
Home (5.6 s vs 3.9 s) for a structural reason: Home's LCP element is a text
node, About's is an image, so Lantern puts a download on the critical path.

Nothing to fix in the markup. Worth confirming against the deployed URL with
PageSpeed Insights, which measures rather than models.

### Also in this phase

- `OWNED_ROUTES` now holds `/about-us`, which brings it into the axe gate, the
  one-h1/no-console-errors gate, and **`main`-region link parity** — all seven
  captured content links reproduce, `href="#"` placeholders included (rule 9b).
- The visual screenshot helper waits for images to have a `naturalWidth` before
  shooting. It was capturing the large CMS photographs as empty placeholder
  boxes. (`complete` is the wrong predicate: the membership cards keep a
  request in flight for a larger srcset candidate long after they can draw.)
- The vision/mission tab strip sets its own top margin below `lg`, where
  `SectionHeader`'s row gap does not apply because the header is not a grid
  there.

### Gates

`format:check` · `lint` · `typecheck` · `build` — all pass.
Suite **234 passed / 18 skipped**, across Chromium desktop, Chromium mobile and
WebKit mobile. Includes `/about_us` → 308 → `/about-us`, axe with no serious or
critical violations, reduced-motion and keyboard walkthroughs.

**Artifacts:** `audit/screenshots/after/about-us@{390,768,1440}.png` ·
`about-scroll-390.webm`
