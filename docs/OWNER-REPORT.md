# OWNER-REPORT — things only the site owner can fix or decide

Living document: every phase adds to it; the final phase (prompts/15) turns it into the plain-language handoff. Nothing here is changed in code — the new frontend renders the live data as-is until the owner acts.

## A. Decisions needed from the owner

| # | Topic | What's needed | Status |
|---|---|---|---|
| 1 | `/about_us` | ~~Decide how to handle the broken route.~~ **Decided 2026-09-29: permanent redirect (308) to `/about-us`;** no Who We Are page is built, and the WhoWeAre record stays the source of Home's "Why Buy Our Share" block. | resolved |
| 2 | Laravel source & API | Location of the source; permission to add read-only `/api/v1/*` and a form proxy endpoint. Until then the site runs on Phase 0 fixtures. | open |
| 3 | Contact page form rules | Server-side validation rules and the post-submit behavior of `/contact-form/submit` for the page form (not tested live to avoid creating a real inquiry). | open |
| 4 | Admin panel URL | `/admin` and `/login` return 404. | open |

## B. Fix in the admin panel (content)

| # | Where | Issue | Fix |
|---|---|---|---|
| 1 | Book Now | "Download Booking Form" link has no file — `href` is `https://indexecoresort.com/public/storage` | Upload the booking-form PDF in the Book Now page settings |
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

## C. Adding a new ownership package needs a code change

Ownership pages are four static routes (`/gold-ownership-2`, `/platinum-ownership-3`, `/signature-ownership-4`, `/silver-ownership-5`) that share one template. A root-level dynamic route was ruled out because it would swallow the Laravel fallback for every unknown URL — unknown paths would hit a Next.js 404 instead of reaching your existing site.

**What this means for you:** if you add a fifth package in the admin panel, the new site has no page for it and Laravel serves it **in the old design** until a developer adds a route folder (a one-line file). Nothing breaks and nothing 404s. `tests/parity/ownership-routes.spec.ts` fails as soon as package data contains a slug with no route folder, so this is caught in CI rather than noticed by a visitor.

Tell us if you plan to add or rename packages and we will wire the route up in the same release.

## D. Decorative UI not rendered (rule 9d)

| Where | What | Flag |
|---|---|---|
| Event detail | "Leave a Reply" comment block — on the live site it has no form, no endpoint and no script; nothing was ever submitted | `features.eventCommentForm = false` |

## E. Server / hosting

| # | Item | Status |
|---|---|---|
| 1 | `APP_DEBUG=true` on production leaked stack traces, server paths and Blade source on every 404/500 | Owner reported switching it off on 2026-09-29 — verify after cut-over |
| 2 | Laravel moves to a subdomain (e.g. `cms.indexecoresort.com`); Next.js takes the apex domain with fallback rewrites | planned |
| 3 | No `sitemap.xml` / `robots.txt` on the live site | the new site adds both |
