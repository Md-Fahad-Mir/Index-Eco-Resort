"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { SmartImage } from "@/components/media/SmartImage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { HomeData } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref, isInternal } from "@/lib/links";
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
  const localRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!slide.videoUrl) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;

    // The CMS clip is 18MB and offers no smaller variant. Pushing that to a
    // phone costs the visitor real money and saturates the connection —
    // measured at 3.6MB transferred and LCP 4.7s on throttled mobile. So it
    // autoplays only where there is room for it; elsewhere the patterned panel
    // stands in and the play control fetches it on request.
    const narrow = window.matchMedia("(max-width: 1023px)").matches;
    const slow = /(^|-)2g|3g/.test(connection?.effectiveType ?? "");
    if (connection?.saveData || narrow || slow) return;

    const start = () => setIdleReady(true);
    const idle = window.requestIdleCallback;
    if (typeof idle === "function") {
      const id = idle.call(window, start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(start, 1200);
    return () => window.clearTimeout(timer);
  }, [slide.videoUrl]);

  // Load either because the browser went idle with bandwidth to spare, or
  // because the visitor pressed play. Derived, so no effect writes state.
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
        {/* Painted immediately, so the hero is never an empty box and the LCP
            element is cheap. Same treatment as a missing page-hero image. */}
        <div aria-hidden className="bg-canopy-deep absolute inset-0">
          <div className="absolute inset-0 [background-image:url('/patterns/leaf-vein.svg')] [background-size:360px_360px] opacity-[0.13]" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_100%,rgb(176_141_87/0.16),transparent_70%)]" />
        </div>
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
          // The CMS provides no poster and the clip is 18MB, so fetching any of
          // it up front made the video's first frame the LCP element — 7.7s on
          // throttled mobile. Nothing is fetched until the browser is idle; the
          // patterned panel behind stands in until then, and the video fades over
          // it once it can actually play.
          preload="none"
          aria-hidden
          onCanPlay={(event) => event.currentTarget.classList.remove("opacity-0")}
          className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-[var(--dur-media)]"
          {...(allowed ? { src: slide.videoUrl } : {})}
        />
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
