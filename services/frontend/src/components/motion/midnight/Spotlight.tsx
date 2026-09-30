"use client";

import { m, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { MEDIUM_UP } from "./tokens";
import { useMedia, useMotionOn } from "./useMotionOn";

/**
 * The vault's light (§5.7): a static radial glow whose opacity rises from .3
 * to 1 as its section scrolls in. Opacity only. Full and still on phones and
 * under reduced motion. The gradient is the `--me-spotlight` token.
 */
export function Spotlight({ className }: { className?: string }) {
  const on = useMotionOn();
  const wide = useMedia(MEDIUM_UP);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  return (
    <m.div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute bg-(image:--me-spotlight)", className)}
      style={{ opacity: on && wide ? opacity : 1 }}
    />
  );
}
