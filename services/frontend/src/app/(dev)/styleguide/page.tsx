import { notFound } from "next/navigation";
import { Heading } from "@/components/typography/Heading";
import { Paragraph } from "@/components/typography/Text";
import { Prose } from "@/components/typography/Prose";
import { PageHero } from "@/components/layout/PageHero";
import { LiteYouTube } from "@/components/media/LiteYouTube";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconButton } from "@/components/ui/IconButton";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tag } from "@/components/ui/Tag";
import { TextLink } from "@/components/ui/TextLink";
import bookNow from "@/fixtures/book-now.json";
import events from "@/fixtures/events.json";
import home from "@/fixtures/home.json";
import offer from "@/fixtures/offer.json";
import packages from "@/fixtures/packages.json";
import posts from "@/fixtures/posts.json";
import { InteractiveShowcase } from "./Interactive";
import { ArrowRight, Plus } from "lucide-react";

/**
 * The design system proved against real CMS content — never lorem, and always
 * the longest real Bangla strings (docs/02-DESIGN-SYSTEM.md §4.8).
 * Development only; production returns 404.
 */
export const metadata = {
  title: "Styleguide — INDEX Eco Resort",
  robots: { index: false, follow: false },
};

// Class names are written out in full: Tailwind extracts them statically, so a
// template literal like `bg-${name}` would produce no CSS at all.
const SWATCHES = [
  { name: "canopy", cls: "bg-canopy", hex: "#13301F", use: "Dark sections, header on scroll" },
  { name: "canopy-deep", cls: "bg-canopy-deep", hex: "#0C2116", use: "Footer, the plan stage" },
  { name: "index", cls: "bg-index", hex: "#2E6B40", use: "Brand green, primary buttons" },
  { name: "lichen", cls: "bg-lichen", hex: "#A9BFA8", use: "Sage panels, tags" },
  { name: "lichen-soft", cls: "bg-lichen-soft", hex: "#DDE6DC", use: "Soft panel background" },
  { name: "mist", cls: "bg-mist", hex: "#EEF1EC", use: "Page background" },
  { name: "paper", cls: "bg-paper", hex: "#FFFFFF", use: "Cards, form panels" },
  { name: "brass", cls: "bg-brass", hex: "#B08D57", use: "Accent on dark" },
  { name: "brass-ink", cls: "bg-brass-ink", hex: "#7D5F32", use: "Accent on light" },
  { name: "ink", cls: "bg-ink", hex: "#1B2420", use: "Body text" },
  { name: "ink-muted", cls: "bg-ink-muted", hex: "#4A5750", use: "Secondary text" },
  { name: "danger", cls: "bg-danger", hex: "#A23B2A", use: "Form errors only" },
] as const;

const SCALE = [
  { token: "display", cls: "text-display", label: "Display" },
  { token: "h1", cls: "text-h1", label: "Heading 1" },
  { token: "h2", cls: "text-h2", label: "Heading 2" },
  { token: "h3", cls: "text-h3", label: "Heading 3" },
  { token: "h4", cls: "text-h4", label: "Heading 4" },
] as const;

