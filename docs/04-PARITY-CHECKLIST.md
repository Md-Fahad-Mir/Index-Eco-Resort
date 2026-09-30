# 04 — Parity Checklist

> Updated after Phase 0 (2026-09-29). Items marked *(allowed diff)* follow CLAUDE.md rule 9 and must appear in `tests/parity/allowed-diffs.ts`.

Tick an item only after testing it on the new site at 390px and 1440px. "Same" = same content, same destination, same behavior (not same look).

## Global
- [ ] Top bar: phone, email, social links — same text and hrefs
- [ ] Logo links to `/`
- [ ] Desktop nav: 7 items + Ownership Packages dropdown with 4 links, same hrefs
- [ ] Active page is indicated
- [ ] Book Now → `/book-now`
- [ ] Mobile menu: same items and hrefs as the original, except About → `/about-us` *(allowed diff: live `/about_us` returns 500)*; nested packages, Call Now → `tel:09638657301`
- [ ] Floating dock: Contact Us opens modal; WhatsApp and Phone hrefs identical to original
- [ ] Contact modal: same fields, same required rules, submits to the same backend logic, shows "Message sent successfully!"
- [ ] Page hero titles and breadcrumb texts/hrefs same on every inner page — except Events breadcrumb "Home" → `/` *(allowed diff: live `/people-leading` is a 500)*
- [ ] Footer: description, 5 social links, Quick Links (4), Ownership Packages (4), phone/email/hours, WhatsApp link, bottom bar texts
- [ ] With `LEGACY_ORIGIN` set, unknown paths and `/admin`, `/public/storage/*` reach it (skipped when unset — the frontend is self-contained)
- [ ] Exactly one non-empty `<h1>` on every page (rule 9e)

## Home `/`
- [ ] Hero carousel: the same 2 slides in the same order (video, then image), same autoplay timing as live (6000 ms), video muted with poster before load, visible pause/play control; slide 1's empty CMS subline/title not rendered (rule 9e)
- [ ] Hero subline, title, Read More (`#`)
- [ ] 3 highlights with CMS icons, texts, Read More links
- [ ] About: 3 images, video modal opens/plays/closes, texts, 2 features, Learn More, "Call Us 24/7" number
- [ ] Project at a glance: all 9 facts; slider with all slides and captions, prev/next, position indicator
- [ ] Gallery: all categories, filtering matches original counts ("All" = 12 on Home, category tabs = full sets — `audit/interactions.md §4`), lightbox opens the full image from **every** tab *(allowed diff: the live category-tab links 404)*
- [ ] CTA strip: avatar, text, Buy Share
- [ ] Choose Your Plan: 4 cards in data order, each links to its package page
- [ ] Why buy: title, 4 features, image
- [ ] Villa: both tabs, each room's images (slider + lightbox), paragraphs, all amenities, Book Now
- [ ] Restaurant: texts, Book Now, image
- [ ] Testimonials: all items, stars, avatar, name, role
- [ ] Latest posts: same posts, links to `/blog-details/{slug}`

## About `/about-us` and `/about_us`
- [x] `/about-us` renders; `/about_us` returns a permanent redirect (308) to `/about-us` *(allowed diff: live `/about_us` returns 500)*
- [x] About block incl. video modal — the same component Home uses, with the derived poster
- [x] Choose Your Plan — the same `PlansStage`, 4 packages in data order
- [x] Vision / Mission / Approach tabs with full texts and images; kickers rendered as stored, labels with spaces produce valid `aria-controls` ids, arrow keys move between tabs
- [x] 6 core values with texts, in the CMS's order, tones alternating at every width

## Package pages (Gold, Platinum, Signature, Silver)
- [x] Hero image + title + breadcrumb per package — Silver's hero 404s on the live site, so it gets the designed canopy panel (OWNER-REPORT §E)
- [x] Heading text exactly as data (including the "Silver Ownership" label issue) — asserted per package
- [x] Discount line, Book Your Share (`#` or data href) — the captured `#` kept verbatim (rule 9b)
- [x] Card image — large on a mist plinth, tilt for fine pointers, sweep on touch, static under reduced motion
- [x] 9 benefits — two columns from 768px, one on a phone
- [x] YouTube video (same ID) plays — each id asserted against `audit/html/<slug>.html`; the iframe is created only on click
- [x] Choose Your Plan grid, current package indicated — captured order per page, `aria-current="page"` + brass ring

## Offer `/offer`
- [ ] Hero "Offers" + "Running Offer" breadcrumb
- [ ] Bangla headline, lead, body, terms note, poster

## Book Now `/book-now`
- [ ] Hero "Running Offer" + "Book Now" breadcrumb
- [ ] Bangla paragraph (upright), Download Booking Form button with the URL and `download` attribute from data (today: no file path → listed in OWNER-REPORT, rule 9f)

## Events `/event`
- [ ] All events in original order
- [ ] Date-from, date-to, category filters produce the same results as the original for the same inputs (same params `start_date`/`end_date`/`category_id`, dates shown and sent as `d-m-Y`, same one-date-without-category guard)
- [ ] Card: image, date badge, category tag (+ link), title, excerpt, time, location, Event details link → `/events/{slug}` — also after filtering *(allowed diff: live AJAX cards link to `/event-details/{id}`, a 404)*
- [ ] No pagination (verified); empty state text `No Events Found!`

## Event detail `/events/{slug}`
- [ ] Banner, date/time, description
- [ ] Event Information: start, end, time, location, category, Booking Now
- [ ] "Leave a Reply" block **not rendered** (`features.eventCommentForm = false`, rule 9d) and listed in OWNER-REPORT
- [ ] Related events as data provides (live renders an empty grid; nothing invented)

## Blogs `/blogs` and `/blog-details/{slug}`
- [ ] List: all posts, same links; no pagination (verified)
- [ ] Detail: the post's own title as `<h1>` (rule 9e — the live page has none), image, meta (category, date/time, comments label, read time), full body formatting, tags, share links (same hrefs, `#`)
- [ ] Sidebar: recent posts (numbered), categories with counts and links, CTA box + link

## Gallery `/gallery`
- [ ] All items, all categories, filter + lightbox, CTA strip

## Contact `/contact`
- [ ] Form: Full Name*, Mobile Number*, Email Address, Present Address*, Your Message; same validation; submits; success/error feedback
- [ ] Google Map embed same place
- [ ] Hotline number + href (`#` verbatim, rule 9b)
- [ ] Two info cards with same texts

## Quality gates
- [ ] Link-diff and form-diff tests pass (only differences listed in `tests/parity/allowed-diffs.ts`, each with a reason)
- [ ] axe: no serious/critical issues on any route
- [ ] Lighthouse budgets met (see architecture §8)
- [ ] Keyboard-only walkthrough of every page
- [ ] Reduced-motion walkthrough
- [ ] 320px width, 200% zoom: no horizontal scroll
- [ ] Bangla rendering check: no broken conjuncts, no faux italics, no tracking on Bangla

## Removed after Phase 0

- Announcement bar / marquee — not reproducible on the live site (audit §11.1); out of scope.
- Event comment form submission — no backend exists; block is not rendered (rule 9d).
- Blog / event pagination — none exists.
