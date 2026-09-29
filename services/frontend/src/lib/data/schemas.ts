import { z } from "zod";

/**
 * THE CONTRACT.
 *
 * These schemas define exactly what the future Django backend must return.
 * Every field name, text value and slug here was captured from the live site in
 * Phase 0 and must survive the migration unchanged — `pnpm contract:export`
 * publishes them as JSON Schema plus docs/API-CONTRACT.md for the backend
 * developer.
 *
 * Two conventions worth knowing before changing anything:
 *  - `href` values are kept verbatim, including `"#"` and `null`. A link that
 *    goes nowhere on the live site still goes nowhere here (CLAUDE.md rule 9b).
 *  - Text is never normalised. Typos, mixed Bangla/English and the known CMS
 *    mistakes in docs/01-SITE-AUDIT.md §9 render as-is.
 */

/** An image as the CMS provides it. `src` may be relative; resolve via assetUrl(). */
export const imgSchema = z.object({
  src: z.string(),
  alt: z.string().default(""),
  width: z.number().optional(),
  height: z.number().optional(),
});

/** A link. `href` is null when the live markup has no href attribute at all. */
export const linkSchema = z.object({
  label: z.string().default(""),
  href: z.string().nullable(),
});

export const socialSchema = z.object({
  network: z.string(),
  href: z.string(),
  target: z.string().nullable().optional(),
});

/** A form control, mirroring the live field names exactly. */
export const formFieldSchema = z.object({
  name: z.string().nullable(),
  type: z.enum(["text", "tel", "email", "textarea", "checkbox", "url", "hidden", "number"]),
  required: z.boolean().default(false),
  placeholder: z.string().nullable().default(null),
  /** Hidden fields carry their literal value — the contact modal sends address="N/A". */
  value: z.string().nullable().optional(),
});

export const navItemSchema: z.ZodType<{
  label: string;
  href: string | null;
  active?: boolean;
  children?: { label: string; href: string | null }[];
}> = z.object({
  label: z.string(),
  href: z.string().nullable(),
  active: z.boolean().optional(),
  children: z.array(linkSchema).optional(),
});

export const settingsSchema = z.object({
  siteName: z.string(),
  logo: imgSchema.nullable(),
  favicon: z.string().nullable(),
  topBar: z.object({
    // PARITY: plain text on the live site, not links — hence href: null.
    phone: z.object({ label: z.string(), href: z.null() }),
    email: z.object({ label: z.string(), href: z.null() }),
    socials: z.array(socialSchema),
  }),
  nav: z.array(navItemSchema),
  mobileNav: z.array(navItemSchema),
  mobileCallNow: linkSchema,
  bookNow: linkSchema,
  floatingDock: z.object({
    whatsappButton: linkSchema,
    phoneButton: linkSchema,
    panelPhone: linkSchema,
    panelWhatsapp: linkSchema,
    hiddenWhatsapp: z.object({ href: z.string() }),
  }),
  contactModal: z.object({
    title: z.string(),
    successMessage: z.string(),
    submitLabel: z.string(),
    submittingLabel: z.string(),
    endpoint: z.string(),
    method: z.string(),
    fields: z.array(formFieldSchema),
  }),
  /** No announcement bar exists on the live site (audit §11.1). */
  announcement: z.object({ text: z.string(), pages: z.array(z.string()) }).nullable(),
  footer: z.object({
    logo: imgSchema.nullable(),
    about: z.string(),
    socials: z.array(socialSchema),
    columns: z.array(z.object({ title: z.string(), links: z.array(linkSchema) })),
    contact: z.array(z.object({ text: z.string(), href: z.string().nullable() })),
    bottom: z.object({
      companyName: z.string(),
      copyright: z.string(),
      creditLabel: z.string(),
      creditSite: z.string(),
      creditHref: z.string().nullable(),
    }),
  }),
});

export const pageHeroSchema = z.object({
  title: z.string(),
  image: imgSchema,
  breadcrumb: z.object({ home: linkSchema, current: z.string() }),
});

export const aboutBlockSchema = z.object({
  images: z.array(imgSchema),
  videoUrl: z.string(),
  eyebrow: z.string(),
  title: z.string(),
  text: z.string(),
  features: z.array(z.object({ title: z.string(), text: z.string() })),
  cta: linkSchema,
  phone: z.object({ label: z.string(), value: z.string(), href: z.string().nullable() }),
});

export const packageSummarySchema = z.object({
  name: z.string(),
  href: z.string(),
  slug: z.string(),
  card: imgSchema.nullable(),
});

export const plansBlockSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  packages: z.array(packageSummarySchema),
});

export const galleryCategorySchema = z.object({ id: z.string(), name: z.string() });

