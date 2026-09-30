/**
 * Interface strings that are not CMS content: accessible names, form
 * validation, metadata. Everything editorial comes from the data layer.
 *
 * `{name}` placeholders are filled with `format()` from ../config. Plain
 * strings only, so a dictionary can be read on the server and the client alike.
 */
export const en = {
  meta: {
    siteTitle: "INDEX Eco Resort",
    siteDescription: "INDEX Eco Resort — ownership shares, stays, dining and events.",
    homeDescription:
      "INDEX Eco Resort — ownership shares in an eco resort, with stays, dining and event spaces.",
    aboutTitle: "About Us | INDEX Eco Resort",
    aboutDescription:
      "INDEX Eco Resort — who we are, what we are building, and the values behind it.",
  },
  language: {
    label: "Language",
    /** Accessible name of each option, in its own language. */
    names: { bn: "বাংলা", en: "English" },
    /** What the switch shows. */
    short: { bn: "বাং", en: "EN" },
  },
  chrome: {
    skipToContent: "Skip to content",
    mainNav: "Main",
    mobileNav: "Mobile",
    breadcrumb: "Breadcrumb",
    menu: "Menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    closeContactForm: "Close contact form",
    openContactOptions: "Contact us",
    closeContactOptions: "Close contact options",
    footerContact: "Contact Us",
  },
  carousel: {
    heroLabel: "Highlights",
    slideOf: "{n} of {total}",
    slideStatus: "Slide {n} of {total}",
    pauseSlideshow: "Pause slideshow",
    playSlideshow: "Play slideshow",
    previousSlide: "Previous slide",
    nextSlide: "Next slide",
    showPhoto: "Show photograph {n}",
    projectFacilities: "Project facilities",
    roomTypes: "Room types",
    roomPhotos: "{name} photographs",
    previousReview: "Previous review",
    nextReview: "Next review",
    reviewStatus: "Review {n} of {total}",
    stars: "{rating} out of 5 stars",
    viewFullSize: "View {title} full size",
  },
  media: {
    watchVideo: "Watch video",
    closeVideo: "Close video",
    playVideo: "Play video: {title}",
    backgroundVideo: "Background video",
    pauseBackgroundVideo: "Pause background video",
    playBackgroundVideo: "Play background video",
    lightbox: { previous: "Previous", next: "Next", close: "Close" },
  },
  forms: {
    invalidEmail: "Enter a valid email address.",
    required: "{label} is required.",
    genericError: "Something went wrong. Please try again.",
    statusError: "Something went wrong ({status}).",
    networkError: "Network error. Please check your connection and try again.",
    invalidBody: "Invalid request body.",
  },
  placeholder: "Phase 4 placeholder — this page is built in a later phase.",
};

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Dictionary = Widen<typeof en>;
