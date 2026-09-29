import { previewMode, usingSnapshot } from "@/config/env";

/** Height of the bar, also used to offset the fixed header beneath it. */
export const PREVIEW_BAR_HEIGHT = "1.75rem";

/** True when the preview banner is being rendered. */
export const showPreviewBar = usingSnapshot && previewMode;

/**
 * A slim, honest banner for preview deployments: the content is a snapshot and
 * forms go nowhere. It is fixed above the header, which shifts down to match.
 */
export function PreviewBar() {
  if (!showPreviewBar) return null;
  return (
    <div
      role="status"
      style={{ height: PREVIEW_BAR_HEIGHT }}
      className="bg-brass-ink text-paper text-label fixed inset-x-0 top-0 z-70 flex items-center justify-center gap-2 px-4 text-center font-semibold"
    >
      <span aria-hidden>●</span>
      Preview — forms are not sent
    </div>
  );
}
