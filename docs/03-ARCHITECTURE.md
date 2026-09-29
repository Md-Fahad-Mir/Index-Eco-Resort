# 03 — Architecture

> Updated after Phase 0 (2026-09-29): monorepo layout, `/event` filtering, comment form, `/about_us`, test paths. Where this conflicts with `docs/01-SITE-AUDIT.md §11`, §11 wins.

## 1. Guiding decisions

**Scope (2026-09-29): the Next.js frontend only.** There is no Laravel source and no backend work in this project. A **Django backend will be built later**, by someone else.

- **The frontend is self-contained.** It runs on the Phase 0 snapshot — `src/fixtures/*.json` plus the mirrored media in `public/media/` — so nothing depends on the old server being up.
- **The zod schemas are the contract.** `src/lib/data/schemas.ts` defines exactly what Django must return; `pnpm contract:export` publishes it as JSON Schema plus `docs/API-CONTRACT.md`. Field names, text values and slugs stay as captured, and Django must reproduce every current URL (`/gold-ownership-2`, `/events/{slug}`, `/blog-details/{slug}`, …).
- **Two adapters, one interface.** `mock` reads the fixtures (default); `api` is a generic REST client against `API_BASE_URL`, written to the contract and unused until Django exists. Pages and components cannot tell them apart.
- **The snapshot seeds the database.** `src/fixtures/` + `public/media/` are the content handoff for whoever builds Django.
- **Legacy fallback is opt-in.** A rewrite to the old site is available via `LEGACY_ORIGIN` for a transitional deployment, but it is unset by default and the frontend does not assume it.

## 2. Folder structure

