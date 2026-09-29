import { apiAdapter } from "./adapters/api";
import { mockAdapter } from "./adapters/mock";
import type { DataAdapter, EventFilterParams } from "./types";
import { usingSnapshot } from "@/config/env";

/**
 * The only data entry point pages use. Which adapter answers is an environment
 * decision — `mock` serves the Phase 0 snapshot, `api` a backend implementing
 * docs/API-CONTRACT.md — and no component can tell the difference.
 *
 * Server-side only: importing this from a client component would bundle the
 * fixtures. Client code goes through route handlers under app/api.
 */
const adapter: DataAdapter = usingSnapshot ? mockAdapter : apiAdapter;

export const getSettings = () => adapter.getSettings();
export const getHome = () => adapter.getHome();
export const getAboutPage = () => adapter.getAboutPage();
export const getPackages = () => adapter.getPackages();
export const getPackage = (slug: string) => adapter.getPackage(slug);
export const getOffer = () => adapter.getOffer();
export const getBookNow = () => adapter.getBookNow();
export const getContactPage = () => adapter.getContactPage();
export const getGallery = () => adapter.getGallery();
export const getEvents = () => adapter.getEvents();
export const filterEvents = (params: EventFilterParams) => adapter.filterEvents(params);
export const getEvent = (slug: string) => adapter.getEvent(slug);
export const getRelatedEvents = (slug: string) => adapter.getRelatedEvents(slug);
export const getPosts = () => adapter.getPosts();
export const getPost = (slug: string) => adapter.getPost(slug);

/** Blog sidebar content lives on the post payload; exposed separately for pages. */
export const getBlogSidebar = async (slug: string) =>
  (await adapter.getPost(slug))?.sidebar ?? null;

export type * from "./schemas";
export type { CacheTag, EventFilterParams } from "./types";
export { CACHE_TAGS } from "./types";