export default function StyleguidePage() {
  // Never ship the styleguide.
  if (process.env.NODE_ENV === "production") notFound();

  const glanceSlides = home.glance.slides.filter((s) => s.image?.src).slice(0, 5);
  const bengaliPostTitle = posts.posts.find((p) => /[ঀ-৿]/.test(p.title))?.title ?? "";
  const latinPostTitle = posts.posts.find((p) => !/[ঀ-৿]/.test(p.title))?.title ?? "";
  const goldCard = packages[0]?.card ?? { src: "", alt: "" };
  const categories = events.filters.categories.map((c) => ({
    value: c.value || "all",
    label: c.label,
  }));
  const roomTabs = home.villa.rooms.map((r) => ({ label: r.tabLabel, body: r.description }));

  return (
    <main id="main" className="bg-mist">
      <Section tone="paper" className="border-hairline border-b">
        <Container className="flex flex-col gap-4">
          <Eyebrow>Canopy &amp; Brass</Eyebrow>
          <Heading level={1} size="h1">
            Design system
          </Heading>
          <Paragraph>
            Every sample below uses real content from the site&rsquo;s own data — including the
            longest Bangla strings — because a scale that only looks right in English is not
            finished.
          </Paragraph>
        </Container>
      </Section>

      {/* ── Colour ─────────────────────────────────────────────────────── */}
      <Section tone="mist" id="color">
        <Container className="flex flex-col gap-10">
          <SectionHeader eyebrow="Tokens" title="Colour" />
          <ul
            data-testid="sg-colors"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {SWATCHES.map((s) => (
              <li
                key={s.name}
                className="rounded-media border-hairline bg-paper overflow-hidden border"
              >
                <div className={`h-20 ${s.cls}`} />
                <div className="flex flex-col gap-1 p-4">
                  <p className="text-label font-semibold">{s.name}</p>
                  <p className="tabular text-small text-ink-muted">{s.hex}</p>
                  <p className="text-small text-ink-muted">{s.use}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── Type scale, in both scripts ────────────────────────────────── */}
      <Section tone="paper" id="type">
        <Container className="flex flex-col gap-12">
          <SectionHeader eyebrow="Tokens" title="Type scale" />
          <div className="flex flex-col gap-10">
            {SCALE.map((step) => (
              <div key={step.token} className="border-hairline flex flex-col gap-3 border-b pb-8">
                <p className="tabular text-label text-brass-ink font-semibold">{step.token}</p>
                <p className={`font-display ${step.cls}`}>{step.label}</p>
                <p className={`font-display ${step.cls}`} lang="bn">
                  ইনডেক্স ইকো রিসোর্ট
                </p>
              </div>
            ))}
            <div className="flex flex-col gap-3">
              <p className="text-label text-brass-ink font-semibold">lead / body / small / label</p>
              <p className="text-lead max-w-[var(--measure)]">{latinPostTitle}</p>
              <Paragraph>{home.about.text}</Paragraph>
              <p className="text-small text-ink-muted">Meta and captions use the small step.</p>
              <p className="text-label font-semibold [font-variation-settings:'wdth'_110]">
                Buttons and labels
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Bilingual typography: the real test ────────────────────────── */}
      <Section tone="mist" id="bilingual">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Bangla rules"
            title="Bilingual typography"
            aside={
              <Paragraph>
                No tracking on Bangla, a taller line, no synthetic italics, and Bangla optically
                sized down at display steps so mixed lines sit level.
              </Paragraph>
            }
          />

          {/* The close-up target: one heading that mixes both scripts. */}
          <div
            data-testid="sg-mixed-heading"
            className="rounded-media border-hairline bg-paper border p-8"
          >
            <p className="text-label text-brass-ink mb-4 font-semibold">
              Mixed Bangla + English heading
            </p>
            <Heading level={2} size="h2" sample={bookNow.text}>
              Index Eco Resort কুয়াকাটার প্রাকৃতিক সৌন্দর্যে
            </Heading>
          </div>

          <div
            data-testid="sg-bangla-offer"
            className="rounded-media border-hairline bg-paper border p-8"
          >
            <p className="text-label text-brass-ink mb-4 font-semibold">
              Offer headline (longest Bangla line)
            </p>
            <Heading level={2} size="h2">
              {offer.headline}
            </Heading>
          </div>

          {/* The Book Now paragraph — faux-italic on the live site, upright here. */}
          <div
            data-testid="sg-booknow-bangla"
            className="rounded-media bg-canopy on-dark text-mist p-8"
          >
            <p className="text-label text-brass mb-4 font-semibold">
              Book Now paragraph — upright, never faux-italic
            </p>
            <p lang="bn" className="font-display text-h3 max-w-[var(--measure-bn)] leading-[1.7]">
              {bookNow.text}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-media border-hairline bg-paper border p-8">
              <p className="text-label text-brass-ink mb-3 font-semibold">Bangla card title</p>
              <Heading level={3} size="h4">
                {bengaliPostTitle}
              </Heading>
            </div>
            <div className="rounded-media border-hairline bg-paper border p-8">
              <p className="text-label text-brass-ink mb-3 font-semibold">
                Bangla numerals stay Bangla
              </p>
              <p lang="bn" className="tabular text-h3 font-display">
                ৫০,০০০ টাকা · ৩ দিন ৪ রাত
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Buttons and links ──────────────────────────────────────────── */}
      <Section tone="paper" id="actions">
        <Container className="flex flex-col gap-12">
          <SectionHeader eyebrow="Components" title="Actions" />
          <div data-testid="sg-buttons" className="flex flex-wrap items-center gap-4">
            <Button>Book Now</Button>
            <Button variant="outline">Learn more</Button>
            <Button disabled>Disabled</Button>
            <IconButton label="Add">
              <Plus strokeWidth={1.5} />
            </IconButton>
          </div>
          <div className="rounded-media bg-canopy on-dark flex flex-wrap items-center gap-8 p-8">
            <Button variant="on-dark">Buy Share</Button>
            <Button variant="outline" className="text-mist hover:text-canopy">
              On dark outline
            </Button>
            <IconButton label="Next" tone="dark">
              <ArrowRight strokeWidth={1.5} />
            </IconButton>
          </div>
          <div className="flex flex-wrap items-center gap-8">
            <TextLink href="/styleguide">Underline draws on hover</TextLink>
            <TextLink href="/styleguide" withArrow>
              Event details
            </TextLink>
            <div className="flex flex-wrap gap-2">
              {home.gallery.categories.slice(0, 4).map((c) => (
                <Tag key={c.id}>{c.name}</Tag>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Interactive primitives ─────────────────────────────────────── */}
      <Section tone="mist" id="controls">
        <Container className="flex flex-col gap-12">
          <SectionHeader eyebrow="Components" title="Fields, filters, tabs, slider and the card" />
          <InteractiveShowcase
            categories={categories}
            slides={glanceSlides}
            card={goldCard}
            roomTabs={roomTabs}
          />
        </Container>
      </Section>

      {/* ── Page hero, including the missing-image state ───────────────── */}
      <Section tone="mist" id="hero" spacing={false} className="section-y">
        <Container className="mb-10 flex flex-col gap-10">
          <SectionHeader
            eyebrow="Components"
            title="Page hero"
            aside={
              <Paragraph>
                A CMS image can be missing from storage — one package hero is today. Rather than a
                broken photo, the hero falls back to a canopy panel with a faint leaf-vein pattern,
                keeping the same layout so the page still reads as designed.
              </Paragraph>
            }
          />
        </Container>
        <div data-testid="sg-hero-missing" className="border-hairline border-y">
          <PageHero
            hero={{
              title: "Silver Ownership",
              image: { src: "", alt: "" },
              breadcrumb: { home: { label: "Home", href: "/" }, current: "Silver Ownership" },
            }}
          />
        </div>
      </Section>

      {/* ── Prose and media ────────────────────────────────────────────── */}
      <Section tone="paper" id="prose">
        <Container className="flex flex-col gap-12">
          <SectionHeader eyebrow="Components" title="Prose and media" />
          <Prose
            html={`<h2>Rich text from the CMS</h2><p>Sanitized, then styled by tokens. <strong>Bold</strong> and <a href="#">links</a> keep their meaning.</p><ul><li>Brass list markers</li><li>Bangla lists get the taller line</li></ul><blockquote>A brass rule marks quotations.</blockquote>`}
          />
          <div className="max-w-2xl">
            <LiteYouTube
              videoId={packages[0]?.youtubeId ?? "nftc2Vk4o_A"}
              title="Ownership benefits"
            />
          </div>
        </Container>
      </Section>
    </main>
  );
}