```
.                                  ← repo root (git, pnpm workspace)
├─ CLAUDE.md · README.md
├─ pnpm-workspace.yaml · package.json   # workspace: services/frontend, audit/scripts
├─ docs/                            # this kit + PROGRESS.md + OWNER-REPORT.md
│  ├─ API-CONTRACT.md               # handoff for the Django developer
│  └─ api-contract/                 # JSON Schemas generated from the zod schemas
├─ prompts/                         # phase prompts
├─ audit/                           # Phase 0 outputs (html, links.json, forms.json, meta.json, screenshots, scripts/)
└─ services/frontend/               # the Next.js app (all paths below are relative to it)
   ├─ public/                       # favicons, og fallback, local SVG patterns
   ├─ src/
   │  ├─ app/
   │  │  ├─ layout.tsx              # <html>, fonts, globals, providers
   │  │  ├─ (site)/
   │  │  │  ├─ layout.tsx           # TopBar, SiteHeader, FloatingDock, ContactModal, Footer
   │  │  │  ├─ page.tsx             # Home
   │  │  │  ├─ about-us/page.tsx
   │  │  │  │                        # (no about_us/ route — next.config redirects it 308 → /about-us)
   │  │  │  ├─ [ownershipSlug]/page.tsx   # gold-ownership-2 … (generateStaticParams; else notFound)
   │  │  │  ├─ offer/page.tsx
   │  │  │  ├─ book-now/page.tsx
   │  │  │  ├─ event/page.tsx
   │  │  │  ├─ events/[slug]/page.tsx
   │  │  │  ├─ blogs/page.tsx
   │  │  │  ├─ blog-details/[slug]/page.tsx
   │  │  │  ├─ gallery/page.tsx
   │  │  │  ├─ contact/page.tsx
   │  │  │  └─ not-found.tsx
   │  │  ├─ api/
   │  │  │  ├─ forms/contact/route.ts     # submitForm target (mocked in DATA_SOURCE=mock)
   │  │  │  ├─ events/filter/route.ts     # same params + logic as the live filter (mock: filters fixtures)
   │  │  │  └─ revalidate/route.ts        # on-demand cache invalidation (secret)
   │  │  ├─ sitemap.ts
   │  │  └─ robots.ts
   │  ├─ components/
   │  │  ├─ ui/          # Button, TextLink, IconButton, Eyebrow, SectionHeader, Tag, Field, Select, DatePicker, Tabs…
   │  │  ├─ layout/      # TopBar, SiteHeader, PackagesMenu, MobileNav, FloatingDock, ContactModal, PageHero, Breadcrumbs, Footer, Container, Section
   │  │  ├─ media/       # SmartImage, HeroCarousel, BackgroundVideo, VideoModal, LiteYouTube, Lightbox, Slider
   │  │  ├─ typography/  # Text, Heading, Prose (autoLang aware)
   │  │  ├─ ownership/   # MembershipCard, PlanGrid, BenefitsList, PackageIntro
   │  │  ├─ events/      # EventCard, EventFilters, EventInfoPanel (CommentForm only behind features.eventCommentForm)
   │  │  ├─ blog/        # PostCard, BlogSidebar, ShareLinks, PostMeta
   │  │  ├─ forms/       # ContactForm, FormSuccess
   │  │  └─ sections/
   │  │     ├─ home/     # Hero, Highlights, AboutBlock, ProjectGlance, GallerySection, CtaStrip, WhyBuy, Villa, Restaurant, Testimonials, LatestPosts
   │  │     ├─ about/    # VisionMissionTabs, CoreValues
   │  │     └─ contact/  # ContactSplit, HotlineBand, InfoCards
   │  ├─ config/
   │  │  ├─ features.ts  # optional enhancements, all false (smoothScroll, viewTransitions, offerPosterLightbox, eventCommentForm)
   │  │  └─ site.ts      # static non-CMS config (breakpoints, revalidate seconds)
   │  ├─ lib/
   │  │  ├─ data/
   │  │  │  ├─ index.ts        # public API used by pages: getHome(), getPackage(slug) …
   │  │  │  ├─ schemas.ts      # zod schemas = the contract (types inferred)
   │  │  │  ├─ adapters/mock.ts        # the Phase 0 fixtures (default)
   │  │  │  └─ adapters/api.ts         # generic REST against API_BASE_URL (for Django)
   │  │  ├─ lang.ts            # autoLang(), isBangla()
   │  │  ├─ sanitize.ts        # CMS HTML sanitizer (allowlist)
   │  │  ├─ format.ts          # date/time display helpers (display only, never mutate data)
   │  │  └─ seo.ts             # metadata + JSON-LD builders
   │  ├─ fixtures/             # JSON captured in Phase 0 — the Django seed data
   │  └─ styles/globals.css
   ├─ public/media/            # mirrored Phase 0 media, original relative paths
   ├─ scripts/                 # fixtures-media.mjs, export-contract.mjs
   └─ tests/                   # Playwright; baselines read from ../../audit/
      ├─ parity/   # links, forms, routes, interactions, allowed-diffs.ts
      ├─ a11y/
      └─ visual/
```

## 3. Route map → files

| Public path | File | Data call |
|---|---|---|
| `/` | `(site)/page.tsx` | `getHome()` |
| `/about-us` | `(site)/about-us/page.tsx` | `getAboutPage()` |
| `/about_us` | `next.config` `redirects` → 308 `/about-us` (rule 9c) | — |
| `/{package-slug}` | `(site)/[ownershipSlug]/page.tsx` | `getPackage(slug)`; `generateStaticParams` from `getPackages()`, `notFound()` otherwise |
| `/offer` | `(site)/offer/page.tsx` | `getOffer()` |
| `/book-now` | `(site)/book-now/page.tsx` | `getBookNow()` |
| `/event` | `(site)/event/page.tsx` | `getEvents()` for the initial list; filtering calls `app/api/events/filter` from a client leaf with the live site's params `start_date`, `end_date`, `category_id` (dates `d-m-Y`) and the same guard/empty-state logic (`audit/interactions.md §5`). Results always link to `/events/{slug}` (allowed diff vs the live `/event-details/{id}`). No URL change — the live site does not change it |
| `/events/{slug}` | `(site)/events/[slug]/page.tsx` | `getEvent(slug)`, `getRelatedEvents(slug)` |
| `/blogs` | `(site)/blogs/page.tsx` | `getPosts(page?)` |
| `/blog-details/{slug}` | `(site)/blog-details/[slug]/page.tsx` | `getPost(slug)`, `getRecentPosts()`, `getBlogSidebar()` |
| `/gallery` | `(site)/gallery/page.tsx` | `getGallery()` |
| `/contact` | `(site)/contact/page.tsx` | `getContactPage()` |

