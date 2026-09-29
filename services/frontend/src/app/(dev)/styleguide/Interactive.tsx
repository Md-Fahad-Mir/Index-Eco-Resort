"use client";

import { useState } from "react";
import { MembershipCard } from "@/components/ownership/MembershipCard";
import { Slider } from "@/components/media/Slider";
import { SmartImage, type ImgData } from "@/components/media/SmartImage";
import { DatePicker } from "@/components/ui/DatePicker";
import { Field, Input, Textarea, Checkbox } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

/** The parts of the styleguide that need state, kept as one client leaf. */
export function InteractiveShowcase({
  categories,
  slides,
  card,
  roomTabs,
}: {
  categories: { value: string; label: string }[];
  slides: { image: ImgData; caption: string }[];
  card: ImgData;
  roomTabs: { label: string; body: string }[];
}) {
  const [category, setCategory] = useState<string>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="flex flex-col gap-16">
      <div data-testid="sg-fields" className="grid gap-6 md:grid-cols-2">
        <Field label="Full Name" required>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              placeholder="Enter Your Full Name"
            />
          )}
        </Field>
        <Field label="Mobile Number" required error="Please enter a valid mobile number.">
          {({ id, describedBy, invalid }) => (
            <Input id={id} aria-describedby={describedBy} invalid={invalid} defaultValue="0170" />
          )}
        </Field>
        <Field label="Your Message" className="md:col-span-2">
          {({ id, describedBy }) => (
            <Textarea id={id} aria-describedby={describedBy} placeholder="Enter Your Message" />
          )}
        </Field>
        <Checkbox label="Save my name, email, and website in this browser for the next time I comment." />
      </div>

      <div data-testid="sg-filters" className="grid gap-4 md:grid-cols-3">
        <DatePicker value={from} onChange={setFrom} placeholder="Choose Date" label="Start date" />
        <DatePicker value={to} onChange={setTo} placeholder="Choose Date" label="End date" />
        <Select
          options={categories}
          value={category}
          onValueChange={setCategory}
          placeholder="All Categories"
          label="Select category"
        />
      </div>

      <div data-testid="sg-tabs" className="flex flex-col gap-12">
        <Tabs defaultValue={roomTabs[0]?.label ?? "one"} variant="underline">
          <TabsList label="Room types">
            {roomTabs.map((t) => (
              <TabsTrigger key={t.label} value={t.label}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {roomTabs.map((t) => (
            <TabsContent key={t.label} value={t.label}>
              <p className="text-body text-ink-muted max-w-[var(--measure)]">{t.body}</p>
            </TabsContent>
          ))}
        </Tabs>

        <Tabs defaultValue="Our Vision" variant="segmented">
          <TabsList label="Vision, mission and approach">
            <TabsTrigger value="Our Vision">Our Vision</TabsTrigger>
            <TabsTrigger value="Our Mission">Our Mission</TabsTrigger>
            <TabsTrigger value="Our Approach">Our Approach</TabsTrigger>
          </TabsList>
          <TabsContent value="Our Vision">
            <p className="text-body text-ink-muted">Segmented tabs share one sliding indicator.</p>
          </TabsContent>
          <TabsContent value="Our Mission">
            <p className="text-body text-ink-muted">Panels cross-fade over 200ms.</p>
          </TabsContent>
          <TabsContent value="Our Approach">
            <p className="text-body text-ink-muted">Keyboard behaviour comes from Radix.</p>
          </TabsContent>
        </Tabs>
      </div>

      <div data-testid="sg-slider">
        <Slider
          label="Project facilities"
          slides={slides.map((s) => (
            <figure key={s.image.src} className="flex flex-col gap-3">
              <SmartImage image={s.image} ratio="portrait" sizes="(min-width: 768px) 420px, 90vw" />
              <figcaption lang="bn" className="text-small text-ink-muted">
                {s.caption}
              </figcaption>
            </figure>
          ))}
          className="max-w-md"
        />
      </div>

      <div data-testid="sg-card" className="max-w-sm">
        <MembershipCard card={card} name="Gold Ownership" sizes="360px" />
      </div>
    </div>
  );
}
