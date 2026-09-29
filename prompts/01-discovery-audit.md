# Phase 0 — Discovery & parity baseline

**Goal:** capture the exact behavior and content of the live site so every later phase can be verified against it. No UI work in this phase.

## Tasks

0. Put all audit scripts in `audit/scripts/` (Node + Playwright, its own minimal `package.json`). They are reused later by the parity tests.
1. **Crawl** every route in `docs/01-SITE-AUDIT.md §3` (plus every `/events/*` and `/blog-details/*` URL discovered, plus `/about_us`). Save raw HTML to `audit/html/<route>.html`. Use `curl` with a desktop UA; also fetch once with a mobile UA to capture the mobile menu markup.
2. **Links:** for each page, extract every anchor `{region: topbar|header|mobile-nav|main|dock|footer, text, href, target, rel}` into `audit/links.json`.
3. **Forms:** for the contact modal, contact page and event comment form (and blog comment form if present), extract `action`, `method`, every field `{name, type, required, placeholder, maxlength, pattern}`, hidden fields, and any AJAX endpoint + payload shape from inline/linked JS. Save to `audit/forms.json`. Note success/error behavior (redirect? message text? where shown?).
4. **Interactions:** read the site's JS and document in `audit/interactions.md`: slider libraries/options (autoplay? speed? loop?), gallery filter mechanism and Home item count, lightbox, video modal, testimonials behavior, tabs, events filter mechanism (query param names or client-side), pagination on `/event` and `/blogs`, marquee text source and pages, "save my info" checkbox behavior.
5. **Screenshots (before):** Playwright full-page screenshots of every route at 390, 768, 1440 px → `audit/screenshots/before/`.
6. **Metadata:** record each page's `<title>`, meta description, OG tags → `audit/meta.json`.
7. **Backend check:** probe for an existing JSON API (`/api`, `/api/v1`, common Laravel resource paths). Ask me whether the Laravel source is available and where. If it is: read `routes/web.php`, the relevant controllers, `FormRequest` classes and models; write `audit/backend.md` with routes, queries (ordering/filtering), validation rules and side effects (emails, DB tables).
8. **Fixtures:** convert the crawled content into JSON matching the contract in `docs/03-ARCHITECTURE.md §5.2` → `src/fixtures/*.json` (keep media URLs absolute to the live site). These fixtures must contain real content only.
9. **Update the audit:** append verified facts and corrections to `docs/01-SITE-AUDIT.md` (mark them "Verified in Phase 0") and resolve every item in §10 "Unknowns".

## Acceptance criteria

- `audit/links.json`, `audit/forms.json`, `audit/interactions.md`, `audit/meta.json`, screenshots and fixtures exist and are complete.
- Every unknown in the audit §10 is answered or escalated as a question to me.
- `docs/PROGRESS.md` created with a Phase 0 summary and open questions.

Stop and report.
