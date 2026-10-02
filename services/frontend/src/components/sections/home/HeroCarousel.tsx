"use client";

import { m, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/components/i18n/Link";
import { useDictionary, useFormatter } from "@/components/i18n/LocaleProvider";
import { SmartImage } from "@/components/media/SmartImage";
import { FrameDraw } from "@/components/motion/midnight/FrameDraw";
import { LightsOn } from "@/components/motion/midnight/LightsOn";
import { LineReveal } from "@/components/motion/midnight/LineReveal";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { RuleDraw } from "@/components/motion/midnight/RuleDraw";
import { DUR, MEDIUM_UP } from "@/components/motion/midnight/tokens";
import { useMedia, useMotionOn } from "@/components/motion/midnight/useMotionOn";
import { Button } from "@/components/ui/Button";
import type { HomeData } from "@/lib/data";
import { autoLang, isBangla } from "@/lib/lang";
import { internalHref, isInternal } from "@/lib/links";
import { MOBILE_VIDEO_QUERY, videoVariants } from "@/lib/media";
import { cn } from "@/lib/utils";

type Slide = HomeData["hero"]["slides"][number];

const REDUCED = "(prefers-reduced-motion: reduce)";
/** A horizontal drag longer than this changes slide, as the original's drag did. */
const SWIPE_PX = 48;

/**
 * The hero — Midnight Estate's "lights on" (prompts/06b-home-redesign.md §5.1).
 *
 * The owner replaced the live site's video-then-banner carousel (audit §11.1)
 * with a single still: the resort's entrance gate. The carousel machinery stays
 * for whatever the CMS sends — 6s per image slide, a video slide advancing when
 * its clip ends — but with one slide nothing rotates and it is not announced
 * as a carousel. One presentation change, recorded in
 * tests/parity/allowed-diffs.ts: the lockup — the subline, title and button of
 * the slide that has a title — stays in place across slides while only the
 * media crossfades beneath it. So the page's single `<h1>` never moves or
 * hides, whichever slide is showing.
 *
 * There is no visible slide counter, progress line or pause control; the owner
 * asked for the media to stand clear. Rotation still holds on hover and keyboard
 * focus, and under reduced motion nothing autoplays at all.
 */
export function HeroCarousel({ hero }: { hero: HomeData["hero"] }) {
  const slides = hero.slides;
  const count = slides.length;
  const motionOn = useMotionOn();
  const wide = useMedia(MEDIUM_UP);
  const reduced = useMedia(REDUCED);
  const dict = useDictionary();
  const { t } = useFormatter();

  const [selected, setSelected] = useState(0);
  // Each time a slide is shown its rotation clock starts again.
  const [cycle, setCycle] = useState(0);
  // Derived rather than synced in an effect, so server and client agree.
  const playing = !reduced;
  const [interacting, setInteracting] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const show = useCallback(
    (index: number) => {
      setSelected(((index % count) + count) % count);
      setCycle((c) => c + 1);
    },
    [count],
  );
  const advance = useCallback(() => show(selected + 1), [show, selected]);
  // A single slide is a still, not a carousel, for assistive tech too.
  const carousel = count > 1;

  // Only the active slide's video plays; the others are reset.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === selected && playing) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
        if (index !== selected) video.currentTime = 0;
      }
    });
  }, [selected, playing]);

  // The lockup is the slide that has a title (rule 9e: the page's one h1).
  const lockup = slides.find((s) => s.title.trim()) ?? slides.find((s) => s.subline.trim());
  const current = slides[selected];
  // Image slides rotate on a clock; never under reduced motion, never while
  // held by hover or focus, never with a single slide.
  const rotates = count > 1 && !reduced && current?.kind !== "video";
  useRotation(rotates && playing && !interacting, hero.autoplayMs, cycle, advance);

  // Scroll-out, ≥768px: the media drifts, the lockup lifts away (§5.1).
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const drift = motionOn && wide;
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const lockupOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const lockupY = useTransform(scrollYProgress, [0, 0.6], [0, -40]);

  return (
    <section
      ref={sectionRef}
      data-testid="hero"
      aria-roledescription={carousel ? "carousel" : undefined}
      aria-label={dict.carousel.heroLabel}
      className="on-dark bg-me-night text-me-ivory phone-landscape:min-h-svh relative isolate flex min-h-[max(640px,100svh)] touch-pan-y flex-col overflow-hidden"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={() => setInteracting(false)}
      onPointerDown={(event) => {
        if ((event.target as Element).closest("a, button")) return;
        swipe.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = swipe.current;
        swipe.current = null;
        if (!start || count < 2) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
          show(selected + (dx < 0 ? 1 : -1));
        }
      }}
      onPointerCancel={() => {
        swipe.current = null;
      }}
    >
      {/* The media, beneath everything. Lights come on over the first 1.6s
          while it settles from 1.08 over 2.4s; the poster paints at once. */}
      <m.div className="absolute inset-0 -z-10" style={drift ? { y: mediaY } : undefined}>
        <LightsOn
          trigger="mount"
          from={1.08}
          duration={DUR.light}
          scaleDuration={2.4}
          className="size-full"
        >
          {slides.map((slide, index) => {
            const active = index === selected;
            return (
              <div
                key={index}
                role={carousel ? "group" : undefined}
                aria-roledescription={carousel ? "slide" : undefined}
                aria-label={
                  carousel ? t(dict.carousel.slideOf, { n: index + 1, total: count }) : undefined
                }
                data-active={active}
                className={cn(
                  "absolute inset-0",
                  // A 1.4s crossfade: the incoming slide fades in on top and
                  // settles from 1.04; the outgoing one stays lit beneath it
                  // until it is covered, then resets out of sight.
                  active
                    ? "z-10 scale-100 opacity-100 [transition:opacity_1.4s_var(--me-ease-inout),scale_2.4s_var(--me-ease)]"
                    : "z-0 scale-[1.04] opacity-0 [transition:opacity_0s_1.4s,scale_0s_1.4s]",
                )}
              >
                <HeroMedia
                  slide={slide}
                  index={index}
                  active={active}
                  playing={playing}
                  onEnded={advance}
                  register={(el) => {
                    videoRefs.current[index] = el;
                  }}
                />
              </div>
            );
          })}
        </LightsOn>
      </m.div>

      {/* Two veils: a strong one below for the type, a light one above for
          the header. From `lg` the lower veil eases off so the photograph
          stays lit down to its foot. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-(image:--me-veil-bottom) lg:bg-(image:--me-veil-bottom-lg)"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-(image:--me-veil-top)"
      />

      <FrameDraw trigger="mount" delay={0.3} />

      {/* The lockup: centred on tablets, in the lower half on phones (and
          at the foot of a sideways phone's single screen). From `lg` it sits
          low, leaving the space under the header to the photograph and its
          sign. */}
      <m.div
        className="container-site short:pb-36 phone-landscape:justify-end phone-landscape:pt-24 phone-landscape:pb-8 relative z-10 flex flex-1 flex-col items-center justify-end pt-36 pb-16 text-center md:justify-center md:pt-40 md:pb-12 lg:justify-end lg:pt-38 lg:pb-24"
        style={drift ? { opacity: lockupOpacity, y: lockupY } : undefined}
      >
        {lockup ? <HeroLockup slide={lockup} /> : null}
      </m.div>

      {/* Which slide is showing, for assistive tech. */}
      {carousel ? (
        <p aria-live="polite" className="sr-only">
          {t(dict.carousel.slideStatus, { n: selected + 1, total: count })}
        </p>
      ) : null}
    </section>
  );
}

