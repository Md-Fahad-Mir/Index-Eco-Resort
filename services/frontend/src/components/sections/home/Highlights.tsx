"use client";

import { SmartImage } from "@/components/media/SmartImage";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { LARGE_UP } from "@/components/motion/midnight/tokens";
import { useMedia } from "@/components/motion/midnight/useMotionOn";
import { Heading } from "@/components/typography/Heading";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref } from "@/lib/links";

/**
 * The three highlights as one forest panel lifting off the hero
 * (prompts/06b-home-redesign.md §5.2): 80px over it from `lg` up, a deep
 * shadow, a gold hairline along the top and gold hairlines between columns.
 *
 * On large screens it is the last beat of the hero's entrance, rising at
 * 1.4s; below `lg` it sits under the hero and its rows enter on scroll.
 */
export function Highlights({ highlights }: { highlights: HomeData["highlights"] }) {
  const large = useMedia(LARGE_UP);
  if (highlights.length === 0) return null;

  return (
    // Phones: the panel floats on night. From `lg` it straddles the edge
    // between the hero's night and About's ivory — its middle on the seam —
    // so the two rooms are joined by one object rather than a hard line.
    <div className="bg-me-night lg:bg-me-ivory relative z-20 pb-16 md:pb-20 lg:pb-0">
      {/* The panel is lifted 80px into the hero, so its middle sits 40px
          above this box's. */}
      <span
        aria-hidden
        className="bg-me-night absolute inset-x-0 top-0 hidden h-[calc(50%-2.5rem)] lg:block"
      />
      <Container className="relative">
        <RevealGroup
          as="ul"
          delay={large ? 1.4 : 0}
          className="bg-me-forest shadow-me-deep lg:shadow-me-float divide-me-hairline-gold relative grid divide-y before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-(--me-frame) lg:-mt-20 lg:grid-cols-3 lg:divide-x lg:divide-y-0"
        >
          {highlights.map((item) => {
            const href = internalHref(item.cta.href) ?? "#";
            return (
              <RevealItem
                key={item.title}
                as="li"
                // `group/link` here too, so hovering anywhere in the column
                // draws the link's underline (TextLink draws on group-hover/link).
                // Tablets: the ring beside the text, a row per highlight.
                className="group/hl group/link hover:bg-me-moss flex flex-col gap-5 p-8 transition-colors duration-[var(--dur-ui)] md:grid md:grid-cols-[3.5rem_1fr] md:gap-x-8 md:gap-y-4 md:p-10 lg:flex"
              >
                {item.icon ? (
                  // A thin champagne ring around an ivory medallion: the CMS
                  // icons are dark line art and a blue pin, drawn for a light
                  // page, and must stay legible exactly as uploaded.
                  <span className="border-me-champagne/40 group-hover/hl:border-me-champagne/60 grid size-14 place-items-center rounded-full border transition-[border-color,box-shadow] duration-[var(--dur-ui)] group-hover/hl:shadow-[0_0_24px_var(--me-frame)] md:row-span-3 lg:row-span-1">
                    <span className="bg-me-ivory grid size-11 place-items-center rounded-full">
                      <SmartImage
                        image={item.icon}
                        sizes="24px"
                        ratio="auto"
                        decorative
                        frameClassName="w-6 bg-transparent"
                        className="h-6 w-auto object-contain"
                      />
                    </span>
                  </span>
                ) : null}
                <Heading level={3} size="h4" className="text-me-ivory max-w-[20ch]">
                  {item.title}
                </Heading>
                <p
                  lang={autoLang(item.subtitle)}
                  className="text-me-parchment text-small max-w-[34ch] flex-1"
                >
                  {item.subtitle}
                </p>
                {item.cta.label ? (
                  <TextLink href={href} withArrow className="text-me-champagne">
                    {item.cta.label}
                  </TextLink>
                ) : null}
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </div>
  );
}
