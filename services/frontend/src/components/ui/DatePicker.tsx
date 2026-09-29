"use client";

import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useState } from "react";
import { Calendar } from "@/components/primitives/calendar";
import { cn } from "@/lib/utils";

/**
 * The live site's date fields use flatpickr with `dateFormat: "d-m-Y"`, and the
 * events endpoint is sent that same string. Keeping the format identical is a
 * parity requirement (audit/interactions.md §5), so it is the component's
 * contract rather than a display choice.
 */
export const DATE_FORMAT = "dd-MM-yyyy";

export function DatePicker({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  /** `dd-MM-yyyy`, exactly as the filter endpoint expects. Empty string = unset. */
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Accessible name — the control has no visible label in the filter bar. */
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value, DATE_FORMAT, new Date()) : undefined;
  const valid = selected && !Number.isNaN(selected.getTime()) ? selected : undefined;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        aria-label={label}
        className={cn(
          "rounded-field border-hairline flex h-14 w-full items-center justify-between gap-3 border",
          "bg-paper text-body px-4 transition-colors duration-[var(--dur-micro)] outline-none",
          valid ? "text-ink" : "text-ink-muted",
          className,
        )}
      >
        <span>{valid ? format(valid, DATE_FORMAT) : placeholder}</span>
        <CalendarIcon aria-hidden className="text-ink-muted size-4 shrink-0" strokeWidth={1.5} />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="rounded-panel border-hairline bg-paper shadow-float z-50 border p-2"
        >
          <Calendar
            mode="single"
            selected={valid}
            defaultMonth={valid}
            onSelect={(date) => {
              onChange(date ? format(date, DATE_FORMAT) : "");
              setOpen(false);
            }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
