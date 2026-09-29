"use client";

import { SmartImage } from "@/components/media/SmartImage";
import { Reveal } from "@/components/motion/Reveal";
import { Heading } from "@/components/typography/Heading";
import { Paragraph } from "@/components/typography/Text";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger, useTabsSwitched } from "@/components/ui/Tabs";
import type { AboutPage } from "@/lib/data";
import { paragraphs } from "@/lib/format";
import { cn } from "@/lib/utils";

type VisionMission = AboutPage["visionMission"];
type VisionTab = VisionMission["tabs"][number];

/**
 * Vision / Mission / Approach (§8, design-system): a split header with the
 * eyebrow and H2 on the left and the segmented pill tabs opposite them, over a
 * two-column panel. The tab strip sits in the header rather than under it so
 * the section opens as one composed row instead of three stacked bands.
 *
 * Tab labels carry spaces ("Our Vision"); `Tabs` normalises them into valid
 * `aria-controls` IDREFs, so callers pass the CMS label unchanged.
 */
export function VisionMissionTabs({ visionMission }: { visionMission: VisionMission }) {
  const [first] = visionMission.tabs;
  if (!first) return null;

  return (
    <Section tone="mist">
      <Container>
        <Tabs defaultValue={first.label} variant="segmented" className="gap-14">
          <SectionHeader
            eyebrow={visionMission.eyebrow}
            title={visionMission.title}
            aside={
              // Below lg the header stacks, and SectionHeader's row gap only
              // applies to its grid, so the strip sets its own space there.
              <div className="mt-8 lg:mt-0">
                <TabsList label={visionMission.title}>
                  {visionMission.tabs.map((tab) => (
                    <TabsTrigger key={tab.label} value={tab.label}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            }
          />
          {visionMission.tabs.map((tab) => (
            <TabsContent key={tab.label} value={tab.label}>
              <VisionPanel tab={tab} />
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </Section>
  );
}

function VisionPanel({ tab }: { tab: VisionTab }) {
  // The unveil belongs to the first view of the section. Radix unmounts
  // inactive panels, so after a switch the image appears with the cross-fade
  // the tab change already provides.
  const switched = useTabsSwitched();

  // The CMS stores this field as plain text. It is split only where the stored
  // value has a blank line — the frontend never invents paragraph breaks.
  const body = paragraphs(tab.text);

  const image = (
    <SmartImage
      image={tab.image}
      sizes="(min-width: 1024px) 40vw, 100vw"
      ratio="portrait"
      // A 4:5 frame balances a tall text column beside it. Stacked under the
      // text it is simply a very tall photograph, so it turns landscape there.
      frameClassName="rounded-media aspect-4/3 lg:aspect-4/5"
    />
  );

  return (
    <div className="grid gap-[clamp(2.5rem,5vw,4.5rem)] lg:grid-cols-12 lg:items-start">
      <div className="flex flex-col gap-5 lg:col-span-6">
        <Eyebrow>{tab.kicker}</Eyebrow>
        <Heading level={3}>{tab.title}</Heading>
        <div data-testid="vm-body" className="flex flex-col gap-5">
          {body.map((para, index) => (
            <Paragraph
              key={para.slice(0, 48)}
              className={cn(
                "text-ink-muted",
                // A lead-sized opener only where the stored text really has
                // more than one paragraph.
                body.length > 1 && index === 0 && "text-lead text-ink",
              )}
            >
              {para}
            </Paragraph>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 lg:col-start-8">
        {switched ? image : <Reveal>{image}</Reveal>}
      </div>
    </div>
  );
}
