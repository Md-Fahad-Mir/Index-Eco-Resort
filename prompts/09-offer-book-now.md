# Phase 8 — Offer `/offer` and Book Now `/book-now`

Both pages are Bangla-heavy. Test every change with the real strings.

## Offer (audit §5.4, data: `getOffer()`)

1. `PageHero` "Offers" with breadcrumb current "Running Offer".
2. Headline: Bangla, `h2` scale, left-aligned in container, `text-wrap: balance`, optical size rule for Bangla (design-system §4.5).
3. **Offer panel** per design-system §8: `paper`, brass hairline border, text column (lead paragraph in Tiro `h3` scale, body in Anek `body` with Bangla line-height), terms note, poster column with `shadow-lift`. Poster enlarge is **off** (`features.offerPosterLightbox = false`).

## Book Now (audit §5.5, data: `getBookNow()`)

1. `PageHero` "Running Offer" with breadcrumb current "Book Now" (no announcement bar — Phase 0 found none).
2. **Book Now panel:** `canopy` panel (radius 4) — Bangla text upright in Tiro at `h3` scale with 1.7 line-height; right column: Download Booking Form button (on-dark, file icon), href and `download` attribute exactly as the data provides (rule 9f: today the href is `https://indexecoresort.com/public/storage` with no file path — keep the button, never invent a URL, and list it in OWNER-REPORT so the owner uploads the PDF in the admin panel). Optional leaf-vein SVG pattern at ≤4% opacity (local SVG in `public/`).

## Acceptance criteria

- Parity checklist "Offer" and "Book Now" ticked; the download button carries the exact URL from data (a working file is the owner's action, tracked in OWNER-REPORT).
- No faux italics; no tracking on Bangla; no horizontal scroll at 320px.
- Screenshots at 390/768/1440.

Stop and report.