/**
 * The lockup: a 40px gold hairline, the title at display size, the subline in
 * Bodoni italic, the button. Empty CMS fields render nothing at all (rule 9e).
 */
function HeroLockup({ slide }: { slide: Slide }) {
  const subline = slide.subline.trim();
  const title = slide.title.trim();
  const href = internalHref(slide.cta.href) ?? "#";

  return (
    <div className="short:gap-4 phone-landscape:gap-3 flex flex-col items-center gap-7 md:gap-9 lg:gap-6">
      {/* From `lg` the shorter hero puts the photograph's own sign just above
          the title, and the hairline would cross its lettering. */}
      <RuleDraw
        trigger="mount"
        delay={0.5}
        origin="center"
        className="bg-me-champagne phone-landscape:hidden h-px w-10 lg:hidden"
      />

      {title ? (
        <LineReveal
          as="h1"
          text={title}
          lang={autoLang(title)}
          trigger="mount"
          delay={0.6}
          stagger={0.11}
          // A sideways phone has little height, so there the title also
          // answers to the screen's height.
          className="text-display text-me-ivory phone-landscape:text-[length:min(var(--text-display),15svh)] max-w-[16ch]"
        />
      ) : null}

      <RevealGroup
        trigger="mount"
        delay={1}
        stagger={0.12}
        className="short:gap-4 phone-landscape:gap-4 flex flex-col items-center gap-9 lg:gap-6"
      >
        {subline ? (
          <RevealItem
            as="p"
            lang={autoLang(subline)}
            className={cn(
              "font-display text-me-champagne phone-landscape:max-w-[64ch] max-w-[40ch] text-[clamp(1.125rem,0.95rem+0.7vw,1.625rem)] leading-snug lg:max-w-[64ch]",
              // Bangla has no true italic, and a faked one is forbidden (§4.4).
              !isBangla(subline) && "italic",
            )}
          >
            {subline}
          </RevealItem>
        ) : null}

        {slide.cta.label ? (
          <RevealItem>
            <Button asChild variant="home-secondary">
              {isInternal(href) ? (
                <Link href={href}>{slide.cta.label}</Link>
              ) : (
                <a href={href}>{slide.cta.label}</a>
              )}
            </Button>
          </RevealItem>
        ) : null}
      </RevealGroup>
    </div>
  );
}

/**
 * Advances an image slide after `durationMs`. Hover and focus hold the clock
 * rather than restart it, so a slide never gets a fresh interval just because
 * the pointer passed over it; a new slide (`cycle`) starts it afresh.
 */
