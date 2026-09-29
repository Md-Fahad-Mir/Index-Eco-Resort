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

export const apiAdapter: DataAdapter = {
  getSettings: () => get("/settings", settingsSchema, "settings"),
  getHome: () => get("/pages/home", homeSchema, "pages"),
  getAboutPage: () => get("/pages/about", aboutPageSchema, "pages"),
  getOffer: () => get("/pages/offer", offerSchema, "pages"),
  getBookNow: () => get("/pages/book-now", bookNowSchema, "pages"),
  getContactPage: () => get("/pages/contact", contactPageSchema, "pages"),
  getGallery: () => get("/gallery", gallerySchema, "gallery"),

  getPackages: () => get("/packages", ownershipPackageSchema.array(), "packages"),
  getPackage: (slug) => getOrNull(`/packages/${slug}`, ownershipPackageSchema, "packages"),

  getEvents: () => get("/events", eventsPageSchema, "events"),
  /** Same parameter names and `d-m-Y` dates as the live site (contract §events). */
  filterEvents: (params: EventFilterParams) =>
    get(`/events/filter${query({ ...params })}`, eventSummarySchema.array(), "events"),
  getEvent: (slug) => getOrNull(`/events/${slug}`, eventDetailSchema, "events"),
  getRelatedEvents: (slug) => get(`/events/${slug}/related`, eventSummarySchema.array(), "events"),

  getPosts: () => get("/posts", postsPageSchema, "posts"),
  getPost: (slug) => getOrNull(`/posts/${slug}`, postDetailSchema, "posts"),
};
