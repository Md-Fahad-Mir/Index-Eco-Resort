"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Home's square icon control (slider arrows): 48px, a champagne hairline on
 * night or a night hairline on ivory, filling on hover. The square corner is
 * Midnight's (§2.3); the hairline is an inset shadow so hover never moves it.
 */
export function EstateIconButton({
  label,
  tone = "night",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  /** The button shows only an icon, so it needs its own name. */
  label: string;
  tone?: "night" | "ivory";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "grid size-12 shrink-0 place-items-center transition-colors duration-[var(--dur-ui)] disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-[18px]",
        tone === "night"
          ? "text-me-ivory hover:bg-me-champagne hover:text-me-night shadow-[inset_0_0_0_1px_var(--me-frame)]"
          : "text-me-night hover:bg-me-night hover:text-me-ivory shadow-[inset_0_0_0_1px_var(--color-me-hairline-ink)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
