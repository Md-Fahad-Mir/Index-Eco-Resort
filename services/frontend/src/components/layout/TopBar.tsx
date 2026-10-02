import { Mail, Phone } from "lucide-react";
import { SocialIcon, socialLabel } from "@/components/brand/SocialIcon";
import { Container } from "@/components/ui/Container";
import { anchorProps } from "@/lib/links";
import type { SiteSettings } from "@/lib/data";

/**
 * The thin bar above the header. Desktop only, and it collapses once the header
 * turns solid (handled by SiteHeader).
 *
 * PARITY: the phone number and email are plain text on the live site, not
 * links — listed in docs/OWNER-REPORT.md §B.
 */
export function TopBar({ settings }: { settings: SiteSettings }) {
  const { phone, email, socials } = settings.topBar;
  return (
    <div
      data-region="topbar"
      // A fixed 56px, so SiteHeader can lift exactly this much out of view.
      className="border-chrome-hairline/60 bg-chrome-topbar hidden h-14 items-center border-b lg:flex"
    >
      <Container className="flex items-center justify-between gap-6">
        <div className="text-chrome-topbar-text/85 flex items-center gap-7">
          <span className="text-small flex items-center gap-2">
            <Phone aria-hidden className="size-4 shrink-0" strokeWidth={1.5} />
            <span className="tabular">{phone.label}</span>
          </span>
          <span className="text-small flex items-center gap-2">
            <Mail aria-hidden className="size-4 shrink-0" strokeWidth={1.5} />
            {email.label}
          </span>
        </div>

        <ul className="flex items-center gap-1">
          {socials.map((social) => (
            <li key={`${social.network}-${social.href}`}>
              <a
                href={social.href}
                aria-label={socialLabel(social.network)}
                className="text-chrome-topbar-text/85 hover:bg-chrome-social-hover hover:text-chrome-social-hover-fg on-dark rounded-pill grid size-9 place-items-center transition-colors duration-[var(--dur-micro)]"
                {...anchorProps(social.href)}
              >
                <SocialIcon network={social.network} className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
