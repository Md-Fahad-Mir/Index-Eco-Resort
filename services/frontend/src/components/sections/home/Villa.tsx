"use client";

import { m } from "motion/react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { useState } from "react";
import Link from "@/components/i18n/Link";
import { useDictionary, useFormatter } from "@/components/i18n/LocaleProvider";
import { Lightbox } from "@/components/media/Lightbox";
import { SmartImage } from "@/components/media/SmartImage";
import { LineReveal } from "@/components/motion/midnight/LineReveal";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { EASE } from "@/components/motion/midnight/tokens";
import { useMotionOn } from "@/components/motion/midnight/useMotionOn";
import { useSlidingIndicator } from "@/components/motion/midnight/useSlidingIndicator";
import { Paragraph } from "@/components/typography/Text";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref, isInternal } from "@/lib/links";
import { EstateHeading } from "./EstateHeading";
import { FadeSlider } from "./FadeSlider";

type Room = HomeData["villa"]["rooms"][number];

/**
 * Tab values become element ids and `aria-controls` IDREFs, which may not
 * contain spaces; CMS labels do ("Family Cottage").
 */
const toValue = (label: string) => label.trim().replace(/\s+/g, "-");

/**
 * The rooms — "the rooms" (prompts/06b-home-redesign.md §5.9), on night. One
 * tab per room, set as large display words with a champagne rule that slides
 * beneath the chosen one. Each room is a crossfading photograph with
 * thumbnails and a forest card that overlaps the image's right edge on large
 * screens — name, description, amenities, Book Now. The photographs turn on
 * their own and hold while the lightbox is open. Switching rooms fades the
 * new photographs up and raises the card's name line by line.
 *
 * Radix Tabs directly rather than the shared `Tabs`: the About page's
 * vision/mission tabs keep their own look.
 *
 * PARITY, two CMS mistakes rendered as stored (docs/OWNER-REPORT.md §B): the
 * tab labelled "Cottage" contains a room called "Executive Suite", and both
 * descriptions name a different property, "Chuti Resort Gazipur".
 */
