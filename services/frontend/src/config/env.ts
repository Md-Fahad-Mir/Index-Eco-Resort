/**
 * Environment checks that must fail loudly rather than ship the wrong thing.
 */

/** True when the site is serving the Phase 0 snapshot rather than a real backend. */
export const usingSnapshot = process.env.DATA_SOURCE !== "api";

/** Explicitly allows a production build to run on snapshot content. */
export const previewMode = process.env.PREVIEW_MODE === "true";

/**
 * A production build on fixtures would look live but show stale content and
 * silently swallow form submissions, so it is refused unless the deployment
 * declares itself a preview.
 */
export function assertDataSourceIsSafe(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (!usingSnapshot) return;
  if (previewMode) return;
  throw new Error(
    [
      "Refusing to build for production with DATA_SOURCE=mock.",
      "",
      "The site would serve the Phase 0 content snapshot as if it were live, and",
      "forms would accept input without sending it anywhere.",
      "",
      "  • For a preview deployment: set PREVIEW_MODE=true (a banner is shown).",
      "  • For production: set DATA_SOURCE=api and API_BASE_URL to a backend",
      "    implementing docs/API-CONTRACT.md.",
    ].join("\n"),
  );
}
