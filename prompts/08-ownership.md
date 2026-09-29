# Phase 7 — Ownership package pages

**Goal:** one template for `/gold-ownership-2`, `/platinum-ownership-3`, `/signature-ownership-4`, `/silver-ownership-5` (audit §5.3). This is where the signature element shines. Data: `getPackage(slug)`.

1. **Route:** `(site)/[ownershipSlug]/page.tsx` with `generateStaticParams()` from `getPackages()` and `notFound()` for anything else, so a package added in Django gets its page automatically. (Architecture §3 records the caveat that a root dynamic segment defeats a `LEGACY_ORIGIN` fallback — only relevant if that opt-in fallback is ever enabled.)
2. **PageHero** with the package's own hero image and name.
3. **PackageIntro:** 12-col split. Left (cols 1–6): heading exactly as data (emoji and label included — `// PARITY:` the "Silver Ownership" label issue), discount line in `lead`, Book Your Share (primary, href verbatim). Right (cols 7–12): `mist` plinth panel (radius 4, hairline) holding a large `MembershipCard` (max 560px) with pointer tilt and sheen; the plinth gets the `Reveal` unveil. Mobile: card first, then text.
4. **Benefits + video:** `paper` section. Left: "Ownership Benefits" (h2) and a two-column list on ≥768px (one column on mobile) — each item has a brass-ink check glyph and a hairline separator. Right: `LiteYouTube` with the package's video ID (16:9, radius 4, brass-ringed play button).
5. **Plans:** reuse `PlanGrid` on the `canopy-deep` stage; the current package gets `aria-current="page"` + brass ring.
6. Per-page metadata and `BreadcrumbList` JSON-LD.

## Acceptance criteria

- All four pages match the parity checklist; each YouTube ID matches the original.
- MembershipCard: tilt only for fine pointers, press-sheen on touch, static under reduced motion, whole card focusable when it is a link.
- INP stays ≤ 200ms while moving the pointer over cards (check with the Performance panel).
- Screenshots of all four pages at 390 and 1440.

Stop and report.
