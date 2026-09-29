import { readFileSync } from "node:fs";
import path from "node:path";

/** Repo-root `audit/` — the Phase 0 baseline every parity test compares against. */
export const AUDIT_DIR = path.resolve(__dirname, "../../../../audit");

/** Where `pnpm test:visual` writes the "after" screenshots, mirroring audit/screenshots/before. */
export const AFTER_SCREENSHOTS_DIR = path.join(AUDIT_DIR, "screenshots", "after");

type LinkRecord = { region: string; text: string; href: string; target?: string; rel?: string };
type FormField = {
  name: string | null;
  type: string;
  required: boolean;
  placeholder: string | null;
};
type FormRecord = { id: string | null; action: string | null; method: string; fields: FormField[] };

const readJson = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(AUDIT_DIR, file), "utf8")) as T;

/** Anchors per route as captured from the live site (audit/links.json). */
export const auditLinks = (): Record<string, LinkRecord[]> => readJson("links.json");
/** Forms per route as captured from the live site (audit/forms.json). */
export const auditForms = (): Record<string, FormRecord[]> => readJson("forms.json");
/** Same file naming as the Phase 0 screenshots: "/" → "home", "/events/x" → "events__x". */
export const routeSlug = (route: string) =>
  route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "__");