**Ownership routing.** One dynamic segment, `(site)/[ownershipSlug]/page.tsx`, with `generateStaticParams()` from `getPackages()` and `notFound()` for anything else. A package added in Django gets its page automatically.

> **Caveat, verified in Phase 1 (Next 16.3.6):** a root-level dynamic segment **defeats a `fallback` rewrite** for every unknown single-segment path — the segment matches first, `notFound()` renders Next's own 404, and `fallback` never runs (it only applies when no route matches). Two-segment paths still fall back. This only matters if `LEGACY_ORIGIN` is set for a transitional deployment; if it ever is, and unknown single-segment paths must reach the old site, use `proxy.ts` (Next 16's middleware) to rewrite them before routing.

## 4. Rendering & caching

- All pages are Server Components, statically rendered and revalidated (target: 300s), plus tag-based on-demand invalidation: `packages`, `gallery`, `events`, `posts`, `settings`, `pages`.
- Use the caching primitives of the installed Next.js version (check its docs: fetch cache options / `revalidateTag(tag, profile)` / cache components). Keep all caching inside `src/lib/data/adapters/api.ts` so pages stay version-agnostic.
- `/event` renders statically with every event; filtering is a client-side request to `/api/events/filter` (mock: filters fixtures; api: forwards to Laravel `/events/filter`). Same params and logic as the live AJAX filter; no query string (the live site has none).
- `POST /api/revalidate?secret=…&tag=…` lets the future Django admin refresh content immediately after a save.
- Client components: only interactive leaves. Wrap motion with `LazyMotion`.

## 5. Data layer & API contract

### 5.1 Adapters

```ts
// src/lib/data/index.ts
const adapter = process.env.DATA_SOURCE === "api" ? apiAdapter : mockAdapter;
export const getHome = () => adapter.getHome();   // returns HomeData (zod-validated)
// … one function per page / entity
```

Every adapter response is parsed with its zod schema, so a backend that drifts from the contract fails loudly instead of rendering wrong content.

- **`mock`** (default) reads `src/fixtures/*.json` and reproduces the live ordering and filtering documented in `audit/interactions.md`.
- **`api`** is a plain REST client against `API_BASE_URL` — no backend-specific code, no hand-written endpoint list beyond the contract in §5.3.

A production build with `DATA_SOURCE=mock` **fails** unless `PREVIEW_MODE=true`, so fixture content can never be shipped as if it were live. In preview mode the site shows a slim bar reading "Preview — forms are not sent".

### 5.2 Contract (TypeScript shape; zod schemas mirror this)

