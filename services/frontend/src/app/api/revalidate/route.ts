import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { CACHE_TAGS, type CacheTag } from "@/lib/data";

/**
 * On-demand cache invalidation, for the future backend to call after a save:
 *   POST /api/revalidate?secret=…&tag=events
 */
export async function POST(request: Request) {
  const params = new URL(request.url).searchParams;
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret || params.get("secret") !== secret) {
    return NextResponse.json({ ok: false, message: "Invalid secret." }, { status: 401 });
  }

  const tag = params.get("tag");
  if (!tag || !(CACHE_TAGS as readonly string[]).includes(tag)) {
    return NextResponse.json(
      { ok: false, message: `Unknown tag. Expected one of: ${CACHE_TAGS.join(", ")}.` },
      { status: 400 },
    );
  }

  // Next 16 takes a staleness profile as the second argument; "max" serves
  // stale content while the revalidation runs.
  revalidateTag(tag as CacheTag, "max");
  return NextResponse.json({ ok: true, revalidated: tag });
}
