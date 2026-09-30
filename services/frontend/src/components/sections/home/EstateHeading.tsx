import { LineReveal } from "@/components/motion/midnight/LineReveal";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";

/**
 * A Home section's eyebrow and heading, entering in the page's one order
 * (prompts/06b-home-redesign.md §3): the eyebrow rises, then the heading's
 * lines rise out of their mask. Champagne and ivory on night, bronze and
 * night on ivory. Empty CMS fields render nothing (rule 9e).
 */
export function EstateHeading({
  eyebrow,
  title,
  tone,
  align = "start",
  as = "h2",
  className,
  titleClassName,
}: {
  eyebrow?: string | null;
  title: string;
  tone: "night" | "ivory";
  align?: "start" | "center";
  as?: "h2" | "h3";
  className?: string;
  titleClassName?: string;
}) {
  const heading = title.trim();
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:gap-6",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow?.trim() ? (
        <RevealGroup>
          <RevealItem>
            <Eyebrow tone={tone === "night" ? "dark" : "light"} variant="home">
              {eyebrow}
            </Eyebrow>
          </RevealItem>
        </RevealGroup>
      ) : null}
      {heading ? (
        <LineReveal
          as={as}
          text={heading}
          lang={autoLang(heading)}
          delay={0.12}
          className={cn(
            "text-h2",
            tone === "night" ? "text-me-ivory" : "text-me-night",
            titleClassName,
          )}
        />
      ) : null}
    </div>
  );
}
