"use client";

import { animate, m, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { DUR, EASE_INOUT, VIEWPORT } from "./tokens";
import type { Trigger } from "./trigger";
import { useMotionOn, useRevealScale } from "./useMotionOn";

/** 0–1 progress of `p` through the segment [a, b] of the perimeter. */
const segment = (p: number, a: number, b: number) =>
  b <= a ? (p >= b ? 1 : 0) : Math.min(1, Math.max(0, (p - a) / (b - a)));

/**
 * The frame motif (§2.3): a 1px champagne hairline at 40%, inset 14px (10px on
 * phones), drawn once clockwise from the top-left corner over 1.4s.
 *
 * The prompt describes an SVG stroke-dashoffset; that repaints the whole
 * layer every frame. This draws the same line with four hairlines whose
 * scale follows one progress value split by edge length — so the pen keeps a
 * constant speed around the corners and every frame is composite-only (§7).
 *
 * Place it inside a `relative` box; it never takes pointer events.
 */
export function FrameDraw({
  className,
  delay = 0,
  trigger = "inView",
}: {
  className?: string;
  /** Seconds. */
  delay?: number;
  trigger?: Trigger;
}) {
  const on = useMotionOn();
  const { time } = useRevealScale();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, VIEWPORT);
  const progress = useMotionValue(0);
  // Width's share of width + height; each horizontal edge is half of it.
  const share = useRef(0.5);

  const top = useTransform(progress, (p) => segment(p, 0, share.current / 2));
  const right = useTransform(progress, (p) => segment(p, share.current / 2, 0.5));
  const bottom = useTransform(progress, (p) => segment(p, 0.5, 0.5 + share.current / 2));
  const left = useTransform(progress, (p) => segment(p, 0.5 + share.current / 2, 1));

  const go = trigger === "mount" || inView;

  useEffect(() => {
    if (!on) {
      progress.set(1);
      return;
    }
    if (!go) return;
    const box = ref.current?.getBoundingClientRect();
    if (box && box.width + box.height > 0) share.current = box.width / (box.width + box.height);
    const controls = animate(progress, 1, {
      duration: DUR.frame * time,
      ease: EASE_INOUT,
      delay,
    });
    return () => controls.stop();
  }, [on, go, delay, time, progress]);

  const edge = "absolute bg-(--me-frame)";
  return (
    <span
      ref={ref}
      aria-hidden
      data-me-frame
      className={cn("pointer-events-none absolute inset-(--me-frame-inset)", className)}
    >
      <m.span data-me-reveal className={cn(edge, "inset-x-0 top-0 h-px origin-left")} style={{ scaleX: top }} />
      {/* The sides stop a pixel short of each corner so no corner is painted twice. */}
      <m.span data-me-reveal className={cn(edge, "top-px right-0 bottom-px w-px origin-top")} style={{ scaleY: right }} />
      <m.span data-me-reveal className={cn(edge, "inset-x-0 bottom-0 h-px origin-right")} style={{ scaleX: bottom }} />
      <m.span data-me-reveal className={cn(edge, "top-px bottom-px left-0 w-px origin-bottom")} style={{ scaleY: left }} />
    </span>
  );
}
