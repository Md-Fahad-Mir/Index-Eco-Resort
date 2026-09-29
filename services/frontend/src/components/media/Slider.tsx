"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useReducer, type ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

type SliderProps = {
  /** One node per slide. */
  slides: ReactNode[];
  /** Names the carousel for screen readers. */
  label: string;
  tone?: "light" | "dark";
  className?: string;
  slideClassName?: string;
  /** Controls above the track instead of below it. */
  controlsPosition?: "below" | "above";
};

/**
 * The single slider used everywhere (§8): Embla, two icon buttons, a
 * `02 / 05` fraction in tabular numerals and a thin progress bar. No autoplay —
 * the live site's autoplay carousels are reproduced by passing `autoplay` at the
 * call site only where the original had it, with a pause control.
 */
export function Slider({
  slides,
  label,
  tone = "light",
  className,
  slideClassName,
  controlsPosition = "below",
}: SliderProps) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: "start" });
  // Embla owns the carousel state. Rather than mirror it into React state (which
  // would mean a setState inside an effect), re-render on its events and read the
  // current values during render.
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", rerender).on("reInit", rerender);
    return () => {
      embla.off("select", rerender).off("reInit", rerender);
    };
  }, [embla]);

  const selected = embla?.selectedScrollSnap() ?? 0;
  const canPrev = embla?.canScrollPrev() ?? false;
  const canNext = embla?.canScrollNext() ?? false;

  const total = slides.length;
  const progress = total > 1 ? ((selected + 1) / total) * 100 : 100;

  const controls = (
    <div className={cn("flex items-center gap-5", controlsPosition === "above" && "justify-end")}>
      <div className="flex gap-2">
        <IconButton
          label="Previous slide"
          tone={tone}
          disabled={!canPrev}
          onClick={() => embla?.scrollPrev()}
        >
          <ChevronLeft strokeWidth={1.5} />
        </IconButton>
        <IconButton
          label="Next slide"
          tone={tone}
          disabled={!canNext}
          onClick={() => embla?.scrollNext()}
        >
          <ChevronRight strokeWidth={1.5} />
        </IconButton>
      </div>

      <p className={cn("tabular text-small", tone === "light" ? "text-ink-muted" : "text-lichen")}>
        {String(selected + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>

      <div
        aria-hidden
        className={cn("h-px flex-1", tone === "light" ? "bg-hairline" : "bg-hairline-dark")}
      >
        <div
          className={cn(
            "h-px transition-[width] duration-[var(--dur-ui)] ease-[var(--ease-out-soft)]",
            tone === "light" ? "bg-brass-ink" : "bg-brass",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {controlsPosition === "above" && total > 1 ? controls : null}

      <div
        ref={emblaRef}
        className="overflow-hidden"
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
      >
        <div className="flex gap-4">
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              className={cn("min-w-0 shrink-0 grow-0 basis-full", slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {controlsPosition === "below" && total > 1 ? controls : null}
    </div>
  );
}
