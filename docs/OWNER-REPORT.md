# OWNER-REPORT — things only the site owner can fix or decide

Living document: every phase adds to it; the final phase (prompts/15) turns it into the plain-language handoff. Nothing here is changed in code — the new frontend renders the captured data as-is until the owner acts.

**How the site runs today.** The new frontend is self-contained: it serves a snapshot of your current content (`services/frontend/src/fixtures/` + `services/frontend/public/media/`, 139 MB of images and video copied from your server on 2026-09-29). It does not depend on the old site staying up. A **Django backend will be built later**; when it exists, the same frontend switches to it with two environment variables. `docs/API-CONTRACT.md` is the document its developer builds against, and this snapshot is what seeds its database.

## A. Decisions needed from the owner

| # | Topic | What's needed | Status |
|---|---|---|---|
| 1 | `/about_us` | ~~Decide how to handle the broken route.~~ **Decided 2026-09-29: permanent redirect (308) to `/about-us`;** no Who We Are page is built, and the WhoWeAre record stays the source of Home's "Why Buy Our Share" block. | resolved |
| 2 | Backend | ~~Laravel source & API access.~~ **Settled 2026-09-29: there is no Laravel source and no backend work in this project.** A Django backend comes later; the frontend runs on the content snapshot until then. | resolved |
| 3 | Contact form behaviour | The old server's validation rules were never captured (submitting would have created a real inquiry). The contract proposes `422 {"errors": {...}}`; Django decides the actual rules. Until then forms are inert and the site shows a "Preview — forms are not sent" bar. | for Django |
| 4 | Admin panel URL | `/admin` and `/login` return 404 on the old site. Only needed if you want a transitional deployment that still proxies it (`LEGACY_ORIGIN`). | optional |

## B. Fix in the admin panel (content)

| # | Where | Issue | Fix |
|---|---|---|---|
| 1 | Book Now | "Download Booking Form" link has no file — `href` is `https://indexecoresort.com/public/storage`. Nothing was mirrored for it, and no URL was invented. | Provide the booking-form PDF so it can be added to the snapshot / Django |
| 2 | Package pages | Gold, Platinum and Signature headings all read "Silver Ownership: N Shares" | Correct the heading field on each package |
| 3 | Top bar | Placeholder phone `01700000000` and email `info@veotech.com` | Enter the real values in General Settings |
| 4 | Project slider | Test slide "3454 / 45645645" | Delete the slide |
| 5 | Project slider | 20-share tier is labelled "ডায়মন্ড গ্রাহক" but sold as "Signature" | Rename or confirm |
| 6 | About page | Vision / Mission / Approach tabs share one identical body text; "Our Approach" repeats "Our Vision"'s heading | Enter the three distinct texts |
| 7 | Home testimonials | The only review is placeholder data ("jack sparrow / Actor", avatar hotlinked from a theme demo) | Replace with a real review and a local photo |
| 8 | Home CTA strip | Avatar hotlinked from `demo.awaikenthemes.com` | Upload a local image |
| 9 | Villa | Tab "Cottage" shows room "Executive Suite"; copy mentions "Chuti Resort Gazipur" | Correct room data |
| 10 | Gallery | "Swimming pool" category appears on Home but not on `/gallery`; "Indoor" category is empty | Review category assignments |
| 11 | Home | Hero slide 1 has empty subline/title; several typos ("Strategic Investment Locatio", "Customized SolutionsWe…", "লেজনক", "প্রেক্ষাপেট"); project name "Indexvilla.veotech" | Edit the fields |
| 12 | Events | Event #4 has no dates/times (shows "-"); breadcrumb "Home" targets `/people-leading` (a 500) | Fill the dates; the new site sends that breadcrumb to `/` |
| 13 | Footer / socials | Facebook link is the relative `www.facebook.com/indexecoresort` (broken); TikTok is `#`; top-bar socials point to `bdresellhub` accounts | Enter full URLs |
| 14 | Many CTAs | Read More, Learn More, Buy Share, Book Your Share, room/restaurant Book Now, event Booking Now, blog share links, contact hotline all go to `#` | Set real targets when ready — kept verbatim until then |
| 15 | Home hero video | The background video is **18 MB** with no smaller version in the CMS. It is too heavy to send to a phone, so on small screens the site shows a designed panel and a play button instead of autoplaying it. A web-optimised version (~720p, under 4 MB) would let it autoplay everywhere. | Re-export the clip smaller and re-upload, or let us compress it once a tool is available |
| 16 | Home hero, first slide | Slide 1 of the hero carousel has **no heading and no subtitle** in the CMS, so it shows only a button. Slide 2 carries "Index Eco Resort". | Add text to slide 1, or remove the slide |
| 17 | Floating contact dock | The WhatsApp button and the phone button both use **+8801700729312**, while the panel beside them *displays* 01711307580 and its own WhatsApp link uses **+8801711307580**. Three numbers, two of them contradicting the footer. | Decide the one correct WhatsApp number and the one correct phone number. The new site shows a single WhatsApp action using the button's own destination. |

## C. Adding a new ownership package

Ownership pages are one dynamic route driven by the package data, so **a package added in Django automatically gets its page** at whatever slug the backend gives it — no code change. Until Django exists, packages come from the snapshot, so a new one needs the snapshot refreshed.

## D. Decorative UI not rendered (rule 9d)

| Where | What | Flag |
|---|---|---|
| Event detail | "Leave a Reply" comment block — on the live site it has no form, no endpoint and no script; nothing was ever submitted | `features.eventCommentForm = false` |

## E. Content snapshot (what seeds the Django database)

`services/frontend/src/fixtures/*.json` is every piece of text, link and setting captured from your site, and `services/frontend/public/media/` is 75 files (139 MB) of images and video mirrored from it, keeping their original paths. Two things to know:

- **One image is missing from your server.** The Silver package's hero image returns 404, so that page has no hero photo. There is no copy to recover — it needs re-uploading.
- **The gallery lightbox is broken on the live site inside category tabs.** Clicking a tile under any category opens nothing (those links point at a path that 404s); the "All" tab works. The new site points them at the same image file that already works, so every tile opens correctly.

## F. For whoever builds the Django backend

Everything they need is in the repository:

| What | Where |
|---|---|
| The contract to implement | `docs/API-CONTRACT.md` — 16 endpoints, query parameters, response shapes, the contact-form payload and the error format |
| Machine-readable schemas | `docs/api-contract/*.json` (14 JSON Schemas). The frontend validates every response against these, so a mismatch fails loudly |
| Data to seed the database | `services/frontend/src/fixtures/*.json` — every text, link and setting captured from the current site |
| Media to import | `services/frontend/public/media/` — 75 files, 139 MB, original paths preserved |

Three rules that matter: the existing URLs must keep working (slugs come from the API), text must not be "cleaned up" on the way through (the typos are real data the admin panel should fix), and links that currently go nowhere must keep going nowhere.

When it is ready, the frontend switches over by setting `DATA_SOURCE=api`, `API_BASE_URL` and `MEDIA_BASE_URL` — no code change.

## G. Server / hosting

| # | Item | Status |
|---|---|---|
| 1 | `APP_DEBUG=true` on production leaked stack traces, server paths and Blade source on every 404/500 | Owner reported switching it off on 2026-09-29 — verify after cut-over |
| 2 | Deployment: a Vercel **preview** now (snapshot content, forms inert), production cut-over once Django is ready | planned |
| 3 | No `sitemap.xml` / `robots.txt` on the live site | the new site adds both |
