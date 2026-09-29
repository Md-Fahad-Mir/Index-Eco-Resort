# Phase 0 — Interaction inventory (verified against the live site, Sept 2026)

Everything below was read out of the live HTML/JS in `audit/html/` and `audit/assets/`,
not inferred. Line references are to `audit/assets/public__frontend__js__custom.js`
unless an inline block is named.

## 1. Libraries in use

| Library | Version | Used for |
|---|---|---|
| jQuery | 3.6.3 | All behavior glue, the AJAX contact submit |
| Owl Carousel 2 | bundled | Hero, highlights, glance slider, plan grid, room slider, testimonials, blog carousel |
| Swiper | 10 + 11 (both loaded) | Offer page slider; two theme sliders that are not present on any page |
| lightGallery 2.7.2 (+ lgZoom, lgThumbnail) | CDN | Gallery lightbox |
| Magnific Popup | bundled | Bound to `.gallerys` / `.gallerys_two`, which do not exist on any page |
| Fancybox 5.0.36 | CDN | Bound to `[data-fancybox]`, which does not exist on any page |
| flatpickr | CDN | The two event date fields |
| axios | CDN | The event filter request |
| WOW.js + animate.css | CDN | Header fade-in on load |
| Bootstrap 5.3.2 | CDN | Pill tabs (gallery, villa, vision/mission) |
| real3d-flipbook | CSS only | Loaded on every page, never used |

**Note for later phases:** Magnific Popup, Fancybox, real3d-flipbook, both Swiper
builds and several Owl initialisers target selectors that exist on no page. They are
dead weight (~200KB) and have no behavior to reproduce.

## 2. Global chrome

### Header
- Inline block on every page: `window.scroll` → adds `.sticky` to `.header_area`
  when `window.scrollY > 100`.
- `.header_area` also carries `wow animate__animated animate__fadeInDown`, so the
  header fades down on every page load.

### Mobile menu
- `.menu_mobile_icon` → `openMenu()`; `#mobileCloseBtn` and `#menuOverlay` → `closeMenu()`.
- Adds/removes `.active` on the icon, `#mobileMenu` and the overlay, and sets
  `document.body.style.overflow = 'hidden'` while open.
- Submenu links (`.menu-link.has-submenu`) `preventDefault()` and toggle
  `#{data-submenu}-submenu`; opening one closes the others.
- **No focus trap, no Escape handler, no focus return.** Not closed on route change
  (full page loads make that moot today).

### Floating dock (`#mystickyWidget`)
- Desktop (`window.innerWidth >= 768`): hover opens a slide-out panel; leaving
  closes it after a 200ms timer. `forceClose()` locks a panel shut for 800ms.
- Mobile (`< 768`): first tap opens the panel and prevents navigation; a second tap
  lets the `href` fire. Tapping outside (`touchstart`) closes all three panels.
- Three panels: `mystickyFormPanel` (contact form), `mystickyWaPanel`, `mystickyPhPanel`.

### Contact modal / sticky form — the only working form on the site
- `$('#stickyContactForm').on('submit')` → `preventDefault()`, then
  `$.ajax({ url: form.attr('action'), type: form.attr('method'), data: form.serialize() })`.
- `POST https://indexecoresort.com/contact-form/submit`, `application/x-www-form-urlencoded`.
- Fields: `_token` (hidden CSRF), `name` (required), `phone` (required, `type=tel`),
  `email` (required, `type=email`), `address` (**hidden**, always the literal string `N/A`), `message` (textarea, optional).
- Button text becomes `Sending...` and is disabled during the request.
- **Success (any 2xx):** `#mystickySuccessMsg` is shown, the button is hidden; after
  2400ms the message hides, the button returns, `form.reset()` runs and the panel closes.
- **Error:** button re-enabled and `alert()` with `xhr.responseJSON.message` or
  `"Something went wrong. Please check fields and try again."`.
- Success text on the live site: `✓ Message sent successfully!`.

## 3. Home

### Hero — a carousel, not a single video
`$('.banner_slider').owlCarousel({ items: 1, loop: true, autoplay: true, autoplayTimeout: 6000, smartSpeed: 1200, animateOut: 'fadeOut', animateIn: 'fadeIn', nav: false, dots: true })`