export function Villa({ villa }: { villa: HomeData["villa"] }) {
  const rooms = villa.rooms;
  const dict = useDictionary();
  const [tab, setTab] = useState(() => toValue(rooms[0]?.tabLabel ?? ""));
  // The photograph fade belongs to a switch; the first room enters with the page.
  const [switched, setSwitched] = useState(false);
  const { container: list, indicator: rule } = useSlidingIndicator<HTMLDivElement, HTMLSpanElement>(
    tab,
  );

  if (rooms.length === 0) return null;

  return (
    <section className="on-dark bg-me-night text-me-parchment me-grain section-y relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 -scale-x-100 bg-(image:--me-lamp)"
      />
      <Container>
        <TabsPrimitive.Root
          value={tab}
          onValueChange={(value) => {
            setTab(value);
            setSwitched(true);
          }}
          className="flex flex-col gap-12 md:gap-16"
        >
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-8">
            <EstateHeading
              tone="night"
              eyebrow={villa.eyebrow}
              title={villa.title}
              className="lg:col-span-7"
            />

            {/* CMS labels are long and bilingual, so the strip scrolls rather
                than pushing the page sideways at 320px. */}
            <div className="-mx-(--container-pad) [scrollbar-width:none] overflow-x-auto px-(--container-pad) lg:col-span-5 lg:mx-0 lg:justify-self-end lg:px-0 [&::-webkit-scrollbar]:hidden">
              <TabsPrimitive.List
                ref={list}
                aria-label={dict.carousel.roomTypes}
                className="border-me-hairline-gold relative flex w-max min-w-full gap-9 border-b lg:min-w-0"
              >
                <span
                  ref={rule}
                  aria-hidden
                  className="after:bg-me-champagne pointer-events-none absolute top-0 left-0 opacity-0 after:absolute after:inset-x-0 after:-bottom-px after:h-px in-data-[indicator=ready]:transition-[transform,width] in-data-[indicator=ready]:duration-600 in-data-[indicator=ready]:ease-(--me-ease)"
                />
                {rooms.map((room) => {
                  const value = toValue(room.tabLabel);
                  return (
                    <TabsPrimitive.Trigger
                      key={value}
                      value={value}
                      data-active={value === tab}
                      lang={autoLang(room.tabLabel)}
                      className="font-display text-me-parchment/70 hover:text-me-ivory data-[state=active]:text-me-ivory relative cursor-pointer pb-4 text-[1.75rem] leading-tight whitespace-nowrap transition-colors duration-500 md:text-[2rem]"
                    >
                      {room.tabLabel}
                    </TabsPrimitive.Trigger>
                  );
                })}
              </TabsPrimitive.List>
            </div>
          </div>

          {rooms.map((room) => (
            <TabsPrimitive.Content
              key={toValue(room.tabLabel)}
              value={toValue(room.tabLabel)}
              className="outline-none"
            >
              <RoomPanel room={room} switched={switched} />
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
      </Container>
    </section>
  );
}

function RoomPanel({ room, switched }: { room: Room; switched: boolean }) {
  const on = useMotionOn();
  const dict = useDictionary();
  const { t } = useFormatter();
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);
  const href = internalHref(room.cta.href) ?? "#";

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
      <m.div
        // Explicit lines on both: the card overlaps column 8 on purpose, and an
        // auto-placed slider would be pushed into implicit columns instead.
        className="lg:col-start-1 lg:col-end-9 lg:row-start-1"
        initial={switched && on ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <FadeSlider
          label={t(dict.carousel.roomPhotos, { name: room.name })}
          frameClassName="aspect-4/3"
          autoplay
          navigation={false}
          // The lightbox covers the page; the room waits beneath it.
          paused={lightboxAt !== null}
          slides={room.images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setLightboxAt(index)}
              className="group/photo absolute inset-0 block overflow-hidden"
            >
              <SmartImage
                image={image}
                sizes="(min-width: 1024px) 62vw, 92vw"
                ratio="auto"
                frameClassName="absolute inset-0 bg-me-forest"
                className="ease-me size-full object-cover [filter:var(--me-grade)] transition-[scale,filter] duration-1000 group-hover/photo:scale-103 group-hover/photo:[filter:none]"
              />
              <span className="sr-only">View photograph {index + 1} full size</span>
            </button>
          ))}
          thumbs={room.images.map((image, index) => (
            <SmartImage
              key={`${image.src}-${index}`}
              image={image}
              sizes="80px"
              ratio="card"
              decorative
              frameClassName="bg-me-forest"
            />
          ))}
        />
        <Lightbox
          tone="midnight"
          open={lightboxAt !== null}
          index={lightboxAt ?? 0}
          onClose={() => setLightboxAt(null)}
          slides={room.images.map((image) => ({
            src: image.src,
            alt: image.alt,
            title: room.name,
          }))}
        />
      </m.div>

      {/* The card: a forest panel with a gold hairline along its top, over
          the image's right edge from 1024px. Below `xl` it takes one more
          column and a little less padding, or the room's name and amenities
          break word by word. */}
      <div className="bg-me-forest shadow-me-deep relative z-10 flex flex-col gap-8 p-7 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-(--me-frame) md:p-12 lg:col-start-7 lg:col-end-13 lg:row-start-1 lg:mt-20 lg:self-start lg:p-10 xl:col-start-8 xl:p-12">
        <LineReveal
          as="h3"
          text={room.name}
          lang={autoLang(room.name)}
          className="text-h2 text-me-ivory"
        />

        <RevealGroup delay={0.2} className="flex flex-col gap-8">
          <RevealItem>
            <Paragraph className="text-me-parchment">{room.description}</Paragraph>
          </RevealItem>

          {room.amenities.length > 0 ? (
            <RevealItem>
              <dl className="border-me-hairline-gold grid grid-cols-1 gap-x-8 gap-y-5 border-t pt-8 sm:grid-cols-2">
                {room.amenities.map((amenity, index) => (
                  <div
                    key={`${amenity.label}-${amenity.value}-${index}`}
                    className="flex flex-col gap-1"
                  >
                    <dt className="text-label text-me-champagne">{amenity.label}</dt>
                    <dd
                      lang={autoLang(amenity.value)}
                      className="text-body text-me-ivory flex items-center gap-3"
                    >
                      <span
                        aria-hidden
                        className="bg-me-champagne/70 block size-1.5 shrink-0 rotate-45"
                      />
                      {amenity.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </RevealItem>
          ) : null}

          {room.cta.label ? (
            <RevealItem>
              <Button asChild variant="home-primary">
                {isInternal(href) ? (
                  <Link href={href}>{room.cta.label}</Link>
                ) : (
                  <a href={href}>{room.cta.label}</a>
                )}
              </Button>
            </RevealItem>
          ) : null}
        </RevealGroup>
      </div>
    </div>
  );
}
