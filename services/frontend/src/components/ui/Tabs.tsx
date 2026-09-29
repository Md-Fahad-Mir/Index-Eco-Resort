"use client";

import { m } from "motion/react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";

/** Underline tabs (villa) or segmented pill tabs (vision/mission) — §8. */
export type TabsVariant = "underline" | "segmented";

/**
 * Tab values become element ids and `aria-controls` IDREFs. CMS labels contain
 * spaces ("Family Cottage", "Our Vision"), and an IDREF may not, so every value
 * is normalised here — callers pass the label and stay correct.
 */
const toValue = (value: string) => value.trim().replace(/\s+/g, "-");

const VariantContext = createContext<{
  variant: TabsVariant;
  layoutId: string;
  /** False until the visitor switches tabs, so the first panel does not fade in. */
  switched: boolean;
}>({
  variant: "underline",
  layoutId: "tabs",
  switched: false,
});

/**
 * Radix Tabs with a shared-layout indicator that slides between triggers and a
 * 200ms cross-fade between panels (§9.2). Keyboard behaviour is Radix's.
 */
export function Tabs({
  defaultValue,
  variant = "underline",
  children,
  className,
}: {
  defaultValue: string;
  variant?: TabsVariant;
  children: ReactNode;
  className?: string;
}) {
  const layoutId = useId();
  // The panel cross-fade belongs to the click (§9.2). Fading the initially
  // active panel in on load would add a second page entrance.
  const [switched, setSwitched] = useState(false);
  return (
    <VariantContext.Provider value={{ variant, layoutId, switched }}>
      <TabsPrimitive.Root
        defaultValue={toValue(defaultValue)}
        onValueChange={() => setSwitched(true)}
        className={cn("flex flex-col gap-10", className)}
      >
        {children}
      </TabsPrimitive.Root>
    </VariantContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  /** Names the tab set for screen readers. */
  label: string;
}) {
  const { variant } = useContext(VariantContext);
  return (
    // CMS tab labels are long and bilingual, so the strip scrolls rather than
    // pushing the page sideways — no horizontal page scroll at 320px (§11).
    <div className="max-w-full [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden">
      <TabsPrimitive.List
        aria-label={label}
        className={cn(
          "flex w-max items-center",
          variant === "underline"
            ? "border-hairline min-w-full gap-8 border-b"
            : "rounded-pill border-hairline gap-1 border p-1",
          className,
        )}
      >
        {children}
      </TabsPrimitive.List>
    </div>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: string }) {
  const { variant, layoutId } = useContext(VariantContext);
  const reduced = useReducedMotionSafe();

  return (
    <TabsPrimitive.Trigger
      value={toValue(value)}
      lang={autoLang(children)}
      className={cn(
        "group relative cursor-pointer whitespace-nowrap transition-colors duration-[var(--dur-micro)]",
        variant === "underline"
          ? "text-h4 font-display text-ink-muted data-[state=active]:text-ink pb-4"
          : "rounded-pill text-label label-track text-ink-muted data-[state=active]:text-paper px-5 py-2.5 font-semibold",
      )}
    >
      {/* The moving indicator: one element shared across triggers via layoutId. */}
      <TabsIndicator variant={variant} layoutId={layoutId} reduced={reduced} />
      <span className="relative z-10">{children}</span>
    </TabsPrimitive.Trigger>
  );
}

function TabsIndicator({
  variant,
  layoutId,
  reduced,
}: {
  variant: TabsVariant;
  layoutId: string;
  reduced: boolean;
}) {
  return (
    <span className="pointer-events-none absolute inset-0 hidden group-data-[state=active]:block">
      <m.span
        layoutId={reduced ? undefined : layoutId}
        transition={reduced ? { duration: 0 } : { duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
        className={cn(
          "absolute",
          variant === "underline"
            ? "bg-brass-ink inset-x-0 bottom-0 h-px"
            : "rounded-pill bg-index inset-0",
        )}
      />
    </span>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotionSafe();
  const { switched } = useContext(VariantContext);
  return (
    <TabsPrimitive.Content value={toValue(value)} className={cn("outline-none", className)}>
      <m.div
        initial={switched ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.01 : 0.2 }}
      >
        {children}
      </m.div>
    </TabsPrimitive.Content>
  );
}
