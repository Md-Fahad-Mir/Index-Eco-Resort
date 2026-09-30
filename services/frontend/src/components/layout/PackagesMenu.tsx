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
              onDark ? "text-chrome-text/90 hover:text-chrome-text" : "text-ink hover:text-index",
              active && (onDark ? "text-chrome-text" : "text-index"),
            )}
          >
            {label}
            <ChevronDown
              aria-hidden
              strokeWidth={1.5}
              className="size-4 transition-transform duration-[var(--dur-ui)] group-data-[state=open]:rotate-180"
            />
            {active && (
              <span aria-hidden className="bg-chrome-accent absolute inset-x-0 -bottom-0.5 h-px" />
            )}
          </Nav.Trigger>

          <Nav.Content className="data-[state=open]:animate-in data-[state=open]:fade-in absolute top-full left-0 z-50 pt-4">
            <ul className="bg-chrome-panel border-chrome-panel-border w-[320px] rounded-(--chrome-panel-radius) border p-2 shadow-(--chrome-panel-shadow)">
              {items.map((item) => {
                const href = internalHref(item.href) ?? "#";
                const isCurrent = isActiveRoute(item.href, pathname);
                return (
                  // Rows are divided by an inset rule, not a border, so a theme can
                  // draw one without moving anything (transparent by default).
                  <li
                    key={item.label}
                    className="[&+&]:shadow-[inset_0_1px_0_var(--chrome-panel-rule)]"
                  >
                    <Nav.Link asChild>
                      <Link
                        href={href}
                        aria-current={isCurrent ? "page" : undefined}
                        className={cn(
                          "group/row hover:bg-chrome-panel-hover flex items-center gap-4 rounded-(--chrome-panel-row-radius) p-2 transition-colors duration-[var(--dur-micro)]",
                          isCurrent && "bg-chrome-panel-hover",
                        )}
                      >
                        <SmartImage
                          image={cardFor(item.href)}
                          sizes="72px"
                          ratio="card-face"
                          decorative
                          frameClassName="w-[72px] shrink-0 rounded-[4px]"
                        />
                        <span className="text-chrome-panel-text font-(family-name:--chrome-panel-font) text-(length:--chrome-panel-size)">
                          {item.label}
                        </span>
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
