"use client";

import { Star } from "lucide-react";
import { useInView } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { useDictionary, useFormatter } from "@/components/i18n/LocaleProvider";
import { SmartImage } from "@/components/media/SmartImage";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { LARGE_UP } from "@/components/motion/midnight/tokens";
import { useMedia, useMotionOn } from "@/components/motion/midnight/useMotionOn";
import { Container } from "@/components/ui/Container";
import type { HomeData, Testimonial } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { EstateHeading } from "./EstateHeading";

/** Roughly how long one card takes to pass; sets every column's pace. */
const SECONDS_PER_CARD = 9;
/** A copy must outrun the window it scrolls through, or the loop shows a gap. */
const MIN_PER_COPY = 4;
/** The outer columns rise and the middle one falls, each at its own pace. */
const DRIFT = [
  { name: "me-drift-up", pace: 1 },
  { name: "me-drift-down", pace: 1.18 },
  { name: "me-drift-up", pace: 0.9 },
] as const;

/** Two columns from here: one card across a tablet runs to 80-character lines. */
const SMALL_UP = "(min-width: 640px)";

type Slot = { testimonial: Testimonial; repeat: boolean };

/**
 * Client quotes — "voices", on ivory: a wall of review cards in up to three
 * columns that drift past each other, fading out at the top and bottom edges.
 * Hover and keyboard focus hold the wall still, and it stops whenever it is off
 * screen.
 *
 * Fewer than three reviews, or reduced motion, and nothing drifts: every card
 * is shown once, in still columns.
 *
 * PARITY: the live site has a single placeholder review ("jack sparrow /
 * Actor"). The rest of the snapshot's reviews are PLACEHOLDERS added so the
 * wall can be seen in preview; the CMS must supply real ones before launch.
 */
