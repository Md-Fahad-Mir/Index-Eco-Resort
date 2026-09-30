import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { hasLocale, type Locale } from "./config";
import { dictionaryFor, type Dictionary } from "./dictionaries";

/**
 * The language of the route being rendered, from the `[lang]` root segment.
 * Server components and pages only — client components use `useLocale()`,
 * and route handlers take it from the request.
 */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaryFor(await getLocale());
}
