import { defineConfig, devices } from "@playwright/test";

/**
 * Parity, a11y and visual tests for the Next.js app. Baselines come from the
 * Phase 0 audit at ../../audit (see tests/helpers/audit.ts). Run `pnpm build`
 * first: the web server is the production server.
 */
const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests",
  // The styleguide needs a dev server (it 404s in production), so it has its
  // own config: playwright.styleguide.config.ts. NOTE: a project's own
  // testIgnore replaces this one, so each project below restates it.
  testIgnore: /styleguide/,
  fullyParallel: true,
  // Three browser projects against one server saturated the machine and made
  // navigations time out; capping workers keeps the suite a reliable gate.
  workers: process.env.CI ? 2 : 4,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "tests/.report" }]],
  outputDir: "tests/.results",
  timeout: 60_000,
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    // Run `next start` directly, not `pnpm start`: through pnpm the real
    // `next-server` process outlives its parent and keeps the stdio pipes open,
    // so Playwright's teardown waits until its timeout and the server leaks.
    command: "node node_modules/next/dist/bin/next start",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 90_000,
  },
  projects: [
    {
      // Data-layer checks: no browser page, so they run once rather than per device.
      name: "data",
      testMatch: /tests\/data\//,
    },
    {
      name: "parity-desktop",
      testIgnore: /visual|styleguide|tests\/data\//,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      // 390 px wide — the primary design width.
      name: "parity-mobile",
      testIgnore: /visual|styleguide|tests\/data\//,
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium", browserName: "chromium" },
    },
    {
      // The same width on real WebKit. Possible again now that
      // upgrade-insecure-requests is production-only (it made WebKit force https
      // on http://localhost and fail TLS).
      name: "parity-mobile-webkit",
      testIgnore: /visual|styleguide|tests\/data\//,
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "visual",
      testMatch: /visual/,
      use: { ...devices["Desktop Chrome"], deviceScaleFactor: 1 },
    },
  ],
});
