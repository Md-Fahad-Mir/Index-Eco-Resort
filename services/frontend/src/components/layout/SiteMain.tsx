"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Routes that wear a theme other than Canopy & Brass. Home is the Midnight
 * Estate pilot (prompts/06b-home-redesign.md); the rollout to other routes, if
 * approved, is one more entry here.
 */
const THEME_BY_ROUTE: Record<string, "midnight"> = { "/": "midnight" };

/**
 * The page's `<main>`. It carries the route's theme as `data-theme`, and
 * `html:has(main[data-theme="midnight"])` in src/styles/midnight.css re-points
 * the chrome tokens — so the header, footer, dock and even portalled dialogs
 * follow, and client navigation reverts them with the attribute.
 */
export function SiteMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <main id="main" className="flex-1" data-theme={THEME_BY_ROUTE[pathname]}>
      {children}
    </main>
  );
}
