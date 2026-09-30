"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { Accordion, Dialog } from "radix-ui";
import { useState } from "react";
import { SocialIcon, socialLabel } from "@/components/brand/SocialIcon";
import Link from "@/components/i18n/Link";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/data";
import { anchorProps, internalHref, isActiveRoute, isInternal } from "@/lib/links";
import { cn } from "@/lib/utils";

/**
 * The mobile menu: a full-height sheet from the right. Radix Dialog gives it a
 * focus trap, Escape and focus return to the trigger — none of which the live
 * site's `classList.toggle` menu has.
 */
export function MobileNav({ settings, pathname }: { settings: SiteSettings; pathname: string }) {
  const [open, setOpen] = useState(false);
  const dict = useDictionary();
  // Closing on click rather than on a pathname change keeps this out of an
  // effect, and it also closes for same-page links.
  const close = () => setOpen(false);

  const callNow = settings.mobileCallNow;
  const bookNow = internalHref(settings.bookNow.href) ?? "#";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={dict.chrome.openMenu}
        className="text-chrome-text on-dark grid size-11 place-items-center lg:hidden"
      >
        <Menu aria-hidden className="size-6" strokeWidth={1.5} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="bg-chrome-overlay/70 data-[state=open]:animate-in data-[state=open]:fade-in fixed inset-0 z-60 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            "bg-chrome-sheet on-dark fixed inset-y-0 right-0 z-60 flex w-[min(22rem,88vw)] flex-col",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-450",
          )}
        >
          <Dialog.Title className="sr-only">{dict.chrome.menu}</Dialog.Title>

          <div className="border-chrome-hairline flex items-center justify-between border-b px-6 py-5">
            <span className="text-chrome-text/70 text-label font-semibold">{dict.chrome.menu}</span>
            <Dialog.Close
              aria-label={dict.chrome.closeMenu}
              className="text-chrome-text hover:bg-chrome-control-hover hover:text-chrome-control-hover-fg rounded-pill grid size-11 place-items-center transition-colors"
            >
              <X aria-hidden className="size-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>

          <nav
            data-region="mobile-nav"
            aria-label={dict.chrome.mobileNav}
            className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6"
          >
            <ul className="divide-chrome-hairline divide-y">
              {settings.mobileNav.map((item) => {
                const active = isActiveRoute(item.href, pathname, item.children);

                if (item.children?.length) {
                  return (
                    <li key={item.label}>
                      <Accordion.Root
                        type="single"
                        collapsible
                        defaultValue={active ? item.label : undefined}
                      >
                        <Accordion.Item value={item.label}>
                          <Accordion.Trigger
                            className={cn(
                              "group font-display flex w-full items-center justify-between gap-3 py-5 text-(length:--chrome-sheet-link-size)",
                              active ? "text-chrome-accent" : "text-chrome-text",
                            )}
                          >
                            {item.label}
                            <ChevronDown
                              aria-hidden
                              strokeWidth={1.5}
                              className="size-5 shrink-0 transition-transform duration-[var(--dur-ui)] group-data-[state=open]:rotate-180"
                            />
                          </Accordion.Trigger>
                          <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                            <ul className="flex flex-col gap-1 pb-5 pl-4">
                              {item.children.map((child) => (
                                <li key={child.label}>
                                  <MobileLink
                                    href={child.href}
                                    pathname={pathname}
                                    onNavigate={close}
                                    className="text-chrome-text/85 text-body block py-2"
                                  >
                                    {child.label}
                                  </MobileLink>
                                </li>
                              ))}
                            </ul>
                          </Accordion.Content>
                        </Accordion.Item>
                      </Accordion.Root>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <MobileLink
                      href={item.href}
                      pathname={pathname}
                      onNavigate={close}
                      className={cn(
                        "font-display block py-5 text-(length:--chrome-sheet-link-size)",
                        active ? "text-chrome-accent" : "text-chrome-text",
                      )}
                    >
                      {item.label}
                    </MobileLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            data-region="mobile-nav"
            className="border-chrome-hairline flex flex-col gap-3 border-t px-6 pt-5"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex gap-3">
              {/* PARITY: Call Now dials a third number, different from the top bar and footer. */}
              <Button asChild variant="chrome-primary" className="flex-1">
                <a href={callNow.href ?? "#"}>{callNow.label}</a>
              </Button>
              <Button asChild variant="chrome-secondary" className="flex-1">
                <Link href={bookNow}>{settings.bookNow.label}</Link>
              </Button>
            </div>
            <ul className="flex items-center gap-1 pt-1">
              {settings.footer.socials.map((social) => (
                <li key={`${social.network}-${social.href}`}>
                  <a
                    href={social.href}
                    aria-label={socialLabel(social.network)}
                    className="text-chrome-text/80 hover:bg-chrome-social-hover hover:text-chrome-social-hover-fg rounded-pill grid size-10 place-items-center transition-colors"
                    {...anchorProps(social.href, social.target)}
                  >
                    <SocialIcon network={social.network} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * PARITY (rule 9c): the live mobile "About Us" points at /about_us, which
 * returns 500. `next.config` redirects that path, and the link itself targets
 * the working page — recorded in tests/parity/allowed-diffs.ts.
 */
function MobileLink({
  href,
  pathname,
  onNavigate,
  className,
  children,
}: {
  href: string | null;
  pathname: string;
  onNavigate: () => void;
  className?: string;
  children: string;
}) {
  const resolved = internalHref(href) ?? "#";
  const target = resolved === "/about_us" ? "/about-us" : resolved;
  const current = isActiveRoute(href, pathname) ? "page" : undefined;

  if (isInternal(target)) {
    return (
      <Link href={target} aria-current={current} onClick={onNavigate} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={target}
      aria-current={current}
      onClick={onNavigate}
      className={className}
      {...anchorProps(target)}
    >
      {children}
    </a>
  );
}
