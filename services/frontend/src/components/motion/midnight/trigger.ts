import { VIEWPORT } from "./tokens";

/** When an entrance plays: on mount (the hero) or once it scrolls into view. */
export type Trigger = "mount" | "inView";

/**
 * The motion props that start a primitive's `hidden → shown` variants. With
 * motion off, "shown" is applied at once (every transition is 0 then), so the
 * final state never waits on a viewport.
 */
export function triggerProps(on: boolean, trigger: Trigger) {
  if (!on || trigger === "mount") return { animate: "shown" } as const;
  return { whileInView: "shown", viewport: VIEWPORT } as const;
}
