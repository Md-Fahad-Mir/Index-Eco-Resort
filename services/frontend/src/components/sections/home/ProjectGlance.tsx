"use client";

import { m } from "motion/react";
import { useRef } from "react";
import { SmartImage } from "@/components/media/SmartImage";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { ScrollDrift } from "@/components/motion/midnight/ScrollDrift";
import { ScrollScale } from "@/components/motion/midnight/ScrollScale";
import { DUR, EASE } from "@/components/motion/midnight/tokens";
import { useMotionOn, useRevealScale } from "@/components/motion/midnight/useMotionOn";
import { Container } from "@/components/ui/Container";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { EstateHeading } from "./EstateHeading";
import { FadeSlider } from "./FadeSlider";

/** The first facts are the project's name, place and size: set in the display face. */
const FEATURED = 3;

type Fact = HomeData["glance"]["facts"][number];

/**
 * Project at a glance — "the engraved ledger" (prompts/06b-home-redesign.md
 * §5.4). The facts are specifications, so they stay a `<dl>` of hairline rows
 * rather than cards; the first three are set large in the display face. As the
 * ledger arrives its hairlines are drawn left to right in turn and each value
 * surfaces with its line, as if engraved.
 *
 * Beside it, the promotional slides crossfade in a 4:5 frame with an offset
 * champagne outline that drifts against the image. From 1024px the slider
 * stays in view while the ledger scrolls past it, its photographs settling
 * from 1.08 as the section passes, as in Why Buy.
 *
 * PARITY: slide 2 of the live slider is a test entry captioned "3454 /
 * 45645645". It renders as stored; docs/OWNER-REPORT.md §B asks for it to be
 * deleted in the admin panel. The promotional images are not graded: some are
 * posters (§2.4).
 */
export function ProjectGlance({ glance }: { glance: HomeData["glance"] }) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    // overflow-clip, not hidden: hidden would make the section the slider's
    // scroll container, and it would never stick.
    <section
      ref={sectionRef}
      className="on-dark bg-me-night text-me-parchment me-grain section-y relative overflow-clip"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-(image:--me-lamp)"
      />
      <Container className="grid gap-16 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
        <div className="flex flex-col gap-12 md:gap-14 lg:col-span-7">
          <EstateHeading tone="night" eyebrow={glance.eyebrow} title={glance.title} />

          {glance.facts.length > 0 ? (
            <RevealGroup as="dl" stagger={0.06} delay={0.2} className="flex flex-col">
              {glance.facts.map((fact, index) => (
                <LedgerRow
                  key={`${fact.label}-${index}`}
                  fact={fact}
                  featured={index < FEATURED}
                  last={index === glance.facts.length - 1}
                />
              ))}
            </RevealGroup>
          ) : null}
        </div>

        {/* Tablets: a narrower frame set to the right, under the ledger. */}
        {glance.slides.length > 0 ? (
          <div className="md:ml-auto md:w-full md:max-w-md lg:col-span-5 lg:col-start-8 lg:ml-0 lg:max-w-none lg:pt-4 xl:col-span-4 xl:col-start-9">
            <FadeSlider
              label="Project facilities"
              frameClassName="aspect-4/5"
              className="lg:sticky lg:top-24"
              backdrop={
                // The offset outline: 16px down and right, drifting against the
                // image — with the section, so it keeps drifting while stuck.
                <ScrollDrift
                  distance={16}
                  target={sectionRef}
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4"
                >
                  <span
                    aria-hidden
                    className="block size-full shadow-[inset_0_0_0_1px_var(--me-frame)]"
                  />
                </ScrollDrift>
              }
              slides={glance.slides.map((slide, index) => (
                <figure key={`${slide.image.src}-${index}`} className="absolute inset-0">
                  <ScrollScale target={sectionRef} className="absolute inset-0">
                    <SmartImage
                      image={slide.image}
                      sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 38vw, 92vw"
                      ratio="auto"
                      frameClassName="absolute inset-0 bg-me-forest"
                      className="size-full object-cover"
                    />
                  </ScrollScale>
                  {slide.label || slide.caption ? (
                    <figcaption className="from-me-night-deep/95 via-me-night-deep/60 absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-linear-to-t to-transparent px-6 pt-20 pb-6 md:px-8 md:pb-8">
                      {slide.label ? (
                        <span
                          lang={autoLang(slide.label)}
                          className="font-display text-me-champagne text-[1.5rem] leading-tight"
                        >
                          {slide.label}
                        </span>
                      ) : null}
                      {slide.caption ? (
                        <span lang={autoLang(slide.caption)} className="text-me-ivory text-small">
                          {slide.caption}
                        </span>
                      ) : null}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            />
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/**
 * One line of the ledger. The hairline above it is drawn left to right and
 * the text surfaces with it — opacity only, nothing travels. Hover warms the
 * label to champagne and brightens the line.
 */
function LedgerRow({ fact, featured, last }: { fact: Fact; featured: boolean; last: boolean }) {
  const on = useMotionOn();
  const { time } = useRevealScale();
  const timing = on ? { duration: DUR.reveal * time, ease: EASE } : { duration: 0 };
  const rule = {
    hidden: { scaleX: 0 },
    shown: { scaleX: 1, transition: timing },
  };

  return (
    <m.div
      className={cn(
        "group/row relative grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-[minmax(8rem,30%)_1fr] sm:items-baseline",
        featured ? "py-6" : "py-4.5",
      )}
      variants={{ hidden: {}, shown: {} }}
    >
      <m.span
        aria-hidden
        data-me-reveal
        variants={rule}
        className="bg-me-hairline-gold group-hover/row:bg-me-champagne/50 absolute inset-x-0 top-0 h-px origin-left transition-colors duration-[var(--dur-ui)]"
      />
      <m.dt
        data-me-reveal
        variants={{ hidden: { opacity: 0 }, shown: { opacity: 1, transition: timing } }}
        className="text-small text-me-sage group-hover/row:text-me-champagne transition-colors duration-[var(--dur-ui)]"
      >
        {fact.label}
      </m.dt>
      <m.dd
        data-me-reveal
        lang={autoLang(fact.value)}
        variants={{
          hidden: { opacity: 0 },
          shown: { opacity: 1, transition: on ? { ...timing, delay: 0.12 } : timing },
        }}
        className={
          featured
            ? "font-display text-me-ivory text-[1.75rem] leading-tight"
            : "text-body text-me-parchment"
        }
      >
        {fact.value}
      </m.dd>
      {last ? (
        <m.span
          aria-hidden
          data-me-reveal
          variants={rule}
          className="bg-me-hairline-gold absolute inset-x-0 bottom-0 h-px origin-left"
        />
      ) : null}
    </m.div>
  );
}
