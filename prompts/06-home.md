# Phase 5 — Home page `/`

**Goal:** the full Home page in the new design with every section, text and behavior from `docs/01-SITE-AUDIT.md §5.1`. Section order and tones: design-system §2.3. Data: `getHome()`.

Build each section as its own component in `src/components/sections/home/`.

1. **Hero** — `HeroCarousel` (Embla): the **same 2 slides in the same order as live** (slide 1 = the settings video, slide 2 = the banner image), same autoplay timing (6000 ms; the video slide plays once and then advances, as the live JS does), design-system hero treatment: overlays, subline (small, `mist` 80%), title in `display` size, Read More button (on-dark), content bottom-left in container, a thin scroll cue line bottom-right, height `100svh` min 640px. Slide 1's empty CMS subline/title are **not rendered** — the page has exactly one `<h1>` (slide 2's title, rule 9e). Video: poster first, `preload="none"`, starts after LCP, muted, off-screen pause; one visible pause/play control that pauses both the video and the carousel autoplay; autoplay also pauses on hover/focus and under reduced motion. This page's single entrance moment: title lines rise from a mask; nothing else animates on load.
2. **Highlights** — one `paper` panel overlapping the hero by 64px on ≥1024px, 3 columns split by hairlines; stacked rows on mobile. CMS icons, titles (h4), subtitles, Read More links.
3. **AboutBlock** — reusable (About page uses it too). Asymmetric collage (tall image + two stacked), `Reveal` unveil on the collage only, 88px play button → `VideoModal` (mp4). Right: eyebrow, H2, paragraph, two feature rows with line icons, Learn More (primary) + "Call Us 24/7" with number (href verbatim).
4. **ProjectGlance** — `lichen-soft` section. Spec sheet `<dl>` with all facts; right: `Slider` of promo slides (4:5, caption on bottom gradient, fraction + progress). Include every slide from data.
5. **GallerySection** — reusable (Gallery page uses it with all items). Split header: title left, filter chips right. Grid 4/3/2 cols of 3:2 tiles, hover caption, `AnimatePresence` re-layout on filter, lightbox with captions. Item counts on Home = live: "All" shows the 12-item capped set, each category chip shows that category's full set (`audit/interactions.md §4`) — reproduce exactly, oddity included. Phase 0 found no duplicates to remove (the live repetition is tab panes).
6. **CtaStrip** — `canopy` band with brass hairline top, avatar, text (Tiro, h4), Buy Share button (on-dark).
7. **PlansStage** — the signature section: `canopy-deep` stage with a soft radial light behind the cards, centered eyebrow + H2, 4 `MembershipCard`s (design-system §8.1) in data order, names below in Tiro. Mobile: snap carousel. Build `MembershipCard` and `PlanGrid` in `src/components/ownership/` — they are reused on About and package pages.
8. **WhyBuy** — `paper`. Left: eyebrow, H2, 2×2 features with brass-ink line icons. Right: tall building image with `Reveal`. Mobile: image after text.
9. **Villa** — `mist`. Underline tabs from room `tabLabel`s. Panel: slider with thumbnails (7 cols) + content (5 cols): room name (h2), paragraphs, amenity grid, Book Now. Images open the lightbox. Tab switch cross-fades.
10. **Restaurant** — split: `canopy` text panel (eyebrow, H2, text, Book Now on-dark) + image bleeding to the viewport edge with `Reveal`.
11. **Testimonials** — `paper`, centered large quote carousel (single visible item, arrows + fraction) when >1 item; static when 1. Brass stars, avatar, name, role.
12. **LatestPosts** — `mist`, split header, `PostCard` grid that adapts to count (1 → wide feature card, 2 → two columns, 3 → three).

## Acceptance criteria

- Parity checklist "Home" section fully ticked; link-parity for region `main` passes.
- Lighthouse mobile on `/`: Performance ≥ 90, LCP ≤ 2.5s, CLS ≤ 0.05.
- Reduced-motion: no transforms, video paused with visible play control.
- Screenshots at 390/768/1440.

Stop and report.
