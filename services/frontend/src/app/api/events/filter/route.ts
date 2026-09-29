import { NextResponse } from "next/server";
import { filterEvents } from "@/lib/data";

/**
 * The events filter, with the same query parameters the live site used:
 * `start_date`, `end_date` (both `d-m-Y`) and `category_id`.
 *
 * Keeping the names identical means the client-side filter built in Phase 9
 * works unchanged whether the data comes from the snapshot or from Django.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const events = await filterEvents({
    start_date: params.get("start_date") ?? undefined,
    end_date: params.get("end_date") ?? undefined,
    category_id: params.get("category_id") ?? undefined,
  });
  return NextResponse.json({ status: true, data: events });
}
