import { defineConfig, devices } from "@playwright/test";

/**
 * The styleguide returns 404 in production by design, so it is exercised
 * against a dev server on its own port. Separate from playwright.config.ts so
 * the normal suite never pays for a dev build.
 *
 *   pnpm test:styleguide
 */
/**
 * Next refuses a second dev server for the same directory, so if one is already
 * running (`pnpm dev`), point at it with STYLEGUIDE_BASE_URL and no server is
 * started here.
 */
const EXISTING = process.env.STYLEGUIDE_BASE_URL;
const PORT = Number(process.env.STYLEGUIDE_PORT ?? 3100);
const baseURL = EXISTING ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests",
  // The styleguide specs, plus the styleguide's Phase 5b pixel baselines
  // (tests/visual/non-home.spec.ts skips its production routes here).
  testMatch: [/styleguide\/.*\.spec\.ts$/, /visual\/non-home\.spec\.ts$/],
  fullyParallel: false,
  reporter: [["list"]],
  outputDir: "tests/.results-styleguide",
  timeout: 90_000,
  use: {
    baseURL,
    // The MembershipCard tilt is a motion behaviour; a video is the only
    // meaningful artifact for it.
    video: { mode: "on", size: { width: 1280, height: 800 } },
    trace: "retain-on-failure",
  },
  ...(EXISTING
    ? {}
    : {
        webServer: {
          command: `node node_modules/next/dist/bin/next dev -p ${PORT}`,
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
  projects: [{ name: "styleguide", use: { ...devices["Desktop Chrome"] } }],
});
