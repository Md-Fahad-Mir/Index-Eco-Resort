import Link from "@/components/i18n/Link";
import { SmartImage } from "@/components/media/SmartImage";
import { Curtain } from "@/components/motion/midnight/Curtain";
import { FrameDraw } from "@/components/motion/midnight/FrameDraw";
import { LightsOn } from "@/components/motion/midnight/LightsOn";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { ScrollScale } from "@/components/motion/midnight/ScrollScale";
import { Paragraph } from "@/components/typography/Text";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { HomeData } from "@/lib/data";
import { internalHref, isInternal } from "@/lib/links";
import { EstateHeading } from "./EstateHeading";

/**
 * Dining — "dine after dark" (prompts/06b-home-redesign.md §5.10), on
 * night-deep. The photograph takes the right three-fifths and runs off the
 * viewport's edge; a night panel overlaps it from the left.
 *
 * The image arrives in three movements: a curtain opens from the right, the
 * lights come on as it finishes, and from 768px it keeps settling from 1.08
 * as the section is scrolled. The champagne frame is drawn after the curtain.
 * On phones the image leads at 4:3 and the panel rises over its lower edge.
 */
export function Restaurant({ restaurant }: { restaurant: HomeData["restaurant"] }) {
  const href = internalHref(restaurant.cta.href) ?? "#";

  return (
    <section className="on-dark bg-me-night-deep text-me-parchment me-grain section-y relative overflow-hidden">
      <Container className="grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
        {/* The image: from column 6 to the viewport's right edge. On phones it
            spans the viewport, edge to edge. */}
        <div className="relative -mx-(--container-pad) lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:mx-0 lg:-mr-[max(var(--container-pad),calc((100vw-var(--container-max))/2+var(--container-pad)))]">
          <Curtain from="right" className="aspect-4/3 overflow-hidden lg:aspect-5/4">
            <LightsOn trigger="parent" delay={0.55} className="absolute inset-0">
              <ScrollScale className="size-full">
                <SmartImage
                  image={restaurant.image}
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  ratio="auto"
                  frameClassName="absolute inset-0 bg-me-forest"
                  className="size-full object-cover [filter:var(--me-grade)]"
                />
              </ScrollScale>
            </LightsOn>
          </Curtain>
          <FrameDraw delay={1.1} />
        </div>

        {/* The panel: night on night-deep, a gold hairline along its top,
            overlapping the image by about a column. */}
        <div className="bg-me-night shadow-me-deep relative z-10 mx-3 -mt-8 flex flex-col gap-8 p-7 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-(--me-frame) md:mx-10 md:-mt-16 md:p-12 lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:mx-0 lg:mt-0 lg:p-14">
          <EstateHeading tone="night" eyebrow={restaurant.eyebrow} title={restaurant.title} />
          <RevealGroup delay={0.3} className="flex flex-col gap-9">
            <RevealItem>
              <Paragraph className="text-me-parchment">{restaurant.text}</Paragraph>
            </RevealItem>
            {restaurant.cta.label ? (
              <RevealItem>
                <Button asChild variant="home-primary">
                  {isInternal(href) ? (
                    <Link href={href}>{restaurant.cta.label}</Link>
                  ) : (
                    <a href={href}>{restaurant.cta.label}</a>
                  )}
                </Button>
              </RevealItem>
            ) : null}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
