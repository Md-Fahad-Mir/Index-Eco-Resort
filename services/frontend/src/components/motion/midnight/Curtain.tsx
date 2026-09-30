"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DUR, EASE_INOUT } from "./tokens";
import { triggerProps, type Trigger } from "./trigger";
import { useMotionOn, useRevealScale } from "./useMotionOn";

/** Where the curtain is drawn from: the clipped-away side at the start. */
const HIDDEN = {
  right: "inset(0% 0% 0% 100%)",
  left: "inset(0% 100% 0% 0%)",
  bottom: "inset(100% 0% 0% 0%)",
} as const;

/**
 * A horizontal (or rising) curtain for an image (§5.10): a clip-path opens
 * from one edge over 1.2s on the in-out ease, once.
 *
 * The viewport is watched on an unclipped outer box, because an element
 * clipped to nothing never intersects — IntersectionObserver honours
 * clip-path, so a curtain watching itself would never open. For the same
 * reason anything inside that should wait for the curtain takes
 * `trigger="parent"` (e.g. `LightsOn`, delayed to come on as it finishes).
 *
 * `className` sizes and positions the outer box; the clipped layer fills it.
 * With motion off the clip is dropped at once, and midnight.css removes it
 * without JS, so the image is never withheld.
 */
export function Curtain({
  children,
  className,
  from = "right",
  delay = 0,
  duration = DUR.text,
  trigger = "inView",
}: {
  children: ReactNode;
  className?: string;
  from?: keyof typeof HIDDEN;
  /** Seconds. */
  delay?: number;
  /** Seconds. */
  duration?: number;
  trigger?: Trigger;
}) {
  const on = useMotionOn();
  const { time } = useRevealScale();
  return (
    <m.div className={cn("relative", className)} {...triggerProps(on, trigger)}>
      <m.div
        data-me-reveal
        className="absolute inset-0"
        variants={{
          hidden: { clipPath: HIDDEN[from] },
          shown: {
            clipPath: "inset(0% 0% 0% 0%)",
            transition: on
              ? { duration: duration * time, ease: EASE_INOUT, delay }
              : { duration: 0 },
          },
        }}
      >
        {children}
      </m.div>
    </m.div>
  );
}
