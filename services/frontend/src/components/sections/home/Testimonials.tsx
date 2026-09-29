"use client";

import { Star } from "lucide-react";
import { SmartImage } from "@/components/media/SmartImage";
import { Slider } from "@/components/media/Slider";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { HomeData, Testimonial } from "@/lib/data";
import { autoLang } from "@/lib/lang";

/**
 * Client quotes. A carousel only when there is more than one — the live site
 * runs an autoplaying loop over a single item, which is motion for nothing.
 *
 * PARITY: that single review is placeholder data ("jack sparrow / Actor", with
 * an avatar hotlinked from a theme demo). It renders as stored;
 * docs/OWNER-REPORT.md §B asks for a real review.
 */
export function Testimonials({ testimonials }: { testimonials: HomeData["testimonials"] }) {
  const items = testimonials.items;
  if (items.length === 0) return null;

  return (
    <Section tone="paper">
      <Container className="flex flex-col gap-12">
        <SectionHeader eyebrow={testimonials.eyebrow} title={testimonials.title} align="center" />
        {items.length === 1 ? (
          <Quote testimonial={items[0]!} />
        ) : (
          <Slider
            label="Client reviews"
            slides={items.map((item, index) => (
              <Quote key={index} testimonial={item} />
            ))}
            className="mx-auto max-w-3xl"
          />
        )}
      </Container>
    </Section>
  );
}

function Quote({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
      {testimonial.rating > 0 ? (
        <div
          // role="img" so the label is permitted and the stars read as one graphic.
          role="img"
          aria-label={`${testimonial.rating} out of 5 stars`}
          className="flex gap-1"
        >
          {Array.from({ length: testimonial.rating }).map((_, index) => (
            <Star
              key={index}
              aria-hidden
              className="text-brass size-4 fill-current"
              strokeWidth={0}
            />
          ))}
        </div>
      ) : null}

      <blockquote
        lang={autoLang(testimonial.quote)}
        className="font-display text-ink text-h3 text-balance"
      >
        {testimonial.quote}
      </blockquote>

      <figcaption className="flex items-center gap-4">
        {testimonial.avatar ? (
          <SmartImage
            image={testimonial.avatar}
            sizes="56px"
            ratio="square"
            decorative
            frameClassName="size-14 rounded-pill"
          />
        ) : null}
        <span className="flex flex-col text-left">
          <span className="text-ink text-body font-semibold">{testimonial.name}</span>
          <span className="text-ink-muted text-small">{testimonial.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
