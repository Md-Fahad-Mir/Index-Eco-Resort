"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import type { FormField as FormFieldSpec } from "@/lib/data";
import { FormSuccess } from "./FormSuccess";

/**
 * The contact form, built from the field list captured in Phase 0 so the
 * payload keys match the original exactly — including `address`, which the
 * modal sends as the literal string "N/A".
 *
 * Validation mirrors what the live markup enforces and nothing more: the modal
 * marks name/phone/email required, the contact page marks nothing. Inventing
 * stricter rules would change behaviour.
 */
export function ContactForm({
  fields,
  submitLabel,
  submittingLabel,
  successMessage,
  tone = "light",
  onSuccess,
}: {
  fields: FormFieldSpec[];
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  tone?: "light" | "dark";
  onSuccess?: () => void;
}) {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Hidden fields are submitted with their captured value, never shown.
  const hidden = fields.filter((f) => f.type === "hidden" && f.name);
  const visible = fields.filter((f) => f.type !== "hidden" && f.name);

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of visible) {
    let rule: z.ZodString = z.string();
    if (field.type === "email") rule = rule.email("Enter a valid email address.");
    shape[field.name!] = field.required
      ? rule.min(1, `${labelFor(field)} is required.`)
      : (rule.optional().or(z.literal("")) as unknown as z.ZodString);
  }
  const schema = z.object(shape);
  type Values = Record<string, string>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Values>({ resolver: zodResolver(schema) as never });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const payload: Record<string, string> = { ...values };
    for (const field of hidden) payload[field.name!] = field.value ?? "";

    const response = await fetch("/api/forms/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as {
      ok?: boolean;
      errors?: Record<string, string[]>;
      message?: string;
    } | null;

    if (response.ok && body?.ok) {
      setDone(true);
      onSuccess?.();
      return;
    }
    // Contract: 422 carries field-level messages.
    if (body?.errors) {
      for (const [name, messages] of Object.entries(body.errors)) {
        setError(name, { type: "server", message: messages[0] });
      }
      return;
    }
    setFormError(body?.message ?? "Something went wrong. Please try again.");
  });

  if (done) return <FormSuccess message={successMessage} />;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {visible.map((field) => {
        const name = field.name!;
        const error = errors[name]?.message as string | undefined;
        const label = labelFor(field);
        const placeholder = placeholderFor(field, label);
        return (
          <Field key={name} label={label} required={field.required} error={error} tone={tone}>
            {({ id, describedBy, invalid }) =>
              field.type === "textarea" ? (
                <Textarea
                  id={id}
                  tone={tone}
                  invalid={invalid}
                  aria-describedby={describedBy}
                  placeholder={placeholder}
                  {...register(name)}
                />
              ) : (
                <Input
                  id={id}
                  tone={tone}
                  invalid={invalid}
                  aria-describedby={describedBy}
                  type={field.type === "tel" ? "tel" : field.type === "email" ? "email" : "text"}
                  inputMode={field.type === "tel" ? "tel" : undefined}
                  placeholder={placeholder}
                  {...register(name)}
                />
              )
            }
          </Field>
        );
      })}

      {formError && (
        <p role="alert" className="text-danger text-small">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        variant={tone === "dark" ? "on-dark" : "primary"}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 aria-hidden className="size-4 animate-spin" strokeWidth={2} />
            {submittingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}

/**
 * The live form has no labels at all, only placeholders. A visible label is an
 * accessibility requirement, so the placeholder text becomes the label — and
 * the placeholder is then dropped rather than repeating it inside the field.
 */
function placeholderFor(field: FormFieldSpec, label: string): string | undefined {
  const placeholder = field.placeholder ?? "";
  if (!placeholder) return undefined;
  const same = placeholder.replace(/\*$/, "").trim().toLowerCase() === label.toLowerCase();
  return same ? undefined : placeholder;
}

function labelFor(field: FormFieldSpec): string {
  const fromPlaceholder = (field.placeholder ?? "").replace(/\*$/, "").trim();
  if (fromPlaceholder) return fromPlaceholder;
  const name = field.name ?? "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}
