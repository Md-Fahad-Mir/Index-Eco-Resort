import type { Dictionary } from "./en";

/** Bangla interface strings. The shape is en.ts's; a missing key fails the typecheck. */
export const bn: Dictionary = {
  meta: {
    siteTitle: "INDEX Eco Resort",
    siteDescription: "INDEX Eco Resort — মালিকানা শেয়ার, আবাসন, ডাইনিং ও ইভেন্ট।",
    homeDescription:
      "INDEX Eco Resort — একটি ইকো রিসোর্টের মালিকানা শেয়ার, সাথে আবাসন, ডাইনিং ও ইভেন্টের সুব্যবস্থা।",
    aboutTitle: "আমাদের সম্পর্কে | INDEX Eco Resort",
    aboutDescription:
      "INDEX Eco Resort — আমরা কারা, কী গড়ে তুলছি এবং কোন মূল্যবোধ আমাদের পথ দেখায়।",
  },
  language: {
    label: "ভাষা",
    names: { bn: "বাংলা", en: "English" },
    short: { bn: "বাং", en: "EN" },
  },
  chrome: {
    skipToContent: "মূল বিষয়বস্তুতে যান",
    mainNav: "প্রধান",
    mobileNav: "মোবাইল",
    breadcrumb: "পথনির্দেশ",
    menu: "মেনু",
    openMenu: "মেনু খুলুন",
    closeMenu: "মেনু বন্ধ করুন",
    closeContactForm: "যোগাযোগ ফর্ম বন্ধ করুন",
    openContactOptions: "যোগাযোগ করুন",
    closeContactOptions: "যোগাযোগের অপশন বন্ধ করুন",
    footerContact: "যোগাযোগ করুন",
  },
  carousel: {
    heroLabel: "বিশেষ আকর্ষণ",
    slideOf: "{total}টির মধ্যে {n}",
    slideStatus: "স্লাইড {n}, মোট {total}টি",
    pauseSlideshow: "স্লাইডশো থামান",
    playSlideshow: "স্লাইডশো চালু করুন",
    previousSlide: "আগের স্লাইড",
    nextSlide: "পরের স্লাইড",
    showPhoto: "{n} নম্বর ছবি দেখুন",
    projectFacilities: "প্রকল্পের সুবিধাসমূহ",
    roomTypes: "রুমের ধরন",
    roomPhotos: "{name} — ছবি",
    previousReview: "আগের রিভিউ",
    nextReview: "পরের রিভিউ",
    reviewStatus: "রিভিউ {n}, মোট {total}টি",
    stars: "৫-এর মধ্যে {rating} তারকা",
    viewFullSize: "{title} বড় করে দেখুন",
  },
  media: {
    watchVideo: "ভিডিও দেখুন",
    closeVideo: "ভিডিও বন্ধ করুন",
    playVideo: "ভিডিও চালান: {title}",
    backgroundVideo: "ব্যাকগ্রাউন্ড ভিডিও",
    pauseBackgroundVideo: "ব্যাকগ্রাউন্ড ভিডিও থামান",
    playBackgroundVideo: "ব্যাকগ্রাউন্ড ভিডিও চালু করুন",
    lightbox: { previous: "আগের ছবি", next: "পরের ছবি", close: "বন্ধ করুন" },
  },
  forms: {
    invalidEmail: "সঠিক ইমেইল ঠিকানা লিখুন।",
    required: "{label} আবশ্যক।",
    genericError: "কিছু একটা সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    statusError: "কিছু একটা সমস্যা হয়েছে ({status})।",
    networkError: "নেটওয়ার্ক সমস্যা। অনুগ্রহ করে ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
    invalidBody: "অনুরোধটি সঠিক নয়।",
  },
  placeholder: "ফেজ ৪ প্লেসহোল্ডার — এই পৃষ্ঠাটি পরবর্তী ধাপে তৈরি করা হবে।",
};
