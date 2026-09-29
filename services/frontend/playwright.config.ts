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
  fullyParallel: true,
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
      name: "parity-desktop",
      testIgnore: /visual/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "parity-mobile",
      testIgnore: /visual/,
      // 390 px wide — the primary design width. Chromium, not the device's default
      // WebKit: WebKit honours upgrade-insecure-requests on http://localhost and fails TLS.
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium", browserName: "chromium" },
    },
    {
      name: "visual",
      testMatch: /visual/,
      use: { ...devices["Desktop Chrome"], deviceScaleFactor: 1 },
    },
  ],
});
