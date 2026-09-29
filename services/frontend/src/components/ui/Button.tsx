"use client";

import { Slot } from "radix-ui";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "on-dark" | "outline";

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

const VARIANT: Record<ButtonVariant, string> = {
  // Green button on a light surface; a canopy fill rises on hover.
  primary: "bg-index text-paper before:bg-canopy",
  // Brass button on a dark surface; fills to mist.
  "on-dark": "bg-brass text-canopy before:bg-mist",
  // Hairline button that inverts into its own colour.
  outline:
    "border border-current bg-transparent text-current before:bg-current " +
    "hover:text-paper focus-visible:text-paper",
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
