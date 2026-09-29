import { previewMode, usingSnapshot } from "@/config/env";

/**
 * A slim, honest banner for preview deployments: the content is a snapshot and
 * forms go nowhere. Renders only when both are actually true.
 */
export function PreviewBar() {
  if (!usingSnapshot || !previewMode) return null;
  return (
    <div
      role="status"
      className="bg-brass-ink text-paper text-label flex items-center justify-center gap-2 px-4 py-1.5 text-center font-semibold"
    >
      <span aria-hidden>●</span>
      Preview — forms are not sent
    </div>
  );
}
