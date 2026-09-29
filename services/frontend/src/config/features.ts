/**
 * Optional enhancements. Every flag is `false` by default — parity first
 * (CLAUDE.md rule 5). Flip one only with the owner's explicit approval.
 */
export const features = {
  /** Lenis-style page smoothing. Off: native scrolling. */
  smoothScroll: false,
  /** View Transitions between routes. */
  viewTransitions: false,
  /** Click-to-enlarge on the Offer page poster. */
  offerPosterLightbox: false,
  /**
   * Event detail "Leave a Reply" block. On the live site it is decoration:
   * no <form>, no endpoint, no script (CLAUDE.md rule 9d). Not rendered.
   */
  eventCommentForm: false,
} as const;

export type FeatureFlag = keyof typeof features;
