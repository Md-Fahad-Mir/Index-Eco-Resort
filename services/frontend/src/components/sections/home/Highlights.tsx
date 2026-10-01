"use client";

import { SmartImage } from "@/components/media/SmartImage";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { Heading } from "@/components/typography/Heading";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref } from "@/lib/links";

/**
 * The three highlights as one forest panel under the hero
 * (prompts/06b-home-redesign.md §5.2): a deep shadow, a gold hairline along
 * the top and gold hairlines between columns. The hero keeps the whole first
 * screen, so the panel starts where the photograph ends and its rows enter
 * on scroll.
 */
export function Highlights({ highlights }: { highlights: HomeData["highlights"] }) {
  if (highlights.length === 0) return null;

  return (
    // Phones: the panel floats on night. From `lg` it sits on About's ivory,
    // a little below the hero's foot.
    <div className="bg-me-night lg:bg-me-ivory relative z-20 pb-16 md:pb-20 lg:pt-20 lg:pb-0">
      <Container className="relative">
        <RevealGroup
          as="ul"
          className="bg-me-forest shadow-me-deep lg:shadow-me-float divide-me-hairline-gold relative grid divide-y before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-(--me-frame) lg:grid-cols-3 lg:divide-x lg:divide-y-0"
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
                className="group/hl group/link hover:bg-me-moss short:gap-3 short:p-6 flex flex-col gap-5 p-8 transition-colors duration-[var(--dur-ui)] md:grid md:grid-cols-[3.5rem_1fr] md:gap-x-8 md:gap-y-4 md:p-10 lg:flex lg:gap-4 lg:p-8"
              >
                {item.icon ? (
                  // A thin champagne ring around an ivory medallion: the CMS
                  // icons are dark line art and a blue pin, drawn for a light
                  // page, and must stay legible exactly as uploaded.
                  <span className="border-me-champagne/40 group-hover/hl:border-me-champagne/60 short:size-12 grid size-14 place-items-center rounded-full border transition-[border-color,box-shadow] duration-[var(--dur-ui)] group-hover/hl:shadow-[0_0_24px_var(--me-frame)] md:row-span-3 lg:row-span-1">
                    <span className="bg-me-ivory short:size-9 grid size-11 place-items-center rounded-full">
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