```ts
type Img = { src: string; alt: string; width?: number; height?: number };
type Link = { label: string; href: string };            // href kept verbatim ("#" allowed)
type Social = { network: "facebook"|"x"|"twitter"|"youtube"|"linkedin"|"instagram"|"tiktok"|"whatsapp"|string; href: string };

type SiteSettings = {
  logo: Img; siteName: string;
  topBar: { phone: { label: string; href: null }; email: { label: string; href: null }; socials: Social[] }; // plain text on the live site
  nav: { label: string; href: string; children?: Link[] }[];        // desktop
  mobileNav: { label: string; href: string; children?: Link[] }[];  // mobile (different hrefs!)
  mobileCallNow: Link;                                              // tel:09638657301
  bookNow: Link;
  floatingDock: { contactLabel: string; whatsapp: Link; phone: Link; extraLinks?: Link[] };
  contactModal: { title: string; successMessage: string; fields: FormField[]; endpoint: string };
  footer: {
    about: string; socials: Social[];
    quickLinks: Link[]; packageLinks: Link[];
    phone: Link; email: Link; workingHours: string; whatsapp?: Link;
    copyrightSite: string; copyright: string; creditLabel: string; creditSite: string;
  };
};

type PageHero = { title: string; image: Img; breadcrumb: { home: Link; current: string } };

type HomeData = {
  hero: { videoUrl: string; poster?: Img; subline: string; title: string; cta: Link };
  highlights: { icon: Img; title: string; subtitle: string; cta: Link }[];
  about: AboutBlock;
  glance: { eyebrow: string; title: string; facts: { label: string; value: string }[]; slides: { image: Img; caption: string }[] };
  gallery: Gallery;              // plus visibleCount for Home (from Phase 0)
  ctaStrip: { avatar: Img; text: string; cta: Link };
  plans: PlansBlock;
  whyBuy: { eyebrow: string; title: string; features: { title: string; text: string }[]; image: Img };
  villa: { eyebrow: string; title: string; rooms: Room[] };
  restaurant: { eyebrow: string; title: string; text: string; cta: Link; image: Img };
  testimonials: { eyebrow: string; title: string; items: Testimonial[] };
  latestPosts: { eyebrow: string; title: string; posts: PostSummary[] };
};

type AboutBlock = {
  images: [Img, Img, Img]; videoUrl: string; eyebrow: string; title: string; text: string;
  features: { icon?: Img; title: string; text: string }[];
  cta: Link; phoneLabel: string; phone: Link;
};
type Gallery = { eyebrow: string; title: string; categories: { id: string; name: string }[];
  items: { id: string; categoryId: string; categoryName: string; title: string; image: Img; fullSrc: string }[] };
type PlansBlock = { eyebrow: string; title: string; packages: PackageSummary[] };
type PackageSummary = { slug: string; name: string; card: Img; href: string };
type OwnershipPackage = PackageSummary & {
  hero: PageHero; heading: string; discountText: string; cta: Link;
  benefitsTitle: string; benefits: string[]; youtubeId: string; plans: PlansBlock;
};
type Room = { tabLabel: string; name: string; paragraphs: string[]; images: Img[];
  amenities: { label: string; value: string }[]; cta: Link };
type Testimonial = { quote: string; name: string; role: string; avatar: Img; rating: number };
type PostSummary = { slug: string; href: string; title: string; excerpt: string; image: Img };
type Post = PostSummary & { category: string; publishedAt: string; commentsLabel: string; readTime: string;
  html: string; tags: string[]; shareLinks: Social[] };
type BlogSidebar = { recent: PostSummary[]; categories: { name: string; count: number; href: string }[];
  cta: { title: string; text: string; link: Link } };
type EventSummary = { slug: string; href: string; title: string; excerpt: string; image: Img;
  day: string; monthYear: string; category: { id: string; name: string; href: string };
  timeRange: string; location: string };
type EventDetail = EventSummary & { banner: Img; html: string; startDate: string; endDate: string;
  time: string; bookingCta: Link;
  // Captured for OWNER-REPORT only. The live block is decorative (no form, no endpoint);
  // rendered only when features.eventCommentForm is true.
  comments: { enabled: false; title: string; note: string; fields: FormField[]; submitLabel: string } };
type Offer = { hero: PageHero; headline: string; lead: string; body: string; poster: Img; terms: string };
type BookNow = { hero: PageHero; text: string; download: Link };   // download.href rendered as-is; no file path today → OWNER-REPORT
type AboutPage = { hero: PageHero; about: AboutBlock; plans: PlansBlock;
  visionMission: { eyebrow: string; title: string; tabs: { label: string; kicker: string; title: string; html: string; image: Img }[] };
  coreValues: { title: string; intro: string; items: { title: string; text: string }[] } };
type ContactPage = { hero: PageHero; form: { fields: FormField[]; submitLabel: string; endpoint: string };
  mapEmbedUrl: string; hotline: { label: string; phone: Link }; infoCards: { icon: "location"|"building"; text: string }[] };
type FormField = { name: string; label: string; type: "text"|"tel"|"email"|"textarea"|"checkbox"|"url";
  required: boolean; placeholder?: string; maxLength?: number; pattern?: string };
```

