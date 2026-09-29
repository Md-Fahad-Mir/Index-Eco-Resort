"use client";

import { domAnimation, LazyMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Loads only motion's DOM animation features, keeping the bundle small
 * (docs/02-DESIGN-SYSTEM.md §9.3). Components use the `m.*` primitives.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
