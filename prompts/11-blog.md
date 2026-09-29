# Phase 10 — Blog `/blogs` and `/blog-details/{slug}`

Audit §5.8–5.9. Data: `getPosts(page)`, `getPost(slug)`, `getBlogSidebar()`.

## List `/blogs`

1. `PageHero` "Blogs".
2. `PostCard` grid (3/2/1 cols) that adapts to count (same rule as Home latest posts). Title h4 (Bangla line-height when Bangla), excerpt 2-line clamp, Read More link with arrow.
3. No pagination (Phase 0 verified none).

## Detail `/blog-details/{slug}`

1. Editorial header: the post's own title as the page `<h1>` (rule 9e — the live detail page renders no title), category tag, then the post meta as separate icon-labelled items (calendar + date/time, message + comments label, clock + read time) — no middle-dot strings. Featured image full container width, 16:9 (or intrinsic if taller), radius 4.
2. 12-col: article (cols 1–8) in `Prose` tuned for long Bangla reading (62ch, 1.9 line-height, Tiro headings, brass list markers, highlighted "important info" lists rendered as a `lichen-soft` panel when the HTML marks them — do not restructure the HTML otherwise). Tags as chips; "শেয়ার করুন:" share icon buttons with the **original hrefs** (`#` today — `// PARITY:`).
3. Sidebar (cols 9–12, sticky): Recent Posts (keep the numbering, numbers in Tiro brass-ink), Categories with counts (links verbatim to `/event`), CTA box (`canopy` variant) "বিনিয়োগে আগ্রহী?" with text and link verbatim.
4. No comment form — Phase 0 found none on blog detail.
5. `BlogPosting` JSON-LD, metadata from title/excerpt/image.

## Acceptance criteria

- Parity checklist "Blogs" ticked; full body formatting preserved (headings, bold, lists).
- Reading comfort check at 390px: side margins ≥ 20px, body text ≥ 17px, no overflow from long words, links or tables.
- Screenshots of list and both posts at 390/1440.

Stop and report.
