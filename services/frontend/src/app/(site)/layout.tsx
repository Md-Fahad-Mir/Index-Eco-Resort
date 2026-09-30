import type { ReactNode } from "react";
import { ContactModal } from "@/components/layout/ContactModal";
import { ContactModalProvider } from "@/components/layout/ContactModalProvider";
import { FloatingDock } from "@/components/layout/FloatingDock";
import { Footer } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteMain } from "@/components/layout/SiteMain";
import { SkipLink } from "@/components/layout/SkipLink";
import { getPackages, getSettings } from "@/lib/data";

/**
 * The chrome every public page shares. The header overlays each page's hero, so
 * `main` starts at the top of the viewport rather than below the header.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, packages] = await Promise.all([getSettings(), getPackages()]);

  return (
    <ContactModalProvider>
      <SkipLink />
      <SiteHeader settings={settings} packages={packages} />
      <SiteMain>{children}</SiteMain>
      <Footer settings={settings} />
      <FloatingDock settings={settings} />
      <ContactModal settings={settings.contactModal} />
    </ContactModalProvider>
  );
}