export const galleryItemSchema = z.object({
  pane: z.string(),
  categoryName: z.string(),
  title: z.string(),
  image: imgSchema,
  /** Full-size image for the lightbox. */
  fullSrc: z.string(),
});

export const galleryBlockSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  categories: z.array(galleryCategorySchema),
  /** The "All" set. On Home the live site caps this at 12 of 21 (audit §11.2). */
  items: z.array(galleryItemSchema),
  /** Per-category sets, keyed by category id. */
  itemsByCategory: z.record(z.string(), z.array(galleryItemSchema)),
});

export const roomSchema = z.object({
  tabLabel: z.string(),
  tabTitle: z.string().nullable(),
  tabDescription: z.string().nullable(),
  name: z.string(),
  description: z.string(),
  images: z.array(imgSchema),
  floorBadges: z.array(z.string()),
  amenities: z.array(z.object({ label: z.string(), value: z.string() })),
  cta: linkSchema,
});

export const testimonialSchema = z.object({
  rating: z.number(),
  quote: z.string(),
  avatar: imgSchema.nullable(),
  name: z.string(),
  role: z.string(),
});

export const postSummarySchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  image: imgSchema.nullable(),
  href: z.string(),
  slug: z.string(),
  cta: linkSchema,
});

export const heroSlideSchema = z.object({
  kind: z.enum(["video", "image"]),
  videoUrl: z.string().nullable(),
  image: imgSchema,
  /** Empty on the live site's video slide — not rendered (rule 9e). */
  subline: z.string(),
  title: z.string(),
  cta: linkSchema,
});

export const homeSchema = z.object({
  hero: z.object({ autoplayMs: z.number(), slides: z.array(heroSlideSchema) }),
  highlights: z.array(
    z.object({
      icon: imgSchema.nullable(),
      title: z.string(),
      subtitle: z.string(),
      cta: linkSchema,
    }),
  ),
  about: aboutBlockSchema,
  glance: z.object({
    eyebrow: z.string(),
    title: z.string(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })),
    slides: z.array(z.object({ image: imgSchema, label: z.string(), caption: z.string() })),
  }),
  gallery: galleryBlockSchema,
  ctaStrip: z.object({ avatar: imgSchema.nullable(), text: z.string(), cta: linkSchema }),
  plans: plansBlockSchema,
  whyBuy: z.object({
    eyebrow: z.string(),
    title: z.string(),
    features: z.array(
      z.object({ icon: imgSchema.nullable(), title: z.string(), text: z.string() }),
    ),
    image: imgSchema.nullable(),
  }),
  villa: z.object({ eyebrow: z.string(), title: z.string(), rooms: z.array(roomSchema) }),
  restaurant: z.object({
    eyebrow: z.string(),
    title: z.string(),
    text: z.string(),
    cta: linkSchema,
    image: imgSchema.nullable(),
  }),
  testimonials: z.object({
    eyebrow: z.string(),
    title: z.string(),
    items: z.array(testimonialSchema),
  }),
  latestPosts: z.object({
    eyebrow: z.string(),
    title: z.string(),
    posts: z.array(postSummarySchema),
  }),
});

export const aboutPageSchema = z.object({
  hero: pageHeroSchema,
  about: aboutBlockSchema,
  plans: plansBlockSchema,
  visionMission: z.object({
    eyebrow: z.string(),
    title: z.string(),
    tabs: z.array(
      z.object({
        label: z.string(),
        kicker: z.string(),
        title: z.string(),
        text: z.string(),
        image: imgSchema.nullable(),
      }),
    ),
  }),
  coreValues: z.object({
    title: z.string(),
    intro: z.string(),
    items: z.array(z.object({ tone: z.string(), title: z.string(), text: z.string() })),
  }),
});

export const ownershipPackageSchema = packageSummarySchema.extend({
  hero: pageHeroSchema,
  /** PARITY: every package reads "Silver Ownership" on the live site (audit §9.1). */
  heading: z.string(),
  discountText: z.string(),
  cta: linkSchema,
  benefitsTitle: z.string(),
  benefits: z.array(z.string()),
  youtubeId: z.string().nullable(),
  youtubeSrc: z.string().nullable(),
  plans: plansBlockSchema,
});

export const offerSchema = z.object({
  hero: pageHeroSchema,
  headline: z.string(),
  paragraphs: z.array(z.string()),
  note: z.string(),
  poster: imgSchema.nullable(),
});

export const bookNowSchema = z.object({
  hero: pageHeroSchema,
  text: z.string(),
  /** PARITY: the live href has no file path; never invented (rule 9f). */
  download: z.object({ label: z.string(), href: z.string(), download: z.boolean() }),
});

