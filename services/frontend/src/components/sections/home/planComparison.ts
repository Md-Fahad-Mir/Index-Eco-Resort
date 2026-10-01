import type { OwnershipPackage, PackageSummary } from "@/lib/data";
import { internalHref } from "@/lib/links";

/** One column of Home's plan comparison: a package and the facts it offers. */
export type PlanColumn = {
  slug: string;
  name: string;
  card: PackageSummary["card"];
  /** The package's own page, where the card links. */
  href: string | null;
  cta: { label: string; href: string } | null;
  shares: number | null;
  /** Percent off a cash purchase. */
  discount: number | null;
  benefits: string[];
};

export type PlanComparison = {
  plans: PlanColumn[];
  /** Every benefit any plan offers, in the order the data first lists it. */
  benefits: string[];
};

const BN_ZERO = "০".codePointAt(0)!;

/** Bengali digits to Latin, so the numbers in a translated string parse. */
const latinDigits = (text: string) =>
  text.replace(/[০-৯]/g, (d) => String(d.codePointAt(0)! - BN_ZERO));

/**
 * The share count and cash discount inside a package's discount line, in
 * either language: "7% discount on purchasing 3 (three) shares in cash", or
 * "ক্যাশে ৩টি (তিন) শেয়ার ক্রয়ে ৭% ছাড়". The number before `%` is the
 * discount; the first other number is the shares. `null` when absent.
 */
export function readDiscountLine(text: string): {
  shares: number | null;
  discount: number | null;
} {
  const plain = latinDigits(text);
  const percent = /(\d+(?:\.\d+)?)\s*%/.exec(plain);
  const rest = percent
    ? plain.slice(0, percent.index) + plain.slice(percent.index + percent[0].length)
    : plain;
  const count = /\d+/.exec(rest);
  return {
    shares: count ? Number(count[0]) : null,
    discount: percent ? Number(percent[1]) : null,
  };
}

/**
 * The comparison Home shows: the plans the Home payload lists, each joined to
 * its full package for the facts, cheapest first. A plan whose package is
 * missing still gets its column, with no facts.
 */
export function comparePlans(
  summaries: PackageSummary[],
  packages: OwnershipPackage[],
): PlanComparison {
  const bySlug = new Map(packages.map((pkg) => [pkg.slug, pkg]));

  const plans = summaries.map((summary): PlanColumn => {
    const pkg = bySlug.get(summary.slug);
    const facts = pkg ? readDiscountLine(pkg.discountText) : { shares: null, discount: null };
    // PARITY: "Book Your Share" links to "#" on the live site; the package's
    // own page is where booking starts, so an empty link goes there instead.
    const ctaHref = pkg && pkg.cta.href && pkg.cta.href !== "#" ? pkg.cta.href : summary.href;
    return {
      slug: summary.slug,
      name: summary.name,
      card: summary.card,
      href: internalHref(summary.href),
      cta: pkg ? { label: pkg.cta.label, href: internalHref(ctaHref) ?? "#" } : null,
      ...facts,
      benefits: pkg?.benefits ?? [],
    };
  });

  // Fewest shares first; plans without a count keep their order, after the rest.
  const ranked = plans
    .map((plan, index) => ({ plan, index }))
    .sort((a, b) => (a.plan.shares ?? Infinity) - (b.plan.shares ?? Infinity) || a.index - b.index)
    .map(({ plan }) => plan);

  const benefits = [...new Set(ranked.flatMap((plan) => plan.benefits))];
  return { plans: ranked, benefits };
}
