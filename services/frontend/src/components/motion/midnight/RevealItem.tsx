"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { DUR, EASE } from "./tokens";
import { useMotionOn, useRevealScale } from "./useMotionOn";

const TAGS = { div: m.div, li: m.li, p: m.p } as const;

/**
 * One step of a `RevealGroup`: it emerges — opacity and a short rise, 28px
 * (18px on phones), on the long expo ease. Transform and opacity only.
 */
export function RevealItem({
  children,
  className,
  as = "div",
  lang,
}: {
  children: ReactNode;
  className?: string;
  as?: keyof typeof TAGS;
  /** For CMS text rendered straight into the item (`autoLang`). */
  lang?: "bn";
}) {
  const on = useMotionOn();
  const { distance, time } = useRevealScale();
  const Tag = TAGS[as];
  return (
    <Tag
      data-me-reveal
      lang={lang}
      className={className}
      variants={{
        hidden: { opacity: 0, y: distance },
        shown: {
          opacity: 1,
          y: 0,
          transition: on ? { duration: DUR.reveal * time, ease: EASE } : { duration: 0 },
        },
      }}
    >
      {children}
    </Tag>
  );
}
