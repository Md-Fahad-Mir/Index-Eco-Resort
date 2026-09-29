/**
 * The frozen public route map (docs/01-SITE-AUDIT.md §3 + Phase 0 discoveries).
 * `OWNED_ROUTES` are the ones Next.js renders itself so far; each phase moves
 * routes from the fallback into this list. Everything else is proxied to Laravel.
 */
export const FROZEN_ROUTES = [
  "/",
  "/about-us",
  "/gold-ownership-2",
  "/platinum-ownership-3",
  "/signature-ownership-4",
  "/silver-ownership-5",
  "/offer",
  "/book-now",
  "/event",
  "/blogs",
  "/gallery",
  "/contact",
  "/blog-details/sustainable-living-eco-friendly-home-features-1",
  "/blog-details/kuzakataz-adhunik-risort-binizoger-ntun-smvabna-2",
  "/events/royal-wedding-celebration-2026-1",
  "/events/annual-corporate-summit-2026-2",
  "/events/joyful-birthday-family-gathering-celebration-3",
  "/events/index-eco-resort-coxs-bazar-2026-business-conference-4",
] as const;

/** `/about_us` is a broken live route; its treatment is an owner decision (CLAUDE.md rule 9c). */
export const PENDING_ROUTES = ["/about_us"] as const;

export const OWNED_ROUTES: readonly string[] = ["/"];

export const SCREENSHOT_WIDTHS = [390, 768, 1440] as const;
