import { LineReveal } from "@/components/motion/midnight/LineReveal";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { Spotlight } from "@/components/motion/midnight/Spotlight";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { PackageSummary } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { VaultCards } from "./VaultCards";

/**
 * Home's Plans section — "the vault" (prompts/06b-home-redesign.md §5.7), the
 * page's signature moment. The four membership cards are the brightest things
 * on the page, under a lamp that brightens as the section arrives.
 *
 * A Home-only wrapper: About and the package pages keep `PlansStage`.
 */
export function PlansVault({
  eyebrow,
  title,
  packages,
}: {
  eyebrow: string;
  title: string;
  packages: PackageSummary[];
}) {
  return (
    <section
      data-testid="plans-vault"
      className="on-dark bg-me-night-deep text-me-parchment section-y relative isolate overflow-hidden"
    >
      <Spotlight className="inset-x-0 top-0 -z-10 h-[90%]" />
      <Container className="flex flex-col items-center gap-16 lg:gap-24">
        <div className="flex flex-col items-center gap-5 text-center">
          <RevealGroup>
            <RevealItem>
              <Eyebrow tone="dark" variant="home">
                {eyebrow}
              </Eyebrow>
            </RevealItem>
          </RevealGroup>
          <LineReveal
            as="h2"
            text={title}
            lang={autoLang(title)}
            delay={0.12}
            className="text-h2 text-me-ivory"
          />
        </div>
        <VaultCards packages={packages} />
      </Container>
    </section>
  );
}
