# syntax=docker/dockerfile:1
#
# INDEX Eco Resort frontend (Next.js), as a standalone production image.
# Build context: this folder (services/frontend).
#
# Local preview on the Phase 0 snapshot, served over plain http:
#
#   docker build -t index-eco-resort \
#     --build-arg PREVIEW_MODE=true \
#     --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 .
#   docker run --rm -p 3000:3000 -e REVALIDATE_SECRET=change-me index-eco-resort
#
# Production: --build-arg DATA_SOURCE=api --build-arg API_BASE_URL=https://…
# (a mock build without PREVIEW_MODE=true is refused; see src/config/env.ts).
#
# NEXT_PUBLIC_SITE_URL, MEDIA_BASE_URL and LEGACY_ORIGIN are read by
# next.config.ts and the client bundle at build time, so they are build args
# and changing them means rebuilding. REVALIDATE_SECRET is runtime-only (-e).

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS deps
ENV CI=true
# The pnpm pinned by package.json's packageManager.
RUN npm install -g pnpm@12.6.0 && npm cache clean --force
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

# ── Build ────────────────────────────────────────────────────────────────────
FROM deps AS build
ARG NEXT_PUBLIC_SITE_URL=https://indexecoresort.com
ARG DATA_SOURCE=mock
ARG API_BASE_URL=
ARG MEDIA_BASE_URL=
ARG LEGACY_ORIGIN=
ARG PREVIEW_MODE=false
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    DATA_SOURCE=$DATA_SOURCE \
    API_BASE_URL=$API_BASE_URL \
    MEDIA_BASE_URL=$MEDIA_BASE_URL \
    LEGACY_ORIGIN=$LEGACY_ORIGIN \
    PREVIEW_MODE=$PREVIEW_MODE \
    NEXT_OUTPUT=standalone
COPY . .
RUN pnpm build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM base AS runner
# The same values the build saw, for server code that reads them per request
# (route handlers, ISR re-renders).
ARG NEXT_PUBLIC_SITE_URL=https://indexecoresort.com
ARG DATA_SOURCE=mock
ARG API_BASE_URL=
ARG MEDIA_BASE_URL=
ARG LEGACY_ORIGIN=
ARG PREVIEW_MODE=false
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    DATA_SOURCE=$DATA_SOURCE \
    API_BASE_URL=$API_BASE_URL \
    MEDIA_BASE_URL=$MEDIA_BASE_URL \
    LEGACY_ORIGIN=$LEGACY_ORIGIN \
    PREVIEW_MODE=$PREVIEW_MODE

# server.js and its traced node_modules, plus the files it does not copy itself.
# Owned by `node` so the image optimizer and ISR can write to .next/cache.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO /dev/null http://127.0.0.1:3000/ || exit 1
CMD ["node", "server.js"]
