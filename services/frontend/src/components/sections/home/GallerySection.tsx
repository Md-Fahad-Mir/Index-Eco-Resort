"use client";

import { AnimatePresence, m } from "motion/react";
import { useMemo, useState } from "react";
import { Lightbox } from "@/components/media/Lightbox";
import { SmartImage } from "@/components/media/SmartImage";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { GalleryBlock } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";

const ALL = "all";

/**
 * The gallery, shared by Home and the Gallery page.
 *
 * PARITY, oddity included: the live site caps the "All" tab on Home at 12 of
 * the 21 items while each category tab shows its full set, so 8 of the 20 images
 * are reachable only through a category tab and never appear under "All"
 * (audit §11.2). That is reproduced from the data rather than smoothed over.
 *
 * The lightbox links are the repaired ones: on the live site every
 * category-tab link points at a path that 404s, so clicking a tile inside a
 * category opens nothing (rule 9c, Phase 3).
 */
export function GallerySection({
  gallery,
  tone = "mist",
}: {
  gallery: GalleryBlock;
  tone?: "mist" | "paper";
}) {
  const [category, setCategory] = useState(ALL);
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);
  const reduced = useReducedMotionSafe();

  const items = useMemo(
    () => (category === ALL ? gallery.items : (gallery.itemsByCategory[category] ?? [])),
    [category, gallery],
  );

  const chips = useMemo(
    () =>
      gallery.categories.filter(
        (c) => c.id === ALL || (gallery.itemsByCategory[c.id]?.length ?? 0) > 0,
      ),
    [gallery],
  );

  return (
    <Section tone={tone}>
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow={gallery.eyebrow}
          title={gallery.title}
          aside={
            <div
              // The chip row scrolls rather than wrapping into a block on mobile.
              className="-mx-[var(--container-pad)] flex [scrollbar-width:none] gap-2 overflow-x-auto px-[var(--container-pad)] pb-1 lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {chips.map((chip) => {
                const active = chip.id === category;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setCategory(chip.id)}
                    aria-pressed={active}
                    lang={autoLang(chip.name)}
                    className={cn(
                      "rounded-pill text-label relative shrink-0 px-4 py-2 font-semibold whitespace-nowrap transition-colors duration-[var(--dur-micro)]",
                      active ? "text-paper" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {active && (
                      <m.span
                        layoutId={reduced ? undefined : "gallery-chip"}
                        transition={
                          reduced ? { duration: 0 } : { duration: 0.25, ease: [0.65, 0, 0.35, 1] }
                        }
                        className="bg-index rounded-pill absolute inset-0"
                      />
                    )}
                    <span className="relative z-10">{chip.name}</span>
                  </button>
                );
              })}
            </div>
          }
        />

        <m.ul layout={!reduced} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item, index) => (
              <m.li
                key={`${item.image.src}-${index}`}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: reduced ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={() => setLightboxAt(index)}
                  className="group rounded-media relative block w-full overflow-hidden text-left"
                >
                  <SmartImage
                    image={item.image}
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    ratio="gallery"
                    zoomOnHover
                  />
                  {/* The caption rises over a gradient on hover and focus. */}
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-[linear-gradient(to_top,rgb(12_33_22/0.85),transparent)] p-4 opacity-0 transition-all duration-[var(--dur-ui)] ease-[var(--ease-out-soft)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    <span
                      lang={autoLang(item.categoryName)}
                      className="text-lichen text-label block"
                    >
                      {item.categoryName}
                    </span>
                    <span lang={autoLang(item.title)} className="text-mist text-small block">
                      {item.title}
                    </span>
                  </span>
                  <span className="sr-only">View {item.title || item.categoryName} full size</span>
                </button>
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      </Container>

      <Lightbox
        open={lightboxAt !== null}
        index={lightboxAt ?? 0}
        onClose={() => setLightboxAt(null)}
        slides={items.map((item) => ({
          src: item.fullSrc || item.image.src,
          alt: item.image.alt,
          title: item.title,
          description: item.categoryName,
        }))}
      />
    </Section>
  );
}
