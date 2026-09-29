"use client";

import { useReducedMotion } from "motion/react";

/**
 * True when the visitor asked for reduced motion. Components use it to swap
 * transforms for a short opacity change and to disable tilt, sheen, autoplay
 * and hero scaling (docs/02-DESIGN-SYSTEM.md §9.3).
 *
 * `useReducedMotion` returns null before hydration; treat that as "no
 * preference" so the first paint matches the server.
 */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}
