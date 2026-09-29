# Phase 4 — Global layout

**Goal:** the chrome every page shares, pixel-careful and fully accessible. Specs: design-system §8 (Header, Packages dropdown, Mobile nav, Floating dock, Contact modal, PageHero, Breadcrumb, Footer). The Announcement bar is out of scope — Phase 0 found no marquee on the live site. Data: `getSettings()`.

## Build

1. `app/layout.tsx`: fonts, globals, `MotionProvider`, Sonner toaster, skip link to `#main`.
2. `(site)/layout.tsx` composing: `TopBar` → `SiteHeader` → `<main id="main">` → `Footer`; plus `FloatingDock` and `ContactModal` (one instance, opened via context).
3. **TopBar:** phone + email with icons — plain text, not links, exactly as live (`// PARITY:`); social icon buttons (local SVGs). Collapses when the header becomes solid.
4. **SiteHeader:** transparent over heroes, solid `canopy` with blur after 24px scroll, height 88→72. Nav items from `settings.nav`; active state from pathname (Ownership Packages active on any package route). Book Now uses on-dark style over hero, primary style when solid.
5. **PackagesMenu:** Radix NavigationMenu dropdown with card thumbnails (from `getPackages()`), hover-intent delay 150ms, keyboard support.
6. **MobileNav:** Sheet from right; items from `settings.mobileNav`, except the About item, which points at `/about-us` (allowed diff, rule 9c: the live `/about_us` returns 500); packages accordion; Call Now (`settings.mobileCallNow`) and Book Now buttons; socials; closes on navigation; focus trap and return.
7. **FloatingDock:** desktop vertical pill with sliding labels; mobile stacked 44px buttons bottom-right with safe-area inset. Contact opens the modal; WhatsApp/Phone use the **exact** hrefs from settings (`// PARITY:`). Hide on `/contact` while the form is in viewport.
8. **ContactModal:** Radix Dialog; `ContactForm` with the Phase 0 fields; posts to `/api/forms/contact` (route handler proxy per architecture §6; mocked success in `DATA_SOURCE=mock`); success state with drawn check + original success text.
9. **PageHero + Breadcrumbs:** photo with overlays, breadcrumb above bottom-left title, entrance motion (hero scale + masked lines), breadcrumb hrefs from data — except the Events breadcrumb "Home", which goes to `/` (allowed diff: live `/people-leading` is a 500).
10. **Footer:** per spec, all links from data (including the relative/broken Facebook href and the href-less credit link, `// PARITY:`), bottom bar texts verbatim.
11. Temporary placeholder pages for every route so the chrome can be tested everywhere. No `/about_us` route folder — `next.config` redirects it.

## Acceptance criteria

- Link-parity test (`services/frontend/tests/parity/links.spec.ts`, baseline `../../audit/links.json`) passes for regions `topbar`, `header`, `mobile-nav`, `dock`, `footer` on every route.
- Contact modal: keyboard open/close, focus return, validation matches `audit/forms.json`, success state shown.
- Header readable over light and dark hero images; no CLS when it changes state.
- axe clean; screenshots at 390/768/1440 for Home and one inner page.

Stop and report.
