"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Moves one indicator element onto whichever child of a container carries
 * `data-active="true"` — the pill under a filter chip, the rule under a tab.
 * Returns the two refs: `container` for the parent (it must be positioned, so
 * it is the children's offset parent) and `indicator` for the moving element.
 *
 * The app loads motion's `domAnimation`, which has no layout animations, so a
 * shared `layoutId` would jump rather than slide. This measures instead and
 * writes the box straight onto the indicator's style: no React state, no
 * re-render.
 *
 * The first placement is instant; after it the container is marked
 * `data-indicator="ready"`, which (a) lets the indicator's CSS transition run
 * for every later move and (b) lets the active child drop the fill it paints
 * for itself before hydration, when there is no indicator to show.
 */
export function useSlidingIndicator<C extends HTMLElement, I extends HTMLElement>(
  /** Anything that changes which child is active. */
  activeKey: unknown,
) {
  const container = useRef<C>(null);
  const indicator = useRef<I>(null);

  useLayoutEffect(() => {
    const root = container.current;
    const mark = indicator.current;
    if (!root || !mark) return;

    const place = () => {
      const el = root.querySelector<HTMLElement>('[data-active="true"]');
      if (!el) {
        mark.style.opacity = "0";
        return;
      }
      mark.style.width = `${el.offsetWidth}px`;
      mark.style.height = `${el.offsetHeight}px`;
      mark.style.transform = `translate3d(${el.offsetLeft}px, ${el.offsetTop}px, 0)`;
      mark.style.opacity = "1";
    };

    place();
    // Only moves after the first placement animate.
    const frame = requestAnimationFrame(() => root.setAttribute("data-indicator", "ready"));
    const observer = new ResizeObserver(place);
    observer.observe(root);
    // Web fonts change label widths once they land.
    void document.fonts?.ready.then(place);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activeKey]);

  return { container, indicator };
}
