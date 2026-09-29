"use client";

import { ChevronDown } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

/**
 * A 56px select on Radix, styled to our tokens (§8 Filter bar). Option labels
 * come straight from the CMS, so each is language-tagged.
 */
export function Select({
  options,
  value,
  onValueChange,
  placeholder,
  label,
  className,
}: {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder: string;
  /** Accessible name — the control has no visible label in the filter bar. */
  label: string;
  className?: string;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        aria-label={label}
        className={cn(
          "rounded-field border-hairline flex h-14 w-full items-center justify-between gap-3 border",
          "bg-paper text-body text-ink px-4 transition-colors duration-[var(--dur-micro)] outline-none",
          "data-[placeholder]:text-ink-muted",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown aria-hidden className="text-ink-muted size-4 shrink-0" strokeWidth={1.5} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden",
            "rounded-panel border-hairline bg-paper shadow-float border",
          )}
        >
          <SelectPrimitive.Viewport className="p-2">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                lang={autoLang(option.label)}
                className={cn(
                  "text-small text-ink cursor-pointer rounded-[6px] px-3 py-2.5 outline-none select-none",
                  "data-[highlighted]:bg-lichen-soft data-[state=checked]:font-semibold",
                )}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
