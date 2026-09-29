# 01 — Site Audit (current indexecoresort.com)

Compiled from full-page screenshots of every page plus a crawl of the live HTML (Sept 2026). Phase 0 must verify and extend this document with anything a crawl reveals that screenshots cannot (form actions, AJAX endpoints, JS behavior, pagination).

---

## 1. What the site is for

- **Business:** INDEX Eco Resort — an eco resort project (Gazipur; content also references Kuakata and Cox's Bazar) that sells **ownership shares** in four packages, and also hosts stays, dining and events.
- **Audience:** Bangladeshi investors and families (mostly mobile), corporate and private event clients. Content is bilingual: English UI, lots of Bangla marketing copy.
- **Primary conversions (in priority order):** share purchase inquiry (Book Now / Book Your Share / Buy Share), phone call, WhatsApp chat, contact form, booking-form PDF download, event booking inquiry.

## 2. Current technology (for coexistence planning)

- Laravel + Blade templates (`meta csrf-token` on every page, media under `/public/storage/images/...`, some under `/public/images/...`).
- Admin panel manages: general settings (logo, hero video, contact info), about block, project facilities slider, gallery (with categories), ownership packages, why-buy block, rooms, restaurant block, testimonials (reviews), blogs, events (with categories), offers, book-now page.
- A site-wide **Contact Form modal** submits via AJAX and shows "✓ Message sent successfully!".
- Event detail has a **comment form** ("Leave a Reply" → "Post Comment").
- Some images are hotlinked from a WordPress theme demo (`demo.awaikenthemes.com`) — see §9.

## 3. Route map (URLs are frozen)

| Path | Page | Notes |
|---|---|---|
| `/` | Home | Background video hero |
| `/about-us` | About | Desktop nav target |
| `/about_us` | 308 → `/about-us` | Mobile menu target — **Phase 0: a separate Laravel route (`who.we.are`) that returns 500; not an alias. Decision: permanent redirect to `/about-us`; no Who We Are page is built (rule 9c).** |
| `/gold-ownership-2` | Package: Gold | Pattern `{slug}-{id}` |
| `/platinum-ownership-3` | Package: Platinum | |
| `/signature-ownership-4` | Package: Signature | |
| `/silver-ownership-5` | Package: Silver | |
| `/offer` | Offers ("Running Offer" breadcrumb) | |
| `/event` | Events list with filters | Singular path for the list |
| `/events/{slug}` | Event detail | e.g. `/events/annual-corporate-summit-2026-2` |
| `/blogs` | Blog list | |
| `/blog-details/{slug}` | Blog detail | e.g. `/blog-details/sustainable-living-eco-friendly-home-features-1` |
| `/gallery` | Gallery | Footer "Quick Links" only |
| `/contact` | Contact | |
| `/book-now` | Book Now ("Running Offer" hero) | Header CTA target |
| anything else | Laravel (admin, storage, PDFs, APIs) | Proxied, see architecture |

## 4. Global chrome (on every page)

### 4.1 Top bar (desktop)
- Left: phone `01700000000` (icon), email `info@veotech.com` (icon).
- Right: three social icon buttons (Facebook, X, YouTube in screenshots; crawl shows facebook/instagram/youtube URLs for bdresellhub). Render whatever the settings data provides.

### 4.2 Header
- Logo (INDEXER) → `/`.
- Nav: Home, About, **Ownership Packages ▾** (Gold, Platinum, Signature, Silver), Offer, Events, Blog, Contact Us.
- Active item is highlighted (green text + underline).
- Right: **Book Now** button → `/book-now`.
- Header sits transparently over the page hero.

### 4.3 Mobile menu (separate markup in the crawl)
- Links: Home, About Us (`/about_us`), Ownership Packages (4 children), Offers, Events, Blog, Contact Us.
- **Call Now** button → `tel:09638657301`.

### 4.4 Floating contact dock (right edge, all pages)
- **Contact Us** (envelope) → opens the Contact Form modal.
- **WhatsApp** → `https://web.whatsapp.com/send?phone=+8801700729312`.
- **Phone** → `tel:+8801700729312`.
- A second WhatsApp link `https://wa.me/+8801711307580` and a phone link showing `01711307580` but dialing `tel:+8801700729312` also exist in markup. Keep all values exactly (see §8).

### 4.5 Contact Form modal
- Title "Contact Form", close ✕, fields (verify in Phase 0), **Submit**, success message "✓ Message sent successfully!".

### 4.6 Announcement marquee — **not reproducible in Phase 0 (no marquee exists); removed from scope**
- On `/book-now` a scrolling Bangla notice ("অফারটি সীমিত সংখ্যক শেয়ারের জন্য প্রযোজ্য") overlaps the nav. Keep the notice; fix only its placement (it becomes a slim announcement bar below the header). Verify in Phase 0 on which pages it appears and whether its text comes from settings.

### 4.7 Page hero (all inner pages)
- Full-width photo, dark overlay, centered title (e.g. "About Us", "Gold Ownership", "Events"), breadcrumb `Home / {Current}`.
- Breadcrumb Home link targets differ per page (`/`, `#`, `/people-leading` on Events) — preserve.

### 4.8 Footer
- Column 1: logo, company description paragraph, social buttons (Facebook, Twitter/X, LinkedIn, Instagram, TikTok).
- **Quick Links:** Offer, Events, Gallery, Blog.
- **Ownership Packages:** Gold, Platinum, Signature, Silver.
- **Contact Us:** Phone `01711307580` (`tel:01711307580`), Email `info@indexecoresort.com`, Working Hours `10:00AM To 06:00PM`.
- Bottom bar (green): `indexecoresort.com` / `© 2026 All Rights Reserved.` — right: `Designed & Developed by indexecoresort.com`.

---

## 5. Page inventories

### 5.1 Home `/`

| # | Section | Content | Behavior |
|---|---|---|---|
| 1 | Hero | **Phase 0: a 2-slide carousel** — slide 1: background video (settings) with *empty* subline/H1 in the CMS; slide 2: image with subline "IndexVilla – Smart Property Buying, Selling & Rental Platform", H1 "Index Eco Resort"; each slide has a **READ MORE** button (`#`) | Owl autoplay 6000 ms; video plays once (JS sets `loop=false`) then advances; see §11 |
| 2 | Highlights | 3 items with CMS icon image, title, subtitle, "Read More" (`#`): *Located in a Prime Location in Gazipur* / *All Facilities in One Place* / *Index Eco Resort* | — |
| 3 | About | 3-image collage, **play button** → video modal (mp4), eyebrow "About Us", H2 "Bringing Innovation and Heart to Every Detail", paragraph, two feature rows (icon, title, text): *Customized Solutions*, *Quality Meets Commitment*; **Learn More** (`#`); "Call Us 24/7 **01711307580**" | Video modal with close ✖ |
| 4 | Project at a glance | Eyebrow, H2 "We Offer Best Features", 9 label/value facts (Project Name, Location, Built Over, Tower Type, Room Type, Dining, Recreation, Event Spaces, Sustainability) + **image slider** of promo slides with Bangla captions | Slider: prev/next arrows + dots |
| 5 | Gallery | Eyebrow "Our Gallery", H2 "Explore the Gallery", category filter (All + 7 categories), image grid (12 visible in screenshot) | Filter tabs; each tile links to the full image (lightbox) |
| 6 | CTA strip | Avatar + "Don't miss this opportunity. One time Investment lifetime halal income." + **Buy Share** (`#`) | — |
| 7 | Ownership packages | Eyebrow, H2 "Choose Your Plan", 4 card images (Gold, Platinum, Signature, Silver) with names | Each links to its package page |
| 8 | Why buy our share | Dark section, H2 "Why investing in our shares ensures value and growth", 4 features (icon, title, text), tall building image | — |
| 9 | Villa / rooms | Eyebrow "Villa", H2 "All you need to know about this", tabs (**Family Cottage**, **Cottage**), each tab: image slider (3 images, lightbox links), room name, 2 paragraphs, amenities grid (label + value), **Book Now** (`#`) | Tabs + slider + lightbox |
| 10 | Restaurant | Eyebrow "Dine With Us", H2 "Restaurant", paragraph, **Book Now** (`#`), image | — |
| 11 | Testimonials | Eyebrow, H2 "What Our Clients Say", cards: 5 stars, quote, avatar, name, role | Likely carousel (verify) |
| 12 | Latest posts | Eyebrow, H2 "Stay Informed With Our Latest Posts", post cards (image, title, excerpt, Read More → `/blog-details/{slug}`) | — |

### 5.2 About `/about-us` (+ `/about_us`)
1. Page hero "About Us".
2. About block (same component as Home §3, including video modal).
3. Ownership packages "Choose Your Plan" (same as Home §7, different card order — render data order).
4. Vision/Mission: eyebrow "Vision Mission", H2 "Creating Spaces That Inspire And Endure", tabs **Our Vision / Our Mission / Our Approach**; each tab: small label (e.g. "// OUR VISION"), H3 (e.g. "Building Communities, Inspiring Growth"), long paragraph, image.
5. Core values: H2 "Our Core Values", intro line, 6 tiles in a checkerboard of sage and near-black: Continuous Improvement, Teamwork & Passion, Sustainability Focus, Prime Location, World-Class Amenities, Exceptional Service (title + one sentence each).

### 5.3 Ownership package pages (×4, same template)
1. Page hero with package-specific background image, title = package name.
2. Intro: heading `💳 {label}: {n} Shares`, discount line (e.g. "10% discount on purchasing 5 (five) shares in cash"), **Book Your Share** (`#`), membership card image on a light panel.
3. **Ownership Benefits**: 9-item checklist (Luxurious Suite … This ownership is transferable) + **YouTube embed** (per package).
4. "Choose Your Plan" (all 4 packages; order varies per page — render data order).

| Package | Shares | Discount (cash) | YouTube (from crawl/screens) |
|---|---|---|---|
| Silver | 3 | 7% | Krishibid Group 25 years video |
| Gold | 5 | 10% | KPL Plabon video |
| Platinum | 10 | 12% | "Relaxing Music…" video |
| Signature | 20 | 15% | `youtube.com/embed/nftc2Vk4o_A` |

### 5.4 Offer `/offer`
1. Page hero "Offers", breadcrumb "Running Offer".
2. Bangla H2 headline (৫০,০০০ টাকায় বুকিং … ৩ দিন ৪ রাত …).
3. Offer panel (cream background, gold border): Bangla lead paragraph, Bangla body paragraph, "*শর্ত প্রযোজ্য" note, portrait promo poster image.

### 5.5 Book Now `/book-now`
1. Announcement marquee (Bangla) — see §4.6.
2. Page hero "Running Offer", breadcrumb "Book Now".
3. Green panel: Bangla paragraph (currently shown in faux-italic) + **DOWNLOAD BOOKING FORM** button (file icon) → PDF.

### 5.6 Events list `/event`
1. Page hero "Events".
2. Filter bar: **Choose Date** (from), **Choose Date** (to), **All Categories** select (All, 2026 BUSINESS CONFERENCE, Wedding & Reception, Corporate Events & Conferences, Birthday Parties & Family Celebrations).
3. Event cards (3-col grid): image, date badge (day + "MON YYYY"), category tag (links to the event), title, excerpt, time range (raw `HH:MM:SS - HH:MM:SS`), location, **Event details** link.
4. Verify in Phase 0: how filtering works (query string vs client-side), pagination, empty state.

### 5.7 Event detail `/events/{slug}`
1. Banner image.
2. Date + time line, description body.
3. **Leave a Reply** block: note "Your email address will not be published. Required fields are marked *", fields Name / Email / Website / Comment, "Save my name, email, and website in this browser…" checkbox (checked), **Post Comment**. **Phase 0: decorative only — no form, no endpoint, no JS. Not rendered in the new site (`features.eventCommentForm=false`).**
4. Sidebar "Event Information": Start date, End date, Time, Location, Category, **Booking Now** (`#`).
5. "Explore Related Events".

### 5.8 Blog list `/blogs`
1. Page hero "Blogs".
2. Post cards (image, title, excerpt, **Read More**). **Phase 0: no pagination.**

### 5.9 Blog detail `/blog-details/{slug}`
1. Featured image.
2. Meta: category, date + time, comments count ("No Comments"), read time ("৫ মিনিট পড়ুন").
3. Rich body (H2/H3, bold, lists) — mostly Bangla.
4. Tags line, "শেয়ার করুন:" share links (currently `#`).
5. Sidebar: **Recent Posts** (numbered), **Categories** (event categories with counts → `/event`), CTA box "বিনিয়োগে আগ্রহী?" + text + "আজই যোগাযোগ করুন →".
6. Verify: comment form on blog detail.

### 5.10 Gallery `/gallery`
1. Page hero "Gallery".
2. Full gallery section (same as Home §5, all items).
3. CTA strip (same as Home §6).

### 5.11 Contact `/contact`
1. Page hero "Contact Us".
2. Dark section: form — **Full Name*** , **Mobile Number*** , **Email Address**, **Present Address*** , **Your Message** (textarea), **SUBMIT**; Google Maps embed (Colombia Super Market, 31 Mohakhali C/A, Dhaka 1213).
3. **Hotline** band: phone icon + `01711307580`.
4. Two info cards: location icon + "indexecoresort.com believes in building lifelong partnerships…"; building icon + "Choose your dream apartment from our wide array of ongoing and upcoming projects."

---

## 6. Data entities (derived)

`SiteSettings`, `NavItem`, `PageHero`, `Highlight`, `AboutBlock`, `ProjectFacts` + `FacilitySlide`, `GalleryCategory` + `GalleryItem`, `CtaStrip`, `OwnershipPackage`, `WhyBuyBlock`, `Room` (+ `Amenity`), `RestaurantBlock`, `Testimonial`, `Post`, `PostCategory`/`Tag`, `EventItem` + `EventCategory`, `Comment`, `Offer`, `BookNowPage`, `AboutPage` (vision/mission/approach tabs, core values), `ContactPage` (hotline, map embed, info cards). Typed contract in `docs/03-ARCHITECTURE.md §5`.

## 7. Interaction inventory

| Interaction | Where | Must keep |
|---|---|---|
| Dropdown menu | Header "Ownership Packages" | Hover + keyboard open, 4 links |
| Mobile menu | All pages | Toggle, nested packages, Call Now |
| Sticky/transparent header | All pages | Readable over hero and on scroll |
| Floating dock | All pages | 3 actions with exact hrefs |
| Contact modal (AJAX) | All pages | Same fields, same endpoint, success message |
| Hero carousel | Home hero | **Phase 0: 2 slides (video, image), autoplay 6000 ms**, video muted; new build adds a pause control |
| Video modal (mp4) | Home/About "About" block | Open, play, close |
| Promo image slider | Home "Project at a glance" | Prev/next, dots, captions |
| Gallery filter + lightbox | Home, Gallery | Category filtering, full image view |
| Room tabs + slider + lightbox | Home "Villa" | Tab switch, slide, full image |
| Testimonials | Home | Carousel if multiple (verify) |
| Vision/Mission tabs | About | 3 tabs |
| YouTube embed | Package pages | Playable video |
| Event filters | `/event` | Date range + category — **Phase 0: AJAX `GET /events/filter` (`start_date`, `end_date`, `category_id`, `d-m-Y`)** |
| Comment form | Event detail | **Phase 0: decorative, no endpoint; not rendered (feature flag)** |
| Contact form | `/contact` | Same fields, required rules, endpoint |
| PDF download | `/book-now` | Same file URL |
| Maps embed | `/contact` | Same place |
| ~~Marquee~~ | — | **Phase 0: does not exist** |

## 8. Contact endpoints as found (preserve verbatim)

| Location | Visible text | Actual href |
|---|---|---|
| Top bar phone | 01700000000 | verify |
| Top bar email | info@veotech.com | verify |
| About block phone | 01711307580 | `#` |
| Mobile menu | Call Now | `tel:09638657301` |
| Footer phone | 01711307580 | `tel:01711307580` |
| Footer WhatsApp | — | `https://wa.me/+8801711307580` |
| Floating WhatsApp | WhatsApp | `https://web.whatsapp.com/send?phone=+8801700729312` |
| Floating phone | Phone / 01711307580 | `tel:+8801700729312` |
| Contact page hotline | 01711307580 | verify |

## 9. Known content & UX issues — preserve in code, report to owner

These come from data or templates. The new frontend renders them as-is and lists them in `docs/PROGRESS.md` for the owner to fix in the admin panel.

1. Package intro headings all read "Silver Ownership: N Shares" (Gold/Platinum/Signature pages included).
2. Top bar shows placeholder phone `01700000000` and `info@veotech.com`; footer shows `01711307580` / `info@indexecoresort.com`.
3. Phone/WhatsApp numbers differ between visible text and hrefs (see §8); mobile "Call Now" dials a third number.
4. Social links point to `bdresellhub` accounts; footer Facebook link is relative (`indexecoresort.com/www.facebook.com/indexecoresort`) and therefore broken; TikTok is `#`.
5. Many CTAs point to `#`: hero Read More, highlight Read More, Learn More, Buy Share, Book Your Share, room Book Now, restaurant Book Now, event Booking Now, blog share links.
6. Events breadcrumb "Home" links to `/people-leading`.
7. Project facilities slider includes a test slide captioned "3454 45645645".
8. Testimonial avatar and a "why choose" image are hotlinked from `demo.awaikenthemes.com` (licensing + availability risk).
9. Room tab labelled "Cottage" shows "Executive Suite"; room copy mentions "Chuti Resort Gazipur".
10. Typos: "Strategic Investment Locatio"; blog title "লেজনক" / "প্রেক্ষাপেট"; "Customized SolutionsWe create…".
11. Project name reads "Indexvilla.veotech"; hero subline mentions "IndexVilla – Smart Property Buying, Selling & Rental Platform".
12. Event times shown raw (`20:51:00 - 17:54:00`), one event has time "-".
13. Contact info cards talk about "dream apartment"/"dream home"; core values mention "beachfront setting in Kuakata" while location is Gazipur.
14. ~~Gallery markup renders items twice (once from `/public/storage/images/...`, once from `/public/images/...`).~~ **Not reproducible in Phase 0**: every image uses one path; the repetition is Bootstrap tab panes (the set is rendered once per pane). Nothing to deduplicate.
15. Blog "Categories" sidebar lists event categories and links to `/event`.

## 10. Unknowns Phase 0 must resolve

- Exact field names, `action`, method and AJAX endpoint of: contact modal form, contact page form, event comment form (and blog comment form if any).
- Validation rules (required, max length, phone format) — from HTML attributes, JS and, if the Laravel source is available, `FormRequest`/controller rules.
- What happens after submit (redirect, flash message, email notification).
- Gallery filter mechanism and how many items Home shows vs `/gallery`.
- Event filter mechanism (query params? names?), sorting, pagination; Blog pagination.
- Testimonials: carousel or static; count.
- Booking form PDF URL; marquee source and pages.
- Whether a JSON API already exists (`/api/*`).
- Page `<title>`/meta tags per page (currently "indexecoresort.com" everywhere).

---

# 11. Verified in Phase 0 (crawl of 19 routes, Sept 2026)

Everything in this section was read from the live HTML/JS captured in `audit/`.
Where it contradicts §1–§10 above, **this section wins**. Full detail in
`audit/interactions.md` and `audit/backend.md`.

## 11.1 Corrections to the sections above

| § | Said | Verified |
|---|---|---|
| 3 / arch §3 | `/about_us` is an alias of `/about-us` | **A separate route** (`who.we.are` → `HomeController@whoWeAre`, view `who_we_are.blade.php`) that returns **HTTP 500**. The mobile menu points here, so mobile "About Us" is broken today. Its `WhoWeAre` row holds Home's "Why Buy Our Share" content (`core_purpose`, `description`, the building image), not About content. **Decision: `/about_us` permanently redirects to `/about-us`;** the WhoWeAre data stays in the Home Why-Buy block. |
| 4.6 | Announcement marquee on `/book-now` | **Does not exist.** No marquee element and no such text anywhere on the site. `settings.announcement` is `null`. |
| 5.1 #1 | Hero is an autoplay background video | A **2-slide Owl carousel** (autoplay 6000ms). Slide 1 is the video, and its subline and `<h1>` are **empty in the CMS** — hence two `<h1>` on Home, one blank. Slide 2 carries the "IndexVilla…" subline and "Index Eco Resort" title. Custom JS sets `video.loop = false` and advances the carousel when the video ends. |
| 5.3 | Each package has its own YouTube video | Gold `nftc2Vk4o_A`, Platinum `_iY6MareB_M`, Signature `nftc2Vk4o_A`, Silver `bzEgLBR-ag4`. **Gold and Signature share one video.** |
| 5.6 | Event filters by query string | **AJAX only**: `GET /events/filter?start_date&end_date&category_id`. The controls have **no `name` attributes and no `<form>`**. Dates are flatpickr `d-m-Y`. |
| 5.7 #3 | Event comment form with fields and an endpoint | **Decorative only.** No `<form>`, no `name` attributes, no action, no JS handler on `.btn-post-comment`. Nothing is submitted or stored. |
| 5.8 | Blog list with pagination | **No pagination.** 2 posts; `?page=2` returns byte-identical HTML. Same for `/event` (4 events). |
| 5.9 | Blog detail shows the post title | **No title element and no `<h1>`.** Hero image → meta bar → body. The title exists only on `/blogs`. |
| 5.11 | Contact page hotline links to the number | `href="#"`. Not a `tel:` link. |
| 5.5 | Download Booking Form → a PDF | `href="https://indexecoresort.com/public/storage"` — **no file path**. The download is broken. |
| 8 | Top bar phone/email hrefs "verify" | **Plain text, not links.** Only the three social icons are anchors. |
| 9.14 | Gallery renders items twice from two paths | **Not reproducible.** All images come from `/public/storage/images/admin/gallery/`. The repetition is Bootstrap tab panes (the set is rendered once per pane). |

## 11.2 Answers to §10 "Unknowns"

1. **Form endpoints.** Both forms → `POST /contact-form/submit`, urlencoded, fields
   `_token, name, phone, email, address, message`. The modal submits by AJAX; the
   contact page form does a **plain browser POST**. Modal marks name/phone/email
   `required` and keeps `address` as a **hidden** empty field; the page form has **no
   `required` attributes at all** and uses `type=number` for phone.
   There is **no comment endpoint** — the comment UI is decoration.
2. **Validation rules.** Client-side: only the modal's three `required` flags plus
   `type=email`/`tel`/`number`. Server-side rules are unknown without the Laravel source.
3. **After submit.** Modal: any 2xx shows `✓ Message sent successfully!`, hides the
   button, and after 2400ms resets the form and closes the panel; errors `alert()`
   `xhr.responseJSON.message`. The page form's behavior was **not tested** — submitting
   would create a real inquiry. Open question for the owner.
4. **Gallery.** Bootstrap pill tabs, server-rendered per pane. Home "All" = **12**
   (capped), `/gallery` "All" = **20**. Category counts (both pages): Business
   Conference 11, Community Hall 1, Room 2, Cottage 1, Indoor **0**, Outdoor 3,
   Swimming pool 3 (that tab is on Home but **missing from `/gallery`**). Because "All"
   is capped on Home, choosing a category can show *more* tiles than "All".
   Lightbox: lightGallery with zoom + thumbnails, `download: false`.
5. **Event filter.** See 11.1. Response `{status, data[]}`. Empty state
   `No Events Found!`. Guard: one date without a category does nothing.
   **The AJAX cards link to `/event-details/{id}`, which 404s** — filtering replaces
   working `/events/{slug}` links with broken ones. No pagination, no sort control.
6. **Blog pagination.** None.
7. **Testimonials.** A carousel (`autoplay 3500ms, loop`) with exactly **one** item,
   which is placeholder content: name "jack sparrow", role "Actor", avatar
   `alt="Vikram Patel"` hotlinked from `demo.awaikenthemes.com`, and a quote about an
   "apartment layout" and "possession".
8. **Booking PDF.** Not configured — see 11.1.
9. **Marquee.** Does not exist.
10. **JSON API.** Only `/events/filter`. All `/api*` paths 404. See `audit/backend.md`.
11. **Metadata.** Every page `<title>` is `indexecoresort.com`. No meta description,
    no OG, no Twitter card, no canonical, no `sitemap.xml`, no `robots.txt`.

## 11.3 Additional content issues found (add to §9, owner fixes in the admin panel)

16. **Vision/Mission/Approach tabs all contain the identical body text** (1376 chars),
    and "Our Approach" repeats "Our Vision"'s heading ("Building Communities,
    Inspiring Growth"). Only the images differ.
17. The single testimonial is placeholder data (see 11.2 #7).
18. The glance slider labels the 20-share tier **"ডায়মন্ড গ্রাহক" (Diamond)** while the
    package is sold as **Signature**. The test slide "3454 / 45645645" is slide 2 of 5.
19. Home's gallery "All" tab is capped at 12 of 21 items while category tabs are not,
    so filtering can increase the number of visible tiles.
20. The "Swimming pool" gallery category appears on Home but not on `/gallery`;
    "Indoor" is an empty category on both.
21. The CTA strip avatar is also hotlinked from `demo.awaikenthemes.com`.
22. `/people-leading`, the Events breadcrumb "Home" target, returns **HTTP 500**.
23. Blog and event detail pages have **no `<h1>`**; Home has **two** (one empty).
24. `APP_DEBUG=true` in production leaks full stack traces on every 404/500.
25. Every inner page's Blade layout emits `</body></html>` **before** the page content,
    so all inner pages are malformed HTML.
26. ~200KB of CSS/JS is loaded on every page for libraries bound to selectors that
    exist nowhere (Magnific Popup, Fancybox, real3d-flipbook, two Swiper builds).
