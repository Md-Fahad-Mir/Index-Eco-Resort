"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useDictionary, useFormatter } from "@/components/i18n/LocaleProvider";
import { useMotionOn } from "@/components/motion/midnight/useMotionOn";
import { cn } from "@/lib/utils";
import { EstateIconButton } from "./EstateIconButton";

/** A horizontal drag longer than this changes slide. */
const SWIPE_PX = 48;
/** Each photograph's time in the frame, the 1.2s turn included. */
const AUTOPLAY_MS = 2500;

const pad = (n: number) => String(n).padStart(2, "0");

type Turn = {
  index: number;
  /** The slide being covered, or -1 before the first turn. */
  from: number;
  /** 1 arrives from the right, -1 from the left. */
  dir: 1 | -1;
  /** Counts turns; keys the seam and the timer so each starts afresh. */
  n: number;
};

/**
 * Home's slider (prompts/06b-home-redesign.md §5.4, §5.9). Slides turn in one
 * frame rather than travel: the incoming photograph is uncovered from the side
 * it arrives on behind a travelling gold seam and settles from 1.1, while the
 * outgoing one slips a tenth the other way and dims beneath it — 1.2s on the
 * frames-and-curtains curve (keyframes in styles/midnight.css).
 *
 * With `autoplay` it turns every 2.5s, timed by a gold line — under the active
 * thumbnail, or beside the fraction — whose end advances it, so anything that
 * holds the rotation freezes the line with it. It holds on mouse hover,
 * keyboard focus, off-screen, in a hidden tab, while `paused`, and at the
 * visitor's pause control (WCAG 2.2.2); under reduced motion it never starts.
 *
 * Below the frame: optional thumbnails, square arrows, the `01 / 05` fraction
 * and the line. It loops, follows a horizontal swipe, and takes ← → while
 * focus is inside. Hidden slides are `inert`, so their buttons never take focus.
 *
 * `navigation={false}` drops the arrows, fraction and pause control, leaving
 * the thumbnails (which carry the timer) as the only controls; it needs `thumbs`.
 */
