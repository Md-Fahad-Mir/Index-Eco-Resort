# Phase 9 — Events `/event` and `/events/{slug}`

Audit §5.6–5.7. Data: `getEvents(filters)`, `getEvent(slug)`, `getRelatedEvents(slug)`.

## List `/event`

1. `PageHero` "Events" — breadcrumb "Home" → `/` (allowed diff, rule 9c: the live `/people-leading` returns 500; record it in `tests/parity/allowed-diffs.ts`).
2. **EventFilters** (client leaf): `paper` panel with date-from, date-to (DatePicker) and category (Select, options from data with the same ids). Filtering goes through **our data layer** with the live logic and params (`audit/interactions.md §5`): `GET /api/events/filter?start_date&end_date&category_id`, dates displayed **and sent** as `d-m-Y`, the same guard (one date without a category → no request), the same empty state `No Events Found!`; the mock adapter reproduces the Laravel filter over the fixtures, the api adapter forwards to Laravel `/events/filter`. Placeholder texts as original ("Choose Date", "All Categories"). Results update without a full reload and the URL does not change (the live site never changes it). Results **always link to `/events/{slug}`** (allowed diff: the live AJAX cards link to `/event-details/{id}`, a 404).
3. **EventCard** grid (3/2/1 cols): image 4:3 with date badge, category tag (its href verbatim), title (h4, 2-line clamp), excerpt (2-line clamp), clock + time (raw string as data), pin + location, footer "Event details" link with arrow. Hover: image scale, border tone, arrow shift.
4. No pagination (Phase 0 verified none). Empty state: the live text `No Events Found!`.
5. Results re-layout with a 250ms cross-fade (no stagger).

## Detail `/events/{slug}`

1. Hero: event banner image as a `PageHero` variant with the event title (from data) and date line.
2. 12-col layout: main (cols 1–8) — meta row (date, time as data), `Prose` body. The live "Leave a Reply" block is decorative (no form, no endpoint — Phase 0), so it is **not rendered**; keep the captured texts in data and a `CommentForm` behind `features.eventCommentForm` (default `false`), and list the block in OWNER-REPORT (rule 9d). Sidebar (cols 9–12, sticky) — **EventInfoPanel** (start, end, time, location, category) + Booking Now (href verbatim, `#`).
3. **Related events:** `EventCard` grid from data (the live grid is empty on all four events — render what the data provides, invent nothing).
4. `Event` JSON-LD and metadata.

## Acceptance criteria

- Filter results for a set of test inputs equal the live `/events/filter` responses (write the cases into `tests/parity/events.spec.ts`), and every result card links to `/events/{slug}`.
- Exactly one `<h1>` (the event title) on the detail page.
- Screenshots of list (default + filtered) and one detail at 390/1440.

Stop and report.
