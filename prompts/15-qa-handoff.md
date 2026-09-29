# Phase 14 — QA, parity sign-off & handoff

## Tasks

1. Run the full test suite: link parity, form parity, interactions, events filters, gallery counts, a11y, visual. Fix failures. Every whitelisted difference in `tests/parity/allowed-diffs.ts` has a written reason.
2. Walk `docs/04-PARITY-CHECKLIST.md` manually at 390 and 1440; tick every item; attach evidence (screenshot path or test name).
3. If a Django API is available, run the whole suite against it with `DATA_SOURCE=api` on a staging URL. Otherwise run against fixtures and say so.
4. Finalize `docs/OWNER-REPORT.md` (started after Phase 0; plain language, for the site owner):
   - What changed visually (before/after screenshot pairs per page).
   - Confirmation that features, links and forms are unchanged.
   - The known content issues from audit §9 with exact admin-panel fixes the owner can make (e.g. "Package heading field on Gold says 'Silver Ownership'").
   - Optional enhancements available in `features.ts` and what each would do.
   - Every rule-9 decision: each `allowed-diffs.ts` entry, the not-rendered decorative UI (event comment block), the Book Now PDF that needs uploading, and the `/about_us` decision.
   - That `src/fixtures/` + `public/media/` are the content snapshot that seeds the Django database, and `docs/API-CONTRACT.md` is what its developer builds against.
5. Write `docs/DEPLOY.md` in two parts:
   - **Preview deployment (now):** Vercel, `DATA_SOURCE=mock` + `PREVIEW_MODE=true`, `LEGACY_ORIGIN` unset, environment variables, build commands, what the preview bar means, and how to share it for review.
   - **Production cut-over (once Django is ready):** point `DATA_SOURCE=api`/`API_BASE_URL`/`MEDIA_BASE_URL` at it, drop `PREVIEW_MODE`, run the parity suite, DNS move, rollback steps, post-launch 404 monitoring.
6. Final `pnpm build`, `pnpm test:e2e`, Lighthouse run; record results in PROGRESS.

## Acceptance criteria

- All checklist items ticked with evidence.
- OWNER-REPORT.md and DEPLOY.md complete.

Report with a summary and the list of anything that still needs the owner's decision.
