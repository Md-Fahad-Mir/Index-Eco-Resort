# services/frontend — INDEX Eco Resort (Next.js)

The premium frontend for https://indexecoresort.com. Rules, layout and workflow live at the repo root: `../../CLAUDE.md`, `../../docs/`, `../../prompts/`. Phase 0 baselines (crawl, links, forms, screenshots) are in `../../audit/`; the tests here read them from there.

```bash
pnpm install        # at the repo root (pnpm workspace)
pnpm dev            # in this folder — or `pnpm --filter frontend dev` from the root
pnpm build && pnpm start
pnpm lint && pnpm typecheck
pnpm test:e2e       # parity + a11y (Playwright)
pnpm test:visual    # screenshots → ../../audit/screenshots/after/
```

`DATA_SOURCE=mock` (default, `.env.example`) serves the Phase 0 fixtures in `src/fixtures/`.

## Docker

```bash
# Local preview on the fixtures, over plain http (env vars are build args; see the Dockerfile)
docker build -t index-eco-resort --build-arg PREVIEW_MODE=true \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 .
docker run --rm -p 3000:3000 -e REVALIDATE_SECRET=change-me index-eco-resort
```
