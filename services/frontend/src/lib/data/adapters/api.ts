import {
  aboutPageSchema,
  bookNowSchema,
  contactPageSchema,
  eventDetailSchema,
  eventSummarySchema,
  eventsPageSchema,
  gallerySchema,
  homeSchema,
  offerSchema,
  ownershipPackageSchema,
  postDetailSchema,
  postsPageSchema,
  settingsSchema,
} from "../schemas";
import type { CacheTag, DataAdapter, EventFilterParams } from "../types";
import { site } from "@/config/site";
import type { Locale } from "@/lib/i18n/config";

/**
 * A generic REST client for the backend described in docs/API-CONTRACT.md.
 *
 * Deliberately not written against any particular server: it is paths, query
 * parameters and zod validation. The Django implementation only has to match
 * the contract — nothing here needs to change when it arrives.
 */
const BASE = (process.env.API_BASE_URL ?? "").replace(/\/+$/, "");

type Schema<T> = { parse: (value: unknown) => T };

async function get<T>(path: string, schema: Schema<T>, tag: CacheTag): Promise<T> {
  if (!BASE) {
    throw new Error(
      `DATA_SOURCE=api but API_BASE_URL is not set. Point it at a backend implementing docs/API-CONTRACT.md.`,
    );
  }
  const response = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: site.revalidateSeconds, tags: [tag] },
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status} ${response.statusText}`);
  }
  return schema.parse(await response.json());
}

/** Returns null on 404 rather than throwing — used for detail pages. */
async function getOrNull<T>(path: string, schema: Schema<T>, tag: CacheTag): Promise<T | null> {
  try {
    return await get(path, schema, tag);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) return null;
    throw error;
  }
}

const query = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const string = search.toString();
  return string ? `?${string}` : "";
};

/**
 * The content language travels as `?lang=bn|en`, so each language is its own
 * URL and the fetch cache keeps them apart. Omitted, the backend answers in its
 * default language.
 */
const withLang = (path: string, locale?: Locale) => {
  if (!locale) return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
};

export const apiAdapter: DataAdapter = {
  getSettings: (locale) => get(withLang("/settings", locale), settingsSchema, "settings"),
  getHome: (locale) => get(withLang("/pages/home", locale), homeSchema, "pages"),
  getAboutPage: (locale) => get(withLang("/pages/about", locale), aboutPageSchema, "pages"),
  getOffer: (locale) => get(withLang("/pages/offer", locale), offerSchema, "pages"),
  getBookNow: (locale) => get(withLang("/pages/book-now", locale), bookNowSchema, "pages"),
  getContactPage: (locale) => get(withLang("/pages/contact", locale), contactPageSchema, "pages"),
  getGallery: (locale) => get(withLang("/gallery", locale), gallerySchema, "gallery"),

  getPackages: (locale) =>
    get(withLang("/packages", locale), ownershipPackageSchema.array(), "packages"),
  getPackage: (slug, locale) =>
    getOrNull(withLang(`/packages/${slug}`, locale), ownershipPackageSchema, "packages"),

  getEvents: (locale) => get(withLang("/events", locale), eventsPageSchema, "events"),
  /** Same parameter names and `d-m-Y` dates as the live site (contract §events). */
  filterEvents: (params: EventFilterParams, locale) =>
    get(
      `/events/filter${query({ ...params, lang: locale })}`,
      eventSummarySchema.array(),
      "events",
    ),
  getEvent: (slug, locale) =>
    getOrNull(withLang(`/events/${slug}`, locale), eventDetailSchema, "events"),
  getRelatedEvents: (slug, locale) =>
    get(withLang(`/events/${slug}/related`, locale), eventSummarySchema.array(), "events"),

  getPosts: (locale) => get(withLang("/posts", locale), postsPageSchema, "posts"),
  getPost: (slug, locale) =>
    getOrNull(withLang(`/posts/${slug}`, locale), postDetailSchema, "posts"),
};
