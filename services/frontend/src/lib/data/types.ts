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
 */
export type DataAdapter = {
  getSettings(): Promise<SiteSettings>;
  getHome(): Promise<HomeData>;
  getAboutPage(): Promise<AboutPage>;
  getPackages(): Promise<OwnershipPackage[]>;
  getPackage(slug: string): Promise<OwnershipPackage | null>;
  getOffer(): Promise<Offer>;
  getBookNow(): Promise<BookNow>;
  getContactPage(): Promise<ContactPage>;
  getGallery(): Promise<Gallery>;
  getEvents(): Promise<EventsPage>;
  filterEvents(params: EventFilterParams): Promise<EventSummary[]>;
  getEvent(slug: string): Promise<EventDetail | null>;
  getRelatedEvents(slug: string): Promise<EventSummary[]>;
  getPosts(): Promise<PostsPage>;
  getPost(slug: string): Promise<PostDetail | null>;
};

/** Cache tags used for on-demand revalidation (architecture §4). */
export const CACHE_TAGS = ["settings", "pages", "packages", "gallery", "events", "posts"] as const;
export type CacheTag = (typeof CACHE_TAGS)[number];
