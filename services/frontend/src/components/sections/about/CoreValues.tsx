import { Heading } from "@/components/typography/Heading";
import { Paragraph } from "@/components/typography/Text";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { AboutPage } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";

type CoreValuesData = AboutPage["coreValues"];

/**
 * The CMS stores `gold` / `dark` per tile; the palette calls those lichen and
 * canopy (§2.1). Contrast is taken from §2.2: ink on lichen is 8.1:1 and
 * lichen on canopy 7.3:1, so the body copy stays readable on both.
 */
const CANOPY_TILE = { tile: "bg-canopy text-mist on-dark", body: "text-lichen" };

const TONE: Record<string, { tile: string; body: string }> = {
  gold: { tile: "bg-lichen text-ink", body: "text-ink/80" },
  dark: CANOPY_TILE,
};

/**
 * Core values (§8): six tiles in the CMS's own order, their tones alternating
 * so the grid reads as a checkerboard.
 *
 * The live site drops to two columns between 481px and 768px, which turns that
 * checkerboard into two solid stripes — one all-lichen column beside an
 * all-canopy one. The alternation is the point of the block, so the layout goes
 * straight from one column to three instead.
 */
export function CoreValues({ coreValues }: { coreValues: CoreValuesData }) {
  return (
    <Section tone="paper">
      <Container className="flex flex-col gap-14">
        <SectionHeader
          title={coreValues.title}
          align="center"
          aside={
            <Paragraph className="text-ink-muted max-w-[56ch] text-center">
              {coreValues.intro}
            </Paragraph>
          }
        />

        <ul data-testid="core-values" className="grid gap-4 lg:grid-cols-3">
          {coreValues.items.map((item) => {
            const tone = TONE[item.tone] ?? CANOPY_TILE;
            return (
              <li
                key={item.title}
                lang={autoLang(item.title)}
                className={cn(
                  "rounded-media group relative isolate flex min-h-[11rem] flex-col items-center justify-center gap-3 overflow-hidden p-10 text-center lg:min-h-[15rem] lg:p-12",
                  tone.tile,
                )}
              >
                {/* A brass rule drawn across the top on hover — the tile's only
                    movement, so the grid stays still until it is pointed at. */}
                <span
                  aria-hidden
                  className="bg-brass absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:scale-x-100"
                />
                <Heading level={3} size="h3">
                  {item.title}
                </Heading>
                <Paragraph className={cn("max-w-[34ch]", tone.body)}>{item.text}</Paragraph>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
