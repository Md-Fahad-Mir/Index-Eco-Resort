"use client";

import { SmartImage } from "@/components/media/SmartImage";
import { Slider } from "@/components/media/Slider";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";

/**
 * The project's facts as a spec sheet — hairline-separated `<dl>` rows rather
 * than cards, because these are specifications, not features — beside the
 * promotional slides.
 *
 * PARITY: slide 2 of the live slider is a test entry captioned "3454 /
 * 45645645". It renders as stored; docs/OWNER-REPORT.md §B asks for it to be
 * deleted in the admin panel.
 */
export function ProjectGlance({ glance }: { glance: HomeData["glance"] }) {
  return (
    <Section tone="lichen-soft">
      <Container className="flex flex-col gap-12">
        <SectionHeader eyebrow={glance.eyebrow} title={glance.title} />

        <div className="grid items-start gap-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-12">
          <dl className="divide-hairline flex flex-col divide-y lg:col-span-7">
            {glance.facts.map((fact) => (
              <div key={fact.label} className="flex flex-wrap gap-x-6 gap-y-1 py-4">
                <dt className="text-ink-muted text-small w-[38%] min-w-[9rem] font-semibold">
                  {fact.label}
                </dt>
                <dd lang={autoLang(fact.value)} className="text-ink text-body flex-1">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="lg:col-span-5">
            <Slider
              label="Project facilities"
              slides={glance.slides.map((slide, index) => (
                <figure key={`${slide.image.src}-${index}`} className="relative">
                  <SmartImage
                    image={slide.image}
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    ratio="portrait"
                    frameClassName="rounded-media"
                  />
                  {slide.label || slide.caption ? (
                    <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-[linear-gradient(to_top,rgb(12_33_22/0.85),transparent)] p-5">
                      {slide.label ? (
                        <span lang={autoLang(slide.label)} className="text-brass text-label">
                          {slide.label}
                        </span>
                      ) : null}
                      {slide.caption ? (
                        <span lang={autoLang(slide.caption)} className="text-mist text-small">
                          {slide.caption}
                        </span>
                      ) : null}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
