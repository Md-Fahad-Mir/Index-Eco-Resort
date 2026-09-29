# Phase 12 — Motion & polish pass

**Goal:** make the whole site feel expensive through restraint and consistency. Reference: design-system §9 (the motion catalogue is the complete list).

## Audit and fix

1. **Motion inventory:** list every animation in the codebase. Remove anything not in the catalogue. Ensure each page has at most one load-time entrance and that `Reveal` is only used on the four approved images.
2. **Timing consistency:** every duration/easing comes from tokens. Hovers ≤ 300ms except image scale (700ms).
3. **Reduced motion:** walk every page with `prefers-reduced-motion: reduce` — no transforms, no marquee, no tilt, video paused with control visible.
4. **Hover/focus parity:** every hover effect has an equivalent `:focus-visible` state.
5. **Spacing rhythm:** check section paddings use `--section-y`; heading-to-content gaps consistent (eyebrow→H2 16px, H2→content 40–56px).
6. **Typography pass:** balance headings, fix widows in hero titles, verify Bangla optical sizing on Offer headline, Book Now panel, blog titles; check no uppercase transforms or tracking slipped in.
7. **Image pass:** every image has correct `sizes`, aspect wrapper, alt; overlays keep text contrast ≥ 4.5:1 over the brightest part of each hero photo (test with the real images).
8. **Edge cases:** very long Bangla titles in cards, missing images (graceful tinted placeholder), one-item lists (testimonials, posts), 320px width, 200% zoom, Windows high-contrast mode (forced-colors) for buttons and focus.
9. **Chanel check:** for each page, name one decorative detail that can be removed, and remove it unless it carries information.
10. **Performance:** measure INP while hovering MembershipCards and scrolling Home; ensure `will-change` is applied only during interaction.

## Acceptance criteria

- `docs/PROGRESS.md` contains the motion inventory (before/after) and what was removed.
- Screenshots of all routes at 390/1440 refreshed.

Stop and report.
