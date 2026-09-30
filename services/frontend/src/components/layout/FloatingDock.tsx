"use client";

import { Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { useRoutePathname } from "@/components/i18n/LocaleProvider";
import type { SiteSettings } from "@/lib/data";
import { anchorProps } from "@/lib/links";
import { cn } from "@/lib/utils";
import { useContactModal } from "./ContactModalProvider";

/**
 * The three persistent contact actions (design-system §8).
 *
 * PARITY: every href is exactly what the live site uses, and they disagree with
 * each other — the WhatsApp button and the phone button both use
 * +8801700729312 while the panel *displays* 01711307580. That is real and is
 * listed in docs/OWNER-REPORT.md §B for the backend's settings.
 */
export function FloatingDock({ settings }: { settings: SiteSettings }) {
  const dock = settings.floatingDock;
  const pathname = useRoutePathname();
  const { openModal } = useContactModal();
  const [hidden, setHidden] = useState(false);

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

  return (
    <div
      data-testid="floating-dock"
      aria-hidden={isHidden}
      className={cn(
        "on-dark fixed right-4 z-40 transition-opacity duration-[var(--dur-ui)]",
        // Desktop: a vertical pill centred on the right edge.
        "lg:top-1/2 lg:right-6 lg:-translate-y-1/2",
        // Mobile: stacked buttons bottom-right, clear of the home indicator.
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        isHidden && "pointer-events-none opacity-0",
      )}
    >
      <ul
        className={cn(
          "bg-chrome-dock/94 border-chrome-dock-rule rounded-pill flex flex-col gap-1 border p-1.5 backdrop-blur-[10px]",
        )}
      >
        <li>
          <DockButton
            label={settings.contactModal.title}
            onClick={(event) => openModal(event.currentTarget)}
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
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