function useRotation(running: boolean, durationMs: number, cycle: number, onDone: () => void) {
  const left = useRef(durationMs);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  // Cleanups run before effects, so a held clock is banked before this resets it.
  useEffect(() => {
    left.current = durationMs;
  }, [cycle, durationMs]);
  useEffect(() => {
    if (!running) return;
    const started = performance.now();
    const timer = window.setTimeout(() => done.current(), left.current);
    return () => {
      window.clearTimeout(timer);
      left.current = Math.max(0, left.current - (performance.now() - started));
    };
  }, [running, cycle]);
}

/**
 * A slide's media, graded into the night palette (§2.4). Videos fetch nothing
 * until the largest paint has happened — the poster stands in — and they also
 * pause off-screen, when the tab is hidden, and are skipped entirely on
 * Save-Data and slow connections (design-system §9.3).
 */
function HeroMedia({
  slide,
  index,
  active,
  playing,
  onEnded,
  register,
}: {
  slide: Slide;
  index: number;
  active: boolean;
  playing: boolean;
  onEnded: () => void;
  register: (el: HTMLVideoElement | null) => void;
}) {
  const [idleReady, setIdleReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const localRef = useRef<HTMLVideoElement | null>(null);
  const variants = videoVariants(slide.videoUrl);

  useEffect(() => {
    if (!slide.videoUrl) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;

    // Save-Data and slow connections never get the video: the poster is the
    // whole experience.
    if (connection?.saveData) return;
    if (/(^|-)2g|3g/.test(connection?.effectiveType ?? "")) return;

    // Start only once the largest paint has happened, so the video never
    // competes with it. The idle callback is the fallback for browsers with no
    // LCP observer, and the timeout is the floor for a page that stays busy.
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      setIdleReady(true);
    };

    let observer: PerformanceObserver | undefined;
    if (typeof PerformanceObserver === "function") {
      try {
        observer = new PerformanceObserver(() => {
          // An LCP entry has landed; give the paint a moment to settle.
          window.setTimeout(start, 200);
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        /* not supported; the timers below still fire */
      }
    }
    const idle = window.requestIdleCallback;
    const idleId = typeof idle === "function" ? idle.call(window, start, { timeout: 3000 }) : null;
    const timer = window.setTimeout(start, 3000);

    return () => {
      observer?.disconnect();
      if (idleId !== null) window.cancelIdleCallback(idleId);
      window.clearTimeout(timer);
    };
  }, [slide.videoUrl]);

  // Load once the page has settled.
  const allowed = idleReady;

  // Off-screen and hidden-tab pausing.
  useEffect(() => {
    const video = localRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) video.pause();
      },
      { threshold: 0.1 },
    );
    observer.observe(video);
    const onVisibility = () => {
      if (document.hidden) video.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const video = localRef.current;
    if (!video || !allowed || !active || !playing) return;
    void video.play().catch(() => undefined);
  }, [allowed, active, playing]);

  if (slide.videoUrl) {
    return (
      <>
        {/* The poster is the pre-video state and the LCP element. It is a real
            frame from the clip, extracted by `pnpm media:variants`, because the
            CMS supplies none. */}
        {variants?.poster ? (
          <Image
            src={variants.poster}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover [filter:var(--me-grade)]"
          />
        ) : (
          <div aria-hidden className="bg-me-night-deep absolute inset-0" />
        )}

        <video
          ref={(el) => {
            localRef.current = el;
            register(el);
          }}
          muted
          playsInline
          // Not `loop`: the original advances the carousel when the clip ends.
          onEnded={() => {
            if (active && playing) onEnded();
          }}
          onCanPlay={() => setVideoReady(true)}
          // Nothing is fetched until `allowed`; the sources are not rendered
          // before then, so the element has nothing to load.
          preload="none"
          aria-hidden
          className={cn(
            "absolute inset-0 size-full object-cover [filter:var(--me-grade)] transition-opacity duration-[var(--dur-media)]",
            videoReady ? "opacity-100" : "opacity-0",
          )}
        >
          {allowed && variants?.mobile ? (
            <source src={variants.mobile} media={MOBILE_VIDEO_QUERY} type="video/mp4" />
          ) : null}
          {allowed ? <source src={slide.videoUrl} type="video/mp4" /> : null}
        </video>
      </>
    );
  }

  return (
    <SmartImage
      image={slide.image}
      sizes="100vw"
      ratio="auto"
      // The poster of the first slide is the largest paint; this one is
      // hidden until the carousel turns, so it waits its turn.
      priority={index === 0}
      decorative
      frameClassName="absolute inset-0 bg-me-night"
      // Anchored at the top: a screen wider than the photograph's 3:2 crops
      // its height, and centred that slides the gate's sign up under the
      // fixed header (a sideways phone, a 16:9 laptop). Taller screens crop
      // only the sides, which stay centred.
      className="size-full object-cover object-top [filter:var(--me-grade)]"
    />
  );
}
