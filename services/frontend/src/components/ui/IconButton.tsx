"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required: the button shows only an icon, so it needs its own name. */
  label: string;
  children: ReactNode;
  tone?: "light" | "dark";
};

/**
 * A 48px hairline circle for carousel arrows, lightbox and dialog controls.
 * Meets the 44px touch-target minimum (§11).
 */
export function IconButton({
  label,
  children,
  tone = "light",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "rounded-pill inline-grid size-12 place-items-center border transition-colors duration-[var(--dur-micro)]",
        "disabled:pointer-events-none disabled:opacity-40",
        tone === "light"
          ? "border-hairline text-ink hover:bg-ink hover:text-mist"
          : "border-hairline-dark text-mist hover:bg-mist hover:text-canopy",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="[&>svg]:size-5">
        {children}
      </span>
    </button>
  );
}
