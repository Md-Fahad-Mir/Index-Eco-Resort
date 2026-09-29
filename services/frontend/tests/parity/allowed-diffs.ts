/**
 * Every intentional difference from the live site, with its reason.
 *
 * CLAUDE.md rule 9: parity means keeping what works — errors are not features.
 * `href="#"` placeholders stay verbatim (rule 9b) and never appear here; only
 * targets that 404/500 on the live site (rule 9c), decorative UI with no backend
 * (rule 9d) and markup-level semantic fixes (rule 9e) do.
 *
 * The link-parity suite treats a difference as a failure unless it matches an
 * entry below, so adding one is a deliberate, reviewable act.
 */

export type AllowedDiff = {
  /** Which rule 9 clause justifies it. */
  rule: "9c" | "9d" | "9e" | "9f";
  /** Routes it applies to; "*" for every route. */
  routes: string[] | "*";
  /** What the live site does. */
  live: string;
  /** What this site does instead. */
  ours: string;
  /** Why the live behavior cannot simply be copied. */
  reason: string;
  /** Set when the owner must act for the live behavior to become correct. */
  ownerAction?: string;
  /**
   * Destinations this entry accounts for, normalised the way the link-parity
   * test normalises them. Listing them explicitly keeps the test exact instead
   * of guessing from the prose.
   */
  hrefs?: string[];
  /**
   * A pattern for families of destinations too numerous to list — the gallery's
   * per-image links, for instance. Written as a regex source string.
   */
  hrefPattern?: string;
};

export const ALLOWED_DIFFS: AllowedDiff[] = [
  {
    rule: "9c",
    routes: ["/about_us"],
    live: "/about_us renders a separate route (`who.we.are`) and returns HTTP 500",
    ours: "/about_us permanently redirects (308) to /about-us",
    reason:
      "live /about_us returns 500 — its template reads photo_one/two/three off a " +
      "model whose columns are id, video, description, core_purpose, " +
      "core_purpose_bg_video. The page has never rendered. Its data is Home's " +
      '"Why Buy Our Share" block, not About content, so no separate page is built.',
  },
  {
    rule: "9c",
    routes: "*",
    live: 'mobile menu "About Us" links to /about_us (a 500)',
    ours: 'mobile menu "About Us" links to /about-us',
    reason: "live /about_us returns 500; /about-us is the evident working target",
    hrefs: ["/about_us"],
  },
  {
    rule: "9c",
    routes: ["/event"],
    live: 'Events page-hero breadcrumb "Home" links to /people-leading',
    ours: 'Events page-hero breadcrumb "Home" links to /',
    reason: "/people-leading returns HTTP 500 on the live site",
    hrefs: ["/people-leading"],
  },
  {
    rule: "9c",
    routes: ["/event"],
    live: "cards rendered by the AJAX filter link to /event-details/{id}",
    ours: "every event card links to /events/{slug}, filtered or not",
    reason:
      "/event-details/{id} returns 404 on the live site; /events/{slug} is the " +
      "working detail route the server-rendered cards already use",
    hrefs: ["/event-details/{id}"],
  },
  {
    rule: "9c",
    routes: ["/gallery", "/"],
    live: "gallery lightbox links in the category tabs point at /public/images/admin/gallery/...",
    ours: "every tile links to the same image under /public/storage/... (now mirrored to /media/...)",
    reason:
      "all 20 of those links return 404 on the live site, so clicking a tile inside any " +
      "category opens nothing. The <img> beside each one already uses the working path " +
      "with the same filename, which is the evident working target.",
    ownerAction: "No action needed; the underlying image files are fine.",
  },
  {
    rule: "9c",
    routes: "*",
    live:
      "the floating dock exposes WhatsApp twice with different numbers: the button uses " +
      "web.whatsapp.com/send?phone=+8801700729312, while a slide-out panel and a " +
      "display:none widget link to wa.me/+8801711307580",
    ours: "one WhatsApp action, using the button's own destination",
    reason:
      "the two numbers contradict each other, and the second is reachable only through " +
      "a hover panel that the design replaces with a label. Shipping two WhatsApp " +
      "buttons with different numbers would pass the contradiction on to visitors.",
    ownerAction:
      "Decide which WhatsApp number is correct; it is one of the mismatches listed in §B.",
    hrefs: ["https://wa.me/+8801711307580"],
  },
  {
    rule: "9e",
    routes: ["/", "/gallery"],
    live: "each gallery tile is an <a> pointing straight at the full-size image file",
    ours: "each tile is a button that opens the image in a lightbox",
    reason:
      "the design system specifies a lightbox with caption, counter, keyboard and swipe " +
      "(§8). Navigating to a bare .jpg leaves the site, has no caption and no way back " +
      "but the back button. The same images are reachable, in a better viewer. The " +
      "pattern covers every image destination: gallery tiles and the room photographs.",
    hrefPattern: "\\.(png|jpe?g|webp|avif|gif)$",
  },
  {
    rule: "9d",
    routes: ["/events/*"],
    live: '"Leave a Reply" block with Name/Email/Website/Comment and a Post Comment button',
    ours: "not rendered (features.eventCommentForm = false)",
    reason:
      "decorative on the live site: no <form>, no name attributes, no action and no " +
      "script bound to .btn-post-comment, so nothing was ever submitted or stored",
    ownerAction: "Decide whether comments should exist; a real backend would be new scope.",
  },
  {
    rule: "9e",
    routes: ["/"],
    live: "two <h1>: hero slide 1's is empty in the CMS, slide 2's holds the title",
    ours: "one <h1> — slide 1's empty CMS title and subline are not rendered",
    reason: "an empty <h1> is a markup defect; rule 9e requires exactly one non-empty <h1>",
    ownerAction: "Fill or clear hero slide 1's title/subline fields in the admin panel.",
  },
  {
    rule: "9e",
    routes: ["/blog-details/*"],
    live: "no title element and no <h1> — the post title appears only on /blogs",
    ours: "the post's own title is rendered as the page <h1>",
    reason: "every page needs exactly one non-empty <h1> (rule 9e); the data already has the title",
  },
];

/** Every destination the allowed diffs account for. */
export const allowedHrefs = new Set(ALLOWED_DIFFS.flatMap((diff) => diff.hrefs ?? []));

const allowedPatterns = ALLOWED_DIFFS.filter((d) => d.hrefPattern).map(
  (d) => new RegExp(d.hrefPattern!),
);

/** True when an allowed diff accounts for this destination. */
export const isAllowedHref = (href: string): boolean =>
  allowedHrefs.has(href) || allowedPatterns.some((pattern) => pattern.test(href));

/** Entries that apply to a route, for assertions and reporting. */
export const allowedDiffsFor = (route: string): AllowedDiff[] =>
  ALLOWED_DIFFS.filter(
    (d) =>
      d.routes === "*" ||
      d.routes.some((r) => (r.endsWith("/*") ? route.startsWith(r.slice(0, -1)) : r === route)),
  );