- Two slides: slide 1 is the background video, slide 2 is an image.
- The `<video>` element has `autoplay muted loop playsinline`, but the JS then sets
  `video.loop = false` and, on `ended`, advances the carousel and resumes autoplay.
- **Slide 1's `slide_tag` and `<h1>` are empty in the CMS**, which is why the page
  ships two `<h1>` elements, one of them blank.
- Slide content is re-animated on `translate`/`translated` by setting inline
  `animation: fadeInUp ...` on `.slide_tag`, `h1` and `.banner_btn`.
- No pause control anywhere (WCAG 2.2.2 gap — the design system adds one).

### Other Home carousels
| Selector | Options |
|---|---|
| `.featured_project_active` (highlights) | ≥992px: 3 items, no autoplay. <992px: loop + autoplay 3000ms, pause on hover |
| `.glance-slider` | 1 item, loop, autoplay 4500ms, pause on hover, smartSpeed 700, nav + dots, `animateOut: fadeOut` |
| `.ownership-owl` (plan grid) | responsive 1/1/2/3/4, loop, **autoplay 1500ms**, pause on hover, dots |
| `.po_panel_active` (room slider) | 1 item, no loop, nav, no dots; refreshed on Bootstrap `shown.bs.tab` |
| `.testimonial-carousel` | responsive 1/2/3, loop, autoplay 3500ms, pause on hover, dots |
| `.blog-carousel` (latest posts) | responsive 1/2/3, loop, autoplay 3500ms, pause on hover, dots |

### About block video modal
- `openVideoModal()` sets `#videoModal.style.display = 'flex'`, rewinds
  `#videoPlayer` to 0 and plays. `closeVideoModal()` pauses and hides.
- Trigger is a `div.play-btn[role=button][aria-label="Watch video"]` with `onclick`.
- **No Escape key, no backdrop click, no focus management, not keyboard reachable.**

### Villa tabs
- Bootstrap pills. Each `button[data-room-title]` also carries `data-room-description`;
  on `shown.bs.tab` an inline handler writes those into `#dynamic-sub-title` and
  `#dynamic-main-title`, and refreshes the room Owl carousel.

## 4. Gallery (Home and `/gallery`)

- **Filtering is Bootstrap pill tabs, not JS filtering.** `#galleryTab` buttons target
  `#pills-all` and `#pills-{categoryId}`; the server renders the matching items into
  every pane, so each item appears once per pane it belongs to.
- Counts verified from the markup:

