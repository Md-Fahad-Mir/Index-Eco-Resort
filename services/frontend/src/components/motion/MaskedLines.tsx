"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

/**
 * The page entrance (§9.2): title lines rise out of a mask, 80ms apart.
 * One per page, on the hero title only.
 */
export function MaskedLines({ lines, className }: { lines: ReactNode[]; className?: string }) {
  const reduced = useReducedMotionSafe();

  if (reduced) {
    return (
      <m.span
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </m.span>
    );
  }

  return (
    <span className={className}>
      {lines.map((line, i) => (
        // The clipping wrapper is what makes the line appear to rise out of nothing.
        <span key={i} className="block overflow-hidden">
          <m.span
            className="block"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </m.span>
        </span>
      ))}
    </span>
  );
}
