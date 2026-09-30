# Phase 5b — Home redesign: "Midnight Estate"

**Scope: `/` only.** The owner chose a completely new luxury look for Home, **Direction A — Midnight Estate**: dark, cinematic, champagne gold, like a private members' estate at night. Home is the pilot. If approved, the same look is rolled out to the rest of the site in a later phase.

This file replaces any earlier `06b-home-redesign.md`. Delete that file; do not mix the two plans.

Read first: `CLAUDE.md`, `docs/01-SITE-AUDIT.md §5.1`, the current `src/components/sections/home/*`, `docs/02-DESIGN-SYSTEM.md` (for conventions — the Home palette and type below override it on Home only).

---

## 0. Hard boundaries

1. **Only Home changes.** Every other route must stay pixel-identical.
   - **Before any code:** add `tests/visual/non-home.spec.ts` with `toHaveScreenshot` baselines (reduced motion, animations disabled) for every non-Home route at 390 and 1440, plus the styleguide. Commit the baselines. They must pass unchanged at the end.
2. **Global chrome wears the new look only while Home is displayed.** This covers the top bar, header, mobile nav, floating dock, contact modal and footer.
   - Implement it with a theme scope: Home's `<main>` carries `data-theme="midnight"`, and theme tokens are overridden under `html:has(main[data-theme="midnight"])`. This also reaches portals (dialog, sheet, lightbox) and reverts automatically on client navigation.
   - Chrome components consume **semantic chrome tokens**, e.g. `--chrome-bg`, `--chrome-text`, `--chrome-accent`, `--chrome-hairline`. Their defaults equal today's values exactly, so non-Home pages render identically. The non-Home baselines prove it.
3. **Shared section components get Home behavior only through `variant="home"` or Home-only wrappers.** This covers `AboutBlock`, `GallerySection`, `CtaStrip`, `PlansStage`/`PlanGrid`, `MembershipCard`, `PostCard`, `Slider` and `SectionHeader`. Their defaults do not change.
4. **Parity stays intact:**
   - Same content, same section order, same links, same behaviors: hero carousel and pause control, video modal, gallery filter and lightbox, room tabs, slider and lightbox, testimonials.
   - Link parity for `/` `main` passes. Every existing Home test passes; update selectors if needed, never weaken assertions.
5. **No new copy, no invented numbers, no stock imagery, no counters, no new features.** Decoration is non-textual only: lines, frames, tone, light.
6. **One presentation change is allowed** (record it in `allowed-diffs.ts`): the hero lockup (subline + H1 from the non-empty slide data) stays visible across both slides; only the media rotates beneath it.

## 1. Design intent

The feeling of arriving at a private estate after dark:
- lamps come on one by one;
- gold catches the light;
- everything is quiet, deliberate, expensive.

**Principles**
- **Night is the canvas, ivory is the reading room.** Dark sections carry imagery and the signature moments. Ivory sections carry long reading (Bangla paragraphs especially), so the page never tires the eye.
- **Gold is jewellery, not paint.** Champagne appears as hairlines, frames, small italic labels, the primary button and card rim-light. Never as large fills.
- **The frame is the motif.** Thin champagne inset frames around the hero and key images, like picture frames in a gallery at night.
- **The ownership cards are the jewels.** On the dark "vault" stage they are the brightest objects on the page.

## 2. Midnight Estate tokens (Home scope)

### 2.1 Color

| Token | Hex | Role |
|---|---|---|
| `me-night` | `#0E1A15` | Primary dark background |
| `me-night-deep` | `#09120E` | Plans vault, gallery, footer |
| `me-forest` | `#1E2E27` | Raised panels on dark, footer bottom bar |
| `me-moss` | `#2C3D35` | Hover surfaces on dark |
| `me-champagne` | `#C9A96E` | Accent on dark: hairlines, frames, labels, primary button fill |
| `me-champagne-soft` | `#E3CFA3` | Hover/highlight gold |
| `me-bronze` | `#7A5E2E` | Gold for text and icons on ivory |
| `me-ivory` | `#EDE6D8` | Headings on dark; background of light sections |
| `me-parchment` | `#CFC8BA` | Body text on dark |
| `me-sage` | `#7C8B83` | Muted text and meta on dark |
| `me-stone` | `#5A5F57` | Muted text on ivory |
| `me-hairline-gold` | `rgb(201 169 110 / .22)` | Dividers on dark |
| `me-hairline-ink` | `rgb(14 26 21 / .14)` | Dividers on ivory |

