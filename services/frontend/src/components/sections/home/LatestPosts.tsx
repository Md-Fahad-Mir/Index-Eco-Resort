import { PostCard } from "@/components/blog/PostCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { HomeData } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * The latest posts. The grid follows the count rather than forcing three
 * columns: one post becomes a wide feature card, two share the width, three
 * or more fall into a three-column grid.
 */
export function LatestPosts({ latestPosts }: { latestPosts: HomeData["latestPosts"] }) {
  const posts = latestPosts.posts;
  if (posts.length === 0) return null;
  const single = posts.length === 1;

  return (
    <Section tone="mist">
      <Container className="flex flex-col gap-12">
        <SectionHeader eyebrow={latestPosts.eyebrow} title={latestPosts.title} />
        <ul
          className={cn(
            "grid gap-6",
            single
              ? "grid-cols-1"
              : posts.length === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {posts.map((post) => (
            <li key={post.slug} className="relative">
              <PostCard
                post={post}
                wide={single}
                sizes={single ? "(min-width: 768px) 50vw, 92vw" : undefined}
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
