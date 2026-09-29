"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import Image from "next/image";
import { SmartImage } from "@/components/media/SmartImage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref, isInternal } from "@/lib/links";
import { cn } from "@/lib/utils";
import { MOBILE_VIDEO_QUERY, videoVariants } from "@/lib/media";
import Link from "next/link";

type Slide = HomeData["hero"]["slides"][number];

/**
 * The hero, reproducing the live site's two-slide carousel (audit §11.1): the
 * settings video first, then the banner image, rotating every 6s — except that
 * the video slide advances when the video ends, as the original's JS does.
 *
 * Accessibility the original lacks: one control that pauses both the rotation
 * and the video (WCAG 2.2.2), autoplay that stops on hover and keyboard focus,
 * and no autoplay at all under reduced motion.
 *
 * The single `<h1>` lives on the slide that has a title. Inactive slides are
 * only translated out of view — never `aria-hidden` or `display:none` — so the
 * heading stays in the accessibility tree whichever slide is showing.
 */
export function HeroCarousel({ hero }: { hero: HomeData["hero"] }) {
  const reduced = useReducedMotionSafe();
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, duration: 30 });
  const [selected, setSelected] = useState(0);
  // Under reduced motion nothing rotates and nothing plays until asked.
  const [playing, setPlaying] = useState(!reduced);
  const [interacting, setInteracting] = useState(false);
  // A press of the control opts in to loading media that autoplay declined.
  const [userRequested, setUserRequested] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const slides = hero.slides;
  const titleIndex = slides.findIndex((s) => s.title.trim());

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    onSelect();
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  const advance = useCallback(() => embla?.scrollNext(), [embla]);

  // Rotation. The video slide is excluded: it advances on `ended` instead, so a
  // clip longer than the interval is not cut off — matching the original.
  useEffect(() => {
    if (!embla || !playing || interacting || reduced) return;
    if (slides[selected]?.kind === "video") return;
    const timer = window.setTimeout(advance, hero.autoplayMs);
    return () => window.clearTimeout(timer);
  }, [embla, playing, interacting, reduced, selected, slides, hero.autoplayMs, advance]);

  // Only the active slide's video plays; the others are reset.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === selected && playing && !reduced) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
        if (index !== selected) video.currentTime = 0;
      }
    });
  }, [selected, playing, reduced]);

  const toggle = () => {
    setUserRequested(true);
    setPlaying((previous) => !previous);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      className="on-dark bg-canopy-deep relative min-h-[max(640px,100svh)] overflow-hidden"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={() => setInteracting(false)}
    >
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full min-h-[max(640px,100svh)]">
          {slides.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              className="relative h-full min-h-[max(640px,100svh)] min-w-0 shrink-0 grow-0 basis-full"
            >
              <HeroMedia
                slide={slide}
                index={index}
                active={index === selected}
                reduced={reduced}
                playing={playing}
                userRequested={userRequested}
                onEnded={advance}
                register={(el) => {
                  videoRefs.current[index] = el;
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,rgb(12_33_22/0.85),rgb(12_33_22/0.15)_55%,rgb(12_33_22/0.45))]"
              />
              <Container className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-6 pb-[clamp(5rem,12vh,9rem)]">
                <HeroText slide={slide} isTitleSlide={index === titleIndex} />
              </Container>
            </div>
          ))}
        </div>
      </div>

      {/* Controls sit above the slides, not inside them. */}
      {/* Clear of the highlights panel, which overlaps the hero by 64px from
          `lg` up and would otherwise swallow clicks on the pause control. */}
      <Container className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between pb-8 lg:pb-28">
        <span aria-hidden className="hidden lg:block" />
        <div className="pointer-events-auto flex items-center gap-4">
          <ScrollCue />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            className="border-hairline-dark bg-canopy/60 text-mist hover:bg-mist hover:text-canopy rounded-pill grid size-11 place-items-center border backdrop-blur-sm transition-colors duration-[var(--dur-micro)]"
          >
            {playing ? (
              <Pause aria-hidden className="size-4 fill-current" strokeWidth={1.5} />
            ) : (
              <Play aria-hidden className="size-4 translate-x-px fill-current" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </Container>

      {/* Which slide is showing, for assistive tech. */}
      <p aria-live="polite" className="sr-only">
        Slide {selected + 1} of {slides.length}
      </p>
    </section>
  );
}

/** Text for one slide. Empty CMS fields render nothing at all (rule 9e). */
function HeroText({ slide, isTitleSlide }: { slide: Slide; isTitleSlide: boolean }) {
  const subline = slide.subline.trim();
  const title = slide.title.trim();
  const href = internalHref(slide.cta.href) ?? "#";

  return (
    <>
      {subline ? (
        <p lang={autoLang(subline)} className="text-mist/80 text-small max-w-[46ch]">
          {subline}
        </p>
      ) : null}

      {title ? (
        isTitleSlide ? (
          // The page's one entrance animation.
          <h1 lang={autoLang(title)} className="text-display text-mist">
            <MaskedLines lines={[title]} />
          </h1>
        ) : (
          <p lang={autoLang(title)} className="text-display text-mist">
            {title}
          </p>
        )
      ) : null}

      {slide.cta.label ? (
        <Button asChild variant="on-dark">
          {isInternal(href) ? (
            <Link href={href}>{slide.cta.label}</Link>
          ) : (
            <a href={href}>{slide.cta.label}</a>
          )}
        </Button>
      ) : null}
    </>
  );
}

/**
 * A slide's background. Videos are muted, fetch nothing until the browser is
 * idle — a patterned panel stands in, since the CMS supplies no poster — and
 * they
 * also pause off-screen, when the tab is hidden, and are skipped entirely on
 * Save-Data (design-system §9.3).
 */
function HeroMedia({
  slide,
  index,
  active,
  reduced,
  playing,
  userRequested,
  onEnded,
  register,
}: {
  slide: Slide;
  index: number;
  active: boolean;
  reduced: boolean;
  playing: boolean;
  userRequested: boolean;
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
    // whole experience, and the play control fetches it on request.
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

  // Load because the page has settled, or because the visitor pressed play.
  const allowed = idleReady || userRequested;

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
    if (!video || !allowed || !active || !playing || reduced) return;
    void video.play().catch(() => undefined);
  }, [allowed, active, playing, reduced]);

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
            className="object-cover"
          />
        ) : (
          <div aria-hidden className="bg-canopy-deep absolute inset-0">
            <div className="absolute inset-0 [background-image:url('/patterns/leaf-vein.svg')] [background-size:360px_360px] opacity-[0.13]" />
          </div>
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
            if (active && playing && !reduced) onEnded();
          }}
          onCanPlay={() => setVideoReady(true)}
          // Nothing is fetched until `allowed`; the sources are not rendered
          // before then, so the element has nothing to load.
          preload="none"
          aria-hidden
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-[var(--dur-media)]",
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
      // The first image in the hero is the largest thing above the fold.
      priority={index <= 1}
      decorative
      frameClassName="absolute inset-0"
      className="size-full object-cover [filter:saturate(.92)_contrast(1.02)]"
    />
  );
}

/** A thin rule that draws downward, hinting there is more below. */
function ScrollCue() {
  return (
    <span aria-hidden className="hidden items-center gap-3 lg:flex">
      <span className="text-mist/60 text-label">Scroll</span>
      <span className="bg-mist/30 relative block h-10 w-px overflow-hidden">
        <span className="bg-brass absolute inset-x-0 top-0 h-4 animate-[scroll-cue_2.4s_ease-in-out_infinite]" />
      </span>
    </span>
  );
}
