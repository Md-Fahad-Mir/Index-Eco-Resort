import { Check } from "lucide-react";
import { LiteYouTube } from "@/components/media/LiteYouTube";
import { Heading } from "@/components/typography/Heading";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import type { OwnershipPackage } from "@/lib/data";
import { autoLang } from "@/lib/lang";

/**
 * Ownership benefits beside the package's video (§8).
 *
 * The benefits are short lines, so they run in two columns from 768px up, each
 * on its own hairline rule — a list of facts rather than a stack of cards.
 * Beside the video on a laptop the halves are too narrow, so it is one column
 * until xl. The video is a facade: nothing from YouTube loads until clicked.
 */
export function PackageBenefits({ pkg }: { pkg: OwnershipPackage }) {
  return (
    <Section tone="mist">
      <Container className="grid gap-[clamp(2.5rem,5vw,4.5rem)] lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-7">
          <Heading level={2}>{pkg.benefitsTitle}</Heading>

          <ul className="grid gap-x-10 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {pkg.benefits.map((benefit) => (
              <li
                key={benefit}
                lang={autoLang(benefit)}
                className="border-hairline flex items-start gap-3 border-b py-4"
              >
                <Check
                  aria-hidden
                  className="text-brass-ink mt-0.5 size-5 shrink-0"
                  strokeWidth={1.5}
                />
                <span className="text-body text-ink">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {pkg.youtubeId ? (
          <div className="lg:col-span-5">
            <LiteYouTube videoId={pkg.youtubeId} title={pkg.name} />
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
