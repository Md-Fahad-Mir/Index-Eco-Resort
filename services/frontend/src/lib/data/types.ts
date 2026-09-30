import type {
  AboutPage,
  BookNow,
  ContactPage,
  EventDetail,
  EventSummary,
  EventsPage,
  Gallery,
  HomeData,
  Offer,
  OwnershipPackage,
  PostDetail,
  PostsPage,
  SiteSettings,
} from "./schemas";
import type { Locale } from "@/lib/i18n/config";

/** Query parameters of the events filter, named exactly as the live site sends them. */
export type EventFilterParams = {
  /** `d-m-Y`, e.g. "29-09-2026". */
  start_date?: string;
  /** `d-m-Y`. */
  end_date?: string;
  /** Category id; empty means all. */
  category_id?: string;
};

/**
 * One interface, two implementations (fixtures now, Django later). Pages depend
 * only on this, which is what makes the backend swap invisible to them.
 *
 * `locale` picks the language of the content. Without one, the content comes
 * back as the backend stores it by default (for the snapshot: as captured).
 */
export type DataAdapter = {
  getSettings(locale?: Locale): Promise<SiteSettings>;
  getHome(locale?: Locale): Promise<HomeData>;
  getAboutPage(locale?: Locale): Promise<AboutPage>;
  getPackages(locale?: Locale): Promise<OwnershipPackage[]>;
  getPackage(slug: string, locale?: Locale): Promise<OwnershipPackage | null>;
  getOffer(locale?: Locale): Promise<Offer>;
  getBookNow(locale?: Locale): Promise<BookNow>;
  getContactPage(locale?: Locale): Promise<ContactPage>;
  getGallery(locale?: Locale): Promise<Gallery>;
  getEvents(locale?: Locale): Promise<EventsPage>;
  filterEvents(params: EventFilterParams, locale?: Locale): Promise<EventSummary[]>;
  getEvent(slug: string, locale?: Locale): Promise<EventDetail | null>;
  getRelatedEvents(slug: string, locale?: Locale): Promise<EventSummary[]>;
  getPosts(locale?: Locale): Promise<PostsPage>;
  getPost(slug: string, locale?: Locale): Promise<PostDetail | null>;
};

/** Cache tags used for on-demand revalidation (architecture §4). */
export const CACHE_TAGS = ["settings", "pages", "packages", "gallery", "events", "posts"] as const;
export type CacheTag = (typeof CACHE_TAGS)[number];
