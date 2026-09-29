/** Static, non-CMS configuration. Everything content-related comes from src/lib/data. */
export const site = {
  /** Public origin of this Next.js site (canonical URLs, sitemap, JSON-LD). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://indexecoresort.com",
  /** ISR window for CMS-backed pages, in seconds (architecture §4). */
  revalidateSeconds: 300,
  /** Design-system breakpoints in px (docs/02-DESIGN-SYSTEM.md §5). */
  breakpoints: { xs: 480, sm: 768, md: 1024, lg: 1280, xl: 1536 },
  /** Screenshot widths used by the visual tests and the Phase 0 baseline. */
  screenshotWidths: [390, 768, 1440],
} as const;
