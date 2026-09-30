import Link from "next/link";
import { SmartImage } from "@/components/media/SmartImage";
import { LineReveal } from "@/components/motion/midnight/LineReveal";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { RuleDraw } from "@/components/motion/midnight/RuleDraw";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref, isInternal } from "@/lib/links";

/**
 * Home's call to action — "the invitation" (prompts/06b-home-redesign.md
 * §5.6). A Home-only wrapper: `CtaStrip` stays as it is for the Gallery page.
 *
 * One quiet, centred card of ivory between two night rooms: bronze hairlines
 * drawn outward from a small diamond, the avatar in a bronze ring, the line
 * in the display face, the button. It ends on a clean edge, so the vault
 * below opens like a door.
 *
 * PARITY: the avatar is hotlinked from a WordPress theme demo on the live site
 * (audit §9.8). It is mirrored into our snapshot, but it is still not a photo
 * of anyone at the resort — listed in docs/OWNER-REPORT.md §B.
 */
export function CtaInvitation({ cta }: { cta: HomeData["ctaStrip"] }) {
  const href = internalHref(cta.cta.href) ?? "#";
  const text = cta.text.trim();

  return (
    <section className="bg-me-ivory text-me-night relative py-[clamp(5rem,3rem+6vw,9.5rem)]">
      <Container className="flex flex-col items-center gap-10 text-center md:gap-12">
        <Ornament />

        {cta.avatar ? (
          <RevealGroup>
            <RevealItem>
              <SmartImage
                image={cta.avatar}
                sizes="72px"
                ratio="square"
                decorative
                frameClassName="size-18 rounded-full bg-me-parchment ring-1 ring-me-bronze ring-offset-4 ring-offset-me-ivory"
              />
            </RevealItem>
          </RevealGroup>
        ) : null}

        {text ? (
          <LineReveal
            as="p"
            text={text}
            lang={autoLang(text)}
            delay={0.15}
            className="font-display text-me-night max-w-[26ch] text-[clamp(1.75rem,1.1rem+2.4vw,3.25rem)] leading-[1.15]"
          />
        ) : null}

        {cta.cta.label ? (
          <RevealGroup delay={0.45}>
            <RevealItem>
              <Button asChild variant="home-ink">
                {isInternal(href) ? (
                  <Link href={href}>{cta.cta.label}</Link>
                ) : (
                  <a href={href}>{cta.cta.label}</a>
                )}
              </Button>
            </RevealItem>
          </RevealGroup>
        ) : null}

        <Ornament />
      </Container>
    </section>
  );
}

/** Two bronze hairlines drawn outward from a small diamond. Decoration only. */
function Ornament() {
  return (
    <div aria-hidden className="flex w-full max-w-md items-center gap-4">
      <RuleDraw origin="right" className="bg-me-bronze/45 h-px flex-1" />
      <span className="border-me-bronze block size-2 rotate-45 border" />
      <RuleDraw origin="left" className="bg-me-bronze/45 h-px flex-1" />
    </div>
  );
}
