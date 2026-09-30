import { NextResponse } from "next/server";
import { submitForm } from "@/lib/forms";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { dictionaryFor } from "@/lib/i18n/dictionaries";

/**
 * The contact form's submit target. Client components post here rather than
 * calling the backend directly, so the API base URL and the data-source choice
 * stay on the server.
 *
 * Mirrors the contract's error shape: 422 with {"errors": {"field": [...]}}.
 * `?lang=bn|en` is the page's language, for the messages written here.
 */
export async function POST(request: Request) {
  const lang = new URL(request.url).searchParams.get("lang");
  const locale = hasLocale(lang) ? lang : defaultLocale;

  let payload: Record<string, string>;
  try {
    payload = (await request.json()) as Record<string, string>;
  } catch {
    return NextResponse.json(
      { ok: false, message: dictionaryFor(locale).forms.invalidBody },
      { status: 400 },
    );
  }

  const result = await submitForm("contact", payload, locale);
  if (result.ok) return NextResponse.json({ ok: true });

  return NextResponse.json(
    { ok: false, errors: result.errors, message: result.message },
    { status: result.errors ? 422 : 502 },
  );
}