**Verified contrast**

| Pair | Ratio | Use |
|---|---|---|
| ivory on night | ≈14.3:1 | Headings on dark |
| parchment on night | ≈10.7:1 | Body on dark |
| champagne on night | ≈8.0:1 | Labels and accents on dark |
| sage on night | ≈5.0:1 | Meta on dark |
| night on ivory | ≈14.3:1 | Text on ivory |
| bronze on ivory | ≈4.9:1 | Gold text on ivory |
| stone on ivory | ≈5.3:1 | Muted text on ivory |
| night on champagne | ≈8.0:1 | Primary button label |

**Never** use champagne as text on ivory; use bronze.

### 2.2 Typography

| Role | Font | Notes |
|---|---|---|
| Display Latin | **Bodoni Moda** | Variable, `font-optical-sizing: auto`, weight 400–500. Only at ≥ 28px; its hairlines vanish when small. Italic for eyebrows. |
| Display Bangla | **Noto Serif Bengali** | Weight 400–500. Load the `bengali` subset **only**, so Latin falls through to Bodoni. |
| Body & UI | **Anek Bangla** | Already loaded. Weight 400 on dark, never below 400 on dark (thin strokes glow and blur on black). |

- Display stack: `var(--font-bodoni), var(--font-noto-serif-bn), serif`.
- Load the two new fonts in the Home segment only, with `display: swap`, no preload.
  - Budget: ≤ 250 KB of **new** font transfer on `/`.
  - Confirm Tiro Bangla is not downloaded on `/`.
- **Mixed-script balance** (e.g. "Index Eco Resort" beside a Bangla line):
  - Test `font-size-adjust` and per-element `:lang(bn)` sizing, and pick whichever makes the two scripts look equal in weight and size.
  - Deliver a close-up screenshot of the hero lockup and one Bangla heading.
- Scale on Home:

| Token | Size | Line-height |
|---|---|---|
| display | `clamp(3.25rem, 2rem + 6vw, 8rem)` | 0.95 |
| h2 | `clamp(2.25rem, 1.5rem + 3vw, 4.25rem)` | 1.05 |
| h3 | `clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)` | — |

- Eyebrows: Bodoni Moda italic, 1.125rem, champagne on dark / bronze on ivory, sentence case as stored, preceded by a 32px gold hairline.
- All Bangla rules from design-system §4 still apply: no tracking, larger line-height (1.9 for body on dark), no faux italics.
- Letter-spacing 0.08em on Latin button labels only.

### 2.3 Shape, frames, shadow

- **Corners.** Buttons and image frames are square (radius 0): architectural and formal. Dialogs 12px. Tags and pills 999px. Membership cards keep real card corners.
- **Frame motif.**
  - The hero, the About collage's tall image, the Restaurant image and the Why-Buy building get a 1px `me-champagne` inset frame: 40% opacity, inset 14px (10px on mobile).
  - Frames are drawn once on reveal (see Motion).
- **Shadows on dark** are deep and soft, and used only on liftable objects (cards, highlights panel, modal): `0 30px 60px -20px rgb(0 0 0 / .6), 0 2px 6px rgb(0 0 0 / .4)`.
  - Membership cards additionally get a champagne rim light on hover: `0 0 0 1px rgb(201 169 110 / .35)` plus the existing sheen.

### 2.4 Photography on dark

- Photographs sit in the night palette through a light, consistent grade: `filter: brightness(.9) saturate(.88) contrast(1.04)`.
- Soft night gradients at the edges where text overlaps.
- Never grade logos, posters or membership cards.

### 2.5 Buttons and links

| Variant | Spec |
|---|---|
| Primary on dark | `me-champagne` fill, night label; hover `me-champagne-soft`; height 52px; square |
| Secondary on dark | 1px champagne outline, ivory label; hover fills champagne with a night label |
| Primary on ivory | Night fill, ivory label |
| Secondary on ivory | Night outline |
| Text links | Underline drawn in gold from the left |

