import { apiAdapter } from "./adapters/api";
import { mockAdapter } from "./adapters/mock";
import type { DataAdapter, EventFilterParams } from "./types";
import { usingSnapshot } from "@/config/env";
import type { Locale } from "@/lib/i18n/config";

/**
 * The only data entry point pages use. Which adapter answers is an environment
 * decision — `mock` serves the Phase 0 snapshot, `api` a backend implementing
 * docs/API-CONTRACT.md — and no component can tell the difference.
 *
 * Server-side only: importing this from a client component would bundle the
 * fixtures. Client code goes through route handlers under app/api.
 *
 * Every call names its language; pages take it from `getLocale()`.
 */
const adapter: DataAdapter = usingSnapshot ? mockAdapter : apiAdapter;

export const getSettings = (locale: Locale) => adapter.getSettings(locale);
export const getHome = (locale: Locale) => adapter.getHome(locale);
export const getAboutPage = (locale: Locale) => adapter.getAboutPage(locale);
export const getPackages = (locale: Locale) => adapter.getPackages(locale);
export const getPackage = (slug: string, locale: Locale) => adapter.getPackage(slug, locale);
export const getOffer = (locale: Locale) => adapter.getOffer(locale);
export const getBookNow = (locale: Locale) => adapter.getBookNow(locale);
export const getContactPage = (locale: Locale) => adapter.getContactPage(locale);
export const getGallery = (locale: Locale) => adapter.getGallery(locale);
export const getEvents = (locale: Locale) => adapter.getEvents(locale);
export const filterEvents = (params: EventFilterParams, locale: Locale) =>
  adapter.filterEvents(params, locale);
export const getEvent = (slug: string, locale: Locale) => adapter.getEvent(slug, locale);
export const getRelatedEvents = (slug: string, locale: Locale) =>
  adapter.getRelatedEvents(slug, locale);
export const getPosts = (locale: Locale) => adapter.getPosts(locale);
export const getPost = (slug: string, locale: Locale) => adapter.getPost(slug, locale);

/** Blog sidebar content lives on the post payload; exposed separately for pages. */
export const getBlogSidebar = async (slug: string, locale: Locale) =>
  (await adapter.getPost(slug, locale))?.sidebar ?? null;

export type * from "./schemas";
export type { CacheTag, EventFilterParams } from "./types";
export { CACHE_TAGS } from "./types";
