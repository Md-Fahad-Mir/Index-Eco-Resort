"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { cn } from "@/lib/utils";

/**
 * The hero's looping video (§9.3). It starts only after first paint, pauses when
 * off-screen or when the tab is hidden, is skipped on Save-Data, and always
 * offers a visible pause/play control — WCAG 2.2.2, which the live site fails.
 */
export function BackgroundVideo({
  src,
  poster,
  className,
  label,
}: {
  src: string;
  /** Shown before the video loads; this is the LCP element. */
  poster?: string;
  className?: string;
  label?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dict = useDictionary();
  const reduced = useReducedMotionSafe();
  // Under reduced motion or Save-Data the video never auto-starts.
  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (connection?.saveData) return;
    // Start once the browser is idle, so the video never competes with LCP.
    const start = () => setEnabled(true);
    const idle = window.requestIdleCallback;
    if (typeof idle === "function") {
      const id = idle.call(window, start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(start, 1200);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  // Pause off-screen and when the tab is hidden; resume only if the visitor
  // has not explicitly paused.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    void video.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!video.dataset.userPaused) void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(video);

    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (!video.dataset.userPaused) void video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      delete video.dataset.userPaused;
      void video.play().then(() => setPlaying(true));
    } else {
      video.dataset.userPaused = "true";
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        aria-label={label ?? dict.media.backgroundVideo}
        className="size-full object-cover"
        {...(enabled ? { src } : {})}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? dict.media.pauseBackgroundVideo : dict.media.playBackgroundVideo}
        className="on-dark rounded-pill border-hairline-dark bg-canopy/60 text-mist hover:bg-mist hover:text-canopy absolute right-6 bottom-6 z-10 inline-grid size-11 place-items-center border backdrop-blur-sm transition-colors duration-[var(--dur-micro)]"
      >
        {playing ? (
          <Pause aria-hidden className="size-4 fill-current" strokeWidth={1.5} />
        ) : (
          <Play aria-hidden className="size-4 translate-x-px fill-current" strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}
