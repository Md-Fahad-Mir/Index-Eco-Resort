# audit/ — Phase 0 outputs

Captured from the live Laravel site (Sept 2026). This is the parity baseline: later
phases are verified against it, and `tests/parity/*` reads `links.json` / `forms.json`.

| Path | What it is |
|---|---|
| `scripts/` | Node + Playwright + cheerio scripts (own `package.json`). `npm install` then `npm run crawl \| extract \| shots \| probe`, and `node fixtures.mjs`. |
| `html/` | Raw HTML of 19 routes, desktop UA. `html/mobile/` is the mobile-UA pass. |
| `assets/` | The site's own 8 CSS/JS files, for reading real interaction config. |
| `links.json` | 1033 anchors, tagged by region, with text/href/target/rel/onclick. |
| `forms.json` | Every form: action, method, and each field's attributes. |
| `meta.json` | title / description / OG / canonical / favicon / h1 list per page. |
| `interactions.md` | Behavioral inventory read out of the live JS. |
| `backend.md` | Stack, routes, the one JSON endpoint, form contracts, security notes. |
| `api-probe.json` | 25 probed paths with status and content type. |
| `crawl-report.json` | What was fetched, status and size. |
| `screenshots/before/` | 57 full-page captures (19 routes × 390/768/1440). |

Regenerate everything:

```bash
cd audit/scripts && npm install
npm run crawl && npm run extract && node fixtures.mjs && npm run shots && npm run probe
```
