"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { useDictionary, useFormatter } from "@/components/i18n/LocaleProvider";
import { SmartImage } from "@/components/media/SmartImage";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { EASE, VIEWPORT } from "@/components/motion/midnight/tokens";
import { useMotionOn } from "@/components/motion/midnight/useMotionOn";
import { Container } from "@/components/ui/Container";
import type { HomeData, Testimonial } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { EstateHeading } from "./EstateHeading";
import { EstateIconButton } from "./EstateIconButton";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Client quotes — "voices" (prompts/06b-home-redesign.md §5.11), on ivory. One
 * quote at a time, set large in the display face under an oversized bronze
 * quotation mark; the stars fill in turn. With more than one quote they
 * crossfade, with arrows and a fraction; with exactly one, nothing moves —
 * the live site runs an autoplaying loop over a single item, which is motion
 * for nothing.
 *
 * PARITY: that single review is placeholder data ("jack sparrow / Actor", with
 * an avatar hotlinked from a theme demo). It renders as stored;
 * docs/OWNER-REPORT.md §B asks for a real review.
 */
export function Testimonials({ testimonials }: { testimonials: HomeData["testimonials"] }) {
  const items = testimonials.items;
  const [index, setIndex] = useState(0);
  const dict = useDictionary();
  const { t, digits } = useFormatter();
  if (items.length === 0) return null;
  const many = items.length > 1;
  const go = (next: number) => setIndex(((next % items.length) + items.length) % items.length);

  return (
    <section className="bg-me-ivory text-me-night section-y relative overflow-hidden">
      <Container className="flex flex-col items-center gap-14 md:gap-20">
        <EstateHeading
          tone="ivory"
          align="center"
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
        />

        <div className="relative grid w-full max-w-5xl">
          {/* The oversized mark, behind the quote. Decoration only. */}
          <span
            aria-hidden
            className="font-display text-me-bronze/15 pointer-events-none absolute -top-[0.3em] left-1/2 -translate-x-1/2 text-[clamp(9rem,6rem+10vw,15rem)] leading-none select-none"
          >
            &ldquo;
          </span>

          {items.map((item, i) => (
            <div
              key={i}
              inert={i !== index}
              className={cn(
                "col-start-1 row-start-1 transition-opacity duration-700 ease-(--me-ease-inout)",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              <Quote testimonial={item} />
            </div>
          ))}
        </div>

        {many ? (
          <div className="flex items-center gap-5">
            <EstateIconButton
              tone="ivory"
              label={dict.carousel.previousReview}
              onClick={() => go(index - 1)}
            >
              <ChevronLeft aria-hidden strokeWidth={1.25} />
            </EstateIconButton>
            <span aria-hidden className="text-label tabular text-me-stone">
              {digits(pad(index + 1))} / {digits(pad(items.length))}
            </span>
            <EstateIconButton
              tone="ivory"
              label={dict.carousel.nextReview}
              onClick={() => go(index + 1)}
            >
              <ChevronRight aria-hidden strokeWidth={1.25} />
            </EstateIconButton>
            <p aria-live="polite" className="sr-only">
              {t(dict.carousel.reviewStatus, { n: index + 1, total: items.length })}
            </p>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

function Quote({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="relative flex flex-col items-center gap-10 pt-16 text-center md:gap-12 md:pt-24">
      {testimonial.rating > 0 ? <Stars rating={testimonial.rating} /> : null}

      <RevealGroup className="flex flex-col items-center gap-10 md:gap-12">
        <RevealItem>
          <blockquote
            lang={autoLang(testimonial.quote)}
            className="font-display text-me-night max-w-[30ch] text-[clamp(1.625rem,1.1rem+1.9vw,2.75rem)] leading-[1.25] text-balance"
          >
            {testimonial.quote}
          </blockquote>
        </RevealItem>

        <RevealItem>
          <figcaption className="flex items-center gap-4">
            {testimonial.avatar ? (
              <SmartImage
                image={testimonial.avatar}
                sizes="56px"
                ratio="square"
                decorative
                frameClassName="size-14 rounded-full bg-me-parchment ring-1 ring-me-bronze ring-offset-3 ring-offset-me-ivory"
              />
            ) : null}
            <span className="flex flex-col text-left">
              <span
                lang={autoLang(testimonial.name)}
                className="text-me-night text-body font-medium"
              >
                {testimonial.name}
              </span>
              <span lang={autoLang(testimonial.role)} className="text-me-stone text-small">
                {testimonial.role}
              </span>
            </span>
          </figcaption>
        </RevealItem>
      </RevealGroup>
    </figure>
  );
}

/** The rating: bronze stars that fill one after another, 70ms apart. */
function Stars({ rating }: { rating: number }) {
  const on = useMotionOn();
  const dict = useDictionary();
  const { t } = useFormatter();
  return (
    <m.div
      // role="img" so the label is permitted and the stars read as one graphic.
      role="img"
      aria-label={t(dict.carousel.stars, { rating })}
      className="flex gap-1.5"
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: on ? 0.07 : 0 } } }}
    >
      {Array.from({ length: rating }).map((_, index) => (
        <m.span
          key={index}
          data-me-reveal
          className="text-me-bronze block"
          variants={{
            hidden: { opacity: 0, scale: 0.6 },
            shown: {
              opacity: 1,
              scale: 1,
              transition: on ? { duration: 0.6, ease: EASE } : { duration: 0 },
            },
          }}
        >
          <Star aria-hidden className="size-4 fill-current" strokeWidth={0} />
        </m.span>
      ))}
    </m.div>
  );
}
