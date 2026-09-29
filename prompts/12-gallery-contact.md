# Phase 11 — Gallery `/gallery` and Contact `/contact`

## Gallery (audit §5.10, data: `getGallery()`)

1. `PageHero` "Gallery".
2. Reuse `GallerySection` with **all** items: 20 in "All", the 7 tabs the live `/gallery` has (the "Swimming pool" tab exists only on Home and "Indoor" is empty on both — reproduce, per `audit/interactions.md §4`); no duplicates to remove (Phase 0). Filter chips scroll horizontally on mobile with edge fades; lightbox with captions, counter, swipe, keyboard, zoom.
3. Reuse `CtaStrip`.

## Contact (audit §5.11, data: `getContactPage()`)

1. `PageHero` "Contact Us".
2. **ContactSplit** on `canopy`: form (cols 1–6) using `ContactForm` with the page's fields (Full Name*, Mobile Number*, Email Address, Present Address*, Your Message — names/types from `audit/forms.json`). Phase 0: this form has **no client-side `required`** and `phone` is `type=number`, unlike the modal, and it posts normally to `/contact-form/submit`; keep the `*` markers as displayed, mirror the live client-side rules (do not invent stricter ones), and post through `/api/forms/contact`. The server-side rules are an open question for the owner, dark field style (design-system §8 Form fields), Submit as on-dark button; map (cols 7–12) as a lazy-loaded iframe with the original embed URL, radius 4, `title` attribute for a11y, same height as the form column on desktop, 4:3 on mobile.
3. **HotlineBand:** label, 64px ring icon, number in Tiro `h1` scale, href verbatim (`#` today — rule 9b).
4. **InfoCards:** two `paper` cards with hairline, lichen icon ring (location / building), texts verbatim, centered.
5. The floating dock hides while the form is in view (already built in Phase 4 — verify here).

## Acceptance criteria

- Gallery counts per category equal the original.
- Contact form: required-field errors announced, payload keys equal original, success/error states work in mock and (if available) against the API.
- Screenshots at 390/768/1440.

Stop and report.
