import { SmartImage } from "@/components/media/SmartImage";
import { Heading } from "@/components/typography/Heading";
import { TextLink } from "@/components/ui/TextLink";
import { Container } from "@/components/ui/Container";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref } from "@/lib/links";

/**
 * Three highlights on a single paper panel, divided by hairlines rather than
 * three separate cards — one object lifting off the hero instead of three.
 * It overlaps the hero on large screens (design-system §5.1).
 */
export function Highlights({ highlights }: { highlights: HomeData["highlights"] }) {
  if (highlights.length === 0) return null;
  return (
    <div className="bg-mist relative z-10">
      <Container>
        <ul className="bg-paper divide-hairline shadow-lift border-hairline rounded-media grid divide-y border lg:-mt-16 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {highlights.map((item) => {
            const href = internalHref(item.cta.href) ?? "#";
            return (
              <li key={item.title} className="flex flex-col gap-4 p-10">
                {item.icon ? (
                  <SmartImage
                    image={item.icon}
                    sizes="40px"
                    ratio="auto"
                    decorative
                    frameClassName="w-10 bg-transparent"
                    className="h-10 w-auto object-contain"
                  />
                ) : null}
                <Heading level={3} size="h4" className="max-w-[24ch]">
                  {item.title}
                </Heading>
                <p
                  lang={autoLang(item.subtitle)}
                  className="text-ink-muted text-small max-w-[34ch] flex-1"
                >
                  {item.subtitle}
                </p>
                {item.cta.label ? (
                  <TextLink href={href} withArrow className="text-index">
                    {item.cta.label}
                  </TextLink>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}
