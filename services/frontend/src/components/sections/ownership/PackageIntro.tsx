import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { MembershipCard } from "@/components/ownership/MembershipCard";
import { Heading } from "@/components/typography/Heading";
import { Paragraph } from "@/components/typography/Text";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import type { OwnershipPackage } from "@/lib/data";
import { anchorProps, internalHref, isInternal } from "@/lib/links";

/**
 * The package opener (§8): the offer on the left, the card itself on a mist
 * plinth to the right — the one place on the site where boldness is spent.
 *
 * On a phone the card comes first: it is what the visitor came to see, and the
 * heading repeats the one already in the page hero.
 */
export function PackageIntro({ pkg }: { pkg: OwnershipPackage }) {
  const href = internalHref(pkg.cta.href) ?? "#";

  return (
    <Section tone="paper">
      <Container className="grid items-center gap-[clamp(2.5rem,5vw,4.5rem)] lg:grid-cols-12">
        <div className="order-2 flex flex-col items-start gap-6 lg:order-1 lg:col-span-6">
          {/* PARITY: every package's heading reads "Silver Ownership" on the
              live site, emoji included (audit §9.1, OWNER-REPORT §B2). */}
          <Heading level={2}>{pkg.heading}</Heading>
          <Paragraph className="text-lead text-ink-muted">{pkg.discountText}</Paragraph>

          {/* PARITY: "Book Your Share" links to "#" on the live site. */}
          <Button asChild>
            {isInternal(href) ? (
              <Link href={href}>{pkg.cta.label}</Link>
            ) : (
              <a href={href} {...anchorProps(pkg.cta.href)}>
                {pkg.cta.label}
              </a>
            )}
          </Button>
        </div>

        <Reveal className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
          <div className="bg-mist border-hairline rounded-media border p-[clamp(1.25rem,4vw,2.5rem)]">
            <div className="mx-auto max-w-[560px]">
              <MembershipCard
                card={pkg.card}
                name={pkg.name}
                priority
                sizes="(min-width: 1024px) 520px, (min-width: 640px) 60vw, 84vw"
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
