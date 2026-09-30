"use client";

import { AnimatePresence, m } from "motion/react";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { useDictionary, useFormatter } from "@/components/i18n/LocaleProvider";
import { Lightbox } from "@/components/media/Lightbox";
import { SmartImage } from "@/components/media/SmartImage";
import { LightsOn } from "@/components/motion/midnight/LightsOn";
import { EASE, MEDIUM_UP } from "@/components/motion/midnight/tokens";
import { useMedia, useMotionOn } from "@/components/motion/midnight/useMotionOn";
import { useSlidingIndicator } from "@/components/motion/midnight/useSlidingIndicator";
import type { GalleryBlock } from "@/lib/data";
import { autoLang, isBangla } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { EstateHeading } from "./EstateHeading";
import { narrowMosaic, wideMosaic, type Tile } from "./galleryMosaic";

const ALL = "all";

/** Seconds between neighbouring tiles as the lights come on across the wall. */
const TILE_STAGGER = 0.07;

/** Static class names per span, so Tailwind sees every one. */
const NARROW_SPAN = { 1: "col-span-1", 2: "col-span-2" } as const;
const WIDE_COL = { 1: "md:col-span-1", 2: "md:col-span-2" } as const;
const WIDE_ROW = { 1: "md:row-span-1", 2: "md:row-span-2" } as const;

/**
 * Home's gallery — "the night gallery" (prompts/06b-home-redesign.md §5.5). A
 * Home-only wrapper: `GallerySection` stays as it is for the Gallery page.
 *
 * Photographs hang like lit frames on a dark wall: a dense mosaic, square
 * corners, hairline gaps, hole-free for any count (galleryMosaic.ts). Each
 * tile's lights come on in a diagonal sweep; hover brings the photograph up to
 * full brightness, draws a champagne inner frame and lifts the caption. A
 * filter change dims the wall and lights the new set.
 *
 * PARITY, oddity included: the live site caps the "All" tab on Home at 12 of
 * the 21 items while each category tab shows its full set, so 8 of the 20
 * images are reachable only through a category tab and never appear under
 * "All" (audit §11.2). That is reproduced from the data rather than smoothed
 * over. The lightbox links are the repaired ones (rule 9c, Phase 3).
 */