export function FadeSlider({
  label,
  slides,
  frameClassName,
  className,
  backdrop,
  thumbs,
  thumbLabel,
  controlsClassName,
  autoplay = false,
  paused = false,
  navigation = true,
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
  /** Turn on its own every 2.5s. */
  autoplay?: boolean;
  /** Hold the rotation, e.g. while a lightbox covers the page. */
  paused?: boolean;
  /** Show the arrows, fraction and pause control beside the thumbnails. */
  navigation?: boolean;
}) {
  const count = slides.length;
  const dict = useDictionary();
  const { t, digits } = useFormatter();
  const motionOn = useMotionOn();
  const [{ index, from, dir, n }, setTurn] = useState<Turn>({ index: 0, from: -1, dir: 1, n: 0 });
  const swipe = useRef<{ x: number; y: number } | null>(null);
  // A drag that changed the slide must not also click the slide's button.
  const swiped = useRef(false);

  const frame = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  const timed = autoplay && motionOn && count > 1;
  const running = timed && playing && !paused && !hovered && !focused && inView && pageVisible;

  const go = (next: number, direction: 1 | -1) => {
    const to = ((next % count) + count) % count;
    if (to === index) return;
    setTurn({ index: to, from: index, dir: direction, n: n + 1 });
  };
  const advance = () => go(index + 1, 1);

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
    if (count < 2) return;
    if (event.key === "ArrowRight") go(index + 1, 1);
    else if (event.key === "ArrowLeft") go(index - 1, -1);
    else return;
    event.preventDefault();
  };

  // Touch never holds the rotation: a tap has no "leave" to release it.
  const onHover = (over: boolean) => (event: PointerEvent) => {
    if (event.pointerType === "mouse") setHovered(over);
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerEnter={onHover(true)}
      onPointerLeave={onHover(false)}
      // Keyboard focus holds; the focus a mouse click leaves on an arrow does not.
      onFocus={(event) => setFocused(event.target.matches(":focus-visible"))}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="relative">
        {backdrop}
        <div
          ref={frame}
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
              if (dx < 0) go(index + 1, 1);
              else go(index - 1, -1);
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
            // The first slide enters with the page; only a turn animates.
            const arriving = active && from !== -1;
            const leaving = !active && i === from;
            return (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={t(dict.carousel.slideOf, { n: i + 1, total: count })}
                inert={!active}
                data-active={active}
                className={cn(
                  "absolute inset-0 overflow-hidden",
                  active ? "z-20" : leaving ? "z-10" : "z-0 opacity-0",
                  arriving &&
                    (dir > 0
                      ? "animate-[me-uncover-next_1.2s_var(--me-ease-inout)_backwards]"
                      : "animate-[me-uncover-prev_1.2s_var(--me-ease-inout)_backwards]"),
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0",
                    // Only the photographs settle; captions arrive at size.
                    arriving && "[&_img]:animate-[me-settle_2.4s_var(--me-ease)_backwards]",
                    leaving &&
                      (dir > 0
                        ? "animate-[me-recede-next_1.2s_var(--me-ease-inout)_forwards]"
                        : "animate-[me-recede-prev_1.2s_var(--me-ease-inout)_forwards]"),
                  )}
                >
                  {slide}
                </div>
                {leaving ? (
                  <span
                    aria-hidden
                    className="bg-me-night-deep pointer-events-none absolute inset-0 animate-[me-dim_1.2s_var(--me-ease-inout)_both]"
                  />
                ) : null}
              </div>
            );
          })}

          {n > 0 ? (
            <span
              key={n}
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 z-30",
                dir > 0
                  ? "animate-[me-seam-next_1.2s_var(--me-ease-inout)_both]"
                  : "animate-[me-seam-prev_1.2s_var(--me-ease-inout)_both]",
              )}
            >
              <span
                className={cn(
                  "bg-me-champagne absolute inset-y-0 w-px animate-[me-glint_1.2s_linear_both] shadow-[0_0_18px_1px_color-mix(in_oklab,var(--color-me-champagne)_55%,transparent)]",
                  dir > 0 ? "left-0" : "right-0",
                )}
              />
            </span>
          ) : null}
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
                  aria-label={thumbLabel ? thumbLabel(i) : t(dict.carousel.showPhoto, { n: i + 1 })}
                  aria-current={i === index}
                  onClick={() => go(i, i > index ? 1 : -1)}
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
                  {timed && i === index ? (
                    <Timer
                      key={n}
                      running={running}
                      onDone={advance}
                      className="inset-x-0 bottom-0 z-10 h-0.5"
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          {navigation ? (
            // min-w-0: on a 320–360px phone the arrows, fraction, line and
            // pause control are wider than the column; the line gives way
            // rather than pushing the pause control off the screen.
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="flex gap-2">
                <EstateIconButton
                  label={dict.carousel.previousSlide}
                  onClick={() => go(index - 1, -1)}
                >
                  <ChevronLeft aria-hidden strokeWidth={1.25} />
                </EstateIconButton>
                <EstateIconButton label={dict.carousel.nextSlide} onClick={() => go(index + 1, 1)}>
                  <ChevronRight aria-hidden strokeWidth={1.25} />
                </EstateIconButton>
              </div>
              <span aria-hidden className="text-label tabular text-me-parchment whitespace-nowrap">
                {digits(pad(index + 1))}{" "}
                <span className="text-me-sage">/ {digits(pad(count))}</span>
              </span>
              {thumbs ? null : (
                <span
                  aria-hidden
                  className="bg-me-hairline-gold relative block h-px w-24 overflow-hidden md:w-32"
                >
                  {timed ? (
                    <Timer key={n} running={running} onDone={advance} className="inset-0" />
                  ) : (
                    <span
                      className="bg-me-champagne ease-me absolute inset-0 origin-left transition-transform duration-700"
                      style={{ transform: `scaleX(${(index + 1) / count})` }}
                    />
                  )}
                </span>
              )}
              {timed ? (
                <EstateIconButton
                  label={playing ? dict.carousel.pauseSlideshow : dict.carousel.playSlideshow}
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? (
                    <Pause aria-hidden strokeWidth={1.25} />
                  ) : (
                    <Play aria-hidden strokeWidth={1.25} className="translate-x-px" />
                  )}
                </EstateIconButton>
              ) : null}
            </div>
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
 * One photograph's time as a gold line filling left to right; its end turns
 * the slider. A CSS animation rather than a timer, so a hold freezes the line
 * where it is and the rotation resumes from there.
 */
function Timer({
  running,
  onDone,
  className,
}: {
  running: boolean;
  onDone: () => void;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-me-champagne pointer-events-none absolute origin-left animate-[me-progress_linear_forwards]",
        className,
      )}
      style={{
        animationDuration: `${AUTOPLAY_MS}ms`,
        animationPlayState: running ? "running" : "paused",
      }}
      onAnimationEnd={onDone}
    />
  );
}
