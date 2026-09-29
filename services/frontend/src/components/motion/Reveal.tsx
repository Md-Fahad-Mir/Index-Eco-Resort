"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

/**
 * The image unveil (§9.2): a clip-path opening once as the element enters view.
 * Reserved for the four approved images — the about collage, the why-buy
 * building, the restaurant image and the package-page card panel. Never text.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotionSafe();

  if (reduced) {
    return (
      <m.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </m.div>
    );
  }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, clipPath: "inset(6% 6% 6% 6%)" }}
      whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
