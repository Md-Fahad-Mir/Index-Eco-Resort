"use client";

import { m } from "motion/react";
import { Phone, Play } from "lucide-react";
import { useRef, useState } from "react";
import Link from "@/components/i18n/Link";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { SmartImage } from "@/components/media/SmartImage";
import { VideoModal } from "@/components/media/VideoModal";
import { FrameDraw } from "@/components/motion/midnight/FrameDraw";
import { LightsOn } from "@/components/motion/midnight/LightsOn";
import { ScrollDrift } from "@/components/motion/midnight/ScrollDrift";
import { ScrollScale } from "@/components/motion/midnight/ScrollScale";
import { StickyStory } from "@/components/motion/midnight/StickyStory";
import { DUR, EASE_INOUT, VIEWPORT } from "@/components/motion/midnight/tokens";
import { useMotionOn } from "@/components/motion/midnight/useMotionOn";
import { Paragraph } from "@/components/typography/Text";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { anchorProps, internalHref, isInternal } from "@/lib/links";
import { EstateHeading } from "./EstateHeading";

/**
 * Home's about block — "the reading room" (prompts/06b-home-redesign.md §5.3).
 * A Home-only wrapper: the About page keeps `AboutBlock` exactly as it is.
 *
 * Ivory, because this is where the page asks to be read. The collage is the
 * frame motif at its most literal: a tall photograph in a champagne frame on
 * a night mat, two smaller ones beside it lit in turn and drifting against
 * it. The play button opens the CMS mp4 in the Midnight dialog.
 *
 * From 1024px it scrolls like Why Buy (StickyStory): the collage stays in
 * view, the tall photograph settling from 1.08 as the section passes, while
 * the text scrolls beside it. The text keeps its own look — nothing is dimmed
 * or ruled; the body, the features and the actions are only given Why Buy's
 * 40vh each so there is something to scroll past. Below 1024px the collage
 * leads and the text follows as before.
 */
