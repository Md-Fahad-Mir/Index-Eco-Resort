"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useCallback } from "react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { MOBILE_VIDEO_QUERY, videoVariants } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Canopy (the About page) or Midnight Estate (Home, docs/02 §13). */
const SKIN = {
  default: {
    overlay: "bg-canopy-deep/90 data-[state=open]:animate-in data-[state=open]:fade-in",
    content: "",
    frame: "rounded-media",
    close: "rounded-pill border-hairline-dark text-mist hover:bg-mist hover:text-canopy border",
  },
  // A night room at 96%, the film in a square champagne-hairline frame that
  // settles from .96 as it opens; the close control squares off to match.
  home: {
    overlay:
      "bg-me-night-deep/96 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:duration-500",
    content:
      "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-96 data-[state=open]:duration-700 data-[state=open]:ease-(--me-ease)",
    frame: "shadow-[0_0_0_1px_var(--me-frame),var(--shadow-me-deep)]",
    close:
      "text-me-ivory hover:bg-me-champagne hover:text-me-night shadow-[inset_0_0_0_1px_var(--me-frame)]",
  },
} as const;

/**
 * The About block's mp4 in a dialog (§8). Plays on open, pauses and unloads on
 * close, Esc closes and focus returns to the trigger — all of which the live
 * site's inline `style.display` modal does not do.
 */
export function VideoModal({
  open,
  onOpenChange,
  src,
  title,
  variant = "default",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  /** Accessible name for the dialog. */
  title: string;
  variant?: keyof typeof SKIN;
}) {
  const dict = useDictionary();
  const variants = videoVariants(src);
  const skin = SKIN[variant];

  // Radix mounts the content — and so a fresh <video> — only once the dialog
  // is open, and its Portal a render after that, so an effect keyed on `open`
  // finds no element. Start playback as the element attaches instead: that is
  // still inside the click's task, so the browser lets it play with sound.
  // Closing unmounts the element, which stops it.
  const playOnMount = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.play().catch(() => {
      // Sound refused: play muted rather than sit on the poster.
      video.muted = true;
      void video.play().catch(() => {
        /* autoplay refused outright; the controls remain usable */
      });
    });
  }, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={cn(skin.overlay, "fixed inset-0 z-50")} />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[min(92vw,1100px)] -translate-x-1/2 -translate-y-1/2 outline-none",
            skin.content,
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <div className={cn(skin.frame, "relative overflow-hidden bg-black")}>
            <video
              ref={playOnMount}
              controls
              playsInline
              // The poster is a real frame from the clip; the CMS has none, so
              // without it the dialog opens on a black rectangle.
              poster={variants?.poster ?? undefined}
              preload="none"
              className="aspect-video w-full"
            >
              {variants?.mobile ? (
                <source src={variants.mobile} media={MOBILE_VIDEO_QUERY} type="video/mp4" />
              ) : null}
              <source src={src} type="video/mp4" />
            </video>
          </div>
          <DialogPrimitive.Close
            aria-label={dict.media.closeVideo}
            className={cn(
              "on-dark absolute -top-14 right-0 inline-grid size-12 place-items-center transition-colors",
              skin.close,
            )}
          >
            <X aria-hidden className="size-5" strokeWidth={1.5} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
