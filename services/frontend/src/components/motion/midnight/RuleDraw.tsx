"use client";

import { m } from "motion/react";
import { cn } from "@/lib/utils";
import { DUR, EASE } from "./tokens";
import { triggerProps, type Trigger } from "./trigger";
import { useMotionOn, useRevealScale } from "./useMotionOn";

const ORIGIN = { left: 0, center: 0.5, right: 1 } as const;

/**
 * A gold hairline drawn once: scaleX 0 → 1 from one end or from the centre.
 * Size and colour come from `className` (e.g. `h-px w-10 bg-me-champagne`).
 */
export function RuleDraw({
  className,
  origin = "left",
  delay = 0,
  duration = DUR.reveal,
  trigger = "inView",
}: {
  className?: string;
  origin?: keyof typeof ORIGIN;
  /** Seconds. */
  delay?: number;
  /** Seconds. */
  duration?: number;
  trigger?: Trigger;
}) {
  const on = useMotionOn();
  const { time } = useRevealScale();
  return (
    <m.span
      aria-hidden
      data-me-reveal
      className={cn("block", className)}
      style={{ originX: ORIGIN[origin] }}
      {...triggerProps(on, trigger)}
      variants={{
        hidden: { scaleX: 0 },
        shown: {
          scaleX: 1,
          transition: on ? { duration: duration * time, ease: EASE, delay } : { duration: 0 },
        },
      }}
    />
  );
}
