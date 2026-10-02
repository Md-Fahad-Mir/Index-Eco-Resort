"use client";

import { useRef } from "react";
import { SmartImage } from "@/components/media/SmartImage";
import { FrameDraw } from "@/components/motion/midnight/FrameDraw";
import { LightsOn } from "@/components/motion/midnight/LightsOn";
import { ScrollScale } from "@/components/motion/midnight/ScrollScale";
import { StickyStory } from "@/components/motion/midnight/StickyStory";
import { Container } from "@/components/ui/Container";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { EstateHeading } from "./EstateHeading";

type Feature = HomeData["whyBuy"]["features"][number];

/**
 * Why buy — "four reasons" (prompts/06b-home-redesign.md §5.8), on ivory.
 *
 * From 1024px the building stays in view, sticky in its champagne frame and
 * settling from 1.08 as the section passes, while the reasons scroll beside
 * it; the one at the viewport's centre is lit — night text, a bronze rule
 * grown beside it, a bronze mark. The others rest in stone rather than at a
 * low opacity, so every line keeps AA contrast. Below 1024px the image leads
 * and the reasons follow as a staggered list, all lit (StickyStory).
 *
 * PARITY: the fourth feature's title is truncated in the CMS — "Strategic
 * Investment Locatio" — and renders as stored (docs/OWNER-REPORT.md §B).
 */
export function WhyBuy({ whyBuy }: { whyBuy: HomeData["whyBuy"] }) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="bg-me-ivory text-me-night section-y relative">
      <Container>
        <StickyStory
          media={
            <div className="relative aspect-4/5 overflow-hidden sm:aspect-16/11 lg:aspect-auto lg:h-full">
              <LightsOn className="absolute inset-0">
                <ScrollScale target={sectionRef} className="size-full">
                  <SmartImage
                    image={whyBuy.image}
                    sizes="(min-width: 1024px) 46vw, 92vw"
                    ratio="auto"
                    frameClassName="absolute inset-0 bg-me-parchment"
                    className="size-full object-cover"
                  />
                </ScrollScale>
              </LightsOn>
              <FrameDraw delay={0.4} />
            </div>
          }
          header={
            <EstateHeading
              tone="ivory"
              eyebrow={whyBuy.eyebrow}
              title={whyBuy.title}
              className="lg:pt-[8vh] lg:pb-[4vh]"
            />
          }
          items={whyBuy.features.map((feature) => (
            <Reason key={feature.title} feature={feature} />
          ))}
          // On a tablet the reasons pair up; one column of short lines would
          // leave half the page empty. From 1024px they stack beside the image.
          columnClassName="md:[&>ol]:grid md:[&>ol]:grid-cols-2 md:[&>ol]:gap-x-10 lg:[&>ol]:flex"
        />
      </Container>
    </section>
  );
}

/**
 * One reason. Styled from StickyStory's `data-active` through the `/story`
 * group: lit, it is night on ivory with a bronze rule down its left edge.
 */
function Reason({ feature }: { feature: Feature }) {
  return (
    <div className="border-me-hairline-ink relative flex w-full gap-6 border-t py-9 lg:border-t-0 lg:py-6 lg:pl-10">
      {/* The track, and the rule that grows along it when this reason is lit. */}
      <span
        aria-hidden
        className="bg-me-hairline-ink absolute inset-y-0 left-0 hidden w-px lg:block"
      />
      <span
        aria-hidden
        className="bg-me-bronze absolute inset-y-0 left-0 hidden w-px origin-top scale-y-0 transition-[scale] duration-700 ease-(--me-ease) group-data-[active=true]/story:scale-y-100 lg:block"
      />

      <span
        aria-hidden
        className="text-me-stone group-data-[active=true]/story:text-me-bronze mt-2 grid size-10 shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_1px_currentColor] transition-colors duration-500"
      >
        {feature.icon?.src ? (
          <SmartImage
            image={feature.icon}
            sizes="20px"
            ratio="auto"
            decorative
            frameClassName="w-5 bg-transparent"
            className="h-5 w-auto object-contain"
          />
        ) : (
          <span className="block size-2 rotate-45 bg-current" />
        )}
      </span>

      <div className="flex flex-col gap-3">
        <h3
          lang={autoLang(feature.title)}
          className="text-h3 text-me-night/60 group-data-[active=true]/story:text-me-night transition-colors duration-500"
        >
          {feature.title}
        </h3>
        <p
          lang={autoLang(feature.text)}
          className="text-body text-me-stone group-data-[active=true]/story:text-me-night/75 max-w-[44ch] transition-colors duration-500"
        >
          {feature.text}
        </p>
      </div>
    </div>
  );
}
