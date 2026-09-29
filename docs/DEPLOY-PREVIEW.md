# Preview deployment (Vercel)

How to deploy this repo as a **preview** — the finished frontend running on the
Phase 0 content snapshot, with forms inert and search engines locked out. It is
what the owner reviews and what the backend developer builds against.

Production cut-over is a different setup and comes later, once a backend
implements `docs/API-CONTRACT.md`. See §6.

---

## 1. Project settings

| Setting | Value | Why |
|---|---|---|
| **Framework Preset** | Next.js | Auto-detected. |
| **Root Directory** | `services/frontend` | The app is one package in a pnpm workspace. |
| **Include files outside the Root Directory** | **On** | The lockfile and `pnpm-workspace.yaml` live at the repo root; without this the install cannot see them. |
| **Node.js Version** | **24.x** | Matches `engines.node` and `.nvmrc`. Every gate and script was verified on v24.21.0. |
| **Install Command** | leave default (`pnpm install`) | Vercel detects the workspace and installs from the repo root. If it ever installs only the app, set it to `cd ../.. && pnpm install --frozen-lockfile`. |
| **Build Command** | leave default (`pnpm build`) | Runs in `services/frontend`. |
| **Output Directory** | leave default | Next.js. |
| **Git LFS** | **Enable** (Project Settings → Git) | `services/frontend/public/media/**` is stored in LFS. Without it the build checks out ~130-byte text pointers instead of images and every picture on the site is broken. `pnpm verify:preview` catches exactly this — see §4. |

The lockfile is in sync, so `pnpm install --frozen-lockfile` succeeds; a drifted
lockfile would fail the build rather than silently install something else.

## 2. Environment variables

Set these for **both Production and Preview** environments:

| Name | Value |
|---|---|
| `PREVIEW_MODE` | `true` |
| `DATA_SOURCE` | `mock` |
| `NEXT_PUBLIC_SITE_URL` | `https://index-eco-resort.vercel.app` |

**And make sure these are absent** (delete them if the project still has them
from an earlier deployment):

| Name | Why it must not be set |
|---|---|
| `LARAVEL_ORIGIN` | Left over from Phase 1. It is no longer read, but its presence signals the old setup. |
| `LEGACY_ORIGIN` | **This is the important one.** If set, every path the app does not own is proxied to that origin — which makes the deployment a public mirror of the client's live site. It must stay unset. |
| `API_BASE_URL`, `MEDIA_BASE_URL` | Only used once a real backend exists. |

> **Why `PREVIEW_MODE` is not optional.** Without it a production build on
> snapshot data is **refused** — the app throws at build time rather than ship
> stale content dressed as live. With it, the site shows a "Preview — forms are
> not sent" bar, sends `X-Robots-Tag: noindex, nofollow` on every response, and
> serves a disallow-all `robots.txt`.

## 3. What the deployment will and will not do

- Serves all 20 prerendered routes from `src/fixtures` and `public/media`.
- **Sends nothing anywhere.** The contact form waits, then reports success; no
  request leaves the deployment.
- **Proxies nothing.** `/public/storage/...` and unknown paths return this app's
  own 404, not the old site.
- `/styleguide` returns 404 in production by design.

## 4. Verify after deploying

```bash
pnpm --filter frontend verify:preview https://index-eco-resort.vercel.app
```

Thirty checks in five groups, printed as a pass/fail table:

| Group | What it proves |
|---|---|
| **Indexability** | `X-Robots-Tag: noindex, nofollow` on HTML *and* API responses; `robots.txt` disallows everything. |
| **Isolation** | Legacy media 404s, unknown paths return this app's 404, `/about-us` is rendered by **this app** (not the old Laravel page), styleguide not exposed. |
| **Routes** | Every route in the map returns 200 with exactly one non-empty `<h1>`. |
| **Preview** | The banner is actually shown. |
| **Media** | Sampled images and the hero video come back as real `image/*` / `video/*` with a sensible size — **not Git LFS pointers**. |

It exits non-zero on any failure, so it can gate a deploy.

## 5. Known-good baseline

Run against the build produced by exactly these settings: **30/30 passed**.
Run against the old Phase 1 deployment it replaces: **15 failed**, including
`legacy /public/storage/* not served → HTTP 200` and `/about-us rendered by this
app → served the OLD Laravel page`. The checks are known to fail when they
should, not just to pass.

## 6. Later: production

Not this deployment. When a backend implements `docs/API-CONTRACT.md`:

1. Set `DATA_SOURCE=api`, `API_BASE_URL` and `MEDIA_BASE_URL`.
2. Remove `PREVIEW_MODE` — the banner disappears, `robots.txt` opens up and the
   noindex header stops.
3. Run the parity suite against the staging URL, then move DNS.

`docs/DEPLOY.md` (final phase) carries the full cut-over checklist.
