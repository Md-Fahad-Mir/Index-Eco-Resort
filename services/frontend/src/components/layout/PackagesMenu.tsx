"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { NavigationMenu as Nav } from "radix-ui";
import { SmartImage } from "@/components/media/SmartImage";
import type { PackageSummary } from "@/lib/data";
import { internalHref, isActiveRoute } from "@/lib/links";
import { cn } from "@/lib/utils";

/**
 * The "Ownership Packages" dropdown (design-system §8): a paper panel showing
 * each package's real card image beside its name. Radix handles hover intent,
 * keyboard and focus; the 150ms delay keeps it from flickering on a pass-by.
 *
 * PARITY: the trigger has no href of its own on the live site, so it is a
 * button here rather than a link to nowhere.
 */
export function PackagesMenu({
  label,
  items,
  packages,
  pathname,
  onDark,
}: {
  label: string;
  items: { label: string; href: string | null }[];
  packages: PackageSummary[];
  pathname: string;
  onDark: boolean;
}) {
  const active = isActiveRoute(null, pathname, items);
  const cardFor = (href: string | null) => {
    const path = internalHref(href) ?? "";
    return packages.find((p) => `/${p.slug}` === path)?.card ?? null;
  };

  return (
    <Nav.Root delayDuration={150} className="relative">
      <Nav.List className="flex">
        <Nav.Item>
          <Nav.Trigger
            className={cn(
              "group text-small relative inline-flex cursor-pointer items-center gap-1.5 py-2 font-medium transition-colors duration-[var(--dur-micro)]",
              onDark ? "text-mist/90 hover:text-mist" : "text-ink hover:text-index",
              active && (onDark ? "text-mist" : "text-index"),
            )}
          >
            {label}
            <ChevronDown
              aria-hidden
              strokeWidth={1.5}
              className="size-4 transition-transform duration-[var(--dur-ui)] group-data-[state=open]:rotate-180"
            />
            {active && (
              <span aria-hidden className="bg-brass absolute inset-x-0 -bottom-0.5 h-px" />
            )}
          </Nav.Trigger>

          <Nav.Content className="data-[state=open]:animate-in data-[state=open]:fade-in absolute top-full left-0 z-50 pt-4">
            <ul className="bg-paper border-hairline rounded-panel shadow-float w-[320px] border p-2">
              {items.map((item) => {
                const href = internalHref(item.href) ?? "#";
                const isCurrent = isActiveRoute(item.href, pathname);
                return (
                  <li key={item.label}>
                    <Nav.Link asChild>
                      <Link
                        href={href}
                        aria-current={isCurrent ? "page" : undefined}
                        className={cn(
                          "group/row hover:bg-lichen-soft flex items-center gap-4 rounded-[10px] p-2 transition-colors duration-[var(--dur-micro)]",
                          isCurrent && "bg-lichen-soft",
                        )}
                      >
                        <SmartImage
                          image={cardFor(item.href)}
                          sizes="72px"
                          ratio="card-face"
                          decorative
                          frameClassName="w-[72px] shrink-0 rounded-[4px]"
                        />
                        <span className="font-display text-ink text-[1.0625rem]">{item.label}</span>
                      </Link>
                    </Nav.Link>
                  </li>
                );
              })}
            </ul>
          </Nav.Content>
        </Nav.Item>
      </Nav.List>
    </Nav.Root>
  );
}