Field names and texts are captured from the live site in Phase 0, never invented.

### 5.3 The API contract (for the future Django backend)

Generated from the zod schemas by `pnpm contract:export` into `docs/api-contract/*.json` (JSON Schema) and summarised in `docs/API-CONTRACT.md`. That file is the handoff document; this section is the shape of it.

```
GET  /settings
GET  /pages/home | about | offer | book-now | contact
GET  /packages                    GET /packages/{slug}
GET  /gallery
GET  /events                      GET /events/{slug}
GET  /events/filter?start_date=&end_date=&category_id=
GET  /posts                       GET /posts/{slug}
POST /forms/contact
```

- **`/events/filter`** keeps the live parameter names and formats: `start_date` and `end_date` as `d-m-Y` (e.g. `29-09-2026`), `category_id` as the category's id, empty meaning "all". The same guard applies: one date without a category returns the unfiltered list.
- **Validation errors** are `HTTP 422` with `{"errors": {"field": ["message", …]}}`, so the form layer can map them back onto fields.
- **Media** URLs may be absolute or relative; the frontend resolves them through `assetUrl()` against `MEDIA_BASE_URL`.

## 6. Forms

- react-hook-form + zod, with the field list, names and client-side rules captured in `audit/forms.json`. The contact modal and the contact page have the **same field names but different rules** (the modal marks name/phone/email required and hides `address` with the literal value `N/A`; the page form enforces nothing and uses `type=number` for phone), so they get two schemas.
- Submission goes through one adapter function:

```ts
submitForm(kind: "contact", payload: Record<string, string>): Promise<SubmitResult>
```

  - **mock** — waits ~600ms, logs the payload in development only, returns success. Nothing leaves the browser.
  - **api** — `POST {API_BASE_URL}/forms/{kind}`, relaying `422` field errors back to the form.
- UX states: idle → submitting (button disabled, "Sending…") → success (the original success text) or error (field errors inline plus a summary line).
- **No comment endpoint**: the live "Leave a Reply" block has no backend at all, so it is not rendered (`features.eventCommentForm = false`).

## 7. Legacy fallback (opt-in) and media

- The frontend is self-contained; it needs no other origin to render.
- **`LEGACY_ORIGIN` is unset by default.** When set, `next.config` adds a `fallback` rewrite sending any path Next.js does not own to that origin — useful only for a transitional deployment where the old site still answers `/admin`, `/public/storage/*` and legacy URLs. The tests for it skip when it is unset.
- **Media** is served from `public/media/` (the Phase 0 mirror, original relative paths preserved). Every URL goes through `assetUrl()`, which prefixes `MEDIA_BASE_URL` when set — that is the single switch for pointing at Django's media storage later.
- `images.remotePatterns` covers `MEDIA_BASE_URL`, `i.ytimg.com` and the two images the CMS hotlinks from a theme demo.

## 8. Performance budgets

| Metric (mobile, 4G, mid-tier) | Budget |
|---|---|
| LCP | ≤ 2.5s (Home hero poster is the LCP element, `priority`) |
| CLS | ≤ 0.05 |
| INP | ≤ 200ms |
| JS per route (gz) | ≤ 170KB first load |
| Fonts | 2 families, subset `bengali`+`latin`, `display: swap`, preloaded by next/font |

