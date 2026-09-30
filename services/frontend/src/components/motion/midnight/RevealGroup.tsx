"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { STAGGER } from "./tokens";
import { triggerProps, type Trigger } from "./trigger";
import { useMotionOn } from "./useMotionOn";

const TAGS = { div: m.div, ul: m.ul, ol: m.ol, dl: m.dl } as const;

/**
 * A group whose `RevealItem`s rise in turn, eyebrow → heading → body → action
 * (§3). It animates nothing itself; it only times its children.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
  stagger = STAGGER,
  delay = 0,
  trigger = "inView",
}: {
  children: ReactNode;
  className?: string;
  as?: keyof typeof TAGS;
  /** Seconds between items. */
  stagger?: number;
  /** Seconds before the first item. */
  delay?: number;
  trigger?: Trigger;
}) {
  const on = useMotionOn();
  const Tag = TAGS[as];
  return (
    <Tag
      className={className}
      {...triggerProps(on, trigger)}
      variants={{
        hidden: {},
        shown: { transition: on ? { staggerChildren: stagger, delayChildren: delay } : {} },
      }}
    >
      {children}
    </Tag>
  );
}
