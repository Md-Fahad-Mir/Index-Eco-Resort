import Link from "next/link";
import { SocialIcon, socialLabel } from "@/components/brand/SocialIcon";
import { SmartImage } from "@/components/media/SmartImage";
import { Paragraph } from "@/components/typography/Text";
import { Container } from "@/components/ui/Container";
import type { SiteSettings } from "@/lib/data";
import { anchorProps, internalHref, isInternal } from "@/lib/links";

/**
 * The footer (design-system §8). Every link comes from data and is rendered
 * verbatim, including two the live site gets wrong:
 *
 * PARITY: the Facebook href is relative ("www.facebook.com/indexecoresort") and
 * therefore resolves against our own origin; TikTok is "#"; the credit line has
 * no href at all. All three are listed in docs/OWNER-REPORT.md §B.
 */
/** Column headings: size and leading are tokens, so a theme can set a larger display size. */
const FOOTER_HEADING =
  "font-display text-chrome-footer-heading mb-5 " +
  "text-(length:--chrome-footer-heading-size) leading-(--chrome-footer-heading-leading)";

export function Footer({ settings }: { settings: SiteSettings }) {
  const { footer } = settings;
  return (
    <footer data-region="footer" className="bg-chrome-footer text-chrome-footer-text on-dark">
      <Container className="grid gap-12 py-[clamp(3.5rem,6vw,5.5rem)] lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Link href="/" aria-label={settings.siteName} className="w-[clamp(130px,16vw,168px)]">
            <SmartImage
              image={footer.logo}
              sizes="168px"
              ratio="auto"
              frameClassName="bg-transparent"
              className="h-auto w-full object-contain"
            />
          </Link>
          <Paragraph className="text-chrome-footer-muted text-small max-w-[44ch]">
            {footer.about}
          </Paragraph>
          <ul className="flex flex-wrap items-center gap-1">
            {footer.socials.map((social) => (
              <li key={`${social.network}-${social.href}`}>
                <a
                  href={social.href}
                  aria-label={socialLabel(social.network)}
                  className="text-chrome-footer-text/80 hover:bg-chrome-social-hover hover:text-chrome-footer-social-hover-fg border-chrome-footer-rule rounded-pill grid size-10 place-items-center border transition-colors duration-[var(--dur-micro)]"
                  {...anchorProps(social.href, social.target)}
                >
                  <SocialIcon network={social.network} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {footer.columns.map((column) => (
          <nav key={column.title} aria-label={column.title} className="lg:col-span-2">
            <h2 className={FOOTER_HEADING}>{column.title}</h2>
            <ul className="flex flex-col gap-3">
              {column.links.map((link) => {
                const href = internalHref(link.href) ?? "#";
                return (
                  <li key={link.label}>
                    {isInternal(href) ? (
                      <Link
                        href={href}
                        className="text-chrome-footer-text/85 hover:text-chrome-footer-text text-small bg-[linear-gradient(var(--chrome-footer-underline),var(--chrome-footer-underline))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size,color] duration-300 hover:bg-[length:100%_1px]"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-chrome-footer-text/85 hover:text-chrome-footer-text text-small"
                        {...anchorProps(href)}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}

        <div className="lg:col-span-4">
          <h2 className={FOOTER_HEADING}>Contact Us</h2>
          <ul className="divide-chrome-footer-rule divide-y">
            {footer.contact.map((item) => (
              <li key={item.text} className="py-3 first:pt-0 last:pb-0">
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-chrome-footer-text/85 hover:text-chrome-footer-text text-small"
                    {...anchorProps(item.href)}
                  >
                    {item.text}
                  </a>
                ) : (
                  <span className="text-chrome-footer-text/85 text-small">{item.text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="bg-chrome-footer-bar">
        <Container className="text-small flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
          <p className="text-chrome-footer-bar-text/90 flex flex-wrap items-center gap-2">
            <span>{footer.bottom.companyName}</span>
            <span>{footer.bottom.copyright}</span>
          </p>
          <p className="text-chrome-footer-bar-text/90 flex items-center gap-1.5">
            {footer.bottom.creditLabel} {/* PARITY: the live credit link has no href. */}
            <span className="font-medium">{footer.bottom.creditSite}</span>
          </p>
        </Container>
      </div>
    </footer>
  );
}
