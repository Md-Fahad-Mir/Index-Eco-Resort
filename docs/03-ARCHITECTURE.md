# 03 — Architecture

> Updated after Phase 0 (2026-09-29): monorepo layout, `/event` filtering, comment form, `/about_us`, test paths. Where this conflicts with `docs/01-SITE-AUDIT.md §11`, §11 wins.

## 1. Guiding decisions

- **Next.js is a new presentation layer; Laravel stays the system of record.** The admin panel, database, uploads, emails and any business logic remain in Laravel. Next.js reads content and forwards form submissions.
- **Nothing breaks during the switch.** Any request Next.js does not handle is proxied to Laravel (admin, storage, PDFs, legacy URLs).
- **Build before the API exists.** A data adapter layer lets the frontend run on fixtures captured from the live site (`DATA_SOURCE=mock`) and switch to the real API (`DATA_SOURCE=api`) without touching components.

## 2. Folder structure

```
.                                  ← repo root (git, pnpm workspace)
├─ CLAUDE.md · README.md
├─ pnpm-workspace.yaml · package.json   # workspace: services/frontend, audit/scripts
├─ docs/                            # this kit + PROGRESS.md + OWNER-REPORT.md
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
   │  │  │  ├─ [ownershipSlug]/page.tsx   # gold-ownership-2 … (validated against packages; else notFound)
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
   │  │  │  ├─ forms/contact/route.ts     # proxy → Laravel /contact-form/submit (mocked in DATA_SOURCE=mock)
   │  │  │  ├─ events/filter/route.ts     # same params + logic as Laravel /events/filter (mock: filters fixtures)
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
   │  │  │  ├─ adapters/mock.ts
   │  │  │  └─ adapters/laravel.ts
   │  │  ├─ lang.ts            # autoLang(), isBangla()
   │  │  ├─ sanitize.ts        # CMS HTML sanitizer (allowlist)
   │  │  ├─ format.ts          # date/time display helpers (display only, never mutate data)
   │  │  └─ seo.ts             # metadata + JSON-LD builders
   │  ├─ fixtures/             # JSON captured in Phase 0 from the live site
   │  └─ styles/globals.css
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
| `/{package-slug}` | `(site)/[ownershipSlug]/page.tsx` | `getPackage(slug)`; `generateStaticParams` from `getPackages()` |
| `/offer` | `(site)/offer/page.tsx` | `getOffer()` |
| `/book-now` | `(site)/book-now/page.tsx` | `getBookNow()` |
| `/event` | `(site)/event/page.tsx` | `getEvents()` for the initial list; filtering calls `app/api/events/filter` from a client leaf with the live site's params `start_date`, `end_date`, `category_id` (dates `d-m-Y`) and the same guard/empty-state logic (`audit/interactions.md §5`). Results always link to `/events/{slug}` (allowed diff vs the live `/event-details/{id}`). No URL change — the live site does not change it |
| `/events/{slug}` | `(site)/events/[slug]/page.tsx` | `getEvent(slug)`, `getRelatedEvents(slug)` |
| `/blogs` | `(site)/blogs/page.tsx` | `getPosts(page?)` |
| `/blog-details/{slug}` | `(site)/blog-details/[slug]/page.tsx` | `getPost(slug)`, `getRecentPosts()`, `getBlogSidebar()` |
| `/gallery` | `(site)/gallery/page.tsx` | `getGallery()` |
| `/contact` | `(site)/contact/page.tsx` | `getContactPage()` |

**Verified in Phase 1 (Next 16.3.6):** a root-level dynamic segment such as `[ownershipSlug]` **defeats the Laravel fallback** for every unknown single-segment path — the segment matches first, `notFound()` renders Next's own 404, and `fallback` rewrites never run (they only apply when no route matches). Two-segment paths still fall back. Phase 7 therefore must not use a root dynamic segment. Options, decided in Phase 7:

1. **Four static route folders** (`gold-ownership-2/`, `platinum-ownership-3/`, `signature-ownership-4/`, `silver-ownership-5/`) sharing one `PackagePage` template fed by `getPackage(slug)`. Simplest and safest; a package added in the admin panel needs a one-line route file. *(recommended)*
2. `afterFiles` rewrite with a negative-lookahead source built at build time from `getPackages()` (`/:slug((?!gold-ownership-2|…)[^/]+)` → Laravel). Data-driven, but a new package still needs a rebuild.
3. `proxy.ts` (Next 16's middleware) that rewrites unknown single-segment paths to Laravel using the package list. Fully dynamic, but runs on every request.

## 4. Rendering & caching

- All pages are Server Components, statically rendered and revalidated (target: 300s), plus tag-based on-demand invalidation: `packages`, `gallery`, `events`, `posts`, `settings`, `pages`.
- Use the caching primitives of the installed Next.js version (check its docs: fetch cache options / `revalidateTag` / cache components). Keep all caching inside `src/lib/data/adapters/laravel.ts` so pages stay version-agnostic.
- `/event` renders statically with every event; filtering is a client-side request to `/api/events/filter` (mock: filters fixtures; api: forwards to Laravel `/events/filter`). Same params and logic as the live AJAX filter; no query string (the live site has none).
- `POST /api/revalidate?secret=…&tag=…` lets the Laravel admin (optional hook) refresh content immediately after a save.
- Client components: only interactive leaves. Wrap motion with `LazyMotion`.

## 5. Data layer & API contract

### 5.1 Adapters

```ts
// src/lib/data/index.ts
const adapter = process.env.DATA_SOURCE === "api" ? laravelAdapter : mockAdapter;
export const getHome = () => adapter.getHome();   // returns HomeData (zod-validated)
// … one function per page / entity
```

Every adapter response is parsed with the zod schema. A schema failure in production logs and falls back to the last good cache rather than crashing the page.

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

### 5.3 Laravel API (only if none exists)

Add **read-only** JSON endpoints in Laravel that reuse the existing models and the same queries the Blade controllers use (same ordering, same filters, same visibility rules). No schema changes, no business-logic changes.

```
GET  /api/v1/settings
GET  /api/v1/pages/home | about | offer | book-now | contact
GET  /api/v1/packages            GET /api/v1/packages/{slug}
GET  /api/v1/gallery
GET  /api/v1/events?{original filter params}     GET /api/v1/events/{slug}
GET  /api/v1/posts?page=         GET /api/v1/posts/{slug}
POST /api/v1/forms/contact       # calls the same logic as the current contact controller
# (no comment endpoint — the live site has no comment backend)
```

Write endpoints: same validation rules, same side effects (DB rows, emails), rate-limited, honeypot field, CORS locked to the Next.js origin. If the Laravel source is not available, stop and ask the owner; keep running on fixtures meanwhile.

## 6. Forms

- react-hook-form + zod schema generated from the Phase 0 field list (names, required, types, max lengths identical to the original).
- Submit → Next.js route handler (`/api/forms/*`) → Laravel endpoint. The handler forwards exactly the original field names, adds nothing but the honeypot check, and relays Laravel's validation errors field-by-field.
- UX states: idle → submitting (button shows spinner, disabled) → success (original success text) / error (field errors inline + a summary line; network error message).
- The contact modal and the contact page share `ContactForm` only if their fields are identical; otherwise two schemas. Phase 0: same field names, **different rules** (modal: name/phone/email required, `address` hidden; page: nothing required, `phone` is `type=number`) → two schemas.
- Comment form: **none exists** on the live site (decorative markup, no endpoint). Not rendered; `features.eventCommentForm = false`.

## 7. Laravel coexistence

- Deploy Next.js on the main domain. Move Laravel to an origin such as `cms.indexecoresort.com` (or keep it on the same server on another port).
- `next.config` **fallback rewrites**: any path not matched by Next.js → Laravel origin. This keeps `/admin`, login, `/public/storage/*`, `/public/images/*`, PDFs and unknown legacy URLs working.
- `images.remotePatterns` for the Laravel media host(s) and `i.ytimg.com`.
- Media URLs from the API are used as-is (they already point at `/public/storage/...`; the rewrite serves them).
- Cookies/CSRF: Next.js never posts to Blade routes directly; it uses the API endpoints (CSRF-exempt, protected by origin check + rate limit + honeypot).

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
NEXT_PUBLIC_SITE_URL=https://indexecoresort.com
DATA_SOURCE=mock            # mock | api
CMS_API_URL=https://cms.indexecoresort.com/api/v1
LARAVEL_ORIGIN=https://cms.indexecoresort.com
REVALIDATE_SECRET=change-me
```

## 12. Deployment

- Node runtime (Vercel or a VPS with `next start` behind Nginx). Nginx example and cut-over steps go in `docs/DEPLOY.md` (written in the final phase).
- Cut-over plan: run Next.js on a staging subdomain against the real API → run parity suite → switch DNS/proxy → keep Laravel reachable via fallback rewrites → monitor 404s for a week.
