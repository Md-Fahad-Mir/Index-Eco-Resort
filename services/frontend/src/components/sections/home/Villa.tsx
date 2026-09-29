"use client";

import Link from "next/link";
import { useState } from "react";
import { Lightbox } from "@/components/media/Lightbox";
import { SmartImage } from "@/components/media/SmartImage";
import { Slider } from "@/components/media/Slider";
import { Heading } from "@/components/typography/Heading";
import { Paragraph } from "@/components/typography/Text";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref, isInternal } from "@/lib/links";

/**
 * The rooms, one tab each.
 *
 * PARITY, two CMS mistakes rendered as stored (docs/OWNER-REPORT.md §B): the
 * tab labelled "Cottage" contains a room called "Executive Suite", and both
 * descriptions name a different property, "Chuti Resort Gazipur".
 */
export function Villa({ villa }: { villa: HomeData["villa"] }) {
  const rooms = villa.rooms;
  if (rooms.length === 0) return null;

  return (
    <Section tone="mist">
      <Container className="flex flex-col gap-12">
        <SectionHeader eyebrow={villa.eyebrow} title={villa.title} />

        <Tabs defaultValue={rooms[0]!.tabLabel} variant="underline">
          <TabsList label="Room types">
            {rooms.map((room) => (
              <TabsTrigger key={room.tabLabel} value={room.tabLabel}>
                {room.tabLabel}
              </TabsTrigger>
            ))}
          </TabsList>

          {rooms.map((room) => (
            <TabsContent key={room.tabLabel} value={room.tabLabel}>
              <RoomPanel room={room} />
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </Section>
  );
}

function RoomPanel({ room }: { room: HomeData["villa"]["rooms"][number] }) {
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);
  const href = internalHref(room.cta.href) ?? "#";

  return (
    <div className="grid items-start gap-[clamp(2rem,4vw,3.5rem)] lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Slider
          label={`${room.name} photographs`}
          slides={room.images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setLightboxAt(index)}
              className="group rounded-media block w-full overflow-hidden"
            >
              <SmartImage
                image={image}
                sizes="(min-width: 1024px) 55vw, 92vw"
                ratio="room"
                zoomOnHover
              />
              <span className="sr-only">View photograph {index + 1} full size</span>
            </button>
          ))}
        />
        <Lightbox
          open={lightboxAt !== null}
          index={lightboxAt ?? 0}
          onClose={() => setLightboxAt(null)}
          slides={room.images.map((image) => ({
            src: image.src,
            alt: image.alt,
            title: room.name,
          }))}
        />
      </div>

      <div className="flex flex-col gap-6 lg:col-span-5">
        <Heading level={3} size="h3">
          {room.name}
        </Heading>
        <Paragraph className="text-ink-muted">{room.description}</Paragraph>

        {room.amenities.length > 0 ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {room.amenities.map((amenity, index) => (
              <div key={`${amenity.label}-${amenity.value}-${index}`} className="flex flex-col">
                <dt className="text-ink-muted text-label">{amenity.label}</dt>
                <dd lang={autoLang(amenity.value)} className="text-ink text-body font-medium">
                  {amenity.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {room.cta.label ? (
          <div className="pt-2">
            <Button asChild>
              {isInternal(href) ? (
                <Link href={href}>{room.cta.label}</Link>
              ) : (
                <a href={href}>{room.cta.label}</a>
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
