"use client";

import { AlertCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

type FieldShellProps = {
  label: string;
  /** Marked with a `*` in brass — text, never colour alone (§11). */
  required?: boolean;
  error?: string;
  hint?: string;
  tone?: "light" | "dark";
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
};

/** Label, required mark, control and an announced error message (§8, §11). */
export function Field({
  label,
  required,
  error,
  hint,
  tone = "light",
  children,
  className,
}: FieldShellProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className={cn(
          "text-label label-track font-semibold",
          tone === "light" ? "text-ink-muted" : "text-lichen",
        )}
      >
        {label}
        {required && (
          <>
            {" "}
            <span aria-hidden className={tone === "light" ? "text-brass-ink" : "text-brass"}>
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>

      {children({ id, describedBy, invalid: Boolean(error) })}

      {hint && !error ? (
        <p
          id={hintId}
          className={cn("text-small", tone === "light" ? "text-ink-muted" : "text-lichen")}
        >
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-small text-danger flex items-center gap-1.5">
          <AlertCircle aria-hidden className="size-4 shrink-0" strokeWidth={1.5} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL =
  "w-full rounded-field border px-4 text-body transition-colors duration-[var(--dur-micro)] " +
  "placeholder:text-ink-muted/70 disabled:opacity-50";

const CONTROL_TONE = {
  light: "border-hairline bg-paper text-ink",
  dark: "border-hairline-dark bg-transparent text-mist placeholder:text-lichen/70",
} as const;

/** 56px input (§8 Form fields). */
export function Input({
  tone = "light",
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { tone?: "light" | "dark"; invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(CONTROL, "h-14", CONTROL_TONE[tone], invalid && "border-danger", className)}
      {...props}
    />
  );
}

/** Textarea with a 140px minimum (§8). */
export function Textarea({
  tone = "light",
  invalid,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { tone?: "light" | "dark"; invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        "min-h-35 py-3.5",
        CONTROL_TONE[tone],
        invalid && "border-danger",
        className,
      )}
      {...props}
    />
  );
}

/** Checkbox with its label, sized for touch (§11). */
export function Checkbox({
  label,
  tone = "light",
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; tone?: "light" | "dark" }) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        className={cn(
          "accent-index mt-0.5 size-5 shrink-0 rounded-[3px] border",
          tone === "light" ? "border-hairline" : "border-hairline-dark",
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn("text-small", tone === "light" ? "text-ink-muted" : "text-lichen")}
      >
        {label}
      </label>
    </div>
  );
}
