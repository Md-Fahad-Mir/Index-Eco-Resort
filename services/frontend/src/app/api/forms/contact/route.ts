import { NextResponse } from "next/server";
import { submitForm } from "@/lib/forms";

/**
 * The contact form's submit target. Client components post here rather than
 * calling the backend directly, so the API base URL and the data-source choice
 * stay on the server.
 *
 * Mirrors the contract's error shape: 422 with {"errors": {"field": [...]}}.
 */
export async function POST(request: Request) {
  let payload: Record<string, string>;
  try {
    payload = (await request.json()) as Record<string, string>;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const result = await submitForm("contact", payload);
  if (result.ok) return NextResponse.json({ ok: true });

  return NextResponse.json(
    { ok: false, errors: result.errors, message: result.message },
    { status: result.errors ? 422 : 502 },
  );
}
