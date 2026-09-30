"use client";

import { m, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode, type RefObject } from "react";
import { MEDIUM_UP } from "./tokens";
import { useMedia, useMotionOn } from "./useMotionOn";

/**
 * A bounded parallax: the child drifts from -distance to +distance (px) on
 * the y axis while its box crosses the viewport. Transform only, and off below
 * 768px and under reduced motion (§3, §6).
 */
export function ScrollDrift({
  children,
  className,
  distance = 24,
  target,
}: {
  children: ReactNode;
  className?: string;
  /** px either side of rest. */
  distance?: number;
  /** Track this element's pass instead of the child's — e.g. a whole section
      around sticky media, which would otherwise freeze while it is stuck. */
  target?: RefObject<HTMLElement | null>;
}) {
  const on = useMotionOn();
  const wide = useMedia(MEDIUM_UP);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: target ?? ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <m.div ref={ref} className={className} style={{ y: on && wide ? y : 0 }}>
      {children}
    </m.div>
  );
}
