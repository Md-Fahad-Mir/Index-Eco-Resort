import { usingSnapshot } from "@/config/env";

/**
 * Server-side only. Client forms POST to /api/forms/{kind}, which calls this —
 * that keeps DATA_SOURCE and API_BASE_URL on the server and keeps the data
 * adapters (and every fixture) out of the client bundle.
 */

/** The forms the site can submit. There is no comment endpoint (rule 9d). */
export type FormKind = "contact";

export type SubmitResult =
  | { ok: true }
  /** Field-level errors, keyed by the field name, per the contract's 422 shape. */
  | { ok: false; errors?: Record<string, string[]>; message?: string };

const BASE = (process.env.API_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * Sends a form.
 *
 * With the snapshot (the default) nothing leaves the browser: it waits about as
 * long as a real request, logs the payload in development, and reports success,
 * so the whole flow can be exercised before a backend exists. The site shows a
 * "Preview — forms are not sent" bar whenever this is the case.
 */
export async function submitForm(
  kind: FormKind,
  payload: Record<string, string>,
): Promise<SubmitResult> {
  if (usingSnapshot) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (process.env.NODE_ENV === "development") {
      console.info(`[submitForm:${kind}] not sent (mock data):`, payload);
    }
    return { ok: true };
  }

  try {
    const response = await fetch(`${BASE}/forms/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) return { ok: true };

    // Contract: 422 with {"errors": {"field": ["message", …]}}
    if (response.status === 422) {
      const body = (await response.json().catch(() => null)) as {
        errors?: Record<string, string[]>;
        message?: string;
      } | null;
      return { ok: false, errors: body?.errors, message: body?.message };
    }
    return { ok: false, message: `Something went wrong (${response.status}).` };
  } catch {
    return { ok: false, message: "Network error. Please check your connection and try again." };
  }
}