export function Testimonials({ testimonials }: { testimonials: HomeData["testimonials"] }) {
  const items = testimonials.items;
  const on = useMotionOn();
  const large = useMedia(LARGE_UP, true);
  const small = useMedia(SMALL_UP, true);
  const wallRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wallRef, { margin: "200px 0px" });
  if (items.length === 0) return null;

  const drift = on && items.length > 2;
  const columns = columnsOf(items, Math.min(large ? 3 : small ? 2 : 1, items.length), drift);
  const lede = testimonials.text.trim();

  return (
    <section className="bg-me-ivory text-me-night section-y relative overflow-hidden">
      {/* A low lamp over the heading. Decoration only. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(45%_55%_at_50%_0%,rgb(201_169_110/0.2),transparent_75%)]"
      />

      <Container className="relative flex flex-col items-center gap-12 md:gap-16">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <EstateHeading
            tone="ivory"
            align="center"
            eyebrow={testimonials.eyebrow}
            title={testimonials.title}
          />
          {lede ? (
            <RevealGroup delay={0.35}>
              <RevealItem
                as="p"
                lang={autoLang(lede)}
                className="text-me-stone text-lead max-w-[40rem] text-center text-balance"
              >
                {lede}
              </RevealItem>
            </RevealGroup>
          ) : null}
        </div>

        <RevealGroup className="w-full" stagger={0.15}>
          <div
            ref={wallRef}
            data-paused={drift && !inView ? "" : undefined}
            className={cn(
              "me-wall mx-auto flex w-full gap-5 lg:gap-6",
              drift
                ? "h-[38rem] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)] md:h-[46rem]"
                : "max-w-5xl items-start justify-center",
            )}
          >
            {columns.map((slots, c) => {
              const lane = DRIFT[c] ?? DRIFT[0];
              return (
                <RevealItem key={c} className={cn("min-w-0 flex-1", !drift && "max-w-md")}>
                  {drift ? (
                    <div
                      className="me-drift"
                      style={
                        {
                          "--drift-name": lane.name,
                          "--drift-duration": `${slots.length * SECONDS_PER_CARD * lane.pace}s`,
                        } as CSSProperties
                      }
                    >
                      <Column slots={slots} />
                      <Column slots={slots} copy />
                    </div>
                  ) : (
                    <Column slots={slots} />
                  )}
                </RevealItem>
              );
            })}
          </div>
        </RevealGroup>
      </Container>
    </section>
  );
}

/**
 * Deals the reviews out across the columns. A drifting column repeats its own
 * cards until a copy is long enough to loop; the repeats are hidden from
 * assistive tech, so each review is read once.
 */
function columnsOf(items: Testimonial[], count: number, drift: boolean): Slot[][] {
  return Array.from({ length: count }, (_, c) => {
    const own = items.filter((_, i) => i % count === c);
    const slots: Slot[] = own.map((testimonial) => ({ testimonial, repeat: false }));
    while (drift && slots.length < MIN_PER_COPY) {
      slots.push(...own.map((testimonial) => ({ testimonial, repeat: true })));
    }
    return slots;
  });
}

/** One run of a column's cards. `copy` is the second, looping run. */
function Column({ slots, copy = false }: { slots: Slot[]; copy?: boolean }) {
  return (
    <ul
      aria-hidden={copy || undefined}
      inert={copy}
      className="flex flex-col gap-5 pb-5 lg:gap-6 lg:pb-6"
    >
      {slots.map((slot, i) => (
        <li key={i} aria-hidden={(!copy && slot.repeat) || undefined}>
          <Card testimonial={slot.testimonial} />
        </li>
      ))}
    </ul>
  );
}

function Card({ testimonial }: { testimonial: Testimonial }) {
  const dict = useDictionary();
  const { t } = useFormatter();
  // The CMS sometimes types the quotation marks into the quote itself.
  const quote = testimonial.quote.trim().replace(/^["“”]+|["“”]+$/g, "");
  return (
    <figure className="border-me-hairline-ink hover:border-me-champagne flex flex-col gap-6 rounded-[1.25rem] border bg-white/50 p-7 shadow-[0_24px_48px_-32px_rgb(14_26_21/0.35)] transition-[translate,border-color,background-color] duration-500 ease-(--me-ease) hover:-translate-y-1 hover:bg-white/75 md:p-8">
      {testimonial.rating > 0 ? (
        <div
          // role="img" so the label is permitted and the stars read as one graphic.
          role="img"
          aria-label={t(dict.carousel.stars, { rating: testimonial.rating })}
          className="text-me-bronze flex gap-1"
        >
          {Array.from({ length: testimonial.rating }).map((_, index) => (
            <Star key={index} aria-hidden className="size-4 fill-current" strokeWidth={0} />
          ))}
        </div>
      ) : null}

      <blockquote lang={autoLang(quote)} className="text-me-night/85 text-body">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <figcaption className="flex items-center gap-4">
        <Avatar testimonial={testimonial} />
        <span className="flex min-w-0 flex-col">
          <span
            lang={autoLang(testimonial.name)}
            className="text-me-night text-body leading-snug font-medium"
          >
            {testimonial.name}
          </span>
          <span lang={autoLang(testimonial.role)} className="text-me-stone text-small">
            {testimonial.role}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** The reviewer's photograph, or their initials on a forest disc. */
function Avatar({ testimonial }: { testimonial: Testimonial }) {
  if (testimonial.avatar?.src) {
    return (
      <SmartImage
        image={testimonial.avatar}
        sizes="48px"
        ratio="square"
        decorative
        frameClassName="size-12 shrink-0 rounded-full bg-me-parchment"
      />
    );
  }
  const initials = testimonial.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toLocaleUpperCase();
  return (
    <span
      aria-hidden
      className="from-me-forest to-me-night text-me-champagne-soft text-small grid size-12 shrink-0 place-items-center rounded-full bg-linear-to-br font-medium tracking-wide"
    >
      {initials}
    </span>
  );
}
