import aboutFixture from "@/fixtures/about.json";
import bookNowFixture from "@/fixtures/book-now.json";
import contactFixture from "@/fixtures/contact.json";
import eventDetailsFixture from "@/fixtures/event-details.json";
import eventsFixture from "@/fixtures/events.json";
import galleryFixture from "@/fixtures/gallery.json";
import homeFixture from "@/fixtures/home.json";
import offerFixture from "@/fixtures/offer.json";
import packagesFixture from "@/fixtures/packages.json";
import postDetailsFixture from "@/fixtures/post-details.json";
import postsFixture from "@/fixtures/posts.json";
import settingsFixture from "@/fixtures/settings.json";
import {
  aboutPageSchema,
  bookNowSchema,
  contactPageSchema,
  eventDetailSchema,
  eventsPageSchema,
  gallerySchema,
  homeSchema,
  offerSchema,
  ownershipPackageSchema,
  postDetailSchema,
  postsPageSchema,
  settingsSchema,
  type EventSummary,
} from "../schemas";
import type { DataAdapter, EventFilterParams } from "../types";
import { parseDmY } from "../filters";

/**
 * Serves the Phase 0 content snapshot. This is the default adapter and the one
 * the site runs on until a Django backend exists.
 *
 * Fixtures are validated on the way out, exactly like a real API response,
 * so the contract is enforced in both directions.
 */
const parse = <T>(schema: { parse: (v: unknown) => T }, value: unknown, what: string): T => {
  try {
    return schema.parse(value);
  } catch (error) {
    throw new Error(`Fixture "${what}" does not match its schema: ${String(error)}`);
  }
};

const events = () => parse(eventsPageSchema, eventsFixture, "events");
const eventDetails = () =>
  eventDetailsFixture.map((e, i) => parse(eventDetailSchema, e, `event-details[${i}]`));
const packages = () =>
  packagesFixture.map((p, i) => parse(ownershipPackageSchema, p, `packages[${i}]`));

export const mockAdapter: DataAdapter = {
  getSettings: async () => parse(settingsSchema, settingsFixture, "settings"),
  getHome: async () => parse(homeSchema, homeFixture, "home"),
  getAboutPage: async () => parse(aboutPageSchema, aboutFixture, "about"),
  getPackages: async () => packages(),
  getPackage: async (slug) => packages().find((p) => p.slug === slug) ?? null,
  getOffer: async () => parse(offerSchema, offerFixture, "offer"),
  getBookNow: async () => parse(bookNowSchema, bookNowFixture, "book-now"),
  getContactPage: async () => parse(contactPageSchema, contactFixture, "contact"),
  getGallery: async () => parse(gallerySchema, galleryFixture, "gallery"),
  getEvents: async () => events(),

  /**
   * Mirrors the live `/events/filter` behaviour (audit/interactions.md §5):
   * dates arrive as `d-m-Y`, a single date without a category is ignored, and
   * an event whose dates are null never matches a date filter.
   */
  filterEvents: async ({ start_date, end_date, category_id }: EventFilterParams) => {
    const all = events().events;
    const onlyOneDate = Boolean(start_date) !== Boolean(end_date);
    if (onlyOneDate && !category_id) return all;

    const from = parseDmY(start_date);
    const to = parseDmY(end_date);

    return all.filter((event) => {
      if (category_id && !matchesCategory(event, category_id)) return false;
      if (!from && !to) return true;
      const when = eventDate(event);
      if (!when) return false;
      if (from && when < from) return false;
      if (to && when > to) return false;
      return true;
    });
  },

  getEvent: async (slug) => eventDetails().find((e) => e.slug === slug) ?? null,
  getRelatedEvents: async (slug) => events().events.filter((e) => e.slug !== slug),
  getPosts: async () => parse(postsPageSchema, postsFixture, "posts"),
  getPost: async (slug) =>
    postDetailsFixture
      .map((p, i) => parse(postDetailSchema, p, `post-details[${i}]`))
      .find((p) => p.slug === slug) ?? null,
};

/** The fixtures carry the category name; the filter uses the id from the select. */
function matchesCategory(event: EventSummary, categoryId: string): boolean {
  const option = events().filters.categories.find((c) => c.value === categoryId);
  return option ? event.category.name === option.label : false;
}

/** Event cards carry "DD" + "MON YYYY"; combine them into a comparable date. */
function eventDate(event: EventSummary): Date | null {
  if (!event.day || !event.monthYear) return null;
  const parsed = new Date(`${event.day} ${event.monthYear}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
