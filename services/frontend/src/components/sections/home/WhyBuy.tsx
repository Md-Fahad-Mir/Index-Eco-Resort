import { Reveal } from "@/components/motion/Reveal";
import { SmartImage } from "@/components/media/SmartImage";
import { Heading } from "@/components/typography/Heading";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";

/**
 * Why buy a share: four features beside the building. On mobile the image
 * follows the text, so the argument comes before the picture.
 *
 * PARITY: the fourth feature's title is truncated in the CMS — "Strategic
 * Investment Locatio" — and renders as stored (docs/OWNER-REPORT.md §B).
 */
export function WhyBuy({ whyBuy }: { whyBuy: HomeData["whyBuy"] }) {
  return (
    <Section tone="paper">
      <Container className="grid items-center gap-[clamp(2.5rem,5vw,4.5rem)] lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-7">
          <div className="flex flex-col gap-4">
            <Eyebrow>{whyBuy.eyebrow}</Eyebrow>
            <Heading level={2} className="max-w-[20ch]">
              {whyBuy.title}
            </Heading>
          </div>

          <ul className="grid gap-8 sm:grid-cols-2">
            {whyBuy.features.map((feature) => (
              <li key={feature.title} className="flex flex-col gap-3">
                <span
                  aria-hidden
                  className="border-brass-ink/40 text-brass-ink rounded-pill grid size-10 place-items-center border"
                >
                  <span className="border-brass-ink block size-2.5 rotate-45 border" />
                </span>
                <Heading level={3} size="h4">
                  {feature.title}
                </Heading>
                <p lang={autoLang(feature.text)} className="text-ink-muted text-small">
                  {feature.text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <Reveal className="order-last lg:col-span-5">
          <SmartImage
            image={whyBuy.image}
            sizes="(min-width: 1024px) 38vw, 90vw"
            ratio="portrait"
            frameClassName="rounded-media"
          />
        </Reveal>
      </Container>
    </Section>
  );
}
