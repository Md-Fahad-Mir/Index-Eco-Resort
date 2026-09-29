import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { SmartImage } from "@/components/media/SmartImage";
import { Heading } from "@/components/typography/Heading";
import { Paragraph } from "@/components/typography/Text";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { HomeData } from "@/lib/data";
import { internalHref, isInternal } from "@/lib/links";

/**
 * Dining: a canopy text panel with the photograph bleeding off the right edge,
 * so the section reads as a wide plate rather than a boxed card.
 */
export function Restaurant({ restaurant }: { restaurant: HomeData["restaurant"] }) {
  const href = internalHref(restaurant.cta.href) ?? "#";
  return (
    <section className="bg-canopy text-mist on-dark relative overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="flex items-center py-[var(--section-y)]">
          <Container className="flex max-w-[calc(var(--container-max)/2)] flex-col gap-6 lg:mr-0 lg:ml-auto lg:pr-[clamp(2rem,4vw,4rem)]">
            <Eyebrow tone="dark">{restaurant.eyebrow}</Eyebrow>
            <Heading level={2}>{restaurant.title}</Heading>
            <Paragraph className="text-lichen">{restaurant.text}</Paragraph>
            {restaurant.cta.label ? (
              <div className="pt-2">
                <Button asChild variant="on-dark">
                  {isInternal(href) ? (
                    <Link href={href}>{restaurant.cta.label}</Link>
                  ) : (
                    <a href={href}>{restaurant.cta.label}</a>
                  )}
                </Button>
              </div>
            ) : null}
          </Container>
        </div>

        <Reveal className="relative min-h-[320px] lg:min-h-full">
          <SmartImage
            image={restaurant.image}
            sizes="(min-width: 1024px) 50vw, 100vw"
            ratio="auto"
            frameClassName="absolute inset-0 h-full"
            className="size-full object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