export const contactPageSchema = z.object({
  hero: pageHeroSchema,
  form: z.object({
    endpoint: z.string(),
    method: z.string(),
    submitLabel: z.string(),
    fields: z.array(formFieldSchema),
  }),
  mapEmbedUrl: z.string().nullable(),
  hotline: z.object({ label: z.string(), value: z.string(), href: z.string().nullable() }),
  infoCards: z.array(z.object({ text: z.string() })),
});

export const gallerySchema = galleryBlockSchema.extend({ hero: pageHeroSchema });

export const eventSummarySchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  image: imgSchema.nullable(),
  day: z.string(),
  monthYear: z.string(),
  category: z.object({ name: z.string(), href: z.string().nullable() }),
  /** Raw strings from the CMS, e.g. "20:51:00 - 17:54:00" (audit §9.12). */
  meta: z.array(z.string()),
  href: z.string(),
  slug: z.string(),
  cta: linkSchema,
});

export const eventsPageSchema = z.object({
  hero: pageHeroSchema,
  filters: z.object({
    mechanism: z.string(),
    endpoint: z.string(),
    params: z.array(z.string()),
    /** flatpickr's format on the live site; the API receives this same string. */
    dateFormat: z.string(),
    emptyState: z.string(),
    ajaxDetailHrefPattern: z.string(),
    controls: z.array(z.object({ id: z.string(), placeholder: z.string(), ariaLabel: z.string() })),
    categories: z.array(z.object({ value: z.string(), label: z.string() })),
  }),
  events: z.array(eventSummarySchema),
});

export const eventDetailSchema = z.object({
  slug: z.string(),
  href: z.string(),
  banner: imgSchema.nullable(),
  meta: z.array(z.string()),
  html: z.string(),
  infoTitle: z.string(),
  info: z.record(z.string(), z.string()),
  bookingCta: linkSchema,
  /** Decorative on the live site: no form, no endpoint (rule 9d). */
  comments: z.object({
    enabled: z.literal(false),
    title: z.string(),
    note: z.string(),
    saveInfoLabel: z.string(),
    saveInfoChecked: z.boolean(),
    fields: z.array(formFieldSchema.partial({ required: true })),
    submitLabel: z.string(),
    endpoint: z.null(),
  }),
  relatedTitle: z.string(),
  related: z.array(z.object({ title: z.string(), href: z.string() })),
});

export const postsPageSchema = z.object({
  hero: pageHeroSchema,
  posts: z.array(postSummarySchema),
});

export const postDetailSchema = z.object({
  slug: z.string(),
  href: z.string(),
  /** Not rendered on the live detail page; taken from the list (rule 9e). */
  title: z.string().nullable(),
  titleRenderedOnPage: z.boolean(),
  image: imgSchema.nullable(),
  categoryTag: z.string(),
  meta: z.array(z.string()),
  html: z.string(),
  share: z.object({
    label: z.string(),
    links: z.array(z.object({ network: z.string(), href: z.string().nullable() })),
  }),
  sidebar: z.object({
    recent: z.array(z.object({ num: z.string(), title: z.string(), href: z.string().nullable() })),
    /** PARITY: these are EVENT categories linking to /event (audit §9.15). */
    categories: z.array(
      z.object({ label: z.string(), count: z.string(), href: z.string().nullable() }),
    ),
    cta: z.object({ title: z.string(), text: z.string(), link: linkSchema }),
  }),
});

export type Img = z.infer<typeof imgSchema>;
export type Link = z.infer<typeof linkSchema>;
export type FormField = z.infer<typeof formFieldSchema>;
export type SiteSettings = z.infer<typeof settingsSchema>;
export type PageHero = z.infer<typeof pageHeroSchema>;
export type HomeData = z.infer<typeof homeSchema>;
export type AboutPage = z.infer<typeof aboutPageSchema>;
export type OwnershipPackage = z.infer<typeof ownershipPackageSchema>;
export type PackageSummary = z.infer<typeof packageSummarySchema>;
export type Offer = z.infer<typeof offerSchema>;
export type BookNow = z.infer<typeof bookNowSchema>;
export type ContactPage = z.infer<typeof contactPageSchema>;
export type Gallery = z.infer<typeof gallerySchema>;
/** The gallery without a page hero — what the shared section renders. */
export type GalleryBlock = z.infer<typeof galleryBlockSchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type EventsPage = z.infer<typeof eventsPageSchema>;
export type EventSummary = z.infer<typeof eventSummarySchema>;
export type EventDetail = z.infer<typeof eventDetailSchema>;
export type PostsPage = z.infer<typeof postsPageSchema>;
export type PostSummary = z.infer<typeof postSummarySchema>;
export type PostDetail = z.infer<typeof postDetailSchema>;
export type Room = z.infer<typeof roomSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