export function GalleryNight({ gallery }: { gallery: GalleryBlock }) {
  const [category, setCategory] = useState(ALL);
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);
  const on = useMotionOn();
  const wide = useMedia(MEDIUM_UP, true);
  const dict = useDictionary();
  const { t } = useFormatter();

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

  const mosaic = useMemo(() => wideMosaic(items.length), [items.length]);
  const narrow = useMemo(() => narrowMosaic(items.length), [items.length]);

  return (
    <section className="on-dark bg-me-night-deep text-me-parchment me-grain section-y relative overflow-hidden">
      <div className="flex flex-col gap-12 md:gap-16">
        {/* The heading keeps the page's column; only the wall widens. */}
        <div className="container-site flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-8">
          <EstateHeading
            tone="night"
            eyebrow={gallery.eyebrow}
            title={gallery.title}
            className="lg:col-span-6"
          />
          <Chips
            chips={chips}
            active={category}
            onSelect={setCategory}
            className="lg:col-span-6 lg:col-start-7"
          />
        </div>

        <div className="@container mx-auto w-full max-w-[1520px] px-(--container-pad)">
          <AnimatePresence mode="wait" initial={false}>
            <m.ul
              key={category}
              className="me-mosaic"
              style={{ "--mosaic-cols": mosaic.cols } as CSSProperties}
              exit={{ opacity: 0, transition: { duration: on ? 0.35 : 0, ease: EASE } }}
            >
              {items.map((item, index) => {
                const big = mosaic.tiles[index];
                const small = narrow[index];
                const at: Tile | undefined = wide ? big : small;
                return (
                  <li
                    key={`${item.image.src}-${index}`}
                    className={cn(
                      NARROW_SPAN[small?.col ?? 1],
                      WIDE_COL[big?.col ?? 1],
                      WIDE_ROW[big?.row ?? 1],
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxAt(index)}
                      className="group/tile relative block size-full overflow-hidden text-left"
                    >
                      <LightsOn
                        // A diagonal sweep: along the row, alternate rows a beat later.
                        delay={((at?.x ?? 0) + ((at?.y ?? 0) % 2)) * TILE_STAGGER}
                        className="absolute inset-0"
                      >
                        <SmartImage
                          image={item.image}
                          sizes={
                            (big?.col ?? 1) === 2
                              ? "(min-width: 1520px) 760px, (min-width: 768px) 50vw, 100vw"
                              : "(min-width: 1520px) 380px, (min-width: 768px) 25vw, 50vw"
                          }
                          ratio="auto"
                          frameClassName="absolute inset-0 bg-me-forest"
                          className="ease-me size-full object-cover [filter:var(--me-grade)] transition-[scale,filter] duration-1000 group-hover/tile:scale-104 group-hover/tile:[filter:none] group-focus-visible/tile:scale-104 group-focus-visible/tile:[filter:none]"
                        />
                      </LightsOn>

                      {/* The inner frame, lit on hover. */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-(--me-frame-inset) opacity-0 shadow-[inset_0_0_0_1px_var(--me-frame)] transition-opacity duration-700 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100"
                      />

                      {/* The caption rises over a night gradient; always shown
                          where there is no hover to reveal it. */}
                      <span className="from-me-night-deep/90 pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 flex-col gap-1 bg-linear-to-t to-transparent p-4 pt-12 opacity-0 transition-[opacity,translate] duration-500 ease-(--me-ease) group-hover/tile:translate-y-0 group-hover/tile:opacity-100 group-focus-visible/tile:translate-y-0 group-focus-visible/tile:opacity-100 md:p-5 md:pt-16 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
                        <span
                          lang={autoLang(item.categoryName)}
                          className={cn(
                            "font-display text-me-champagne line-clamp-1 text-[1rem] md:text-[1.0625rem]",
                            !isBangla(item.categoryName) && "italic",
                          )}
                        >
                          {item.categoryName}
                        </span>
                        {item.title ? (
                          <span
                            lang={autoLang(item.title)}
                            className="text-me-ivory text-small max-md:text-label line-clamp-2"
                          >
                            {item.title}
                          </span>
                        ) : null}
                      </span>
                      <span className="sr-only">
                        {t(dict.carousel.viewFullSize, { title: item.title || item.categoryName })}
                      </span>
                    </button>
                  </li>
                );
              })}
            </m.ul>
          </AnimatePresence>
        </div>
      </div>

      <Lightbox
        tone="midnight"
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
    </section>
  );
}

/**
 * The filter: hairline pills, the active one filled champagne by a single
 * pill that slides between them. On phones the row scrolls sideways under
 * soft edge fades, and the chosen chip is brought to the middle.
 */
function Chips({
  chips,
  active,
  onSelect,
  className,
}: {
  chips: GalleryBlock["categories"];
  active: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const { container: row, indicator: pill } = useSlidingIndicator<HTMLDivElement, HTMLSpanElement>(
    active,
  );

  return (
    <div
      ref={scroller}
      className={cn(
        "-mx-(--container-pad) [scrollbar-width:none] overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_var(--container-pad),black_calc(100%-var(--container-pad)),transparent)] px-(--container-pad) lg:mx-0 lg:overflow-visible lg:[mask-image:none] lg:px-0 [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <div ref={row} className="relative flex w-max gap-2 lg:w-auto lg:flex-wrap lg:justify-end">
        <span
          ref={pill}
          aria-hidden
          className="bg-me-champagne pointer-events-none absolute top-0 left-0 rounded-full opacity-0 in-data-[indicator=ready]:transition-[transform,width,height] in-data-[indicator=ready]:duration-600 in-data-[indicator=ready]:ease-(--me-ease)"
        />
        {chips.map((chip) => {
          const current = chip.id === active;
          return (
            <button
              key={chip.id}
              type="button"
              data-active={current}
              aria-pressed={current}
              lang={autoLang(chip.name)}
              onClick={(event) => {
                onSelect(chip.id);
                // Only the phone row scrolls; on wide screens the chips wrap.
                const strip = scroller.current;
                if (strip && strip.scrollWidth > strip.clientWidth) {
                  const box = event.currentTarget.getBoundingClientRect();
                  const view = strip.getBoundingClientRect();
                  strip.scrollTo({
                    left: strip.scrollLeft + box.left - view.left - (view.width - box.width) / 2,
                    behavior: "smooth",
                  });
                }
              }}
              className={cn(
                "text-label relative shrink-0 rounded-full px-5 py-3 font-medium whitespace-nowrap transition-colors duration-500",
                current
                  ? "text-me-night bg-me-champagne in-data-[indicator=ready]:bg-transparent"
                  : "text-me-parchment hover:text-me-ivory shadow-[inset_0_0_0_1px_var(--color-me-hairline-gold)] hover:shadow-[inset_0_0_0_1px_var(--me-frame)]",
              )}
            >
              {chip.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
