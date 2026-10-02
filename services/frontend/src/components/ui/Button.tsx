"use client";

import { Slot } from "radix-ui";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "on-dark"
  | "outline"
  | "chrome-cta"
  | "chrome-primary"
  | "chrome-secondary"
  | "home-primary"
  | "home-secondary"
  | "home-ink"
  | "home-ink-outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Render as the child element (a `next/link`, an `<a>`) keeping the styling. */
  asChild?: boolean;
  children: ReactNode;
};

/**
 * The primary action. 52px tall, 2px radius, sentence case — never uppercase
 * (§3.2). Hover fills from the bottom via a ::before layer so only `transform`
 * animates (§8, §9.3).
 */
const BASE =
  "relative isolate inline-flex h-[52px] items-center justify-center gap-2 overflow-hidden " +
  "rounded-btn px-7 font-sans text-label label-track font-semibold " +
  "transition-[color,border-color] duration-[var(--dur-micro)] " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-50 " +
  "before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 " +
  "before:transition-transform before:duration-300 before:ease-[var(--ease-out-soft)] " +
  "hover:before:scale-y-100 focus-visible:before:scale-y-100";

/** Radius and Latin tracking from the chrome tokens (defaults: rounded-btn, label-track). */
const CHROME_SHAPE = "rounded-(--chrome-btn-radius) tracking-(--chrome-btn-tracking) ";

/**
 * Midnight Estate (Home pilot, docs/02 §13): square, and 0.08em on Latin
 * labels only — the `:lang(bn)` rule zeroes tracking on Bangla.
 */
const HOME_SHAPE = "rounded-none tracking-[0.08em] ";

const VARIANT: Record<ButtonVariant, string> = {
  // Green button on a light surface; a canopy fill rises on hover.
  primary: "bg-index text-paper before:bg-canopy",
  // Brass button on a dark surface; fills to mist.
  "on-dark": "bg-brass text-canopy before:bg-mist",
  // Hairline button that inverts into its own colour.
  outline:
    "border border-current bg-transparent text-current before:bg-current " +
    "hover:text-paper focus-visible:text-paper",
  // The chrome's buttons, painted from the chrome tokens (globals.css) so a
  // theme scope can restyle them. Defaults render exactly as noted.
  // Header Book Now: `on-dark` over the hero, `primary` once the header is solid.
  "chrome-cta":
    CHROME_SHAPE +
    "bg-chrome-cta text-chrome-cta-fg before:bg-chrome-cta-fill " +
    "hover:text-chrome-cta-fill-fg focus-visible:text-chrome-cta-fill-fg " +
    "shadow-[inset_0_0_0_1px_var(--chrome-cta-ring)]",
  // Mobile sheet Call Now: `on-dark`.
  "chrome-primary":
    CHROME_SHAPE + "bg-chrome-primary text-chrome-primary-fg before:bg-chrome-primary-hover",
  // Mobile sheet Book Now: `outline` in mist.
  "chrome-secondary":
    CHROME_SHAPE +
    "border border-chrome-secondary bg-transparent text-chrome-secondary-fg " +
    "before:bg-chrome-secondary-fill hover:text-chrome-secondary-fill-fg " +
    "focus-visible:text-chrome-secondary-fill-fg",
  // Midnight Estate, Home only (§2.5). Outlines are inset shadows, so a
  // variant never changes the button's box.
  // Primary on dark: champagne, night label; champagne-soft rises on hover.
  "home-primary": HOME_SHAPE + "bg-me-champagne text-me-night before:bg-me-champagne-soft",
  // Secondary on dark: a champagne outline that fills, the label turning night.
  "home-secondary":
    HOME_SHAPE +
    "bg-transparent text-me-ivory shadow-[inset_0_0_0_1px_var(--color-me-champagne)] " +
    "before:bg-me-champagne hover:text-me-night focus-visible:text-me-night",
  // Primary on ivory: night, ivory label; forest rises on hover.
  "home-ink": HOME_SHAPE + "bg-me-night text-me-ivory before:bg-me-forest",
  // Secondary on ivory: a night outline that fills.
  "home-ink-outline":
    HOME_SHAPE +
    "bg-transparent text-me-night shadow-[inset_0_0_0_1px_var(--color-me-night)] " +
    "before:bg-me-night hover:text-me-ivory focus-visible:text-me-ivory",
};

export function Button({
  variant = "primary",
  asChild,
  className,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp className={cn(BASE, VARIANT[variant], className)} {...props}>
      {children}
    </Comp>
  );
}
