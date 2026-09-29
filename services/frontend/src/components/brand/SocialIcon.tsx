import type { SVGProps } from "react";

/**
 * Brand marks as local inline SVG — no icon font, no third-party request.
 * Each is decorative; the surrounding link carries the accessible name.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
  focusable: false,
} as const;

const Facebook = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z" />
  </svg>
);

const X = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M17.5 3h3l-6.6 7.5L21.8 21h-6l-4.7-6.1L5.7 21h-3l7-8L2.5 3h6.2l4.2 5.6L17.5 3Zm-1 16h1.7L7.6 4.8H5.8L16.5 19Z" />
  </svg>
);

const Instagram = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm0-1.8a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4Zm6.6-.6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0ZM8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Zm0 1.8A2.2 2.2 0 0 0 5.8 8v8A2.2 2.2 0 0 0 8 18.2h8a2.2 2.2 0 0 0 2.2-2.2V8A2.2 2.2 0 0 0 16 5.8H8Z" />
  </svg>
);

const YouTube = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  </svg>
);

const LinkedIn = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6.9 8.4H4V20h2.9V8.4ZM5.4 4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM20 13.3c0-3-1.6-4.4-3.8-4.4-1.7 0-2.5.95-3 1.6V8.4H10.4V20h2.9v-6.2c0-1.4.6-2.2 1.8-2.2s1.9.8 1.9 2.2V20H20v-6.7Z" />
  </svg>
);

const TikTok = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M16.2 3c.3 2 1.5 3.4 3.5 3.6v2.6c-1.2.1-2.3-.2-3.5-.9v5.3c0 4.4-4.1 6.9-7.6 4.9-2.3-1.3-3-4.4-1.8-6.7 1-2 3.2-3 5.4-2.6v2.8c-.4-.1-.8-.2-1.2-.1-1.2.1-2 1-2 2.2 0 1.4 1.4 2.4 2.7 1.9.9-.3 1.4-1.1 1.4-2.1V3h3.1Z" />
  </svg>
);

const WhatsApp = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.6 4.8-1.3A10 10 0 1 0 12 2Zm0 1.9a8.1 8.1 0 1 1-4.2 15l-.3-.2-2.8.8.8-2.7-.2-.3A8.1 8.1 0 0 1 12 3.9Zm-3.4 4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.2.2 1.8 2.8 4.4 3.8 2.2.9 2.6.7 3.1.6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.1-.7.1l-.9 1.2c-.2.2-.3.2-.6.1-1.5-.7-2.5-1.6-3.3-3-.2-.4 0-.5.2-.7l.5-.6c.1-.2.1-.4 0-.6l-.8-2c-.2-.4-.4-.4-.6-.4Z" />
  </svg>
);

const Globe = (p: IconProps) => (
  <svg {...base} {...p} fill="none" stroke="currentColor" strokeWidth={1.6}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 2.5 15 0 18-2.5-3-2.5-15.4 0-18Z" />
  </svg>
);

const ICONS: Record<string, (p: IconProps) => React.JSX.Element> = {
  facebook: Facebook,
  x: X,
  "brand-x": X,
  twitter: X,
  instagram: Instagram,
  youtube: YouTube,
  linkedin: LinkedIn,
  tiktok: TikTok,
  whatsapp: WhatsApp,
  "wa.me": WhatsApp,
};

/** Human name for a network key, used as the link's accessible name. */
export const socialLabel = (network: string): string => {
  const names: Record<string, string> = {
    facebook: "Facebook",
    x: "X",
    "brand-x": "X",
    twitter: "X",
    instagram: "Instagram",
    youtube: "YouTube",
    linkedin: "LinkedIn",
    tiktok: "TikTok",
    whatsapp: "WhatsApp",
    "wa.me": "WhatsApp",
  };
  return names[network] ?? "Website";
};

export function SocialIcon({ network, ...props }: { network: string } & IconProps) {
  const Icon = ICONS[network] ?? Globe;
  return <Icon {...props} />;
}
