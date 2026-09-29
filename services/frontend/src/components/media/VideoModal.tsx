"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useEffect, useRef } from "react";

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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  /** Accessible name for the dialog. */
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (open) {
      video.currentTime = 0;
      void video.play().catch(() => {
        /* autoplay can be refused; the controls remain usable */
      });
    } else {
      video.pause();
    }
  }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bg-canopy-deep/90 data-[state=open]:animate-in data-[state=open]:fade-in fixed inset-0 z-50" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,1100px)] -translate-x-1/2 -translate-y-1/2 outline-none">
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <div className="rounded-media relative overflow-hidden bg-black">
            <video ref={videoRef} controls playsInline className="aspect-video w-full" src={src} />
          </div>
          <DialogPrimitive.Close
            aria-label="Close video"
            className="on-dark rounded-pill border-hairline-dark text-mist hover:bg-mist hover:text-canopy absolute -top-14 right-0 inline-grid size-12 place-items-center border transition-colors"
          >
            <X aria-hidden className="size-5" strokeWidth={1.5} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
