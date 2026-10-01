import { SocialIcon, socialLabel } from "@/components/brand/SocialIcon";
import Link from "@/components/i18n/Link";
import { SmartImage } from "@/components/media/SmartImage";
import { Paragraph } from "@/components/typography/Text";
import { Container } from "@/components/ui/Container";
import type { SiteSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { anchorProps, internalHref, isInternal } from "@/lib/links";
import { cn } from "@/lib/utils";

/**
 * The footer (design-system §8). Every link comes from data and is rendered
 * verbatim, including two the live site gets wrong:
 *
 * PARITY: TikTok is "#" and the credit line has no href at all. Both are
 * listed in docs/OWNER-REPORT.md §B.
 */
/** Column headings: size and leading are tokens, so a theme can set a larger display size. */
const FOOTER_HEADING =
  "font-display text-chrome-footer-heading mb-5 " +
  "text-(length:--chrome-footer-heading-size) leading-(--chrome-footer-heading-leading)";

/**
 * Below `xl` the footer is read on touch screens: a link's hit area grows to
 * the 44px its row pitch allows, without moving the text or its underline.
 */
const TOUCH_AREA =
  "relative max-xl:before:absolute max-xl:before:inset-x-0 max-xl:before:-inset-y-2.5";

export async function Footer({ settings }: { settings: SiteSettings }) {
  const { footer } = settings;
  const dict = await getDictionary();
  return (
    <footer data-region="footer" className="bg-chrome-footer text-chrome-footer-text on-dark">
      {/* Phones: one column, the two link lists side by side from 480px.
          Tablets: the brand across the top (logo and socials beside the
          text), then the lists, then contact. Small laptops: brand across
          the top, then three columns. From `xl`: the four-column row. */}
      <Container className="grid gap-12 py-[clamp(3.5rem,6vw,5.5rem)] min-[30rem]:grid-cols-2 min-[30rem]:gap-x-8 lg:grid-cols-3 xl:grid-cols-12 xl:gap-8">
        <div className="flex flex-col gap-6 min-[30rem]:col-span-2 md:grid md:grid-cols-subgrid md:gap-x-8 lg:col-span-3 xl:col-span-4 xl:flex">
          <Link
            href="/"
            aria-label={settings.siteName}
            className="w-[clamp(130px,16vw,168px)] md:col-start-1 md:row-start-1"
          >
            <SmartImage
              image={footer.logo}
              sizes="168px"
              ratio="auto"
              frameClassName="bg-transparent"
              className="h-auto w-full object-contain"
            />
          </Link>
          <Paragraph className="text-chrome-footer-muted text-small max-w-[44ch] md:col-start-2 md:row-span-2 md:row-start-1 lg:col-span-2">
            {footer.about}
          </Paragraph>
          <ul className="flex flex-wrap items-center gap-1 md:col-start-1 md:row-start-2 md:self-end xl:self-auto">
            {footer.socials.map((social) => (
              <li key={`${social.network}-${social.href}`}>
                <a
                  href={social.href}
                  aria-label={socialLabel(social.network)}
                  className="text-chrome-footer-text/80 hover:bg-chrome-social-hover hover:text-chrome-footer-social-hover-fg border-chrome-footer-rule rounded-pill grid size-11 place-items-center border transition-colors duration-[var(--dur-micro)] xl:size-10"
                  {...anchorProps(social.href, social.target)}
                >
                  <SocialIcon network={social.network} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {footer.columns.map((column) => (
          <nav key={column.title} aria-label={column.title} className="xl:col-span-2">
            <h2 className={FOOTER_HEADING}>{column.title}</h2>
            {/* A 44px pitch for thumbs below `xl`, the tighter list above. */}
            <ul className="flex flex-col gap-5 xl:gap-3">
              {column.links.map((link) => {
                const href = internalHref(link.href) ?? "#";
                return (
                  <li key={link.label}>
                    {isInternal(href) ? (
                      <Link
                        href={href}
                        className={cn(
                          "text-chrome-footer-text/85 hover:text-chrome-footer-text text-small bg-[linear-gradient(var(--chrome-footer-underline),var(--chrome-footer-underline))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size,color] duration-300 hover:bg-[length:100%_1px]",
                          TOUCH_AREA,
                        )}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className={cn(
                          "text-chrome-footer-text/85 hover:text-chrome-footer-text text-small",
                          TOUCH_AREA,
                        )}
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

        <div className="min-[30rem]:col-span-2 lg:col-span-1 xl:col-span-4">
          <h2 className={FOOTER_HEADING}>{dict.chrome.footerContact}</h2>
          <ul className="divide-chrome-footer-rule divide-y">
            {footer.contact.map((item) => (
              <li key={item.text} className="py-3 first:pt-0 last:pb-0">
                {item.href ? (
                  <a
                    href={item.href}
                    className={cn(
                      "text-chrome-footer-text/85 hover:text-chrome-footer-text text-small",
                      TOUCH_AREA,
                    )}
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
