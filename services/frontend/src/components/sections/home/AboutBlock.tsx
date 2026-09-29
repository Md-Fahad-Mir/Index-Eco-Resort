"use client";

import { Phone, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SmartImage } from "@/components/media/SmartImage";
import { VideoModal } from "@/components/media/VideoModal";
import { Heading } from "@/components/typography/Heading";
import { Paragraph } from "@/components/typography/Text";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import type { HomeData } from "@/lib/data";
import { anchorProps, internalHref, isInternal } from "@/lib/links";

/**
 * The about block, shared by Home and the About page.
 *
 * The collage is asymmetric — one tall image beside two stacked — so it reads
 * as an arrangement rather than a grid. The play button opens the CMS mp4 in a
 * dialog that can be closed with Escape and returns focus, which the live
 * site's inline modal cannot.
 */
export function AboutBlock({ about }: { about: HomeData["about"] }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [tall, ...stacked] = about.images;
  const ctaHref = internalHref(about.cta.href) ?? "#";

  return (
    <Section tone="mist">
      <Container className="grid items-center gap-[clamp(2.5rem,5vw,4.5rem)] lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <div className="grid grid-cols-5 gap-4">
            <div className="relative col-span-3">
              <SmartImage
                image={tall}
                sizes="(min-width: 1024px) 30vw, 55vw"
                ratio="portrait"
                frameClassName="rounded-media h-full"
              />
              {about.videoUrl ? (
                <button
                  type="button"
                  onClick={() => setVideoOpen(true)}
                  aria-label="Watch video"
                  className="bg-brass text-canopy rounded-pill shadow-lift absolute -right-7 bottom-10 grid size-22 place-items-center transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out-soft)] hover:scale-105"
                >
                  <Play
                    aria-hidden
                    className="size-7 translate-x-0.5 fill-current"
                    strokeWidth={1}
                  />
                </button>
              ) : null}
            </div>
            <div className="col-span-2 flex flex-col gap-4">
              {stacked.map((image, index) => (
                <SmartImage
                  key={image?.src ?? index}
                  image={image}
                  sizes="(min-width: 1024px) 20vw, 35vw"
                  ratio="card"
                  frameClassName="rounded-media flex-1"
                />
              ))}
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col gap-6 lg:col-span-6 lg:pl-8">
          <Eyebrow>{about.eyebrow}</Eyebrow>
          <Heading level={2}>{about.title}</Heading>
          <Paragraph className="text-ink-muted">{about.text}</Paragraph>

          <ul className="flex flex-col gap-6 pt-2">
            {about.features.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="border-brass-ink/40 text-brass-ink rounded-pill mt-1 grid size-10 shrink-0 place-items-center border"
                >
                  <span className="bg-brass-ink rounded-pill block size-1.5" />
                </span>
                <div className="flex flex-col gap-1">
                  <Heading level={3} size="h4">
                    {feature.title}
                  </Heading>
                  <p className="text-ink-muted text-small max-w-[52ch]">{feature.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <Button asChild>
              {isInternal(ctaHref) ? (
                <Link href={ctaHref}>{about.cta.label}</Link>
              ) : (
                <a href={ctaHref}>{about.cta.label}</a>
              )}
            </Button>

            {/* PARITY: the live "Call Us 24/7" number links to "#". */}
            <a
              href={about.phone.href ?? "#"}
              className="group/phone flex items-center gap-3"
              {...anchorProps(about.phone.href)}
            >
              <span className="border-hairline text-brass-ink rounded-pill group-hover/phone:bg-ink group-hover/phone:text-mist grid size-11 place-items-center border transition-colors">
                <Phone aria-hidden className="size-4" strokeWidth={1.5} />
              </span>
              <span className="flex flex-col">
                <span className="text-ink-muted text-label">{about.phone.label}</span>
                <span className="font-display text-ink tabular text-[1.25rem]">
                  {about.phone.value}
                </span>
              </span>
            </a>
          </div>
        </div>
      </Container>

      {about.videoUrl ? (
        <VideoModal
          open={videoOpen}
          onOpenChange={setVideoOpen}
          src={about.videoUrl}
          title={about.title}
        />
      ) : null}
    </Section>
  );
}
