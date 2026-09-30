import type { Locale } from "../config";
import { bn } from "./bn";
import { en, type Dictionary } from "./en";

/**
 * Both dictionaries are small, so they are imported statically rather than
 * loaded per request: the client components that need one read it from
 * `useDictionary()` without a round trip.
 */
const dictionaries: Record<Locale, Dictionary> = { bn, en };

export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
