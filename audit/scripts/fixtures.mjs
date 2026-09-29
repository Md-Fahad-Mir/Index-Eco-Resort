/**
 * Phase 0 fixture builder — turns the crawled HTML into JSON matching the data
 * contract in docs/03-ARCHITECTURE.md §5.2, so the Next.js app can be built on
 * real content before the Laravel API exists. Content is copied verbatim,
 * including the known mistakes listed in docs/01-SITE-AUDIT.md §9.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const HTML = new URL("../html/", import.meta.url);
const OUT = fileURLToPath(new URL("../../services/frontend/src/fixtures/", import.meta.url));
const ORIGIN = "https://indexecoresort.com";

const $of = async (name) => load(await readFile(new URL(`${name}.html`, HTML), "utf8"));
/**
 * Text of an element, normalised but NOT flattened.
 *
 * Blank lines in a CMS textarea are the author's paragraph structure. The old
 * Blade templates print those fields inside a single <p>, where HTML collapses
 * them — a template limitation, not an editorial decision — so the snapshot
 * keeps them and the frontend decides how to render them. Everything else
 * (indentation, wrapped source lines) still collapses to single spaces.
 */
const t = ($, el) =>
  ($(el).text() || "")
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n\s*/)
    .map((para) => para.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
/** Reads a CSS background-image url() off a style attribute. */
const bg = (style = "") => (style.match(/url\(['"]?(.*?)['"]?\)/) || [])[1] || "";
const img = ($, el) => (el ? { src: $(el).attr("src") || "", alt: $(el).attr("alt") ?? "" } : null);
const link = ($, el) => ({ label: t($, el), href: $(el).attr("href") ?? null });
/** Last non-empty <p>: CMS text is often wrapped as <p><p>real text</p></p>. */
const innerP = ($, root) => {
  const ps = $(root).find("p").map((_, p) => t($, p)).get().filter(Boolean);
  return ps.length ? ps[ps.length - 1] : "";
};

await mkdir(OUT, { recursive: true });
const write = async (name, data) => {
  await writeFile(`${OUT}${name}.json`, JSON.stringify(data, null, 2) + "\n");
  console.log(`  ${name}.json`);
};

/* ── shared blocks ─────────────────────────────────────────────────────── */
const aboutBlock = ($) => {
  const root = $(".about_us_area").first();
  const phoneWrap = root.find(".contact-info__text").first();
  return {
    images: root.find(".about__gallery img").map((_, el) => img($, el)).get(),
    videoUrl: root.find("#videoPlayer source").attr("src") || "",
    eyebrow: t($, root.find(".section-sub-title").first()),
    title: t($, root.find(".section-main-title").first()),
    text: t($, root.find(".about__desc").first()),
    // Icons here are template inline SVGs, not CMS images.
    features: root.find(".feature").map((_, el) => ({
      title: t($, $(el).find(".feature__body h4").first()),
      text: t($, $(el).find(".feature__body p").first()),
    })).get(),
    cta: link($, root.find("a.btn-learn").first()),
    phone: {
      label: t($, phoneWrap.find("small").first()),
      value: t($, phoneWrap.find("strong").first()),
      href: phoneWrap.closest("a").attr("href") ?? null, // PARITY: "#"
    },
  };
};

const plansBlock = ($) => {
  const root = $(".ownership-section-area").first();
  return {
    eyebrow: t($, root.find(".section-sub-title").first()),
    title: t($, root.find(".section-main-title").first()),
    packages: root.find(".ownership-owl .owl-slide").map((_, el) => {
      const a = $(el).find("a").first();
      const href = a.attr("href") || "";
      return {
        name: t($, $(el).find(".ownership-card__label").first()),
        href,
        slug: href.replace(ORIGIN, "").replace(/^\//, ""),
        card: img($, $(el).find(".ownership-card__img")[0]),
      };
    }).get(),
  };
};

const galleryBlock = ($) => {
  const tabs = $("#galleryTab .gallery-tab-btn").map((_, b) => ({
    id: ($(b).attr("data-bs-target") || "").replace("#pills-", ""),
    name: t($, b),
  })).get();
  const items = [];
  // PARITY (rule 9c): in the category panes the lightbox anchor points at
  // /public/images/admin/gallery/... which returns 404 on the live site, while
  // the <img> beside it uses the working /public/storage/... path with the same
  // filename. Clicking a tile in any category therefore opens nothing today.
  // We keep the image and repair the link to its evident working target.
  const repairFullSrc = (fullSrc, imgSrc) => {
    if (!fullSrc || !fullSrc.includes("/public/images/")) return fullSrc;
    const file = fullSrc.split("/").pop();
    return imgSrc && imgSrc.split("/").pop() === file ? imgSrc : fullSrc;
  };
  $("#galleryTabContent .tab-pane").each((_, pane) => {
    const paneId = ($(pane).attr("id") || "").replace("pills-", "");
    $(pane).find(".gird_gallery_card").each((_, card) => {
      const a = $(card).find("a").first();
      const image = img($, $(card).find("img")[0]);
      items.push({
        pane: paneId,
        categoryName: t($, $(card).find(".gallery_tag span").first()),
        title: t($, $(card).find(".gallery_title span").first()),
        image,
        fullSrc: repairFullSrc(a.attr("href") || a.attr("data-src") || "", image?.src),
      });
    });
  });
  return {
    eyebrow: t($, $(".gallery_section .section-sub-title").first()),
    title: t($, $(".gallery_section .section-main-title").first()),
    categories: tabs,
    // PARITY: the live site renders the set once per tab pane; "all" on Home is capped at 12.
    items: items.filter((i) => i.pane === "all"),
    itemsByCategory: Object.fromEntries(
      tabs.filter((c) => c.id !== "all").map((c) => [c.id, items.filter((i) => i.pane === c.id)])
    ),
  };
};

const pageHero = ($) => {
  const root = $(".page-hero").first();
  if (!root.length) return null;
  return {
    title: t($, root.find(".page-hero__title").first()),
    image: { src: bg(root.find(".page-hero__bg").attr("style") || ""), alt: "" },
    breadcrumb: {
      home: link($, root.find(".page-hero__breadcrumb a").first()),
      current: t($, root.find(".page-hero__breadcrumb .current").first()),
    },
  };
};

console.log("fixtures:");

/* ── settings (global chrome, identical on every page) ─────────────────── */
{
  const $ = await $of("home");
  const topbarText = $(".header_top .contact_item").map((_, el) => t($, el)).get();
  const socialNet = ($, el) => {
    const cls = ($(el).find("i, svg").attr("class") || "") + " " + ($(el).attr("href") || "");
    return cls.match(/facebook|instagram|youtube|twitter|linkedin|tiktok|brand-x|wa\.me|whatsapp/)?.[0] ?? "link";
  };
  await write("settings", {
    siteName: "indexecoresort.com",
    logo: img($, $("nav.main_menu .navbar-brand img")[0]),
    favicon: $('link[rel="icon"]').attr("href") || null,
    topBar: {
      // PARITY: plain text on the live site, not links.
      phone: { label: topbarText[0] ?? "", href: null },
      email: { label: topbarText[1] ?? "", href: null },
      socials: $(".header_social_links a").map((_, el) => ({ network: socialNet($, el), href: $(el).attr("href") || "" })).get(),
    },
    nav: $("nav.main_menu ul.main_menu_list > li").map((_, li) => {
      const a = $(li).children("a").first();
      const children = $(li).find("ul.sub_menu_list a").map((_, c) => link($, c)).get();
      const item = {
        label: (a.clone().children("svg").remove().end().text() || "").replace(/\s+/g, " ").trim(),
        href: a.attr("href") ?? null, // PARITY: "Ownership Packages" has no href at all.
        active: a.hasClass("activate"),
      };
      if (children.length) item.children = children;
      return item;
    }).get(),
    mobileNav: $("#mobileMenu .menu-link").map((_, a) => {
      const item = { label: (($(a).clone().children("svg,i").remove().end().text()) || "").replace(/\s+/g, " ").trim(), href: $(a).attr("href") ?? null };
      const sub = $(a).attr("data-submenu");
      if (sub) item.children = $(`#${sub}-submenu a`).map((_, c) => link($, c)).get();
      return item;
    }).get(),
    mobileCallNow: link($, $('#mobileMenu a[href^="tel:"]').first()),
    bookNow: link($, $("header.header_area .contact_btn a").first()),
    floatingDock: {
      whatsappButton: { label: "WhatsApp", href: $('#mystickyWidget a[href*="web.whatsapp.com"]').first().attr("href") || "" },
      phoneButton: { label: "Phone", href: $('#mystickyWidget a[href^="tel:"]').first().attr("href") || "" },
      // PARITY: panel shows 01711307580 but dials +8801700729312.
      panelPhone: link($, $("#mystickyPhPanel a").first()),
      panelWhatsapp: link($, $("#mystickyWaPanel a").first()),
      // PARITY: hidden duplicate widget in markup (.fixed_footer_whatsapp_icon.d-none), different number.
      hiddenWhatsapp: { href: $(".fixed_footer_whatsapp_icon a").first().attr("href") || "" },
    },
    contactModal: {
      // The live heading element also contains the close control's "✕" glyph;
      // that is a button, not part of the title.
      title: t($, $(".mysticky-form-head").first().clone().children("span,button,a,i").remove().end()),
      successMessage: t($, $("#mystickySuccessMsg").first()),
      submitLabel: t($, $("#stickySubmitBtn").first()),
      submittingLabel: "Sending...",
      endpoint: $("#stickyContactForm").attr("action") || "",
      method: ($("#stickyContactForm").attr("method") || "POST").toUpperCase(),
      // PARITY: submitted as urlencoded via jQuery .serialize(); success is any 2xx.
      fields: $("#stickyContactForm").find("input, textarea").map((_, f) => {
        const type = f.tagName.toLowerCase() === "textarea" ? "textarea" : ($(f).attr("type") || "text");
        return {
          name: $(f).attr("name") ?? null,
          type,
          required: $(f).attr("required") !== undefined,
          placeholder: $(f).attr("placeholder") ?? null,
          // Hidden fields are submitted with their literal value — address is
          // always "N/A" — except the CSRF token, which is a per-request secret.
          value:
            type === "hidden" && $(f).attr("name") !== "_token"
              ? ($(f).attr("value") ?? null)
              : null,
        };
      }).get(),
    },
    announcement: null, // PARITY: no marquee on the live site (audit §4.6 not reproducible).
    footer: {
      logo: img($, $("footer .footer_logo img")[0]),
      about: t($, $("footer .footer-text").first()),
      socials: $("footer .social-links a").map((_, el) => ({
        network: socialNet($, el),
        href: $(el).attr("href") || "",
        target: $(el).attr("target") ?? null,
      })).get(),
      columns: $("footer .footer_section_items").map((_, col) => ({
        title: t($, $(col).find("h4").first()),
        links: $(col).find("ul a").map((_, a) => link($, a)).get(),
      })).get().filter((c) => c.links.length),
      contact: $("footer .footer-contact .contact-item").map((_, it) => {
        const a = $(it).find("a").first();
        return { text: t($, it), href: a.attr("href") ?? null };
      }).get(),
      // NOTE: .footer-bottom sits outside <footer> once parsed — the live markup
      // closes <footer> early, so it is selected without the ancestor.
      bottom: {
        companyName: t($, $(".footer-bottom .footer-left .company-name").first()),
        copyright: t($, $(".footer-bottom .footer-left .copyright").first()),
        creditLabel: t($, $(".footer-bottom .footer-right p").first()),
        creditSite: t($, $(".footer-bottom .footer-right a").first()),
        creditHref: $(".footer-bottom .footer-right a").attr("href") ?? null, // PARITY: no href
      },
    },
  });
}

/* ── home ──────────────────────────────────────────────────────────────── */
{
  const $ = await $of("home");
  await write("home", {
    hero: {
      // PARITY: an owl carousel, not a single video. Slide 1 is the video and its
      // tag/h1 are empty in the CMS, which is why the page has two <h1> elements.
      autoplayMs: 6000,
      slides: $(".banner_area .banner_slide").map((_, el) => ({
        kind: $(el).hasClass("video_slide") ? "video" : "image",
        videoUrl: $(el).find("video source").attr("src") || null,
        image: { src: bg($(el).find(".slide_bg").attr("style") || ""), alt: "" },
        subline: t($, $(el).find(".slide_tag").first()),
        title: t($, $(el).find("h1").first()),
        cta: link($, $(el).find(".banner_btn").first()),
      })).get(),
    },
    highlights: $(".features-section .feature-card").map((_, el) => ({
      icon: img($, $(el).find(".icon-wrap img")[0]),
      title: t($, $(el).find(".card-title").first()),
      subtitle: t($, $(el).find(".card-desc").first()),
      cta: link($, $(el).find(".read-more").first()),
    })).get(),
    about: aboutBlock($),
    glance: {
      eyebrow: t($, $(".glance-section-area .section-sub-title").first()),
      title: t($, $(".glance-section-area .section-main-title").first()),
      facts: $(".glance-section-area .info-list li").map((_, li) => {
        const raw = t($, li);
        const idx = raw.indexOf(":");
        return idx < 0 ? { label: raw, value: "" } : { label: raw.slice(0, idx).trim(), value: raw.slice(idx + 1).trim() };
      }).get(),
      slides: $(".glance-slider .glanceImages-slide-item").map((_, el) => ({
        image: img($, $(el).find("img")[0]),
        label: t($, $(el).find(".sl-sub").first()),
        caption: t($, $(el).find(".sl-title").first()),
      })).get(),
    },
    gallery: galleryBlock($),
    ctaStrip: {
      avatar: img($, $(".cta__text").closest("div").find("img")[0]),
      text: t($, $(".cta__text").first()),
      cta: link($, $(".cta__link").first()),
    },
    plans: plansBlock($),
    whyBuy: {
      eyebrow: t($, $(".wcu-section .section-sub-title").first()),
      title: t($, $(".wcu-section .section-main-title").first()),
      features: $(".wcu-card").map((_, el) => ({
        icon: img($, $(el).find(".wcu-card__icon-wrap img")[0]),
        title: t($, $(el).find(".wcu-card__title").first()),
        text: t($, $(el).find(".wcu-card__desc").first()),
      })).get(),
      image: img($, $(".wcu-building__img--desktop")[0] ?? $(".wcu-building__img-container img")[0]),
    },
    villa: {
      eyebrow: t($, $(".po__section .section-sub-title").first()),
      title: t($, $(".po__section .section-main-title").first()),
      rooms: $(".po__section .gallery-tab-btn").map((_, b) => {
        const pane = $($(b).attr("data-bs-target"));
        return {
          tabLabel: t($, b),
          tabTitle: $(b).attr("data-room-title") ?? null,
          tabDescription: $(b).attr("data-room-description") ?? null,
          name: t($, pane.find(".po__apt-name").first()),
          description: t($, pane.find(".po__apt-desc").first()),
          images: pane.find(".po_panel_img img").map((_, im) => img($, im)).get(),
          floorBadges: pane.find(".po__floor-badge").map((_, x) => t($, x)).get(),
          amenities: pane.find(".po__stat-item").map((_, it) => {
            const lines = $(it).find("span, small, strong, p").map((_, x) => t($, x)).get().filter(Boolean);
            return { label: lines[0] ?? "", value: lines.slice(1).join(" ") || t($, it) };
          }).get(),
          cta: link($, pane.find("a").last()),
        };
      }).get(),
    },
    restaurant: {
      eyebrow: t($, $(".resto__tagline").first()),
      title: t($, $(".resto__title").first()),
      text: t($, $(".resto__desc").first()),
      cta: link($, $(".resto__btn").first()),
      image: img($, $(".resto__image-wrap img")[0]),
    },
    testimonials: {
      eyebrow: t($, $(".testimonial-section-area .section-sub-title").first()),
      title: t($, $(".testimonial-section-area .section-main-title").first()),
      items: $(".testimonial-item").map((_, el) => ({
        rating: $(el).find(".stars .fa-star").length,
        quote: t($, $(el).find(".quote-text").first()),
        avatar: img($, $(el).find(".author img")[0]),
        name: t($, $(el).find(".author-name").first()),
        role: t($, $(el).find(".author-role").first()),
      })).get(),
    },
    latestPosts: {
      eyebrow: t($, $(".blog-section-area .section-sub-title").first()),
      title: t($, $(".blog-section-area .section-main-title").first()),
      posts: $(".blog-section-area .blog-item").map((_, el) => {
        const a = $(el).find(".blog-read-more").first();
        const href = a.attr("href") || "";
        return {
          title: t($, $(el).find(".blog-title").first()),
          excerpt: t($, $(el).find(".blog-excerpt").first()),
          image: img($, $(el).find(".blog-thumb img")[0]),
          href,
          slug: href.split("/").pop() || "",
          cta: link($, a),
        };
      }).get(),
    },
  });
}

/* ── about ─────────────────────────────────────────────────────────────── */
{
  const $ = await $of("about-us");
  await write("about", {
    hero: pageHero($),
    about: aboutBlock($),
    plans: plansBlock($),
    visionMission: {
      eyebrow: t($, $(".vm_header .section-sub-title").first()),
      title: t($, $(".vm_header .section-main-title").first()),
      tabs: $(".vm_section_area .gallery-tab-btn").map((_, b) => {
        const pane = $($(b).attr("data-bs-target"));
        return {
          label: t($, b),
          kicker: t($, pane.find(".vm__panel-sub-title").first()),
          title: t($, pane.find(".vm__panel-title").first()),
          text: t($, pane.find(".vm__panel-desc").first()),
          image: img($, pane.find("img")[0]),
        };
      }).get(),
    },
    coreValues: {
      title: t($, $(".cv-header h2").first()),
      intro: t($, $(".cv-header p").first()),
      items: $(".cv-card").map((_, el) => ({
        tone: ($(el).attr("class") || "").includes("gold") ? "gold" : "dark",
        title: t($, $(el).find("h3").first()),
        text: innerP($, el),
      })).get(),
    },
  });
}

/* ── packages ──────────────────────────────────────────────────────────── */
{
  const packages = [];
  for (const slug of ["gold-ownership-2", "platinum-ownership-3", "signature-ownership-4", "silver-ownership-5"]) {
    const $ = await $of(slug);
    const iframe = $('iframe[src*="youtube"]').first();
    packages.push({
      slug,
      href: `${ORIGIN}/${slug}`,
      name: t($, $(".page-hero__title").first()),
      hero: pageHero($),
      // PARITY: every package reads "Silver Ownership" — a CMS data mistake (audit §9.1).
      heading: t($, $(".title-block h2").first()),
      discountText: t($, $(".title-block > p").first()),
      cta: link($, $(".title-block a.btn-book").first()),
      card: img($, $(".membership-card img")[0]),
      benefitsTitle: t($, $(".benefits-block h3").first()),
      benefits: $(".benefits-list li").map((_, li) => t($, li)).get(),
      youtubeId: (iframe.attr("src") || "").match(/embed\/([\w-]+)/)?.[1] ?? null,
      youtubeSrc: iframe.attr("src") || null,
      plans: plansBlock($),
    });
  }
  await write("packages", packages);
}

/* ── offer ─────────────────────────────────────────────────────────────── */
{
  const $ = await $of("offer");
  await write("offer", {
    hero: pageHero($),
    headline: t($, $(".running-offer__heading").first()),
    paragraphs: $(".running-offer__content p").map((_, p) => t($, p)).get().filter(Boolean),
    note: t($, $(".running-offer__note").first()),
    poster: img($, $(".running-offer__image-wrap img")[0]),
  });
}

/* ── book now ──────────────────────────────────────────────────────────── */
{
  const $ = await $of("book-now");
  const dl = $("a[download]").first();
  await write("book-now", {
    hero: pageHero($),
    // PARITY: rendered in faux-italic on the live site; the design system renders it upright.
    text: $("p").map((_, p) => t($, p)).get().filter((x) => x.length > 40)[0] ?? "",
    // PARITY: href has no file path — the download is broken on the live site.
    download: { label: t($, dl), href: dl.attr("href") || "", download: true },
  });
}

/* ── contact ───────────────────────────────────────────────────────────── */
{
  const $ = await $of("contact");
  const form = $("form").not("#stickyContactForm").first();
  await write("contact", {
    hero: pageHero($),
    form: {
      endpoint: form.attr("action") || "",
      method: (form.attr("method") || "POST").toUpperCase(),
      submitLabel: t($, form.find("button, input[type=submit]").first()) || "Submit",
      // PARITY: no `required` attributes on this form, unlike the modal.
      fields: form.find("input, textarea").map((_, f) => {
        const type = f.tagName.toLowerCase() === "textarea" ? "textarea" : ($(f).attr("type") || "text");
        return {
          name: $(f).attr("name") ?? null,
          type,
          required: $(f).attr("required") !== undefined,
          placeholder: $(f).attr("placeholder") ?? null,
          value:
            type === "hidden" && $(f).attr("name") !== "_token"
              ? ($(f).attr("value") ?? null)
              : null,
        };
      }).get().filter((f) => f.name),
    },
    mapEmbedUrl: $('iframe[src*="google.com/maps"], .contact_map iframe').attr("src") || null,
    // PARITY: the hotline anchor is href="#", not a tel: link.
    hotline: {
      label: t($, $(".call_section_area h3").first()),
      value: t($, $(".call_content").first()),
      href: $(".call_content").attr("href") ?? null,
    },
    infoCards: $(".service_card").map((_, el) => ({ text: innerP($, el) || t($, el) })).get(),
  });
}

/* ── gallery ───────────────────────────────────────────────────────────── */
{
  const $ = await $of("gallery");
  await write("gallery", { hero: pageHero($), ...galleryBlock($) });
}

/* ── events ────────────────────────────────────────────────────────────── */
{
  const $ = await $of("event");
  await write("events", {
    hero: pageHero($),
    filters: {
      // PARITY: controls have no name attributes and no form; filtering is AJAX only.
      mechanism: "ajax",
      endpoint: "/events/filter",
      params: ["start_date", "end_date", "category_id"],
      dateFormat: "d-m-Y",
      emptyState: "No Events Found!",
      // PARITY: AJAX results link to /event-details/{id}, which 404s on the live site.
      ajaxDetailHrefPattern: "/event-details/{id}",
      controls: ["start-date", "end-date"].map((id) => ({
        id, placeholder: $(`#${id}`).attr("placeholder") || "", ariaLabel: $(`#${id}`).attr("aria-label") || "",
      })),
      categories: $("#category option").map((_, o) => ({ value: $(o).attr("value") ?? "", label: t($, o) })).get(),
    },
    events: $(".blog-item").map((_, el) => {
      const a = $(el).find(".blog-read-more").first();
      const href = a.attr("href") || "";
      const tag = $(el).find(".event-category-tag").first();
      return {
        title: t($, $(el).find(".blog-title").first()),
        excerpt: t($, $(el).find(".blog-excerpt").first()),
        image: img($, $(el).find(".blog-thumb img")[0]),
        day: t($, $(el).find(".badge-day").first()),
        monthYear: t($, $(el).find(".badge-month-year").first()),
        category: { name: t($, tag), href: tag.closest("a").attr("href") ?? null },
        meta: $(el).find(".event-meta-item").map((_, m) => t($, m)).get(),
        href, slug: href.split("/").pop() || "",
        cta: link($, a),
      };
    }).get(),
  });

  const details = [];
  for (const slug of ["royal-wedding-celebration-2026-1", "annual-corporate-summit-2026-2", "joyful-birthday-family-gathering-celebration-3", "index-eco-resort-coxs-bazar-2026-business-conference-4"]) {
    const $e = await $of(`events__${slug}`);
    const info = {};
    $e(".event-info-box .info-row").each((_, r) => {
      info[t($e, $e(r).find(".info-label").first()).replace(/:$/, "")] = t($e, $e(r).find(".info-value").first());
    });
    details.push({
      slug,
      href: `${ORIGIN}/events/${slug}`,
      // PARITY: no page hero on event detail — a banner image instead.
      banner: img($e, $e(".event-hero-thumb img")[0]),
      meta: $e(".event-detail-meta .meta-item").map((_, m) => t($e, m)).get(),
      html: ($e(".event-left .event-description, .event-left > div").not(".event-hero-thumb,.event-detail-meta,.comment-section").first().html() || "").trim(),
      infoTitle: t($e, $e(".info-title").first()),
      info,
      bookingCta: link($e, $e(".booking-wrap a").first()),
      // PARITY: decorative only — no <form>, no name attributes, no endpoint, no JS handler.
      comments: {
        enabled: false,
        title: t($e, $e(".comment-section h3").first()),
        note: t($e, $e(".comment-note").first()),
        saveInfoLabel: t($e, $e('label[for="save-info"]').first()),
        saveInfoChecked: $e("#save-info").attr("checked") !== undefined,
        fields: $e(".comment-form-grid input, .comment-form textarea").map((_, f) => ({
          name: $e(f).attr("name") ?? null,
          type: f.tagName.toLowerCase() === "textarea" ? "textarea" : ($e(f).attr("type") || "text"),
          placeholder: $e(f).attr("placeholder") ?? null,
        })).get(),
        submitLabel: t($e, $e(".btn-post-comment").first()),
        endpoint: null,
      },
      relatedTitle: t($e, $e(".events-related-title").first()),
      related: $e(".events-related-grid .blog-item").map((_, el) => {
        const a = $e(el).find("a").last();
        return { title: t($e, $e(el).find(".blog-title").first()), href: a.attr("href") || "" };
      }).get(),
    });
  }
  await write("event-details", details);
}

/* ── posts ─────────────────────────────────────────────────────────────── */
{
  const $ = await $of("blogs");
  await write("posts", {
    hero: pageHero($),
    posts: $(".blog-item").map((_, el) => {
      const a = $(el).find(".blog-read-more, a").last();
      const href = a.attr("href") || "";
      return {
        title: t($, $(el).find(".blog-title").first()),
        excerpt: t($, $(el).find(".blog-excerpt").first()),
        image: img($, $(el).find(".blog-thumb img")[0]),
        href, slug: href.split("/").pop() || "",
        cta: link($, a),
      };
    }).get(),
  });

  // The detail page renders no title element, so titles come from the list page.
  const listTitles = Object.fromEntries($(".blog-item").map((_, el) => {
    const href = $(el).find(".blog-read-more, a").last().attr("href") || "";
    return [[href.split("/").pop() || "", t($, $(el).find(".blog-title").first())]];
  }).get());

  const details = [];
  for (const slug of ["sustainable-living-eco-friendly-home-features-1", "kuzakataz-adhunik-risort-binizoger-ntun-smvabna-2"]) {
    const $p = await $of(`blog-details__${slug}`);
    details.push({
      slug,
      href: `${ORIGIN}/blog-details/${slug}`,
      // PARITY: not rendered on the live detail page (no <h1>); taken from /blogs.
      title: listTitles[slug] ?? null,
      titleRenderedOnPage: false,
      image: img($p, $p(".blog-details-hero-wrap img")[0]),
      categoryTag: t($p, $p(".blog-details-meta-tag").first()),
      meta: $p(".blog-details-meta-item").map((_, m) => t($p, m)).get(),
      html: ($p(".blog-details-article-body").first().html() || "").trim(),
      share: {
        label: t($p, $p(".blog-details-share-label").first()),
        links: $p(".blog-details-share-btn").map((_, a) => ({
          network: ($p(a).attr("class") || "").match(/--(\w+)$/)?.[1] ?? "link",
          href: $p(a).attr("href") ?? null, // PARITY: all "#"
        })).get(),
      },
      sidebar: {
        recent: $p(".blog-details-recent-post").map((_, el) => ({
          num: t($p, $p(el).find(".blog-details-post-num").first()),
          title: t($p, $p(el).find(".blog-details-post-title").first()),
          href: $p(el).closest("a").attr("href") ?? $p(el).find("a").attr("href") ?? null,
        })).get(),
        // PARITY: these are EVENT categories and link to /event (audit §9.15).
        categories: $p(".blog-details-cat-list li").map((_, li) => ({
          label: t($p, $p(li).clone().children(".blog-details-cat-count").remove().end()),
          count: t($p, $p(li).find(".blog-details-cat-count").first()),
          href: $p(li).find("a").attr("href") ?? $p(li).closest("a").attr("href") ?? null,
        })).get(),
        cta: {
          title: t($p, $p(".blog-details-cta-card h4, .blog-details-cta-card h3").first()),
          text: t($p, $p(".blog-details-cta-card p").first()),
          link: link($p, $p(".blog-details-cta-btn").first()),
        },
      },
    });
  }
  await write("post-details", details);
}
console.log("\nfixtures written to src/fixtures/");
