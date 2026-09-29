# 02 — Design System: "Canopy & Brass"

## 1. Direction

**Concept.** An eco resort you *own a share of*. The site should feel like walking from a forest canopy into a quiet private members' lounge: deep greens from the grounds, brass from the script lettering on the ownership cards, calm off-white paper tinted with green (not cream), and one bilingual serif that carries Bangla and English with the same voice.

**The one memorable thing: the ownership card as a physical object.** The four membership cards are the product. Wherever they appear, they behave like real cards under light — they tilt toward the pointer and catch a moving sheen. Everything around them stays quiet and disciplined. Do not spend boldness anywhere else.

**Principles**

1. *Quiet surfaces, rich materials.* Surfaces are flat and separated by tone and hairlines. Depth (shadows) is reserved for objects you can pick up: cards, menus, dialogs, the floating dock.
2. *Editorial, not template.* Headings align left with generous air; inner-page heroes put the title bottom-left like a magazine opener. Centered layouts only where the content is a single statement (hero statement, testimonials, "Choose Your Plan").
3. *Bangla is first-class.* Every rule is tested with Bangla text first, English second.
4. *Motion answers people.* Motion appears when someone acts (hover, open, switch, filter). Non-user motion is limited to one entrance moment per page.
5. *Real content only.* Designs use the actual CMS content, including long Bangla paragraphs. No lorem, no invented stats.

**Explicitly avoided** (they read as generic): cream `#F4F1EA` + terracotta; near-black + acid accent; identical rounded cards all with the same grey shadow; a tracked ALL-CAPS eyebrow above every heading; one word per headline colored or italicized; meta strings joined by middle dots; gradient washes as decoration; fade-up on every section.

## 2. Color

### 2.1 Base palette