Techniques: hero video starts after LCP with `preload="none"`; LiteYouTube facade; lightbox and video modal are dynamically imported on first interaction; Embla only on pages that use it; `sizes` on every image; AVIF/WebP via next/image; no layout-shifting font swaps (size-adjusted fallbacks from next/font).

## 9. SEO

- `generateMetadata` per page: title pattern `{Page} — INDEX Eco Resort`, description from content (first 155 chars of intro), canonical (the `/about_us` alias points to `/about-us`), Open Graph image = page hero.
- JSON-LD: `Resort` (LodgingBusiness) with contact data from settings on Home; `Event` on event detail; `BlogPosting` on blog detail; `BreadcrumbList` on inner pages.
- `sitemap.ts` from packages, events, posts + static pages. `robots.ts` allowing all public routes.
- These are additions to `<head>` only; visible content unchanged.

## 10. Testing

- All tests live in `services/frontend/tests/` and read Phase 0 baselines from `../../audit/`.
- **Link parity:** `tests/parity/links.spec.ts` loads each route on the new site, collects `{text, href}` of all anchors in topbar, header, mobile-nav, main, dock, footer and compares with `audit/links.json`. Differences fail the test unless listed in `tests/parity/allowed-diffs.ts` with a reason. Seeded entries: Events breadcrumb `/people-leading → /`; filtered event cards `/event-details/{id} → /events/{slug}`; empty hero slide `<h1>` not rendered.
- **Form parity:** compares field names/required flags with `audit/forms.json`; submits against a mocked endpoint and asserts payload keys match the original.
- **Interaction tests:** dropdown, mobile menu, dock actions, contact modal submit, video modal, hero carousel (2 slides, pause), slider next/prev, gallery filter counts per category = `audit/interactions.md §4` counts, lightbox keyboard nav, villa tabs, vision tabs, event filters (`tests/parity/events.spec.ts`: same inputs → same results as `/events/filter`, cards link to `/events/{slug}`), download button href, YouTube facade.
- **a11y:** axe on every route (no serious/critical violations).
- **Visual:** screenshots at 390/768/1440 for every route into `audit/screenshots/after/`.
- **Lighthouse CI** on Home, `/gold-ownership-2`, `/event`, one blog post.

## 11. Environment variables

```
NEXT_PUBLIC_SITE_URL=https://indexecoresort.com   # canonical URLs; https also enables upgrade-insecure-requests
DATA_SOURCE=mock            # mock (fixtures, default) | api (Django, once it exists)
API_BASE_URL=               # Django REST base, e.g. https://api.indexecoresort.com/v1
MEDIA_BASE_URL=             # empty = serve public/media locally; later, Django's media origin
PREVIEW_MODE=false          # true allows a production build to run on fixtures, with a visible banner
LEGACY_ORIGIN=              # unset. Set only for a transitional deploy that still proxies the old site
REVALIDATE_SECRET=change-me
```

**Build guard:** `NODE_ENV=production` + `DATA_SOURCE=mock` + `PREVIEW_MODE` unset ⇒ the build fails, so fixture content cannot ship as if it were live.

## 12. Deployment

**Now — preview.** Deploy to Vercel with `DATA_SOURCE=mock` and `PREVIEW_MODE=true`. The site renders the Phase 0 snapshot end to end, forms are inert behind the preview bar, and `LEGACY_ORIGIN` stays unset. This is what the owner reviews and what the Django developer builds against.

**Later — production.** Once Django implements `docs/API-CONTRACT.md`: set `DATA_SOURCE=api`, `API_BASE_URL` and `MEDIA_BASE_URL`, drop `PREVIEW_MODE`, run the parity suite against it, then move DNS. `docs/DEPLOY.md` (final phase) carries the step-by-step for both.
