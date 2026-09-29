"use client";

import { m } from "motion/react";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

/**
 * The success state: a check drawn with an SVG stroke rather than a static
 * tick, so the moment of completion is felt. The message text is the live
 * site's own (§8 Contact modal).
 */
export function FormSuccess({ message }: { message: string }) {
  const reduced = useReducedMotionSafe();
  return (
    <div role="status" className="flex flex-col items-center gap-5 py-10 text-center">
      <span className="border-index/30 rounded-pill grid size-16 place-items-center border">
        <svg viewBox="0 0 32 32" className="text-index size-8" fill="none" aria-hidden>
          <m.path
            d="M7 16.5 13.5 23 25 10"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      </span>
      <p className="font-display text-h4 text-ink">{message}</p>
    </div>
  );
}
