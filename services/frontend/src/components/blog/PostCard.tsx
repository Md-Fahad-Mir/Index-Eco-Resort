import Link from "@/components/i18n/Link";
import { SmartImage } from "@/components/media/SmartImage";
import { Heading } from "@/components/typography/Heading";
import { TextLink } from "@/components/ui/TextLink";
import type { PostSummary } from "@/lib/data";
import { autoLang } from "@/lib/lang";
import { internalHref } from "@/lib/links";
import { cn } from "@/lib/utils";

/**
 * A post card (design-system §8). `wide` lays it out horizontally, used when a
 * list has only one item and a lone narrow card would look like an accident.
 */
export function PostCard({
  post,
  wide = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 92vw",
}: {
  post: PostSummary;
  wide?: boolean;
  sizes?: string;
}) {
  const href = internalHref(post.href) ?? "#";
  return (
    <article
      className={cn(
        "group bg-paper border-hairline hover:border-hairline-strong rounded-media flex overflow-hidden border transition-colors duration-[var(--dur-micro)]",
        wide ? "flex-col md:flex-row" : "flex-col",
      )}
    >
      <div className={cn(wide && "md:w-1/2")}>
        <SmartImage image={post.image} sizes={sizes} ratio="card" zoomOnHover />
      </div>

      <div className={cn("flex flex-1 flex-col gap-3 p-7", wide && "md:justify-center")}>
        <Heading level={3} size="h4" className="line-clamp-2">
          {/* The whole card is reachable through this one link. */}
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {post.title}
          </Link>
        </Heading>

        {post.excerpt ? (
          <p lang={autoLang(post.excerpt)} className="text-ink-muted text-small line-clamp-2">
            {post.excerpt}
          </p>
        ) : null}

        {post.cta.label ? (
          <div className="border-hairline mt-auto border-t pt-4">
            <TextLink href={href} withArrow className="text-index" tabIndex={-1}>
              {post.cta.label}
            </TextLink>
          </div>
        ) : null}
      </div>
    </article>
  );
}
