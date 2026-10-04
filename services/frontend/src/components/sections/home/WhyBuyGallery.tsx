"use client";

import { Pause, Play } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { useDictionary, useFormatter } from "@/components/i18n/LocaleProvider";
import { SmartImage } from "@/components/media/SmartImage";
import { LightsOn } from "@/components/motion/midnight/LightsOn";
import { ScrollScale } from "@/components/motion/midnight/ScrollScale";
import { useMotionOn } from "@/components/motion/midnight/useMotionOn";
import type { HomeData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { EstateIconButton } from "./EstateIconButton";

type Photo = HomeData["whyBuy"]["images"][number];

/** Each photograph's time in the frame, its fade included — the hero's pace. */
const HOLD_MS = 6000;
/** The crossfade; under reduced motion, a short one with no drift. */
const FADE_MS = 1400;
const FADE_REDUCED_MS = 300;
/** A horizontal drag longer than this changes photograph. */
const SWIPE_PX = 48;
/**
 * The photographs are landscape (about 11:6) and the frame is portrait on
 * phones and desktops, so each is drawn at the frame's height times that
 * ratio: 4:5 phones → 211vw, 16:11 tablets → 116vw, the 80vh sticky frame →
 * 147vh. Sizing by the frame's width would fetch an image half as wide.
 */
const SIZES = "(min-width: 1024px) 147vh, (min-width: 640px) 116vw, 211vw";

type Turn = {
  index: number;
  /** The photograph being covered, or -1 before the first turn. */
  from: number;
  /** Counts turns; keys the timer so each starts afresh. */
  n: number;
};

/**
 * Why buy's frame (prompts/06b-home-redesign.md §5.8), turning through the
 * resort's photographs.
 *
 * A crossfade rather than a slide: the frame already settles as the section
 * scrolls, and a sideways travel would fight it. The incoming photograph fades
 * in over the last on the frames-and-curtains curve, drawing back from 1.06
 * across its whole time in the frame (`me-linger`), so the picture is never
 * quite still and a turn never jumps. The first photograph enters with the
 * frame's own lights-on instead.
 *
 * Along its foot, a hairline per photograph — the one showing fills with
 * champagne over its 6s, and each is a button to its photograph — and a pause
 * control (WCAG 2.2.2). The rotation holds on mouse hover, keyboard focus,
 * off-screen, in a hidden tab and at the pause control; under reduced motion it
 * never starts. It follows a horizontal swipe and ← → while focus is inside.
 * One photograph is a still: no controls, and not announced as a carousel.
 *
 * Photographs are fetched as they come up — the one showing and the next —
 * rather than all five as the section nears.
 */
export function WhyBuyGallery({
  images,
  label,
  target,
  className,
}: {
  images: Photo[];
  /** Names the carousel for assistive tech. */
  label: string;
  /** The section, whose pass drives the frame's scroll settle. */
  target: RefObject<HTMLElement | null>;
  /** The frame's size and position. */
  className?: string;
}) {
  const count = images.length;
  const dict = useDictionary();
  const { t } = useFormatter();
  const motionOn = useMotionOn();
  const [{ index, from, n }, setTurn] = useState<Turn>({ index: 0, from: -1, n: 0 });
  const [fetched, setFetched] = useState(() => new Set([0, 1]));
  const frame = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  const carousel = count > 1;
  const timed = carousel && motionOn;
  const running = timed && playing && !hovered && !focused && inView && pageVisible;
  const fade = motionOn ? FADE_MS : FADE_REDUCED_MS;

  const go = (next: number) => {
    const to = ((next % count) + count) % count;
    if (to === index) return;
    setTurn({ index: to, from: index, n: n + 1 });
    setFetched((seen) => new Set(seen).add(to).add((to + 1) % count));
  };

  // Off-screen and hidden-tab holds.
  useEffect(() => {
    const el = frame.current;
    if (!timed || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: 0.35 },
    );
    observer.observe(el);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [timed]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (!carousel) return;
    if (event.key === "ArrowRight") go(index + 1);
    else if (event.key === "ArrowLeft") go(index - 1);
    else return;
    event.preventDefault();
  };

  // Touch never holds the rotation: a tap has no "leave" to release it.
  const onHover = (over: boolean) => (event: PointerEvent) => {
    if (event.pointerType === "mouse") setHovered(over);
  };

  return (
    <div
      ref={frame}
      role={carousel ? "group" : undefined}
      aria-roledescription={carousel ? "carousel" : undefined}
      aria-label={carousel ? label : undefined}
      onKeyDown={onKeyDown}
      onPointerEnter={onHover(true)}
      onPointerLeave={onHover(false)}
      // Keyboard focus holds; the focus a mouse click leaves on a control does not.
      onFocus={(event) => setFocused(event.target.matches(":focus-visible"))}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onPointerDown={(event) => {
        if ((event.target as Element).closest("button")) return;
        swipe.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = swipe.current;
        swipe.current = null;
        if (!start || !carousel) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
          go(index + (dx < 0 ? 1 : -1));
        }
      }}
      onPointerCancel={() => {
        swipe.current = null;
      }}
      className={cn("touch-pan-y overflow-hidden select-none", className)}
    >
      <LightsOn className="absolute inset-0">
        <ScrollScale target={target} className="size-full">
          {(count > 0 ? images : [null]).map((image, i) => {
            const active = i === index;
            const leaving = i === from;
            // Only photographs that arrived by a turn drift; the first one
            // entered with the frame.
            const lingering = motionOn && ((active && n > 0) || (leaving && n > 1));
            return (
              <div
                key={i}
                role={carousel ? "group" : undefined}
                aria-roledescription={carousel ? "slide" : undefined}
                aria-label={
                  carousel ? t(dict.carousel.slideOf, { n: i + 1, total: count }) : undefined
                }
                inert={!active}
                data-active={active}
                // The incoming photograph fades in on top; the outgoing one
                // stays lit beneath it until the next turn, the rest unseen.
                className={cn(
                  "absolute inset-0",
                  active ? "z-20" : leaving ? "z-10" : "z-0 opacity-0",
                )}
                style={
                  {
                    "--focus": image?.focus,
                    transition: active ? `opacity ${fade}ms var(--me-ease-inout)` : undefined,
                    animation: lingering
                      ? `me-linger ${HOLD_MS + FADE_MS}ms linear both`
                      : undefined,
                  } as CSSProperties
                }
              >
                {fetched.has(i) ? (
                  <SmartImage
                    image={image}
                    sizes={SIZES}
                    ratio="auto"
                    frameClassName="absolute inset-0 bg-me-parchment"
                    className="size-full object-cover object-(--focus)"
                  />
                ) : null}
              </div>
            );
          })}
        </ScrollScale>
      </LightsOn>

      {carousel ? (
        // A low night veil keeps the controls legible on a bright photograph.
        <div className="on-dark from-me-night-deep/60 absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-6 bg-linear-to-t to-transparent px-6 pt-20 pb-6 md:px-8 md:pb-8">
          <div className="flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={t(dict.carousel.showPhoto, { n: i + 1 })}
                aria-current={i === index}
                onClick={() => go(i)}
                // The line is 2px; the button around it is a 24px target.
                className="group/dash relative h-6 w-8 cursor-pointer md:w-10"
              >
                <span
                  aria-hidden
                  className="bg-me-ivory/35 group-hover/dash:bg-me-ivory/65 absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden transition-colors duration-[var(--dur-ui)]"
                >
                  {i !== index ? null : timed ? (
                    <Timer key={n} running={running} onDone={() => go(index + 1)} />
                  ) : (
                    <span className="bg-me-champagne absolute inset-0" />
                  )}
                </span>
              </button>
            ))}
          </div>

          {timed ? (
            <EstateIconButton
              label={playing ? dict.carousel.pauseSlideshow : dict.carousel.playSlideshow}
              onClick={() => setPlaying(!playing)}
              className="size-10 [&_svg]:size-4"
            >
              {playing ? (
                <Pause aria-hidden strokeWidth={1.25} />
              ) : (
                <Play aria-hidden strokeWidth={1.25} className="translate-x-px" />
              )}
            </EstateIconButton>
          ) : null}

          {/* Silent while it rotates, so a screen reader is not interrupted
              every few seconds (APG carousel pattern). */}
          <p aria-live={timed && playing ? "off" : "polite"} className="sr-only">
            {t(dict.carousel.slideStatus, { n: index + 1, total: count })}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * One photograph's time as a champagne line filling its hairline; its end
 * turns the frame. A CSS animation rather than a timer, so a hold freezes the
 * line where it is and the rotation resumes from there.
 */
function Timer({ running, onDone }: { running: boolean; onDone: () => void }) {
  return (
    <span
      className="bg-me-champagne absolute inset-0 origin-left animate-[me-progress_linear_forwards]"
      style={{
        animationDuration: `${HOLD_MS}ms`,
        animationPlayState: running ? "running" : "paused",
      }}
      onAnimationEnd={onDone}
    />
  );
}
