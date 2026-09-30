"use client";

import { useEffect, useState } from "react";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import Link from "@/components/i18n/Link";
import { useDictionary, useRoutePathname } from "@/components/i18n/LocaleProvider";
import { SmartImage } from "@/components/media/SmartImage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { PackageSummary, SiteSettings } from "@/lib/data";
import { internalHref, isActiveRoute, isInternal } from "@/lib/links";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { PackagesMenu } from "./PackagesMenu";
import { TopBar } from "./TopBar";

/**
 * The header sits over every page's hero. At the top it is transparent with a
 * gradient behind it for legibility over any photograph; past 24px it becomes
 * solid with a blur and loses the top bar. Colours come from the chrome tokens
 * (globals.css), so a theme scope restyles it without a branch here.
 *
 * Height changes from 88 to 72, but the header is fixed and the hero sizes
 * itself, so nothing below it moves — no layout shift.
 */
export function SiteHeader({
  settings,
  packages,
}: {
  settings: SiteSettings;
  packages: PackageSummary[];
}) {
  const pathname = useRoutePathname();
  const dict = useDictionary();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bookNowHref = internalHref(settings.bookNow.href) ?? "#";

  return (
    <header
      data-solid={solid}
      className={cn(
        "on-dark fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300",
        solid
          ? "bg-chrome-header-solid/92 shadow-[inset_0_-1px_0_var(--chrome-header-rule)] backdrop-blur-[12px] backdrop-saturate-150"
          : "bg-transparent",
      )}
    >
      {/* Gradient scrim: keeps white chrome readable over a bright photo. */}
      {!solid && (
        <div
          aria-hidden
          className="from-chrome-scrim/70 pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent"
        />
      )}

      <div className={cn("relative transition-all duration-300", solid && "lg:-mt-11")}>
        <TopBar settings={settings} />

        <Container
          data-region="header"
          className={cn(
            "flex items-center justify-between gap-6 transition-all duration-300",
            solid ? "h-[72px]" : "h-[88px]",
          )}
        >
          <Link href="/" className="flex shrink-0 items-center" aria-label={settings.siteName}>
            <SmartImage
              image={settings.logo}
              sizes="180px"
              ratio="auto"
              priority
              frameClassName="w-[clamp(120px,14vw,168px)] bg-transparent"
              className="h-auto w-full object-contain"
            />
          </Link>

          <nav data-region="header" aria-label={dict.chrome.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {settings.nav.map((item) =>
                item.children?.length ? (
                  <li key={item.label}>
                    <PackagesMenu
                      label={item.label}
                      items={item.children}
                      packages={packages}
                      pathname={pathname}
                      onDark
                    />
                  </li>
                ) : (
                  <li key={item.label}>
                    <NavLink href={item.href} pathname={pathname} label={item.label} />
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            <LanguageSwitch />
            {/* Its two states follow the header's data-solid (globals.css). */}
            <Button asChild variant="chrome-cta" className="hidden h-11 px-6 lg:inline-flex">
              <Link href={bookNowHref}>{settings.bookNow.label}</Link>
            </Button>
            <MobileNav settings={settings} pathname={pathname} />
          </div>
        </Container>
      </div>
    </header>
  );
}

function NavLink({
  href,
  pathname,
  label,
}: {
  href: string | null;
  pathname: string;
  label: string;
}) {
  const target = internalHref(href) ?? "#";
  const active = isActiveRoute(href, pathname);
  const className = cn(
    "text-small relative inline-block py-2 font-medium transition-colors duration-[var(--dur-micro)]",
    active ? "text-chrome-text" : "text-chrome-text/85 hover:text-chrome-text",
  );
  const underline = active && (
    <span aria-hidden className="bg-chrome-accent absolute inset-x-0 -bottom-0.5 h-px" />
  );

  if (isInternal(target)) {
    return (
      <Link href={target} aria-current={active ? "page" : undefined} className={className}>
        {label}
        {underline}
      </Link>
    );
  }
  return (
    <a href={target} aria-current={active ? "page" : undefined} className={className}>
      {label}
      {underline}
    </a>
  );
}
