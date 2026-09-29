# Phase 2 — Design system & primitives

**Goal:** implement "Canopy & Brass" (`docs/02-DESIGN-SYSTEM.md`) as tokens and reusable, accessible primitives, and prove them on a styleguide page.

## Tasks

1. **Tokens:** put the `@theme` block from design-system §12 into `src/styles/globals.css`; add section rhythm, container, focus-ring and reduced-motion base styles, `:lang(bn)` rules (§4).
2. **Fonts:** load Tiro Bangla (400 + italic) and Anek Bangla (variable, include `wdth` axis) via `next/font/google` with `bengali` + `latin` subsets and CSS variables `--font-tiro`, `--font-anek`. If either is unavailable in the installed `next/font`, fall back to Noto Serif Bengali / Hind Siliguri and note it in PROGRESS.
3. **Language utilities:** `src/lib/lang.ts` (`isBangla`, `autoLang`) and typography components `<Text>`, `<Heading level>`, `<Prose>` that set `lang="bn"` automatically and apply the scale.
4. **Primitives** (in `src/components/ui/`), each per design-system §8: `Button` (primary, on-dark, outline; `asChild` support for links), `TextLink` (underline draw, optional arrow), `IconButton`, `Eyebrow`, `SectionHeader` (split layout slot), `Tag`, `Field`/`Input`/`Textarea`/`Checkbox`, `Select`, `DatePicker` (Popover + Calendar), `Tabs` (underline + segmented variants with shared-layout indicator), `Container`, `Section` (tone: mist | paper | lichen-soft | canopy | canopy-deep).
5. **Restyle shadcn components** to tokens (radius by role, shadows only on floating layers, focus rings).
6. **Media primitives** (`src/components/media/`): `SmartImage` (remote CMS images, `sizes`, fixed ratio wrapper, blur/tint placeholder), `Slider` (Embla wrapper with arrows, fraction, progress bar, keyboard, a11y roles), `Lightbox` (dynamic import), `VideoModal`, `LiteYouTube`, `BackgroundVideo` (rules in design-system §9.3, with pause/play control).
7. **Motion helpers:** `src/components/motion/` — `MotionProvider` (LazyMotion + domAnimation), `Reveal` (image unveil only), `MaskedLines` (hero title lines), `useReducedMotionSafe`.
8. **Styleguide route** `src/app/(dev)/styleguide/page.tsx` (excluded from production via `notFound()` when `NODE_ENV === "production"`) showing colors, type scale with real Bangla + English strings from fixtures (Offer headline, a blog title, the Book Now paragraph), all buttons/states, fields with errors, tabs, tags, slider, a MembershipCard placeholder.

## Acceptance criteria

- No raw hex values or arbitrary font sizes outside `globals.css`.
- Styleguide passes axe with no serious/critical issues; all controls keyboard operable; focus visible on light and dark.
- Bangla strings: no tracking, correct line-height, no faux italics (inspect computed styles).
- Screenshot the styleguide at 390 and 1440 into `audit/screenshots/after/styleguide-*.png`.

Stop and report with screenshots.
