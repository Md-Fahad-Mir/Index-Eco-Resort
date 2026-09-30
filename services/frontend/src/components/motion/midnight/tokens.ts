/**
 * Midnight Estate motion tokens — "candlelight" (prompts/06b-home-redesign.md
 * §3). Mirrors the CSS custom properties in src/styles/midnight.css, in the
 * units motion wants (seconds, cubic-bezier arrays).
 */

/** Expo-out: things settle rather than stop. */
export const EASE = [0.19, 1, 0.22, 1] as const;
/** Frames and curtains. */
export const EASE_INOUT = [0.77, 0, 0.175, 1] as const;

/** Seconds. */
export const DUR = {
  reveal: 1.1,
  text: 1.2,
  light: 1.6,
  frame: 1.4,
} as const;

export const STAGGER = 0.09;
/** Reveal distance in px; phones get the shorter one (§6). */
export const DISTANCE = 28;
export const DISTANCE_SMALL = 18;
/** Durations below 768px are a quarter shorter (§6). */
export const SMALL_DURATION_FACTOR = 0.75;

/** Every in-view trigger: once, when a quarter is visible (§3). */
export const VIEWPORT = { once: true, amount: 0.25 } as const;

/** Scroll-linked effects and the long distances start here (§6). */
export const MEDIUM_UP = "(min-width: 768px)";
export const LARGE_UP = "(min-width: 1024px)";