| Pane | Home | `/gallery` |
|---|---|---|
| `all` | **12** (capped) | **20** (all) |
| `9` Business Conference 2026 (COX'S BAZAR) | 11 | 11 |
| `8` Community Hall | 1 | 1 |
| `6` Room | 2 | 2 |
| `5` Cottage | 1 | 1 |
| `4` Indoor | **0** | **0** |
| `3` Outdoor | 3 | 3 |
| `2` Swimming pool | 3 | — (tab absent on `/gallery`) |

- So Home's "All" tab shows 12 of 21 items while its category tabs show every item —
  picking a category can *increase* the number of visible items.
- `/gallery` has 7 tabs, Home has 8: the "Swimming pool" tab is missing from `/gallery`.
- "Indoor" is an empty category tab on both pages.
- Lightbox: `lightGallery(document.getElementById('lightgallery'), { plugins:[lgZoom, lgThumbnail], speed:500, download:false })`.
  Each tile is an `<a href="{full image}" data-src="{full image}">`.
- **`audit §9.14` is not reproducible:** every gallery image on both pages is served
  from `/public/storage/images/admin/gallery/`. There is no second `/public/images/...`
  copy and no visible duplicate. The duplication is only tab panes.

## 5. Events

### `/event` filter bar — AJAX, no form, no names
- Controls are three bare inputs with **no `name` attribute and no `<form>`**:
  `#start-date`, `#end-date` (both `readonly`, flatpickr `dateFormat: "d-m-Y"`,
  `disableMobile: true`), and `#category` (a `<select>` whose options carry category ids,
  with `All` as the empty value).
- Calendar icons call `startPicker.open()` / `endPicker.open()`.
- `change` and `input` on all three call `fetchEvents()`:

```js
axios.get("/events/filter", { params: { start_date, end_date, category_id } })
```

- Guard: if exactly one of the two dates is set **and** no category is selected,
  the function returns without requesting.
- Response shape (verified live): `{ "status": true, "data": [ …events… ] }` where each
  event has `id, title, event_categories_id, short_description, description,
  start_date, end_date, start_time, end_time, location, details_page_image,
  card_image, status, slug, created_at, updated_at, category{id,name,slug,status,…}`.
- Results are rendered into `.blog_events_container` as an HTML string.
- Empty state: `<div class="col-12 text-center mt-5"><h4>No Events Found!</h4></div>`.
- **Broken:** the AJAX template links each card to `/event-details/${event.id}`, which
  returns **404**. The server-rendered cards link to `/events/{slug}`, which works.
  Filtering therefore replaces working links with broken ones.
- No pagination, no loading state, no error UI (errors only `console.log`).
- Dates are sent in `d-m-Y` (e.g. `29-09-2026`); the API stores `Y-m-d`. The server's
  interpretation of that mismatch is unverified — see open questions.

### Event detail
- **The "Leave a Reply" block is decoration.** There is no `<form>`, no `name`
  attributes, no `action` and no JS bound to `.btn-post-comment`. Nothing is submitted
  and nothing is stored. The `#save-info` checkbox is hard-coded `checked` and has no
  persistence logic.
- Fields present (placeholders only): `Name` (text), `Email` (email), `Website` (url),
  `Comment` (textarea), plus the checkbox and a `Post Comment` button.
- Sidebar "Event Information" is five static `.info-row` label/value pairs, then a
  `Booking Now` link to `#`.
- "Explore Related Events" renders an empty grid on all four events.
- There is **no `<h1>`** on event detail pages.

## 6. Blog

- `/blogs` lists 2 posts. There is **no pagination markup**, and `?page=2` returns
  byte-identical content to page 1.
- Blog detail has **no title element at all** — hero image, then a meta bar
  (category tag, date, time, comments count, read time), then the article body.
  No `<h1>`; the post title appears only on the list page.
- Share row: four `.blog-details-share-btn` anchors (fb, tw, wa, ln), all `href="#"`.
- Sidebar: numbered recent posts; a "Categories" list that contains **event**
  categories with counts, all linking to `/event`; and a CTA card.
- **No comment form on blog detail** (the audit asked — answer: none).

## 7. Other pages

- `/offer` — a Swiper (`.myOfferSlider`) with a single slide. Heading, two Bangla
  paragraphs, a `*শর্ত প্রযোজ্য` note and a portrait poster.
- `/book-now` — no marquee (see §8). One Bangla paragraph and a download button whose
  `href` is `https://indexecoresort.com/public/storage` with a `download` attribute —
  **no file path, so the download is broken.**
- `/contact` — two forms on the page. The visible one posts **normally** (full page
  navigation) to `/contact-form/submit`; only `#stickyContactForm` is AJAX. The visible
  form carries **no `required` attributes** even though the design shows `*` markers,
  and `phone` is `type=number`. The Hotline link is `href="#"`, not a `tel:` link.
  Map is a Google Maps iframe.
- Package pages — one YouTube `<iframe>` each, loaded eagerly on page load.

## 8. Things the audit expected that do not exist

| Expected (docs/01-SITE-AUDIT.md) | Reality |
|---|---|
| §4.6 Announcement marquee on `/book-now` | No marquee element and no such text anywhere on the site |
| §5.7 Event comment form with an endpoint | Decorative markup only; no form, no endpoint |
| §5.6 Event filters by query string | AJAX to `/events/filter`; no query params, no form |
| §9.14 Gallery items rendered twice from two paths | Not reproducible; single path, tab panes only |
| §5.8 Blog pagination | None; `?page=2` is identical |
| §5.3 Per-package YouTube videos | Gold and Signature share one video (`nftc2Vk4o_A`) |
| §5.1 Hero as a single video | A 2-slide Owl carousel; the video slide's text is empty |

## 9. Accessibility gaps found (fixed by the new build, not "features")

- Home has two `<h1>`, one empty; blog and event detail pages have none.
- Autoplaying hero video and six autoplaying carousels with no pause control.
- Video modal and mobile menu: no Escape, no focus trap, no focus return.
- Play button is a `div[role=button]` with no `tabindex` and no key handler.
- Filter inputs are `readonly` with no visible label (only `aria-label`).
- Every page `<title>` is `indexecoresort.com`; no meta description, OG or canonical.
