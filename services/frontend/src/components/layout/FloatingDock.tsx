"use client";

import { Mail, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { useDictionary, useRoutePathname } from "@/components/i18n/LocaleProvider";
import type { SiteSettings } from "@/lib/data";
import { anchorProps } from "@/lib/links";
import { cn } from "@/lib/utils";
import { useContactModal } from "./ContactModalProvider";

/**
 * The three persistent contact actions (design-system §8), folded behind one
 * message button in the bottom-right corner; clicking it fans them out above.
 */
export function FloatingDock({ settings }: { settings: SiteSettings }) {
  const dock = settings.floatingDock;
  const t = useDictionary();
  const pathname = useRoutePathname();
  const { openModal } = useContactModal();
  const [hidden, setHidden] = useState(false);
  // The path it was opened on rather than a boolean, so navigating away folds
  // it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // On the contact page the dock would sit over the form's submit button, so it
  // steps aside while the form is in view. Elsewhere there is nothing to watch,
  // and `onContact` already makes the dock visible without touching state.
  const onContact = pathname === "/contact";

  useEffect(() => {
    if (!onContact) return;
    const form = document.querySelector("form");
    if (!form) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(Boolean(entry?.isIntersecting)),
      { threshold: 0.15 },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [onContact]);

  const isHidden = onContact && hidden;
  const expanded = openOn === pathname && !isHidden;

  // While open, a press anywhere else or Escape folds it back.
  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenOn(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenOn(null);
      toggleRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  return (
    <div
      ref={rootRef}
      data-testid="floating-dock"
      aria-hidden={isHidden}
      className={cn(
        "on-dark fixed right-4 z-40 flex flex-col-reverse items-center gap-2 lg:right-6",
        "transition-opacity duration-[var(--dur-ui)]",
        // Clear of the home indicator on phones.
        "bottom-[max(1rem,env(safe-area-inset-bottom))] lg:bottom-6",
        isHidden && "pointer-events-none opacity-0",
      )}
    >
      {/* First in the DOM so it leads the tab order; drawn below the list. */}
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-label={expanded ? t.chrome.closeContactOptions : t.chrome.openContactOptions}
        onClick={() => setOpenOn(expanded ? null : pathname)}
        className="group bg-chrome-dock/94 border-chrome-dock-rule rounded-pill border p-1.5 backdrop-blur-[10px]"
      >
        <span
          className={cn(
            "text-chrome-dock-icon group-hover:bg-chrome-control-hover group-hover:text-chrome-control-hover-fg",
            "rounded-pill grid size-11 place-items-center transition-colors duration-[var(--dur-micro)] lg:size-13",
          )}
        >
          <MessageCircle
            aria-hidden
            strokeWidth={1.5}
            className={cn(
              "col-start-1 row-start-1 size-5 transition-[opacity,rotate,scale] duration-[var(--dur-ui)]",
              expanded && "scale-50 rotate-90 opacity-0",
            )}
          />
          <X
            aria-hidden
            strokeWidth={1.5}
            className={cn(
              "col-start-1 row-start-1 size-5 transition-[opacity,rotate,scale] duration-[var(--dur-ui)]",
              !expanded && "scale-50 -rotate-90 opacity-0",
            )}
          />
        </span>
      </button>

      <ul
        id={listId}
        className={cn(
          "bg-chrome-dock/94 border-chrome-dock-rule rounded-pill flex flex-col gap-1 border p-1.5 backdrop-blur-[10px]",
          "origin-bottom transition-[opacity,translate,scale,visibility] duration-[var(--dur-ui)]",
          // `invisible` also takes the folded buttons out of the tab order.
          !expanded && "pointer-events-none invisible translate-y-3 scale-90 opacity-0",
        )}
      >
        <li>
          <DockButton
            label={settings.contactModal.title}
            onClick={() => {
              setOpenOn(null);
              // The mail button is about to fold away, so the dialog hands focus
              // back to the toggle instead.
              openModal(toggleRef.current);
            }}
          >
            <Mail aria-hidden className="size-5" strokeWidth={1.5} />
          </DockButton>
        </li>
        <li>
          <DockLink label={dock.whatsappButton.label} href={dock.whatsappButton.href ?? "#"}>
            <SocialIcon network="whatsapp" className="size-5" />
          </DockLink>
        </li>
        <li>
          {/* PARITY: displays one number, dials another. */}
          <DockLink
            label={`${dock.phoneButton.label} ${dock.panelPhone.label}`}
            href={dock.phoneButton.href ?? "#"}
          >
            <Phone aria-hidden className="size-5" strokeWidth={1.5} />
          </DockLink>
        </li>
      </ul>
    </div>
  );
}

const DOCK_ITEM =
  "group text-chrome-dock-icon hover:bg-chrome-control-hover hover:text-chrome-control-hover-fg " +
  "relative grid size-11 place-items-center " +
  "rounded-pill transition-colors duration-[var(--dur-micro)] lg:size-13";

/**
 * The label appears to the left on hover and focus, tooltip-style. A theme can
 * make it slide out as well, through --chrome-dock-label-shift (0 by default).
 */
function DockLabel({ children }: { children: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-chrome-dock-label text-chrome-dock-label-fg text-label pointer-events-none absolute right-[calc(100%+0.5rem)] hidden",
        "rounded-pill px-3 py-1.5 whitespace-nowrap opacity-0 transition-[opacity,translate] duration-[var(--dur-micro)]",
        "translate-x-(--chrome-dock-label-shift) group-hover:translate-x-0 group-focus-visible:translate-x-0",
        "group-hover:opacity-100 group-focus-visible:opacity-100 lg:block",
      )}
    >
      {children}
    </span>
  );
}

function DockButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={DOCK_ITEM}>
      {children}
      <DockLabel>{label}</DockLabel>
    </button>
  );
}

function DockLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} aria-label={label} className={DOCK_ITEM} {...anchorProps(href)}>
      {children}
      <DockLabel>{label}</DockLabel>
    </a>
  );
}
