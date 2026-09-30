import { usingSnapshot } from "@/config/env";
import { defaultLocale, format, type Locale } from "@/lib/i18n/config";
import { dictionaryFor } from "@/lib/i18n/dictionaries";

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
 * so the whole flow can be exercised before a backend exists.
 *
 * `locale` is the language of the visitor's page, for this function's own
 * messages; the backend's 422 messages are passed through as they come.
 */
export async function submitForm(
  kind: FormKind,
  payload: Record<string, string>,
  locale: Locale = defaultLocale,
): Promise<SubmitResult> {
  const messages = dictionaryFor(locale).forms;
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
    return { ok: false, message: format(messages.statusError, { status: response.status }) };
  } catch {
    return { ok: false, message: messages.networkError };
  }
}
