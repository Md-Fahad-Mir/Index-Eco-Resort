import { createCn } from "cn/config";

/**
 * Class merging, taught about our theme.
 *
 * Tailwind's merge logic has to decide whether two classes conflict. Out of the
 * box it sees `text-h1` (a font size) and `text-mist` (a colour) as the same
 * `text-*` group and keeps only the last one — which silently dropped heading
 * sizes wherever a size and a colour were combined. Registering our custom
 * scales fixes that for every component.
 *
 * Keep these lists in step with the `@theme` block in src/styles/globals.css.
 */
const FONT_SIZES = ["display", "h1", "h2", "h3", "h4", "lead", "body", "small", "label"];

const COLORS = [
  "canopy",
  "canopy-deep",
  "index",
  "lichen",
  "lichen-soft",
  "mist",
  "paper",
  "brass",
  "brass-ink",
  "ink",
  "ink-muted",
  "danger",
  "hairline",
  "hairline-strong",
  "hairline-dark",
];

export const cn = createCn({
  extend: {
    theme: {
      text: FONT_SIZES,
      color: COLORS,
      radius: ["btn", "media", "field", "panel", "pill"],
      shadow: ["lift", "float", "card"],
    },
  },
});
