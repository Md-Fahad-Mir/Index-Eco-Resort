"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DUR, EASE } from "./tokens";
import { triggerProps, type Trigger } from "./trigger";
import { useMotionOn, useRevealScale } from "./useMotionOn";

/**
 * "Lights on" for an image (§3): a night veil over it fades from .85 to 0
 * while the image settles from a slight scale. The image itself is never at
 * opacity 0, so it paints — and counts as the largest paint — immediately.
 *
 * The wrapper clips; give it the frame's size through `className`.
 */
export function LightsOn({
  children,
  className,
  from = 1.06,
  duration = DUR.light,
  scaleDuration,
  delay = 0,
  trigger = "inView",
}: {
  children: ReactNode;
  className?: string;
  /** Starting scale of the image. */
  from?: number;
  /** Seconds for the veil. */
  duration?: number;
  /** Seconds for the scale; defaults to `duration`. */
  scaleDuration?: number;
  /** Seconds. */
  delay?: number;
  trigger?: Trigger;
}) {
  const on = useMotionOn();
  const { time } = useRevealScale();
  const timing = (seconds: number) =>
    on ? { duration: seconds * time, ease: EASE, delay } : { duration: 0 };

  return (
    <m.div
      className={cn("relative overflow-hidden", className)}
      initial="hidden"
      {...triggerProps(on, trigger)}
    >
      <m.div
        data-me-reveal
        className="relative size-full"
        variants={{
          hidden: { scale: from },
          shown: { scale: 1, transition: timing(scaleDuration ?? duration) },
        }}
      >
        {children}
      </m.div>
      <m.div
        aria-hidden
        data-me-veil
        className="bg-me-night pointer-events-none absolute inset-0"
        variants={{
          hidden: { opacity: 0.85 },
          shown: { opacity: 0, transition: timing(duration) },
        }}
      />
    </m.div>
  );
}
