"use client";

import useEmblaCarousel from "embla-carousel-react";
import { m, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { EASE, LARGE_UP } from "@/components/motion/midnight/tokens";
import { useMedia, useMotionOn } from "@/components/motion/midnight/useMotionOn";
import { MembershipCard } from "@/components/ownership/MembershipCard";
import { Heading } from "@/components/typography/Heading";
import type { PackageSummary } from "@/lib/data";
import { internalHref } from "@/lib/links";
import { cn } from "@/lib/utils";

/** The fanned stack (§5.7): each card's tilt, left to right. */
const FAN_ROTATION = [-6, -2, 2, 6];
/** px between neighbouring cards in the stack, so every card still shows. */
const FAN_SPACING = 56;
/** px the stack sits below its final row. */
const FAN_DROP = 40;
/** Veil opacity over a fanned card: brightness .6. */
const FAN_DIM = 0.4;
/** px, the row's gap at `lg` (gap-6). */
const GAP = 24;
/** The part of the row's pass through the viewport over which it spreads. */
const SPREAD_WINDOW = [0.2, 0.6];

const SIZES = "(min-width: 1024px) 300px, (min-width: 768px) 45vw, 78vw";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The vault's cards, three compositions (§5.7):
 * - ≥1024px: a fanned, dimmed stack at the centre that spreads into four
 *   columns and brightens as the row passes 20%→60% through the viewport —
 *   reversible inside that window, then locked open for good. Names fade in
 *   beneath once it has locked.
 * - 768–1023px: a 2×2 grid rising in turn.
 * - <768px: a snap carousel; the card under the lamp at full brightness and
 *   size, its neighbours dimmed to .55 and scaled to .92.
 * Reduced motion: the open grid at full brightness, nothing moving.
 */
export function VaultCards({ packages }: { packages: PackageSummary[] }) {
  const on = useMotionOn();
  const large = useMedia(LARGE_UP);
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: rowRef, offset: ["start end", "end start"] });
  // 1 = fanned, 0 = open.
  const fan = useTransform(scrollYProgress, SPREAD_WINDOW, [1, 0]);
  const [locked, setLocked] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value >= SPREAD_WINDOW[1]!) setLocked(true);
  });
  const fanned = on && large && !locked;

  return (
    <>
      <div
        ref={rowRef}
        data-testid="vault-grid"
        data-state={fanned ? "fanned" : "open"}
        className="hidden w-full md:block"
      >
        <RevealGroup
          as="ul"
          className="grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4 lg:gap-x-6"
        >
          {packages.map((pkg, index) => (
            <VaultCard
              key={pkg.slug}
              pkg={pkg}
              index={index}
              count={packages.length}
              fan={fan}
              fanned={fanned}
            />
          ))}
        </RevealGroup>
      </div>
      <VaultCarousel packages={packages} />
    </>
  );
}

/** One card in the grid, carrying its share of the fan while it is fanned. */
function VaultCard({
  pkg,
  index,
  count,
  fan,
  fanned,
}: {
  pkg: PackageSummary;
  index: number;
  count: number;
  fan: MotionValue<number>;
  fanned: boolean;
}) {
  // -1.5 … 1.5 for four cards: this column's distance from the centre.
  const offset = index - (count - 1) / 2;
  const rotation = FAN_ROTATION[index] ?? offset * 4;
  // Pulled in by its distance from the centre (a column is its own width plus
  // the gap, hence the percentage), then spaced back out a little, dropped
  // and turned. At f = 0 every term is 0: the card is in its column.
  const transform = useTransform(fan, (f) => {
    const pull = (-offset * f).toFixed(4);
    const spread = (offset * FAN_SPACING * f).toFixed(2);
    return `translateX(calc(${pull} * (100% + ${GAP}px) + ${spread}px)) translateY(${(FAN_DROP * f).toFixed(2)}px) rotate(${(rotation * f).toFixed(3)}deg)`;
  });
  const dim = useTransform(fan, (f) => f * FAN_DIM);

  return (
    <RevealItem as="li">
      <m.div
        className="relative flex flex-col items-center gap-6"
        style={{ transform: fanned ? transform : "none" }}
      >
        <div className="relative w-full">
          <MembershipCard
            variant="home"
            card={pkg.card}
            name={pkg.name}
            href={internalHref(pkg.href) ?? undefined}
            sizes={SIZES}
          />
          {fanned ? (
            <m.span
              aria-hidden
              className="bg-me-night-deep pointer-events-none absolute inset-0 rounded-[4.5%_/_7.1%]"
              style={{ opacity: dim }}
            />
          ) : null}
        </div>
        <m.div
          animate={{ opacity: fanned ? 0 : 1 }}
          transition={fanned ? { duration: 0 } : { duration: 0.9, ease: EASE, delay: 0.2 }}
        >
          <Heading level={3} size="h4" className="text-me-ivory text-center">
            {pkg.name}
          </Heading>
        </m.div>
      </m.div>
    </RevealItem>
  );
}

/** Below 768px: a snap carousel with the active card lit. */
function VaultCarousel({ packages }: { packages: PackageSummary[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "center" });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setActive(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  return (
    <div data-testid="vault-carousel" className="w-full md:hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <ul className="flex">
          {packages.map((pkg, index) => {
            const current = index === active;
            return (
              <li key={pkg.slug} className="min-w-0 shrink-0 grow-0 basis-[78%] px-2">
                <div
                  className={cn(
                    "ease-me flex flex-col items-center gap-5 transition-[scale] duration-500",
                    current ? "scale-100" : "scale-[0.92]",
                  )}
                >
                  <div className="relative w-full">
                    <MembershipCard
                      variant="home"
                      card={pkg.card}
                      name={pkg.name}
                      href={internalHref(pkg.href) ?? undefined}
                      sizes={SIZES}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "bg-me-night-deep pointer-events-none absolute inset-0 rounded-[4.5%_/_7.1%] transition-opacity duration-500",
                        current ? "opacity-0" : "opacity-45",
                      )}
                    />
                  </div>
                  <Heading level={3} size="h4" className="text-me-ivory text-center">
                    {pkg.name}
                  </Heading>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <p aria-hidden className="text-label tabular text-me-parchment mt-8 text-center">
        {pad(active + 1)} <span className="text-me-sage">/ {pad(packages.length)}</span>
      </p>
    </div>
  );
}
