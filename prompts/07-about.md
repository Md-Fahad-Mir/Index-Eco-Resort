# Phase 6 — About `/about-us`

**Goal:** About page per audit §5.2. Data: `getAboutPage()`.

1. `PageHero` "About Us".
2. Reuse `AboutBlock` (with video modal).
3. Reuse `PlansStage` / `PlanGrid` (data order for this page).
4. **VisionMissionTabs** (`src/components/sections/about/`): `mist` section, split header (eyebrow + H2 left), segmented pill tabs (Our Vision / Our Mission / Our Approach). Panel: kicker label (render the text as stored, styled as an eyebrow), H3, long text in `Prose` with `lead`-sized first paragraph if the HTML has multiple paragraphs, image right (4:5, `Reveal` on first view only). Cross-fade between tabs; tab state in URL hash is **not** added unless the original does it.
5. **CoreValues:** H2 + intro (centered narrow column), 3×2 checkerboard tiles alternating `lichen` / `canopy` exactly in the original's order. Tile: generous padding (48px), title in Tiro `h3`, text `body`. Hover: a 1px brass rule grows across the top (300ms). Mobile: single column, keep alternation.
6. `/about_us`: already handled by the permanent redirect in `next.config` (rule 9c) — **do not add a route folder** and do not build a Who We Are page. Its `WhoWeAre` data belongs to Home's "Why Buy Our Share" block.

## Acceptance criteria

- Parity checklist "About" ticked; `/about-us` 200 and `/about_us` 308 → `/about-us` (covered by `tests/parity/fallback.spec.ts`); tabs keyboard operable (arrow keys). Note for the data: all three Vision/Mission/Approach tabs currently share one body text (audit §11.3 #16) — render as stored.
- Screenshots at 390/768/1440.

Stop and report.
