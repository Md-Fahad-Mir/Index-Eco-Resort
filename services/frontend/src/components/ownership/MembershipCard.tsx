"use client";

import { m, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { SmartImage, type ImgData } from "@/components/media/SmartImage";
import { cn } from "@/lib/utils";

/**
 * The one memorable moment (docs/02-DESIGN-SYSTEM.md §8.1).
 *
 * The four membership cards are the product, so they behave like real cards
 * under light: they tilt toward the pointer, catch a moving sheen, and their
 * shadow leans the other way. Everything else on the site stays calm.
 *
 * Fine pointers only. Touch gets a single sheen sweep on press; reduced motion
 * gets a static card with a slightly raised shadow and no sheen.
 */

const MAX_TILT = 7; // degrees, §8.1
const SPRING = { stiffness: 150, damping: 18 } as const;

export function MembershipCard({
  card,
  name,
  href,
  className,
  sizes = "(min-width: 1024px) 320px, (min-width: 640px) 45vw, 80vw",
  priority,
  variant = "default",
}: {
  card: ImgData | null | undefined;
  /** Package name, used as the link's accessible name. */
  name: string;
  /** Wraps the card in a link when given (the plan grid). */
  href?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /**
   * `home` is the Midnight Estate vault (docs/02 §13): shadows deep and black
   * rather than canopy-tinted, plus a champagne rim that lights on hover.
   */
  variant?: "default" | "home";
}) {
  const home = variant === "home";
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [sweeping, setSweeping] = useState(false);

  // -0.5 … 0.5 across the card, from the pointer position.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]), SPRING);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]), SPRING);

  // The shadow leans opposite the tilt, up to 12px (§8.1).
  const shadowX = useSpring(useTransform(px, [-0.5, 0.5], [12, -12]), SPRING);
  const shadowY = useSpring(useTransform(py, [-0.5, 0.5], [12, -12]), SPRING);
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px 40px -14px rgb(12 33 22 / 0.55), 0 1px 1px rgb(12 33 22 / 0.2)`;
  // Midnight: the §2.3 shadow on dark, leaning with the tilt, and the rim light.
  const rim = useSpring(0, SPRING);
  const homeShadow = useMotionTemplate`${shadowX}px ${shadowY}px 60px -20px rgb(0 0 0 / 0.6), 0 2px 6px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(201 169 110 / ${rim})`;

  // Sheen origin follows the pointer across the face.
  const sheenX = useTransform(px, (v) => `${(v + 0.5) * 100}%`);
  const sheenY = useTransform(py, (v) => `${(v + 0.5) * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgb(255 255 255 / 0.35), transparent 45%)`;

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const rest = () => {
    setHovering(false);
    rim.set(0);
    px.set(0);
    py.set(0);
  };

  // Touch: one diagonal sweep instead of a tilt (§8.1).
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType === "mouse") return;
    setSweeping(true);
    window.setTimeout(() => setSweeping(false), 600);
  };

  const face = (
    <m.div
      ref={ref}
      data-testid="membership-card-face"
      onPointerMove={handlePointerMove}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        setHovering(true);
        rim.set(0.35);
      }}
      onPointerLeave={rest}
      onPointerDown={handlePointerDown}
      style={
        reduced
          ? undefined
          : {
              rotateX,
              rotateY,
              boxShadow: home ? homeShadow : boxShadow,
              transformStyle: "preserve-3d" as const,
            }
      }
      className={cn(
        // Real card corners, not a uniform radius (§6).
        "relative isolate overflow-hidden rounded-[4.5%_/_7.1%]",
        home ? "bg-me-night-deep" : "bg-canopy-deep",
        reduced &&
          (home
            ? "shadow-me-deep hover:shadow-me-lit transition-shadow duration-[var(--dur-ui)]"
            : "shadow-card hover:shadow-float transition-shadow duration-[var(--dur-ui)]"),
      )}
    >
      <SmartImage image={card} sizes={sizes} ratio="card-face" priority={priority} />

      {/* Pointer sheen — soft-light so it reads as reflected light, not a white wash. */}
      {!reduced && (
        <m.span
          aria-hidden
          style={{ backgroundImage: sheen, opacity: hovering ? 1 : 0 }}
          className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-[var(--dur-ui)]"
        />
      )}

      {/* Touch sweep. */}
      {!reduced && sweeping && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-[card-sweep_600ms_ease-out] bg-[linear-gradient(105deg,transparent_30%,rgb(255_255_255/0.45)_50%,transparent_70%)] mix-blend-soft-light"
        />
      )}
    </m.div>
  );

  const wrapper = cn("group block [perspective:1000px]", className);

  if (!href) return <div className={wrapper}>{face}</div>;

  return (
    <Link href={href} aria-label={name} className={cn(wrapper, "rounded-[4.5%_/_7.1%]")}>
      {face}
    </Link>
  );
}