All CTA hrefs stay verbatim.

### 2.6 Rhythm (section order unchanged)

| # | Section | Tone |
|---|---|---|
| 1 | Hero | night |
| 2 | Highlights | forest panel over the hero |
| 3 | About | **ivory** |
| 4 | Project at a glance | night |
| 5 | Gallery | night-deep |
| 6 | CTA strip | **ivory** |
| 7 | Plans | night-deep "vault" |
| 8 | Why buy | **ivory** |
| 9 | Villa | night |
| 10 | Restaurant | night-deep |
| 11 | Testimonials | **ivory** |
| 12 | Latest posts | **ivory** |
| 13 | Footer | night-deep |

Section padding: `clamp(6rem, 4rem + 7vw, 12rem)`. Content container 1320px; the gallery may widen to 1520px.

## 3. Motion: "candlelight"

Slow, confident, cinematic. Things emerge from darkness rather than fly in.

**Principles**
- Small distances (≤ 28px), long expo easing, short staggers.
- Hierarchy order: eyebrow → heading → body → action. At most about 5 steps per section.
- **Once.** Revealed elements stay revealed.
- Scroll-linked effects are transform-only and bounded, and are off below 768px.
- Every frame is readable and usable. Nothing waits on an animation.

**Tokens**
```
--me-ease: cubic-bezier(0.19, 1, 0.22, 1);        /* expo-out: settling */
--me-ease-inout: cubic-bezier(0.77, 0, 0.175, 1); /* frames, curtains */
--me-dur-reveal: 1100ms;  --me-dur-text: 1200ms;  --me-dur-light: 1600ms;
--me-stagger: 90ms;       --me-distance: 28px;
```

**Primitives** (`src/components/motion/midnight/`)

| Primitive | Behavior |
|---|---|
| `RevealGroup` / `RevealItem` | opacity + y, staggered |
| `LineReveal` | Heading lines rise from a mask. Lines are measured from real line breaks after fonts load, split on whole words only (Bangla-safe), and fall back to a whole-heading reveal if measuring fails. |
| `RuleDraw` | Gold hairline scaleX 0→1 |
| `FrameDraw` | SVG rect stroke drawn clockwise (stroke-dashoffset) around a frame, 1400ms `--me-ease-inout` |
| `LightsOn` | For images. A dark veil over the image fades from .85 to 0 while the image scales 1.06→1, over `--me-dur-light`. The image itself is **never** at opacity 0. |
| `ScrollDrift` | `useScroll` + `useTransform`, bounded, off below 768px |
| `StickyStory` | Sticky media with items activated at the viewport center (IntersectionObserver); native scroll |
| `Spotlight` | Static radial light whose opacity follows scroll progress; used only in the Plans vault |

All primitives:
- respect `useReducedMotion()` and render their final state;
- use `LazyMotion`;
- use `whileInView` with `once: true, amount: 0.25`.

**Safety**
- The hero poster is visible at first paint; only its veil and scale animate.
- Initial hidden states are scoped to `html[data-motion="on"]`, set by a tiny inline head script only when JS runs and reduced motion is off. No JS or reduced motion means everything is visible.
- Transforms only: zero CLS.

## 4. Chrome on Home

**Top bar:** night-deep, text sage/parchment, social icons champagne on hover.

**Header**
- Transparent over the hero, ivory nav text, a gold hairline under the active item.
- After scrolling 24px: night at 92% with blur and a bottom `me-hairline-gold`.
- Book Now = secondary on dark (champagne outline); it fills on hover.

**Packages dropdown:** night panel, deep shadow, champagne hairlines, card thumbnails.

**Mobile nav:** night sheet, links in Bodoni Moda / Noto Serif Bengali at 2rem, gold hairline dividers, Call Now and Book Now at the bottom.

**Floating dock:** night pill with a 1px gold hairline and champagne icons; labels slide out on hover/focus.

**Contact modal:** ivory dialog, night text, bronze required marks, night primary button. A light form reads best, even when opened over the dark page.

**Footer**
- night-deep; column headings in Bodoni Moda champagne; links parchment with gold underline-draw; contact rows separated by gold hairlines.
- Bottom bar in `me-forest` (instead of green), champagne text. Same texts and links.

