import Link from "@/components/i18n/Link";
import { SmartImage } from "@/components/media/SmartImage";
import { LightsOn } from "@/components/motion/midnight/LightsOn";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import type { HomeData, PostSummary } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref } from "@/lib/links";
import { cn } from "@/lib/utils";
import { EstateHeading } from "./EstateHeading";

type Size = "single" | "lead" | "side";

/**
 * The latest posts — "the journal" (prompts/06b-home-redesign.md §5.12), on
 * ivory. Three posts at most: a tall lead on the left and two smaller posts
 * stacked on the right (side by side from 768px). The lead's ratio sets the
 * height of the grid's two equal rows and the right-hand posts fill them, so
 * the stack always ends exactly where the lead does. Two posts are a lead and
 * one post the lead's full height; one is a wide feature.
 *
 * Square-cornered photographs that settle under the pointer, titles in the
 * display face over a night scrim with a champagne underline drawn on hover.
 * The whole card is one link (the title's), and Read More keeps its own href
 * as on the live site.
 */
export function LatestPosts({ latestPosts }: { latestPosts: HomeData["latestPosts"] }) {
  const posts = latestPosts.posts.slice(0, 3);
  if (posts.length === 0) return null;
  const [lead, ...rest] = posts;

  return (
    <section className="bg-me-ivory text-me-night relative pb-(--section-y)">
      <Container className="flex flex-col gap-14 md:gap-20">
        {/* A hairline closes the testimonials above: two ivory rooms, one door. */}
        <span aria-hidden className="bg-me-hairline-ink block h-px w-full" />

        <EstateHeading
          tone="ivory"
          eyebrow={latestPosts.eyebrow}
          title={latestPosts.title}
          titleClassName="max-w-[18ch]"
        />

        <RevealGroup
          as="ul"
          stagger={0.15}
          className={cn(
            // One gap both ways, so the stack's seam matches the gutter.
            "grid gap-5 md:gap-6 xl:gap-8",
            // 640–767: the lead goes wide and the other two pair up beneath it.
            rest.length > 1 && "sm:grid-cols-2",
            rest.length > 0 && "md:grid-cols-12 md:grid-rows-2",
          )}
        >
          <RevealItem
            as="li"
            className={cn(
              "relative aspect-4/5 sm:aspect-4/3",
              rest.length > 1 && "sm:col-span-2",
              rest.length > 0
                ? "md:col-span-7 md:row-span-2 md:aspect-4/5 lg:aspect-5/6 xl:aspect-9/10"
                : "md:aspect-16/9",
            )}
          >
            <JournalCard post={lead!} size={rest.length > 0 ? "lead" : "single"} />
          </RevealItem>

          {rest.map((post) => (
            <RevealItem
              as="li"
              key={post.slug}
              // No ratio from 768px: the card stretches to its row, and its
              // content is all absolute, so it never pushes the row taller.
              className={cn(
                "relative aspect-4/3 md:col-span-5 md:aspect-auto",
                rest.length === 1 && "md:row-span-2",
              )}
            >
              <JournalCard post={post} size="side" />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

const SIZES: Record<Size, string> = {
  single: "(min-width: 1320px) 1224px, 92vw",
  lead: "(min-width: 1320px) 720px, (min-width: 768px) 56vw, 92vw",
  side: "(min-width: 1320px) 500px, (min-width: 768px) 40vw, (min-width: 640px) 46vw, 92vw",
};

/** One post: a full-bleed photograph with its title, excerpt and Read More over it. */
function JournalCard({ post, size }: { post: PostSummary; size: Size }) {
  const href = internalHref(post.href) ?? "#";
  const ctaHref = internalHref(post.cta.href) ?? href;
  const side = size === "side";

  return (
    <article
      // The title link covers the card, so the card shows its focus.
      className="group/card has-[a:focus-visible]:outline-me-night bg-me-night absolute inset-0 flex flex-col justify-end overflow-hidden outline-offset-4 has-[a:focus-visible]:outline-2"
    >
      <LightsOn className="absolute inset-0">
        <SmartImage
          image={post.image}
          sizes={SIZES[size]}
          ratio="auto"
          frameClassName="absolute inset-0 bg-me-parchment"
          className="ease-me size-full object-cover transition-[scale] duration-1000 group-hover/card:scale-104"
        />
      </LightsOn>

      {/* Deep at the foot, clear by two-thirds up: ivory text reads on any
          photograph. A side card is short, its title climbs past the middle,
          and the scrim climbs with it. */}
      <span
        aria-hidden
        className={cn(
          "from-me-night-deep/90 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent",
          side ? "via-me-night-deep/50 via-50% to-90%" : "via-me-night-deep/40 via-35% to-70%",
        )}
      />

      {/* A flex item with a z-index stacks over the image without becoming the
          positioned box, so the title's overlay still spans the whole card. */}
      <div
        className={cn(
          "z-10 flex flex-col",
          side ? "gap-3 p-5 md:p-6 xl:p-8" : "gap-4 p-6 md:p-8 xl:p-10",
        )}
      >
        <h3
          lang={autoLang(post.title)}
          className={cn(
            "text-me-ivory line-clamp-3",
            side
              ? "text-[clamp(1.25rem,1rem+0.6vw,1.625rem)] leading-[1.2]"
              : "max-w-[24ch] text-[clamp(1.75rem,1.3rem+1.3vw,2.5rem)] leading-[1.15]",
          )}
        >
          {/* The whole card is reachable through this one link. */}
          <Link
            href={href}
            // `leading-[inherit]`: inside a Bangla title the link would take
            // the base `:lang(bn)` body line-height and open the lines up.
            className="bg-[linear-gradient(var(--color-me-champagne),var(--color-me-champagne))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 leading-[inherit] transition-[background-size] duration-700 ease-(--me-ease) group-hover/card:bg-[length:100%_1px] after:absolute after:inset-0 focus-visible:bg-[length:100%_1px] focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && !side ? (
          <p
            lang={autoLang(post.excerpt)}
            className="text-me-ivory/80 text-small line-clamp-2 max-w-[52ch]"
          >
            {post.excerpt}
          </p>
        ) : null}

        {post.cta.label ? (
          <div className={side ? "pt-1" : "pt-2"}>
            <TextLink
              href={ctaHref}
              withArrow
              className="text-me-champagne relative z-10"
              tabIndex={-1}
            >
              {post.cta.label}
            </TextLink>
          </div>
        ) : null}
      </div>
    </article>
  );
}
