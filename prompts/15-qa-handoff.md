# Phase 14 — QA, parity sign-off & handoff

## Tasks

1. Run the full test suite: link parity, form parity, interactions, events filters, gallery counts, a11y, visual. Fix failures. Every whitelisted difference in `tests/parity/allowed-diffs.ts` has a written reason.
2. Walk `docs/04-PARITY-CHECKLIST.md` manually at 390 and 1440; tick every item; attach evidence (screenshot path or test name).
3. If `DATA_SOURCE=api` is available, run the whole suite against the real API on a staging URL.
4. Finalize `docs/OWNER-REPORT.md` (started after Phase 0; plain language, for the site owner):
   - What changed visually (before/after screenshot pairs per page).
   - Confirmation that features, links and forms are unchanged.
   - The known content issues from audit §9 with exact admin-panel fixes the owner can make (e.g. "Package heading field on Gold says 'Silver Ownership'").
   - Optional enhancements available in `features.ts` and what each would do.
   - Every rule-9 decision: each `allowed-diffs.ts` entry, the not-rendered decorative UI (event comment block), the Book Now PDF that needs uploading, and the `/about_us` decision.
5. Write `docs/DEPLOY.md`: environment variables, build/start commands, Nginx/Vercel config, Laravel origin move, fallback rewrites, cut-over checklist, rollback steps, post-launch 404 monitoring.
6. Final `pnpm build`, `pnpm test:e2e`, Lighthouse run; record results in PROGRESS.

## Acceptance criteria

- All checklist items ticked with evidence.
- OWNER-REPORT.md and DEPLOY.md complete.

Report with a summary and the list of anything that still needs the owner's decision.
