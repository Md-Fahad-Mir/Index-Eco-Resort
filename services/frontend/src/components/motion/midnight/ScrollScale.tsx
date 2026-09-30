"use client";

import { m, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode, type RefObject } from "react";
import { MEDIUM_UP } from "./tokens";
import { useMedia, useMotionOn } from "./useMotionOn";

/**
 * An image that settles as it is scrolled past: scale `from` → `to` while its
 * box (or `target`'s) crosses the viewport. Transform only, bounded, and off
 * below 768px and under reduced motion (§3, §6). The parent clips.
 */
export function ScrollScale({
  children,
  className,
  from = 1.08,
  to = 1,
  target,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
  /** Track this element's pass instead of the child's — e.g. a whole section
      around a sticky image. */
  target?: RefObject<HTMLElement | null>;
}) {
  const on = useMotionOn();
  const wide = useMedia(MEDIUM_UP);
  const own = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: target ?? own,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [from, to]);

  return (
    <m.div ref={own} className={className} style={{ scale: on && wide ? scale : 1 }}>
      {children}
    </m.div>
  );
}
