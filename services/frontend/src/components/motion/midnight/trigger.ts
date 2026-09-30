import { VIEWPORT } from "./tokens";

/**
 * When an entrance plays: on mount (the hero), once it scrolls into view, or
 * when a parent primitive says so — `parent` follows the enclosing motion
 * element's `hidden → shown` variants instead of watching anything itself.
 */
export type Trigger = "mount" | "inView" | "parent";

/**
 * The motion props that start a primitive's `hidden → shown` variants. With
 * motion off, "shown" is applied at once (every transition is 0 then), so the
 * final state never waits on a viewport. `parent` sets nothing: the variants
 * are inherited.
 */
export function triggerProps(on: boolean, trigger: Trigger) {
  if (trigger === "parent") return { initial: undefined } as const;
  if (!on || trigger === "mount") return { initial: "hidden", animate: "shown" } as const;
  return { initial: "hidden", whileInView: "shown", viewport: VIEWPORT } as const;
}