export function AboutEstate({ about }: { about: HomeData["about"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [tall, ...stacked] = about.images;
  const ctaHref = internalHref(about.cta.href) ?? "#";

  return (
    // overflow-x-clip: the mat is offset past the container's edge, which on
    // narrow tablets is past the viewport's. Clip, not hidden, keeps sticky.
    <section
      ref={sectionRef}
      className="bg-me-ivory text-me-night relative overflow-x-clip pt-[calc(var(--section-y)*0.8)] pb-(--section-y)"
    >
      <Container>
        <StickyStory
          as="div"
          className="gap-16"
          mediaClassName="lg:col-span-7"
          stickyClassName="lg:flex lg:flex-col lg:justify-center-safe"
          columnClassName="gap-9 lg:pl-4"
          media={
            // Phones: the tall photograph, then two side by side. From 768px
            // the desktop arrangement: tall beside a stacked, lowered pair.
            // From 1024px the collage is pinned in an 80vh box, and it stands
            // about 0.875 × its width plus the mat's 40px: on a short laptop
            // screen its width is capped so the whole collage stays in view.
            <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4 lg:max-w-[calc((80vh-2rem)/0.875)]">
              {/* z-10: the play disc crosses the gap, over the drifting column
                  beside it (whose transform makes its own stacking context).
                  self-start: the frame and mat hug the photograph, not the row. */}
              <div className="relative isolate z-10 col-span-2 md:col-span-7 md:self-start">
                {/* The night mat, offset down and left: a dark mount on linen. */}
                <span
                  aria-hidden
                  className="bg-me-night absolute inset-0 -z-10 translate-x-[-1.25rem] translate-y-5 md:translate-x-[-2.5rem] md:translate-y-10"
                />
                <LightsOn className="aspect-4/5 md:aspect-2/3">
                  <ScrollScale target={sectionRef} className="size-full">
                    <SmartImage
                      image={tall}
                      sizes="(min-width: 1024px) 34vw, (min-width: 768px) 54vw, 92vw"
                      ratio="auto"
                      frameClassName="absolute inset-0 bg-me-forest"
                      className="size-full object-cover"
                    />
                  </ScrollScale>
                </LightsOn>
                <FrameDraw delay={0.5} />

                {about.videoUrl ? <PlayButton onClick={() => setVideoOpen(true)} /> : null}
              </div>

              {/* Tracks the section, so the pair keeps drifting while the
                  collage is stuck. */}
              <ScrollDrift
                distance={-24}
                target={sectionRef}
                className="col-span-2 grid grid-cols-2 gap-3 md:col-span-5 md:flex md:flex-col md:gap-4 md:pt-16"
              >
                {stacked.map((image, index) => (
                  <LightsOn
                    key={image?.src ?? index}
                    delay={0.15 * (index + 1)}
                    className="aspect-4/3 md:aspect-square"
                  >
                    <SmartImage
                      image={image}
                      sizes="(min-width: 1024px) 24vw, (min-width: 768px) 38vw, 46vw"
                      ratio="auto"
                      frameClassName="absolute inset-0 bg-me-forest"
                      className="size-full object-cover"
                    />
                  </LightsOn>
                ))}
              </ScrollDrift>
            </div>
          }
          header={<EstateHeading tone="ivory" eyebrow={about.eyebrow} title={about.title} />}
          // The text: body → features → actions. Below 1024px, 40px between
          // them as before; from 1024px each is centred in its 40vh.
          items={[
            ...(about.text?.trim()
              ? [
                  <div key="text" className="w-full pb-10 lg:pb-0">
                    <Paragraph className="text-me-night/75">{about.text}</Paragraph>
                  </div>,
                ]
              : []),
            ...(about.features.length > 0
              ? [
                  <div key="features" className="w-full pb-10 lg:pb-0">
                    <ul className="border-me-hairline-ink flex flex-col gap-7 border-t pt-9">
                      {about.features.map((feature, index) => (
                        <li key={feature.title} className="flex gap-5">
                          <DrawnMark delay={0.2 + index * 0.15} />
                          <div className="flex flex-col gap-2">
                            <h3 lang={autoLang(feature.title)} className="text-h4 text-me-night">
                              {feature.title}
                            </h3>
                            <p
                              lang={autoLang(feature.text)}
                              className="text-small text-me-night/75 max-w-[50ch]"
                            >
                              {feature.text}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>,
                ]
              : []),
            <div key="actions" className="flex w-full flex-wrap items-center gap-x-9 gap-y-6">
              {about.cta.label ? (
                <Button asChild variant="home-ink">
                  {isInternal(ctaHref) ? (
                    <Link href={ctaHref}>{about.cta.label}</Link>
                  ) : (
                    <a href={ctaHref}>{about.cta.label}</a>
                  )}
                </Button>
              ) : null}

              {/* PARITY: the live "Call Us 24/7" number links to "#". */}
              <a
                href={about.phone.href ?? "#"}
                className="group/phone flex items-center gap-4"
                {...anchorProps(about.phone.href)}
              >
                <span className="text-me-bronze group-hover/phone:bg-me-night group-hover/phone:text-me-ivory grid size-12 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--color-me-bronze)] transition-colors duration-[var(--dur-ui)]">
                  <Phone aria-hidden className="size-[18px]" strokeWidth={1.25} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-me-stone text-label">{about.phone.label}</span>
                  <span className="font-display text-me-night tabular text-[1.75rem] leading-none">
                    {about.phone.value}
                  </span>
                </span>
              </a>
            </div>,
          ]}
        />
      </Container>

      {about.videoUrl ? (
        <VideoModal
          variant="home"
          open={videoOpen}
          onOpenChange={setVideoOpen}
          src={about.videoUrl}
          title={about.title}
        />
      ) : null}
    </section>
  );
}

/**
 * The 96px night disc with a champagne triangle (§5.3), at the tall image's
 * edge. Hover sends one gold ring out from it — once, not a loop.
 */
function PlayButton({ onClick }: { onClick: () => void }) {
  const dict = useDictionary();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dict.media.watchVideo}
      className="group/play bg-me-night text-me-champagne absolute right-5 bottom-5 z-10 grid size-18 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--me-frame),var(--shadow-me-deep)] transition-[scale] duration-500 ease-(--me-ease) hover:scale-105 md:right-0 md:bottom-16 md:size-24 md:translate-x-1/2"
    >
      <span
        aria-hidden
        className="border-me-champagne pointer-events-none absolute inset-0 rounded-full border opacity-0 group-hover/play:animate-[me-ring_1.1s_var(--me-ease)_1] group-focus-visible/play:animate-[me-ring_1.1s_var(--me-ease)_1]"
      />
      <Play aria-hidden className="size-6 translate-x-0.5 fill-current md:size-7" strokeWidth={1} />
    </button>
  );
}

/**
 * A feature's mark: a bronze ring drawn once around a small diamond. The ring
 * is an SVG stroke; without motion it is simply there.
 */
function DrawnMark({ delay }: { delay: number }) {
  const on = useMotionOn();
  return (
    <span aria-hidden className="relative mt-1 grid size-11 shrink-0 place-items-center">
      <svg viewBox="0 0 44 44" className="text-me-bronze absolute inset-0 size-full -rotate-90">
        <m.circle
          data-me-draw
          cx="22"
          cy="22"
          r="21.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={VIEWPORT}
          transition={on ? { duration: DUR.frame, ease: EASE_INOUT, delay } : { duration: 0 }}
        />
      </svg>
      <span className="bg-me-bronze block size-1.5 rotate-45" />
    </span>
  );
}
