"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { DISTANCE, DISTANCE_SMALL, MEDIUM_UP, SMALL_DURATION_FACTOR } from "./tokens";

const REDUCED = "(prefers-reduced-motion: reduce)";

declare global {
  interface Window {
    /** Read by the head script's failsafe (app/layout.tsx). */
    __meMotionReady?: boolean;
  }
}

const subscribeTo = (query: string) => (onChange: () => void) => {
  const list = window.matchMedia(query);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
};

const subscribeReduced = subscribeTo(REDUCED);

/**
 * Whether Midnight's entrances should play: JS ran, the head script set
 * `data-motion="on"`, and reduced motion is off.
 *
 * The server — and therefore hydration — assumes yes, so the markup always
 * starts in the entrance state; styles/midnight.css neutralises that state
 * whenever the flag is absent. After hydration the real answer takes over and
 * every primitive jumps to its final state if motion is off. This is
 * `useReducedMotion()` made hydration-safe: motion's own hook reads the media
 * query during the hydrating render and so can disagree with the server.
 */
export function useMotionOn(): boolean {
  const on = useSyncExternalStore(
    subscribeReduced,
    () =>
      document.documentElement.getAttribute("data-motion") === "on" &&
      !window.matchMedia(REDUCED).matches,
    () => true,
  );

  // Tells the head script's failsafe the page hydrated.
  useEffect(() => {
    window.__meMotionReady = true;
  }, []);

  return on;
}

/** A media query as state; `serverValue` until hydration. */
export function useMedia(query: string, serverValue = false): boolean {
  const subscribe = useMemo(() => subscribeTo(query), [query]);
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Reveal distance and duration scale for the current width (§6). */
export function useRevealScale() {
  const wide = useMedia(MEDIUM_UP, true);
  return {
    distance: wide ? DISTANCE : DISTANCE_SMALL,
    time: wide ? 1 : SMALL_DURATION_FACTOR,
    wide,
  };
}