**Browser chrome on phones:** `viewport.themeColor` = `#0E1A15` on `/` only; `color-scheme: dark` inside the Home scope.

## 5. Section by section

### 5.1 Hero — "Lights on" (signature entrance)

**Layout**
- `100svh` (min 640), full-bleed media under two veils: a strong bottom veil for type, a top veil for the header.
- The champagne inset frame surrounds the whole hero.
- **Lockup centered**, monumental:
  - 40px gold hairline;
  - H1 at display size in ivory;
  - subline in Bodoni Moda italic, champagne;
  - Read More (secondary on dark).
- Bottom center: slide fraction "01 / 02", a 120px gold progress line (fills over 6s or the video's length, freezes when paused), and the pause/play control. The control must never be covered by the highlights panel.

**Load choreography (≈2s)**

| Time | Element | Motion |
|---|---|---|
| 0 ms | Poster | Painted immediately; veil fades .85→final over 1.6s ("lights come on") while the media scales 1.08→1 over 2.4s |
| 300 ms | Frame | `FrameDraw` around the hero |
| 500 ms | Hairline | Draws |
| 600 ms | H1 | Lines rise, 110ms stagger |
| 1000 ms | Subline + CTA | Fade in |
| 1300 ms | Indicators | Fade in |
| 1400 ms | Highlights panel | Rises |

**Slide change:** 1.4s crossfade; the incoming media scales 1.04→1. The lockup stays.

**Scroll-out (≥768px):** media drifts 0→12%; the lockup fades out and moves up 40px across the first 60% of the hero's scroll.

**Mobile:** lockup centered in the lower half, H1 max 3 lines, indicators below it, frame inset 10px, no drift.

### 5.2 Highlights — forest panel

**Layout**
- A `me-forest` panel overlapping the hero by 80px (desktop), with a deep shadow and a 1px gold hairline on top.
- 3 columns divided by gold hairlines. Each column: CMS icon in a 56px thin champagne ring, title Bodoni/Noto Serif (h4 ivory), subtitle parchment, Read more link.

**Hover:** column background `me-moss`, ring glows (champagne at 60%), link underline draws.

**Entrance:** part of the hero sequence; columns stagger 90ms.

**Mobile:** stacked rows that enter on scroll.

### 5.3 About — ivory reading room

**Composition**
- Tall image in cols 1–5 (with champagne frame) and two stacked images in cols 6–7, offset 64px down; text in cols 8–12.
- Behind the collage, a `me-night` block offset 40px: a dark mat on ivory.

**Motion**
- Images use `LightsOn` in sequence (150ms apart); the tall image's frame draws.
- ≥1024px: differential drift of ±24px.

**Text order:** bronze eyebrow → H2 in night → paragraph (stone for secondary) → feature icons (bronze, stroke draw) → CTA row (primary on ivory + "Call Us 24/7" with the number in Bodoni).

**Play button:** 96px night disc with a champagne triangle; hover: one expanding gold ring (no loop).

**Mobile:** tall image, then the two small images side by side, then the text.

### 5.4 Project at a glance — the engraved ledger (night)

**Ledger**
- Header left; the 9 facts as a two-column ledger on ≥1024px.
- Label: sage, `small`. Value: parchment; key values (Project Name, Location, Built Over) in Bodoni h3 ivory.
- Long values span the full row. Gold hairlines between rows.

**Motion:** hairlines draw left→right in sequence (40ms stagger) and the values fade in with them: the ledger is "engraved". Row hover: label turns champagne.

**Slider**
- Promo slider in a 4:5 frame with an offset champagne outline (16px down-right). The frame drifts 16px on scroll.
- Captions on a night gradient. Controls below: fraction, gold progress line, square icon buttons.
- Slide change: 800ms crossfade. Keep every slide, including the test slide (PARITY).

### 5.5 Gallery — the night gallery (night-deep, up to 1520px)

**Header:** split. Filter chips in pills with a 1px gold hairline; the active chip fills champagne with night text and a sliding indicator.

**Grid (≥1024px)**
- 4 columns, `grid-auto-flow: dense`, cycling tile spans: 2×2, 1×1, 1×1, 1×1, 1×1, 2×1.
- **Hole-free for every category count** (test 1–12). Uniform grid under 4 items.
- Tiles are square-cornered with 2px gaps: photos like lit frames on a black wall.

**Motion:** tiles use `LightsOn` row by row (70ms stagger). Filter change: `layout` FLIP 600ms; exiting tiles fade.

**Hover:** image brightens to 1.0 and scales 1.04 over 1s; a champagne inner frame fades in; the caption rises (category in champagne italic + title in ivory).

**Lightbox:** night backdrop at 96%, fade + scale .96→1, captions, counter, keyboard, swipe. Uses the repaired URLs.

**Mobile:** chips scroll horizontally with edge fades; 2 columns with every 5th tile spanning both.

### 5.6 CTA strip — ivory invitation

**Layout:** centered stack — avatar (72px, bronze ring), the text in Bodoni/Noto Serif h3 night (max 28ch), Buy Share (primary on ivory).

**Motion:** bronze hairlines at the top and bottom draw outward from the center; text `LineReveal`.

**Transition:** ends with a clean edge into the Plans vault. The jump from light to dark is deliberate, like a door opening.

### 5.7 Plans — "The vault" (signature moment, night-deep)

**Stage**
- Centered champagne eyebrow + ivory H2.
- A `Spotlight` radial light above the cards brightens (opacity .3→1) as the section scrolls in.

**Desktop (≥1024px)**
- Cards start as a fanned stack at the center: overlapping, rotations −6°, −2°, 2°, 6°, y +40px, slightly dimmed (brightness .6).
- As the section scrolls from 20% to 60% into view, they spread to their 4-column positions and brighten to 1. The motion is scroll-linked, reversible only inside that window, then locks in its final state.
- After locking: tilt + sheen + champagne rim light on hover; the package names fade in beneath (Bodoni ivory).

**Other widths**
- Tablet: 2×2 grid with a staggered rise.
- Mobile: snap carousel. The active card sits under the spotlight at full brightness and scale 1; neighbours at .55 brightness and .92 scale. Fraction indicator.

**Links and accessibility**
- Each card is a link with a champagne focus ring around the card. Names only; no new copy.
- Reduced motion: static 4-column grid at full brightness.

### 5.8 Why buy — "Four reasons" (ivory)

**Desktop (≥1024px) — `StickyStory`**
- Left: the building image, sticky (top 96px, ~80vh, champagne frame drawn once), slowly scaling 1.08→1 across the section.
- Right: eyebrow + H2, then the 4 reasons as tall blocks (min-height 40vh).
- The reason at the viewport center is active: night text, a bronze rule grows beside it, the icon turns bronze. The others sit at .35 opacity.

**Below 1024px:** image first, then the reasons stacked with `RevealGroup`.

**Reduced motion:** all reasons at full opacity.

### 5.9 Villa — "The rooms" (night)

**Tabs:** large Bodoni/Noto Serif words (h3, parchment; active ivory) with a sliding champagne underline.

**Composition (≥1024px)**
- Image slider in cols 1–8 at 16:10, with a thumbnail strip below (the active thumbnail gets a champagne frame).
- A `me-forest` content card (deep shadow, 48px padding, gold hairline on top) overlaps the image's right edge by 80px.
- Room name in h2 ivory, paragraphs in parchment, amenities in a 2×2 grid with champagne line icons, Book Now (primary on dark).

**Tab switch:** image crossfade 700ms; the card's text runs a short `LineReveal`; the slider resets to its first image.

**Mobile:** full-width slider, card below overlapping it by 32px.

### 5.10 Restaurant — "Dine after dark" (night-deep)

**Composition**
- The image fills the right 60% and bleeds to the viewport edge, with a champagne frame.
- A night text panel on the left overlaps it by 64px: eyebrow, H2, text, Book Now.

**Motion:** the image enters with a horizontal curtain (clip-path from the right, 1.2s `--me-ease-inout`), then `LightsOn`, then a scroll-linked scale 1.08→1 (≥768px). The frame draws after the curtain.

**Mobile:** image full width at 4:3, then the panel overlapping upward by 32px.

### 5.11 Testimonials — "Voices" (ivory)

**Layout (centered)**
- An oversized quotation mark: Bodoni Moda, 9rem, bronze at 14% opacity, `aria-hidden`.
- Quote in Bodoni/Noto Serif h3 night, max 32ch. Avatar with a bronze ring, then name and role in stone.

**Motion:** stars fill in sequence (bronze, 70ms).

**Items:** with more than one, 700ms crossfade plus fraction and arrows. With exactly one, static and no controls.

### 5.12 Latest posts — "The journal" (ivory)

**Count-adaptive layout**
- 1 post → feature: image 16:10 in 7 cols, text on the right.
- 2 posts → feature (7 cols) + a tall card (5 cols).
- 3 posts → a feature plus two stacked.

**Cards:** square-cornered images; titles in Bodoni/Noto Serif night; hover brings an image zoom and a bronze underline-draw on the title.

**Motion:** `RevealGroup` stagger.

## 6. Responsive rules

- **Design each breakpoint on purpose;** tablet (768–1023) is its own composition.
- **Below 768px:**
  - no scroll-linked effects;
  - reveal distance 18px and durations −25%;
  - frames inset 10px;
  - overlaps ≤ 32px;
  - sticky and fan compositions fall back as described above.
- **Touch:** no information behind hover only; tap targets at least 44px.
- **Test widths:** 320, 390, 768, 1024, 1440, 1920.

## 7. Performance and accessibility budgets (`/`)

| Metric | Budget |
|---|---|
| Lighthouse mobile, real throttling | ≥ 90 |
| Lighthouse mobile, simulated | ≥ 82 |
| Accessibility | ≥ 95 |
| LCP / CLS / INP | ≤ 2.5s / ≤ 0.02 / ≤ 200ms |
| Added JS on `/` | ≤ 30 KB gz |
| New fonts on `/` | ≤ 250 KB |
| Scroll at 4× CPU throttle | No animation-caused long tasks over 50ms; animated elements composite-only |

- Contrast pairs as in §2.1.
- Focus ring: 2px champagne on dark, 2px night on ivory, 3px offset.
- axe clean; full keyboard walkthrough; reduced-motion walkthrough.

## 8. Process

**Part A** — build these, then stop and report:
1. Non-Home baselines.
2. Home theme scope and semantic chrome tokens (non-Home unchanged).
3. Fonts.
4. Motion primitives.
5. Chrome on Home.
6. Hero, Highlights and the Plans vault.

**Part B** (after approval):
1. About, Project at a glance, Gallery, CTA strip, Why buy, Villa, Restaurant, Testimonials, Latest posts.
2. A full-page choreography pass: pacing, nothing firing at once, the dark/ivory rhythm.
3. All gates.

Add a "Midnight Estate (Home pilot)" section to `docs/02-DESIGN-SYSTEM.md` with these tokens, type, frames and motion, marked as the candidate site-wide system.

## 9. Gates and report

**Gates**
- `non-home.spec.ts` unchanged. All existing tests pass. Link parity for `/`.
- New tests:
  - chrome tokens resolve to Midnight values on `/` and to the defaults on `/about-us` (including after client-side navigation both ways);
  - reduced motion: all content visible, no transforms;
  - JS disabled: all content visible;
  - the hero lockup persists across both slides;
  - the pause control is clickable at 390, 768 and 1440;
  - the Plans end state is 4 columns at full brightness;
  - `StickyStory` works at ≥1024 and falls back below;
  - hole-free gallery for every category count;
  - Tiro Bangla is not downloaded on `/`.
- WebKit + Chromium mobile.

**Report (Part A and Part B)**
- `home-midnight@{390,768,1440}.png`, after animations settle, each **side by side with the Phase 5 screenshot** of the same width.
- Close-ups: the hero lockup (mixed script) and one Bangla heading on dark.
- Videos:
  - `hero-lights-on.webm`, `plans-vault.webm` and `home-nav-to-about.webm` (proves the theme reverts) — Part A;
  - `whybuy-sticky.webm` — Part B;
  - `home-scroll-1440.webm` and `home-scroll-390.webm`, slow and steady, recorded in both parts.
- Lighthouse table, JS and font size deltas, deviations with reasons.

**Commits**
- Part A: "Phase 5b-A: Home Midnight Estate — theme, chrome, hero, vault".
- Part B: "Phase 5b: Home Midnight Estate complete".

Don't push. Stop after each part.
