import Link from "next/link";
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

type Layout = "single" | "feature" | "tall" | "compact";

/**
 * The latest posts — "the journal" (prompts/06b-home-redesign.md §5.12), on
 * ivory. The layout follows the count rather than forcing a grid: one post is
 * a wide feature; two are a feature and a tall card set lower beside it, like
 * a magazine spread; three or more are a feature with the rest stacked.
 *
 * Square-cornered photographs that settle under the pointer, titles in the
 * display face with a bronze underline drawn on hover. The whole card is one
 * link (the title's), and Read More keeps its own href as on the live site.
 */
export function LatestPosts({ latestPosts }: { latestPosts: HomeData["latestPosts"] }) {
  const posts = latestPosts.posts;
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
          className={cn("grid gap-x-8 gap-y-16", rest.length > 0 && "lg:grid-cols-12")}
        >
          <RevealItem as="li" className={cn(rest.length > 0 && "lg:col-span-7")}>
            <JournalCard post={lead!} layout={rest.length > 0 ? "feature" : "single"} />
          </RevealItem>

          {rest.length === 1 ? (
            <RevealItem as="li" className="lg:col-span-5 lg:mt-28">
              <JournalCard post={rest[0]!} layout="tall" />
            </RevealItem>
          ) : rest.length > 1 ? (
            <li className="lg:col-span-5">
              <ul className="border-me-hairline-ink divide-me-hairline-ink flex flex-col divide-y border-y">
                {rest.map((post) => (
                  <RevealItem as="li" key={post.slug} className="py-7">
                    <JournalCard post={post} layout="compact" />
                  </RevealItem>
                ))}
              </ul>
            </li>
          ) : null}
        </RevealGroup>
      </Container>
    </section>
  );
}

const IMAGE: Record<Layout, { ratio: string; sizes: string; frame: string }> = {
  single: {
    ratio: "aspect-16/10",
    sizes: "(min-width: 1024px) 58vw, 92vw",
    frame: "lg:col-span-7",
  },
  feature: { ratio: "aspect-16/10", sizes: "(min-width: 1024px) 54vw, 92vw", frame: "" },
  tall: {
    ratio: "aspect-4/3 md:aspect-16/10 lg:aspect-4/5",
    sizes: "(min-width: 1024px) 38vw, 92vw",
    frame: "",
  },
  compact: {
    ratio: "aspect-4/3",
    sizes: "(min-width: 1024px) 12vw, 32vw",
    frame: "w-28 shrink-0 md:w-40",
  },
};

/** One post: photograph, title, excerpt, Read More. */
function JournalCard({ post, layout }: { post: PostSummary; layout: Layout }) {
  const href = internalHref(post.href) ?? "#";
  const ctaHref = internalHref(post.cta.href) ?? href;
  const image = IMAGE[layout];
  const compact = layout === "compact";

  return (
    <article
      className={cn(
        // The title link covers the card, so the card shows its focus.
        "group/card has-[a:focus-visible]:outline-me-night relative outline-offset-8 has-[a:focus-visible]:outline-2",
        layout === "single" ? "grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-x-8" : "flex",
        compact ? "flex-row items-start gap-5 md:gap-6" : layout !== "single" && "flex-col gap-8",
      )}
    >
      <LightsOn className={cn(image.ratio, image.frame)}>
        <SmartImage
          image={post.image}
          sizes={image.sizes}
          ratio="auto"
          frameClassName="absolute inset-0 bg-me-parchment"
          className="ease-me size-full object-cover transition-[scale] duration-1000 group-hover/card:scale-104"
        />
      </LightsOn>

      <div
        className={cn(
          "flex flex-col gap-4",
          layout === "single" && "lg:col-span-5",
          compact && "gap-3",
        )}
      >
        <h3
          lang={autoLang(post.title)}
          className={cn(
            "text-me-night",
            compact
              ? "text-h4 line-clamp-3"
              : "line-clamp-3 text-[clamp(1.75rem,1.3rem+1.3vw,2.5rem)] leading-[1.15]",
          )}
        >
          {/* The whole card is reachable through this one link. */}
          <Link
            href={href}
            // `leading-[inherit]`: inside a Bangla title the link would take
            // the base `:lang(bn)` body line-height and open the lines up.
            className="bg-[linear-gradient(var(--color-me-bronze),var(--color-me-bronze))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 leading-[inherit] transition-[background-size] duration-700 ease-(--me-ease) group-hover/card:bg-[length:100%_1px] after:absolute after:inset-0 focus-visible:bg-[length:100%_1px] focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && !compact ? (
          <p
            lang={autoLang(post.excerpt)}
            className="text-me-night/75 text-small line-clamp-2 max-w-[56ch]"
          >
            {post.excerpt}
          </p>
        ) : null}

        {post.cta.label ? (
          <div className="pt-2">
            <TextLink
              href={ctaHref}
              withArrow
              className="text-me-bronze relative z-10"
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
