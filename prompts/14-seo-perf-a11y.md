# Phase 13 — SEO, performance & accessibility hardening

## SEO (architecture §9)
1. `generateMetadata` for every route (title pattern, description, canonical, OG/Twitter image from page hero).
2. JSON-LD: Resort/LodgingBusiness (Home), Event, BlogPosting, BreadcrumbList.
3. `sitemap.ts` and `robots.ts` (the live site has neither). `/about_us` is a permanent redirect, so it is not in the sitemap.
4. Compare with `audit/meta.json`; never remove existing meta, only improve.

## Performance (architecture §8)
1. Bundle analysis per route; dynamic-import lightbox, video modal, date picker, YouTube iframe.
2. Verify hero poster is LCP and prioritized; video starts after LCP; offscreen pause works.
3. Font loading: no FOIT; size-adjusted fallbacks; only needed subsets.
4. Images: correct `sizes`, no oversized downloads at 390px (check network panel).
5. Third parties: Google Maps iframe `loading="lazy"`; YouTube only on click.
6. Run Lighthouse CI on Home, `/gold-ownership-2`, `/event`, one blog post (mobile). Meet budgets.

## Accessibility (design-system §11)
1. axe on all routes: zero serious/critical.
2. Keyboard walkthrough of every interaction in audit §7; document results.
3. Screen-reader spot check (VoiceOver or NVDA) of header, dropdown, mobile nav, gallery lightbox, contact form errors, tabs.
4. Color contrast on real hero images; focus visible everywhere; touch targets ≥ 44px.

## Acceptance criteria
- Lighthouse scores and budgets recorded in `docs/PROGRESS.md` with screenshots of reports.
- All a11y findings fixed or listed with a reason.

Stop and report.