| Token | Hex | Role |
|---|---|---|
| `canopy` | `#13301F` | Dark sections, header when scrolled, dialogs on dark, text on light accents |
| `canopy-deep` | `#0C2116` | Footer, the "Choose Your Plan" stage |
| `index` | `#2E6B40` | Brand green (evolved from the current site's green). Primary buttons on light, active states |
| `lichen` | `#A9BFA8` | Sage panels (core values), tags, muted text on dark |
| `lichen-soft` | `#DDE6DC` | Soft panel background (project-at-a-glance) |
| `mist` | `#EEF1EC` | Page background — green-tinted paper |
| `paper` | `#FFFFFF` | Cards, form panels, highlight strip |
| `brass` | `#B08D57` | Accent on dark: icons, stars, focus ring on dark, primary button on dark |
| `brass-ink` | `#7D5F32` | Brass for text/icons on light backgrounds |
| `ink` | `#1B2420` | Body text and headings on light |
| `ink-muted` | `#4A5750` | Secondary text on light |
| `hairline` | `rgb(27 36 32 / .12)` | Dividers on light |
| `hairline-dark` | `rgb(238 241 236 / .14)` | Dividers on dark |
| `danger` | `#A23B2A` | Form errors only |

### 2.2 Verified contrast (WCAG)

| Pair | Ratio | Use |
|---|---|---|
| `ink` on `mist` | ≈14:1 | Body text |
| `ink-muted` on `mist` | ≈6.7:1 | Secondary text |
| `index` on `mist` | ≈5.6:1 | Links, small green text |
| white on `index` | ≈6.4:1 | Primary button label |
| `brass-ink` on `mist` | ≈5.2:1 | Eyebrows, small accents on light |
| `brass` on `canopy` | ≈4.6:1 | Accents/labels on dark |
| `mist` on `canopy` | ≈12.6:1 | Text on dark |
| `lichen` on `canopy` | ≈7.3:1 | Muted text on dark |
| `ink` on `lichen` | ≈8.1:1 | Core-value tiles |

Never put `brass` (the light one) as text on light backgrounds — use `brass-ink`.

### 2.3 Section rhythm on Home

hero (video, dark) → highlights (paper, overlapping) → about (mist) → project at a glance (lichen-soft) → gallery (mist) → CTA strip (canopy band) → **Choose Your Plan (canopy-deep stage)** → why buy (paper) → villa (mist) → restaurant (canopy) → testimonials (paper) → latest posts (mist) → footer (canopy-deep) + bottom bar (index).

## 3. Typography

### 3.1 Families

| Role | Family | Why |
|---|---|---|
| Display & headings | **Tiro Bangla** (400, 400 italic) | A true bilingual serif: Bangla and Latin designed together, so mixed headlines like "Index Eco Resort কুয়াকাটার…" keep one voice. Single weight = restraint. |
| UI & body | **Anek Bangla** (variable: wght 100–800, wdth 75–125) | Bilingual sans with a width axis; body at wdth 100, small labels at wdth 110 for an airy, engraved feel without letter-spacing Bangla. |

Load via `next/font/google` with `subsets: ["bengali", "latin"]`, `display: "swap"`, CSS variables `--font-tiro` and `--font-anek`, and the `wdth` axis for Anek. Verify exact export names in the installed version. Fallbacks: `"Noto Serif Bengali", Georgia, serif` and `"Hind Siliguri", system-ui, sans-serif`.

### 3.2 Scale (fluid)

| Token | Size | Line-height | Family | Use |
|---|---|---|---|---|
| `display` | `clamp(3rem, 2rem + 5vw, 6.75rem)` | 1.0 | Tiro | Home hero H1 |
| `h1` | `clamp(2.5rem, 1.75rem + 3.2vw, 4.5rem)` | 1.05 | Tiro | Inner page hero titles |
| `h2` | `clamp(2rem, 1.5rem + 2.2vw, 3.5rem)` | 1.1 | Tiro | Section headings |
| `h3` | `clamp(1.5rem, 1.25rem + 1vw, 2rem)` | 1.2 | Tiro | Sub-sections, room name, card titles (large) |
| `h4` | `1.375rem` | 1.3 | Tiro | Card titles |
| `lead` | `1.25rem` | 1.6 | Anek 400 | Intro paragraphs, discount line |
| `body` | `1.0625rem` | 1.65 | Anek 400 | Paragraphs |
| `small` | `0.9375rem` | 1.55 | Anek 400/500 | Meta, captions |
| `label` | `0.8125rem` | 1.4 | Anek 600, wdth 110 | Buttons, tags, form labels |

Rules: headings `text-wrap: balance`; paragraphs `text-wrap: pretty`; max line length `68ch` (Latin) — Bangla paragraphs `62ch`; Latin display `letter-spacing: -0.01em`; buttons/labels in sentence case as the data provides — **no `text-transform: uppercase` anywhere**; numerals in cards and stats use `font-variant-numeric: tabular-nums lining-nums`.

### 3.3 Eyebrows (the small label above section headings)

The CMS has eyebrow text ("About Us", "Our Gallery", "Ownership Packages", "Why Buy Our Share"…). Keep the text, change the treatment: Tiro Bangla *italic* (Latin only), `1.125rem`, `brass-ink` on light / `brass` on dark, sentence case as stored, preceded by a 24px brass hairline. No tracking, no caps. Bangla eyebrows render upright.

## 4. Bangla typography rules (mandatory)

1. **Auto-detect script.** `autoLang(text)` returns `"bn"` if the string contains `[\u0980-\u09FF]`. `<Text>` / `<Heading>` / `<Prose>` set `lang="bn"` on the element automatically. Root `<html lang="en">`.
2. **Line-height:** `:lang(bn)` adds +0.2 to body (1.85) and +0.1 to headings. Bangla glyphs have tall matras and deep conjuncts.
3. **No letter-spacing on Bangla**, ever (`:lang(bn) { letter-spacing: 0 }`). Tracking breaks conjunct shaping.
4. **No synthetic italics or bold:** `font-synthesis: none` globally. Bangla that is currently faux-italic (Book Now panel) renders upright.
5. **Optical size match:** Bangla in display sizes gets `font-size: 0.94em` so mixed lines look even. Verify visually on the Offer headline and Book Now panel.
6. **No `hyphens: auto`** for Bangla; allow natural wrapping. `overflow-wrap: anywhere` only inside narrow cards.
7. Keep numerals exactly as in the data (Bangla digits stay Bangla).
8. Test every component with the longest real Bangla string from the data (Offer headline, blog titles, Book Now paragraph).

## 5. Layout & spacing

- **Container:** `max-width: 1320px`, `padding-inline: clamp(1.25rem, 4vw, 3rem)`. Wide media may bleed to viewport edge.
- **Grid:** 12 columns, gap `clamp(1rem, 2vw, 2rem)`.
- **Section rhythm:** `--section-y: clamp(5rem, 3rem + 6vw, 10rem)`.
- **Spacing scale (rem):** 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12.
- **Breakpoints:** 480, 768, 1024, 1280, 1536. Design mobile first; 390px is the primary test width.
- **Alignment:** left by default. Centered only for Home hero statement (optional), testimonials, "Choose Your Plan".
- **Section header pattern (split):** on ≥1024px, eyebrow + H2 sit in columns 1–6, any intro text or controls (e.g. gallery filters, carousel arrows) in columns 8–12, aligned to the H2 baseline.

### 5.1 Key wireframes

```
HOME HERO (100svh, min 640)                          INNER PAGE HERO (clamp 420px–62vh)
┌──────────────────────────────────────────┐        ┌──────────────────────────────────────────┐
│ topbar · header (transparent)            │        │ header (transparent)                     │
│                                          │        │                                          │
│            [ looping video ]             │        │            [ photo ]                     │
│                                          │        │                                          │
│ IndexVilla – Smart Property…  (small)    │        │ Home / Gold Ownership   (breadcrumb)     │
│ Index Eco Resort   (display)             │        │ Gold Ownership          (h1, bottom-left)│
│ [ Read more ]                     ❚❚ ↓   │        └──────────────────────────────────────────┘
└──────────────────────────────────────────┘
┌────────────┬─────────────┬─────────────┐  ← highlights: one paper panel, 3 columns split by
│ icon       │ icon        │ icon        │    hairlines, overlapping the hero by 64px (desktop)
│ title      │ title       │ title       │
│ Read more  │ Read more   │ Read more   │
└────────────┴─────────────┴─────────────┘

ABOUT (mist)                                        CHOOSE YOUR PLAN (canopy-deep stage)
┌───────────────┬──────┐   Eyebrow                  ─── Ownership packages ───
│               │ img2 │   H2 (3 lines)                 Choose Your Plan
│    img1       ├──────┤   paragraph              ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│      (▶)      │ img3 │   ◇ feature               │ card │ │ card │ │ card │ │ card │  ← tilt + sheen
│               │      │   ◇ feature               └──────┘ └──────┘ └──────┘ └──────┘
└───────────────┴──────┘   [Learn more]  ☎ 24/7     Gold      Platinum  Signature  Silver

PROJECT AT A GLANCE (lichen-soft)                   PACKAGE PAGE INTRO
Eyebrow / H2                ┌──────────────┐        💳 Silver Ownership: 5 Shares   ┌──────────────┐
Project Name ── value       │   slide      │        10% discount … (lead)           │  big card    │
Location ─────── value      │   caption    │        [ Book your share ]             │  (tilt)      │
… (hairline rows)           │ ‹  02 / 05 › │                                        └──────────────┘
                            └──────────────┘
```

## 6. Shape, borders, elevation

**Radius by role (not one radius for everything):**

| Role | Radius |
|---|---|
| Photographs, video frames, map, gallery tiles, content cards | `4px` (architectural, crisp) |
| Buttons | `2px` |
| Inputs, selects, date fields | `6px` |
| Tags / filter chips / tab indicators | `999px` |
| Dialogs, sheets, popovers | `16px` |
| Floating dock | `999px` |
| Membership cards | real card corners: `border-radius: 4.5% / 7.1%` |

**Borders:** 1px `hairline` (light) / `hairline-dark` (dark). Card hover shifts border to `rgb(27 36 32 / .24)`.

**Shadows (green-tinted, layered) — only on liftable objects:**

```css
--shadow-lift:  0 1px 2px rgb(19 48 31 / .06), 0 8px 24px -8px rgb(19 48 31 / .18);
--shadow-float: 0 2px 4px rgb(19 48 31 / .08), 0 24px 48px -12px rgb(19 48 31 / .28);
--shadow-card:  0 1px 1px rgb(12 33 22 / .20), 0 18px 40px -14px rgb(12 33 22 / .55); /* membership cards */
```

## 7. Imagery

- All CMS images through `<SmartImage>` with correct `sizes`, blur placeholder (tiny LQIP or dominant color from `lichen-soft`), and fixed aspect ratios to prevent CLS: hero 16:9 cover, gallery 3:2, event/post cards 4:3, room slider 4:3, portrait slides 4:5, poster keeps intrinsic ratio.
- Overlays for text on photos: `linear-gradient(to top, rgb(12 33 22 / .85), rgb(12 33 22 / .15) 55%, rgb(12 33 22 / .45))` — bottom for titles, top for header legibility.
- Optional unified grade on large photographic heroes: `filter: saturate(.92) contrast(1.02)`. Never on logos, posters or membership cards.
- Hover on image cards: inner image scales to `1.04` over 700ms `ease-out-soft`; frame stays fixed (overflow hidden).

## 8. Components

Each component: tokens only, keyboard accessible, visible focus, `prefers-reduced-motion` aware.

| Component | Spec |
|---|---|
| **Button / primary** | `index` bg, white label, height 52px, padding-inline 28px, radius 2px, Anek 600 `label` size wdth 110. Hover: a `canopy` fill rises from bottom (`::before`, 300ms). Active: translateY(1px). |
| **Button / on-dark** | `brass` bg, `canopy` label. Hover: fill `mist`. |
| **Button / outline** | 1px current-color border, transparent. Hover: fill with current color, label inverts. |
| **Text link** | Current color, underline drawn from left on hover (`scaleX 0→1`, 300ms). Directional links (Read more, Event details) end with a thin arrow icon that shifts 4px on hover — only where the original had an arrow. |
| **Icon button** | 48px circle, 1px hairline, icon 20px. Hover: fill `ink` (light) / `mist` (dark). Used for carousel arrows, lightbox, dialog close. |
| **Eyebrow** | See §3.3. |
| **SectionHeader** | Eyebrow + H2 (+ optional intro/controls slot). Split layout on desktop. |
| **Tag** | Pill, `lichen` bg, `ink` text, `label` size. On dark: `hairline-dark` border, `lichen` text. |
| **Header** | Height 88px over hero (transparent, white text, gradient behind for legibility); after 24px scroll → 72px, `canopy` at 92% opacity with `backdrop-filter: blur(12px) saturate(1.2)`, top bar collapses. Active link: 1px brass underline under the label. Book Now: primary on light, on-dark style over hero. |
| **Packages dropdown** | Radix NavigationMenu. Panel `paper`, radius 16, `shadow-float`, 4 rows: 72px card thumbnail (real card image) + package name in Tiro. Opens on hover (150ms delay) and keyboard. |
| **Mobile nav** | Radix Sheet from right, full height, `canopy` bg. Large Tiro links (1.75rem) separated by hairlines, packages as an accordion, then **Call Now** (tel from data) and **Book Now** buttons at the bottom; socials row. Focus trapped; closes on route change. |
| **Floating dock** | Desktop: vertical pill on right edge, centered, `canopy` 94% with blur, three 52px icon buttons (Contact / WhatsApp / Phone). Label slides out to the left on hover/focus as a tooltip-style tab. Mobile: the same three buttons at 44px stacked bottom-right, respecting `env(safe-area-inset-bottom)`, never covering form submit buttons (hide on `/contact` while the form is in view). WhatsApp keeps a restrained green icon, not a green tile. |
| **Contact modal** | Radix Dialog, radius 16, `paper`, max-width 560. Title "Contact Form". Fields per Phase 0. Success: form cross-fades to a check mark drawn with SVG stroke (400ms) + "Message sent successfully!". Errors inline under fields, `aria-live="polite"`. |
| **PageHero** | Photo + overlays, breadcrumb above title, both bottom-left in container. Title uses `h1`. Initial load: image scales 1.06→1 over 1.6s; title lines rise from a mask (see Motion). |
| **Breadcrumb** | `small`, mist at 80%; separator is a 1px slanted rule, not a slash glyph. Hrefs from data. |
| **Highlights panel** | One `paper` panel, 3 columns divided by hairlines, padding 40px, icon 40px (CMS image), title `h4`, subtitle `small ink-muted`, link. Mobile: stacked rows. |
| **Spec sheet** | `<dl>` rows with hairline separators; label `small` 600 `ink-muted` at 38% width, value `body ink`. |
| **Slider** | Embla. Controls: two icon buttons + fraction "02 / 05" in tabular numerals + thin progress bar. Swipe on touch, arrow keys when focused, `aria-roledescription="carousel"`, slide labels. No autoplay unless the original autoplays (verify); if it does, pause on hover/focus and provide a pause button. |
| **Gallery grid** | Filter chips (pills, animated active background via shared `layoutId`), horizontally scrollable on mobile with edge fade. Grid 4/3/2 columns, 3:2 tiles, 12px gap. Hover: caption (category small + title) rises over bottom gradient. Click → lightbox with caption, counter, keyboard, swipe, zoom. |
| **MembershipCard** (signature) | See §8.1. |
| **Plan grid** | 4 columns desktop, 2 on tablet, snap carousel (80% width cards) on mobile. Current package on a package page: brass hairline ring + `aria-current="page"`. |
| **Feature item** | 40px line icon in `brass-ink` (light) / `brass` (dark), title `h4`, text `small`. No filled circles. |
| **Tabs** | Underline tabs (villa) or segmented pill tabs (vision/mission). Shared-layout indicator; panel content cross-fades 200ms. Radix Tabs for a11y. |
| **Amenity grid** | 2×2 (mobile 1 col). Each: small label ("Amenities"/"Complementary") `ink-muted`, value `body` 500. Lucide icon mapped by keyword when obvious, otherwise none. |
| **Testimonial** | Large Tiro quote (1.75rem, `h3` scale), brass stars, avatar 56px circle, name 600 + role muted. Single-quote carousel when >1. |
| **Post / Event card** | `paper`, 1px hairline, radius 4, image 4:3 on top. Content padding 28px. Title `h4` (2-line clamp), excerpt 2-line clamp, footer row separated by hairline with the arrow link. Event card adds a date badge (top-left over image): `paper` block, day in Tiro 1.75rem, "MON YYYY" in `label`. Category tag above title. |
| **Filter bar (events)** | `paper` panel, radius 4, hairline, three controls in a row (stack on mobile): date-from, date-to (Radix Popover + Calendar), category (Radix Select). Controls 56px tall. |
| **Prose** | For CMS HTML: max 68ch (62ch Bangla), h2 `h3` scale Tiro with 2.5em top margin, h3 `h4`, strong 600 `ink`, lists with brass markers, blockquote with brass left rule, images radius 4, tables scroll inside `overflow-x:auto`. |
| **Sidebar box** | `paper`, hairline, radius 4, padding 28px, title `h4`. CTA box variant: `canopy` bg, mist text, brass link. Sticky on ≥1024px (`top: 96px`). |
| **Form fields** | Label above (`label` size, `ink-muted`; on dark `lichen`), required mark `*` in `brass-ink`/`brass`. Input height 56px, radius 6, 1px border; focus: 2px ring `index` (light) / `brass` (dark). Error text `danger`, `small`, with icon. Textarea min 140px. |
| **Offer panel** | `paper`, 1px `brass` border at 40% opacity, radius 4, padding clamp(24px, 4vw, 56px). Text 7 cols, poster 5 cols with `shadow-lift`. Terms note `small ink-muted`, right aligned. |
| **Book Now panel** | `canopy` bg with a very subtle leaf-vein SVG pattern at 4% opacity (optional), Bangla text Tiro 1.75rem upright, lh 1.7. Download button: on-dark style with file icon; keeps `download` attribute and original URL. |
| **Announcement bar** | 36px bar directly under the header, `index` bg, mist text `small`. Text scrolls slowly (CSS `translateX` loop, 40s linear) only if it overflows; pauses on hover/focus; static and ellipsized under reduced motion. Never overlaps navigation. |
| **Hotline band** | `mist`, centered: "Hotline" label, phone icon in a 64px `index` ring, number in Tiro `h1` with tabular numerals, link = original href. |
| **Footer** | `canopy-deep`. Brand column (logo, description max 44ch in `lichen`, social icon buttons 40px). Link columns with Tiro headings in `brass`, links `mist` with underline-draw hover. Contact items as rows with icon + label + value, separated by hairlines (no boxed cards). Bottom bar `index`, `small`, left copyright, right credit. |
| **Video modal** | Dialog, black backdrop 90%, 16:9 frame radius 4, native controls, autoplay on open, pause + unload on close, Esc closes, focus returns to the play button. |
| **Lite YouTube** | Facade: poster from `i.ytimg.com` (`hqdefault`), brass-ringed play button; the iframe (`youtube-nocookie.com`) loads only on click. Keeps the same video ID. |

### 8.1 MembershipCard (signature component)

- Renders the package's card image at true card ratio (1.586:1), `shadow-card`, card-corner radius.
- **Pointer tilt:** on `pointermove` (fine pointers only), rotateX/rotateY up to ±7°, `transform-style: preserve-3d`, parent `perspective: 1000px`. Driven by `motion` springs (`stiffness 150, damping 18`). Returns to rest on leave.
- **Sheen:** an overlay `radial-gradient(circle at var(--x) var(--y), rgb(255 255 255 / .35), transparent 45%)` with `mix-blend-mode: soft-light`, opacity 0 → 1 on hover.
- **Shadow response:** shadow offset moves opposite to tilt (max 12px).
- **Touch:** no tilt; on press, a single diagonal sheen sweep (600ms).
- **Reduced motion:** static card, no sheen motion; hover only raises shadow slightly.
- **Sizes:** grid 100% of column; package-page hero up to 560px wide.
- Wrapped in a link when used in the plan grid (whole card clickable, visible focus ring around the card).

## 9. Motion

### 9.1 Tokens

```
--ease-out-soft:    cubic-bezier(0.22, 1, 0.36, 1)   /* entrances, hovers */
--ease-in-out-soft: cubic-bezier(0.65, 0, 0.35, 1)   /* panels, tabs */
--dur-micro: 150ms   /* color, opacity on hover */
--dur-ui:    250ms   /* tabs, chips, dropdown */
--dur-panel: 450ms   /* sheet, dialog, accordion */
--dur-media: 700ms   /* image hover scale */
--dur-hero:  1200ms  /* one entrance per page */
```

### 9.2 Catalogue (the complete list — do not add more)

| Moment | Trigger | Motion |
|---|---|---|
| Page entrance | Load | Hero media scale 1.06→1 (1.6s); title lines rise from a mask (y 100%→0, 80ms stagger, 900ms); breadcrumb/subline fade 400ms after. Once per page. |
| Image unveil | Enters viewport (once) | Only on: about collage, why-buy building, restaurant image, package-page card panel. `clip-path: inset(6% 6% 6% 6%)→inset(0)` + opacity 0→1, 900ms. |
| Header state | Scroll > 24px | Height, background, blur — 300ms. |
| Dropdown / popover | Hover/focus/click | Opacity + translateY(6px→0), 250ms. |
| Sheet / dialog | Open/close | Sheet slides 450ms; dialog scale .98→1 + fade 250ms; backdrop fade. |
| Tabs | Click | Indicator slides via shared layout; content cross-fade 200ms. |
| Gallery filter | Click | Items re-layout (`layout` + `AnimatePresence mode="popLayout"`), exiting items fade/scale .96, 300ms. |
| Carousel | Drag/click | Embla physics; progress bar width follows. |
| Card hover | Hover | Image scale 1.04 (700ms), border tone (150ms), arrow shift 4px (250ms). |
| Button hover | Hover | Fill rise 300ms. |
| MembershipCard | Pointer | Tilt + sheen (see §8.1). |
| Form success | Submit OK | Cross-fade to drawn check (400ms). |
| Accordion | Click | Height auto animation 300ms. |

Not allowed: parallax scroll-jacking, bouncing, infinite pulsing, text fade-ups on every section, animated counters, cursor followers, page-wide smooth-scroll libraries by default (Lenis only behind `features.smoothScroll`, off).

### 9.3 Implementation rules

- Animate only `transform`, `opacity`, `clip-path`, `filter` (rarely). Never width/height/top/left (except accordion via motion's height auto).
- Use `LazyMotion` + `domAnimation` features to keep bundle small; CSS transitions for simple hovers.
- `whileInView` with `viewport={{ once: true, amount: 0.3 }}`.
- `useReducedMotion()`: replace transforms with ≤150ms opacity changes; disable tilt, sheen sweeps, marquee, hero scale; pause background video by default and show the play control.
- Background video: `muted playsInline loop autoPlay preload="none"` + poster; start after LCP; pause when off-screen (IntersectionObserver) and when tab hidden; skip on `navigator.connection.saveData`.

## 10. Iconography

- lucide-react, stroke 1.5, sizes 16/20/24/40. Colors from tokens.
- Brand icons (Facebook, X, YouTube, LinkedIn, Instagram, TikTok, WhatsApp) as local SVG components with `aria-hidden` and an accessible label on the link.
- CMS-provided icon images (highlights) are used as-is.

## 11. Accessibility checklist

- Skip link to `#main`. Landmarks: header, nav, main, footer. One `h1` per page.
- Focus ring: 2px `index` (light) / `brass` (dark), offset 3px, on every interactive element.
- All carousels, tabs, dialogs, menus, lightbox fully keyboard operable; focus returns to trigger on close.
- Autoplay video has a visible pause/play control (WCAG 2.2.2).
- Touch targets ≥ 44×44px.
- Images have alt from CMS; decorative images `alt=""`.
- Form errors announced; required fields marked with text, not color only.
- Works at 200% zoom and 320px width without horizontal scroll.

## 12. Tailwind v4 theme (starting point for `src/styles/globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-canopy: #13301F;
  --color-canopy-deep: #0C2116;
  --color-index: #2E6B40;
  --color-lichen: #A9BFA8;
  --color-lichen-soft: #DDE6DC;
  --color-mist: #EEF1EC;
  --color-paper: #FFFFFF;
  --color-brass: #B08D57;
  --color-brass-ink: #7D5F32;
  --color-ink: #1B2420;
  --color-ink-muted: #4A5750;
  --color-danger: #A23B2A;
  --color-hairline: rgb(27 36 32 / 0.12);
  --color-hairline-dark: rgb(238 241 236 / 0.14);

  --font-display: var(--font-tiro), "Noto Serif Bengali", Georgia, serif;
  --font-sans: var(--font-anek), "Hind Siliguri", system-ui, sans-serif;

  --text-display: clamp(3rem, 2rem + 5vw, 6.75rem);
  --text-h1: clamp(2.5rem, 1.75rem + 3.2vw, 4.5rem);
  --text-h2: clamp(2rem, 1.5rem + 2.2vw, 3.5rem);
  --text-h3: clamp(1.5rem, 1.25rem + 1vw, 2rem);
  --text-h4: 1.375rem;
  --text-lead: 1.25rem;
  --text-body: 1.0625rem;
  --text-small: 0.9375rem;
  --text-label: 0.8125rem;

  --radius-btn: 2px;
  --radius-media: 4px;
  --radius-field: 6px;
  --radius-panel: 16px;

  --shadow-lift: 0 1px 2px rgb(19 48 31 / .06), 0 8px 24px -8px rgb(19 48 31 / .18);
  --shadow-float: 0 2px 4px rgb(19 48 31 / .08), 0 24px 48px -12px rgb(19 48 31 / .28);
  --shadow-card: 0 1px 1px rgb(12 33 22 / .20), 0 18px 40px -14px rgb(12 33 22 / .55);

  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out-soft: cubic-bezier(0.65, 0, 0.35, 1);
}

:root { --section-y: clamp(5rem, 3rem + 6vw, 10rem); font-synthesis: none; }
html { background: var(--color-mist); color: var(--color-ink); }
:lang(bn) { letter-spacing: 0 !important; line-height: 1.85; }
:where(h1, h2, h3, h4):lang(bn) { line-height: 1.25; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  /* short opacity-only fades are re-enabled per component via useReducedMotion() */
}
```
