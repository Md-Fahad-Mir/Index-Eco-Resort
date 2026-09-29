import Link from "next/link";
import { SmartImage } from "@/components/media/SmartImage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref, isInternal } from "@/lib/links";

/**
 * The single-line call to action, shared by Home and the Gallery page.
 *
 * PARITY: the avatar is hotlinked from a WordPress theme demo on the live site
 * (audit §9.8). It is mirrored into our snapshot, but it is still not a photo
 * of anyone at the resort — listed in docs/OWNER-REPORT.md §B.
 */
export function CtaStrip({ cta }: { cta: HomeData["ctaStrip"] }) {
  const href = internalHref(cta.cta.href) ?? "#";
  return (
    <Section tone="canopy" spacing={false} className="border-brass/40 border-t py-14">
      <Container className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-center md:text-left">
        {cta.avatar ? (
          <SmartImage
            image={cta.avatar}
            sizes="64px"
            ratio="square"
            decorative
            frameClassName="size-16 shrink-0 rounded-pill"
          />
        ) : null}
        <p lang={autoLang(cta.text)} className="font-display text-h4 text-mist max-w-[46ch]">
          {cta.text}
        </p>
        {cta.cta.label ? (
          <Button asChild variant="on-dark" className="shrink-0 md:ml-4">
            {isInternal(href) ? (
              <Link href={href}>{cta.cta.label}</Link>
            ) : (
              <a href={href}>{cta.cta.label}</a>
            )}
          </Button>
        ) : null}
      </Container>
    </Section>
  );
}
