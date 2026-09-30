"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EstateIconButton } from "./EstateIconButton";

/** A horizontal drag longer than this changes slide. */
const SWIPE_PX = 48;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Home's slider (prompts/06b-home-redesign.md §5.4, §5.9): slides crossfade in
 * one frame rather than travel. The incoming slide fades in on top and settles
 * from 1.04 while the outgoing one stays lit beneath it until covered — the
 * hero's crossfade, at the pace of a page turn.
 *
 * Below the frame: optional thumbnails, square arrows, the `01 / 05` fraction
 * and a gold line filling with progress. It loops, never autoplays, follows a
 * horizontal swipe, and takes ← → while focus is inside. Hidden slides are
 * `inert`, so their buttons never take focus.
 */
export function FadeSlider({
  label,
  slides,
  frameClassName,
  className,
  backdrop,
  thumbs,
  thumbLabel = (index) => `Show photograph ${index + 1}`,
  controlsClassName,
}: {
  /** Names the carousel for assistive tech. */
  label: string;
  slides: ReactNode[];
  /** The frame's size, e.g. `aspect-4/5`. */
  frameClassName?: string;
  className?: string;
  /** Painted behind the frame, e.g. an offset outline. */
  backdrop?: ReactNode;
  /** One small image per slide; rendered as buttons beneath the frame. */
  thumbs?: ReactNode[];
  thumbLabel?: (index: number) => string;
  controlsClassName?: string;
}) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  // A drag that changed the slide must not also click the slide's button.
  const swiped = useRef(false);

  const go = (next: number) => setIndex(((next % count) + count) % count);

  const onKeyDown = (event: KeyboardEvent) => {
    if (count < 2) return;
    if (event.key === "ArrowRight") go(index + 1);
    else if (event.key === "ArrowLeft") go(index - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="relative">
        {backdrop}
        <div
          className={cn(
            "bg-me-night-deep relative isolate touch-pan-y overflow-hidden select-none",
            frameClassName,
          )}
          onPointerDown={(event) => {
            swiped.current = false;
            swipe.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start || count < 2) return;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
              swiped.current = true;
              go(index + (dx < 0 ? 1 : -1));
            }
          }}
          onPointerCancel={() => {
            swipe.current = null;
          }}
          onClickCapture={(event) => {
            if (!swiped.current) return;
            swiped.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {slides.map((slide, i) => {
            const active = i === index;
            return (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                inert={!active}
                data-active={active}
                className={cn(
                  "absolute inset-0",
                  active
                    ? "z-10 scale-100 opacity-100 [transition:opacity_.8s_var(--me-ease-inout),scale_1.6s_var(--me-ease)]"
                    : "z-0 scale-[1.04] opacity-0 [transition:opacity_0s_.8s,scale_0s_.8s]",
                )}
              >
                {slide}
              </div>
            );
          })}
        </div>
      </div>

      {count > 1 ? (
        <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-4", controlsClassName)}>
          {thumbs ? (
            <div className="flex gap-2">
              {thumbs.map((thumb, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={thumbLabel(i)}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className={cn(
                    "relative block w-16 overflow-hidden transition-opacity duration-[var(--dur-ui)] md:w-20",
                    // The active thumbnail is framed in champagne; the rest rest dim.
                    "after:pointer-events-none after:absolute after:inset-0 after:transition-shadow after:duration-[var(--dur-ui)]",
                    i === index
                      ? "opacity-100 after:shadow-[inset_0_0_0_1px_var(--color-me-champagne)]"
                      : "opacity-45 hover:opacity-80",
                  )}
                >
                  {thumb}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-5">
            <div className="flex gap-2">
              <EstateIconButton label="Previous slide" onClick={() => go(index - 1)}>
                <ChevronLeft aria-hidden strokeWidth={1.25} />
              </EstateIconButton>
              <EstateIconButton label="Next slide" onClick={() => go(index + 1)}>
                <ChevronRight aria-hidden strokeWidth={1.25} />
              </EstateIconButton>
            </div>
            <span aria-hidden className="text-label tabular text-me-parchment whitespace-nowrap">
              {pad(index + 1)} <span className="text-me-sage">/ {pad(count)}</span>
            </span>
            {thumbs ? null : (
              <span
                aria-hidden
                className="bg-me-hairline-gold relative block h-px w-24 overflow-hidden md:w-32"
              >
                <span
                  className="bg-me-champagne ease-me absolute inset-0 origin-left transition-transform duration-700"
                  style={{ transform: `scaleX(${(index + 1) / count})` }}
                />
              </span>
            )}
          </div>

          <p aria-live="polite" className="sr-only">
            Slide {index + 1} of {count}
          </p>
        </div>
      ) : null}
    </div>
  );
}
