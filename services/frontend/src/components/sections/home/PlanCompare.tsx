"use client";

import useEmblaCarousel from "embla-carousel-react";
import {
  animate,
  m,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "@/components/i18n/Link";
import { useDictionary, useFormatter } from "@/components/i18n/LocaleProvider";
import { RevealGroup } from "@/components/motion/midnight/RevealGroup";
import { RevealItem } from "@/components/motion/midnight/RevealItem";
import { DUR, EASE, EASE_INOUT, VIEWPORT } from "@/components/motion/midnight/tokens";
import { useMotionOn, useRevealScale } from "@/components/motion/midnight/useMotionOn";
import { MembershipCard } from "@/components/ownership/MembershipCard";
import { Button } from "@/components/ui/Button";
import { autoLang, isBangla } from "@/lib/lang";
import { anchorProps, isInternal } from "@/lib/links";
import { cn } from "@/lib/utils";
import type { PlanColumn, PlanComparison } from "./planComparison";

/** The benefit column's width against one plan column's. */
const LABEL_FR = 1.55;
/** Seconds between neighbouring columns as a row arrives: a wave, left to right. */
const COLUMN_STAGGER = 0.08;
/** Seconds between the cards being dealt onto the table. */
const DEAL_STAGGER = 0.12;
/** The panel starts as soon as its top edge is in; it is taller than a screen. */
const PANEL_VIEWPORT = { once: true, amount: 0.05 } as const;

const SIZES = "(min-width: 1024px) 240px, (min-width: 768px) 17vw, 78vw";

/** A ring drawn from twelve o'clock, clockwise, and the two marks inside it. */
const RING = "M20 1.5a18.5 18.5 0 1 1 0 37a18.5 18.5 0 1 1 0-37";
const TICK = "M13.5 20.5l4.5 4.5l8.5-9.5";
const CROSS = "M15.5 15.5l9 9M24.5 15.5l-9 9";

const pad = (n: number) => String(n).padStart(2, "0");

/** Seconds a row waits once it arrives; rows arriving together still fall in turn. */
const rowDelay = (index: number) => 0.12 + Math.min(index, 6) * 0.06;

/**
 * Home's plan comparison (the vault, §5.7): the four membership cards heading
 * a table of what each plan holds.
 *
 * - ≥768px: the table. The cards are dealt onto it, tilting up into place, and
 *   a light crosses each face once it lands; every row then rises as it
 *   scrolls in, its hairline drawn left to right, its numbers counting up and
 *   its marks drawn in a wave across the columns. A band of light follows the
 *   column under the pointer (or holding focus).
 * - <768px: the cards as a snap carousel, the lit one's facts and benefits
 *   beneath it; changing card counts the numbers over and redraws the marks.
 * Reduced motion, or no JS: everything in its final state, nothing moving.
 */
export function PlanCompare({ comparison }: { comparison: PlanComparison }) {
  return (
    <div className="flex w-full flex-col items-center gap-10 lg:gap-12">
      <CompareTable comparison={comparison} />
      <PlanExplorer comparison={comparison} />
      <Legend />
    </div>
  );
}

// ── Shared motion ────────────────────────────────────────────────────────────

/** Whether the panel has arrived; rows wait for it before playing. */
const PanelShown = createContext(true);

/** The column under the pointer or holding focus, and how to change it. */
const HotColumn = createContext<{ hot: number | null; setHot: (col: number | null) => void }>({
  hot: null,
  setHot: () => {},
});

/** The entrance variants, sized for the viewport. Each takes its delay as `custom`. */
function useVariants() {
  const on = useMotionOn();
  const { distance, time } = useRevealScale();
  const at = (delay: number, duration: number, ease: typeof EASE | typeof EASE_INOUT = EASE) =>
    on ? { duration: duration * time, ease, delay } : { duration: 0 };

  const rise: Variants = {
    hidden: { opacity: 0, y: distance },
    shown: (delay: number = 0) => ({ opacity: 1, y: 0, transition: at(delay, DUR.reveal) }),
  };
  // A card laid onto the table: it tips up out of the surface and settles.
  const deal: Variants = {
    hidden: { opacity: 0, y: distance * 2, rotateX: 34, scale: 0.94, transformPerspective: 900 },
    shown: (delay: number = 0) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transformPerspective: 900,
      transition: at(delay, DUR.frame),
    }),
  };
  const rule: Variants = {
    hidden: { scaleX: 0 },
    shown: (delay: number = 0) => ({ scaleX: 1, transition: at(delay, DUR.frame, EASE_INOUT) }),
  };
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    shown: ({ delay = 0, duration = 1 }: { delay?: number; duration?: number } = {}) => ({
      pathLength: 1,
      opacity: 1,
      transition: on
        ? {
            pathLength: { duration: duration * time, ease: EASE_INOUT, delay },
            opacity: { duration: 0.01, delay },
          }
        : { duration: 0 },
    }),
  };
  return { on, rise, deal, rule, draw };
}

/**
 * A row's trigger: once it is a quarter in view and the panel has arrived.
 * With motion off it is shown at once.
 */
function useArrival() {
  const on = useMotionOn();
  const panelShown = useContext(PanelShown);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, VIEWPORT);
  const go = !on || (panelShown && inView);
  return { ref, go, state: { initial: "hidden", animate: go ? "shown" : "hidden" } as const };
}

/**
 * A number that counts up from zero the first time `go` is true, and over to
 * the new value whenever it changes after that. The markup always holds the
 * final value, so it reads right before JS and to assistive tech.
 */
function CountUp({
  value,
  suffix = "",
  go,
  delay = 0,
}: {
  value: number | null;
  suffix?: string;
  go: boolean;
  delay?: number;
}) {
  const on = useMotionOn();
  const { digits } = useFormatter();
  const target = value ?? 0;
  const decimals = Number.isInteger(target) ? 0 : 1;
  const count = useMotionValue(target);
  const text = useTransform(count, (v) => `${digits(v.toFixed(decimals))}${suffix}`);
  const started = useRef(false);

  useEffect(() => {
    if (value === null) return;
    if (!on) {
      count.set(value);
      return;
    }
    if (!go) return;
    const first = !started.current;
    started.current = true;
    // Hidden behind the row's own entrance until the count begins.
    if (first) count.jump(0);
    const controls = animate(count, value, {
      duration: DUR.light,
      ease: EASE,
      delay: first ? delay : 0,
    });
    return () => controls.stop();
  }, [value, on, go, delay, count]);

  if (value === null) return <span className="text-me-sage">—</span>;
  return (
    <>
      <m.span aria-hidden>{text}</m.span>
      <span className="sr-only">
        {digits(value.toFixed(decimals))}
        {suffix}
      </span>
    </>
  );
}

/**
 * Included or not: a ring and a tick (or a cross), drawn ring first. Takes its
 * `hidden → shown` from the enclosing row unless given its own `state`.
 */
function Mark({
  included,
  delay = 0,
  state,
  className,
}: {
  included: boolean;
  delay?: number;
  state?: { initial: "hidden"; animate: "hidden" | "shown" };
  className?: string;
}) {
  const { draw } = useVariants();
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  return (
    <m.svg
      aria-hidden
      viewBox="0 0 40 40"
      {...state}
      className={cn(
        "size-9 shrink-0 lg:size-10",
        included ? "text-me-champagne" : "text-me-sage",
        className,
      )}
    >
      <m.path
        data-me-draw
        data-me-reveal
        d={RING}
        {...stroke}
        strokeWidth={1}
        strokeOpacity={included ? 0.75 : 0.6}
        variants={draw}
        custom={{ delay, duration: 1.1 }}
      />
      <m.path
        data-me-draw
        data-me-reveal
        d={included ? TICK : CROSS}
        {...stroke}
        strokeWidth={1.5}
        variants={draw}
        custom={{ delay: delay + 0.45, duration: 0.6 }}
      />
    </m.svg>
  );
}

/** A light that crosses a card's face once, left to right. CSS only. */
function Glint({ delay }: { delay: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[4.5%_/_7.1%]"
    >
      <span
        className="absolute inset-0 animate-[card-sweep_1.4s_var(--me-ease)_both] bg-[linear-gradient(105deg,transparent_32%,rgb(255_255_255/0.55)_50%,transparent_68%)] mix-blend-soft-light"
        style={{ animationDelay: `${delay}s` }}
      />
    </span>
  );
}

/** "Book Your Share", naming its plan to assistive tech so the four differ. */
function PlanCta({ plan, className }: { plan: PlanColumn; className?: string }) {
  if (!plan.cta) return null;
  const { label, href } = plan.cta;
  const content = (
    <>
      {label}
      <span className="sr-only"> — {plan.name}</span>
    </>
  );
  return (
    <Button
      asChild
      variant="home-secondary"
      className={cn("h-auto min-h-[52px] px-4 py-3 text-center", className)}
    >
      {isInternal(href) ? (
        <Link href={href} lang={autoLang(label)}>
          {content}
        </Link>
      ) : (
        <a href={href} lang={autoLang(label)} {...anchorProps(href)}>
          {content}
        </a>
      )}
    </Button>
  );
}

/** A fact's label: italic champagne, upright for Bangla (no faked italic, §4.4). */
function FactLabel({ children, className }: { children: string; className?: string }) {
  return (
    <span
      lang={autoLang(children)}
      className={cn("font-display text-me-champagne", !isBangla(children) && "italic", className)}
    >
      {children}
    </span>
  );
}

// ── ≥768px: the table ────────────────────────────────────────────────────────

function CompareTable({ comparison }: { comparison: PlanComparison }) {
  const dict = useDictionary();
  const { on, rise } = useVariants();
  const { plans, benefits } = comparison;
  const panelRef = useRef<HTMLDivElement>(null);
  const panelInView = useInView(panelRef, PANEL_VIEWPORT);
  const shown = !on || panelInView;
  const [hot, setHot] = useState<number | null>(null);

  const columns: CSSProperties = {
    gridTemplateColumns: `minmax(0,${LABEL_FR}fr) repeat(${plans.length},minmax(0,1fr))`,
  };

  return (
    <HotColumn.Provider value={{ hot, setHot }}>
      <PanelShown.Provider value={shown}>
        <m.div
          ref={panelRef}
          data-me-reveal
          data-testid="plan-compare"
          className="border-me-hairline-gold shadow-me-deep relative hidden w-full overflow-hidden rounded-[28px] border bg-[linear-gradient(to_bottom,rgb(30_46_39/0.45),rgb(14_26_21/0.7)_30%,rgb(14_26_21/0.55))] md:block"
          initial="hidden"
          animate={shown ? "shown" : "hidden"}
          variants={rise}
          onPointerLeave={() => setHot(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHot(null);
          }}
        >
          <ColumnBand hot={hot} count={plans.length} />
          <div role="table" aria-label={dict.plans.caption} className="relative">
            <div role="rowgroup">
              <HeadRow plans={plans} columns={columns} />
            </div>
            <div role="rowgroup">
              <FactRow
                label={dict.plans.shares}
                values={plans.map((plan) => plan.shares)}
                columns={columns}
                index={0}
              />
              <FactRow
                label={dict.plans.cashDiscount}
                values={plans.map((plan) => plan.discount)}
                suffix="%"
                columns={columns}
                index={1}
              />
              {benefits.map((benefit, index) => (
                <BenefitRow
                  key={benefit}
                  benefit={benefit}
                  plans={plans}
                  columns={columns}
                  striped={index % 2 === 0}
                  index={index + 2}
                />
              ))}
            </div>
            <div role="rowgroup">
              <CtaRow plans={plans} columns={columns} />
            </div>
          </div>
        </m.div>
      </PanelShown.Provider>
    </HotColumn.Provider>
  );
}

/**
 * The light over the hot column. It glides between columns on a spring and
 * appears in place when the pointer arrives from outside. Transform and
 * opacity only.
 */
function ColumnBand({ hot, count }: { hot: number | null; count: number }) {
  const on = useMotionOn();
  const col = useSpring(0, { stiffness: 320, damping: 34 });
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (hot !== null) {
      if (last.current === null || !on) col.jump(hot);
      else col.set(hot);
    }
    last.current = hot;
  }, [hot, on, col]);

  const x = useTransform(col, (c) => `${c * 100}%`);
  const total = LABEL_FR + count;

  return (
    <m.div
      aria-hidden
      className="pointer-events-none absolute inset-y-0"
      style={{ left: `${(LABEL_FR / total) * 100}%`, width: `${100 / total}%`, x }}
      initial={false}
      animate={{ opacity: hot === null ? 0 : 1 }}
      transition={{ duration: on ? 0.45 : 0, ease: EASE }}
    >
      <span className="absolute inset-x-1.5 inset-y-3 rounded-[20px] bg-[linear-gradient(to_bottom,rgb(201_169_110/0.14),rgb(201_169_110/0.04)_45%,rgb(201_169_110/0.1))] shadow-[inset_0_0_0_1px_rgb(201_169_110/0.3)]" />
    </m.div>
  );
}

/** The benefit column's cell. Hovering it puts the band out. */
function LabelCell({
  role,
  className,
  children,
}: {
  role: "columnheader" | "rowheader" | "cell";
  className?: string;
  children?: ReactNode;
}) {
  const { setHot } = useContext(HotColumn);
  return (
    <div
      role={role}
      onPointerEnter={() => setHot(null)}
      className={cn("flex items-center pr-4 pl-6 text-start lg:pl-11", className)}
    >
      {children}
    </div>
  );
}

/** A plan's cell. `group/col` carries `data-hot` to its contents. */
function PlanCell({
  col,
  role = "cell",
  className,
  children,
}: {
  col: number;
  role?: "columnheader" | "cell";
  className?: string;
  children: ReactNode;
}) {
  const { hot, setHot } = useContext(HotColumn);
  return (
    <div
      role={role}
      data-hot={hot === col || undefined}
      onPointerEnter={() => setHot(col)}
      onFocus={() => setHot(col)}
      className={cn("group/col flex items-center justify-center px-2.5 lg:px-4", className)}
    >
      {children}
    </div>
  );
}

/**
 * A row's top hairline, drawn left to right as it arrives. Empty and roleless,
 * so it is nothing to assistive tech inside the row.
 */
function RowRule({ delay, strong }: { delay: number; strong?: boolean }) {
  const { rule } = useVariants();
  return (
    <m.span
      data-me-reveal
      variants={rule}
      custom={delay}
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 h-px origin-left",
        strong ? "bg-me-hairline-gold" : "bg-me-hairline-gold/60",
      )}
    />
  );
}

function HeadRow({ plans, columns }: { plans: PlanColumn[]; columns: CSSProperties }) {
  const dict = useDictionary();
  const { ref, go, state } = useArrival();
  const { on, rise, deal } = useVariants();

  return (
    <m.div ref={ref} role="row" className="grid" style={columns} {...state}>
      <LabelCell role="columnheader" className="pt-10 pb-8 lg:pt-12 lg:pb-10">
        <m.span
          data-me-reveal
          variants={rise}
          custom={0.1}
          lang={autoLang(dict.plans.benefits)}
          className="text-me-ivory text-h3 font-light"
        >
          {dict.plans.benefits}
        </m.span>
      </LabelCell>
      {plans.map((plan, col) => {
        const delay = 0.2 + col * DEAL_STAGGER;
        return (
          <PlanCell
            key={plan.slug}
            col={col}
            role="columnheader"
            className="flex-col gap-4 pt-10 pb-8 lg:gap-5 lg:pt-12 lg:pb-10"
          >
            <m.div
              data-me-reveal
              variants={deal}
              custom={delay}
              className="relative w-full max-w-[240px]"
            >
              <MembershipCard
                variant="home"
                card={plan.card}
                name={plan.name}
                href={plan.href ?? undefined}
                sizes={SIZES}
              />
              {on && go ? <Glint delay={delay + DUR.frame * 0.6} /> : null}
            </m.div>
            {/* The card link already names the column; this is its caption. */}
            <m.span
              aria-hidden
              data-me-reveal
              variants={rise}
              custom={delay + 0.35}
              lang={autoLang(plan.name)}
              className="text-me-ivory group-data-[hot]/col:text-me-champagne-soft text-center text-base leading-snug transition-colors duration-500 lg:text-[1.25rem]"
            >
              {plan.name}
            </m.span>
          </PlanCell>
        );
      })}
    </m.div>
  );
}

function FactRow({
  label,
  values,
  suffix,
  columns,
  index,
}: {
  label: string;
  values: (number | null)[];
  suffix?: string;
  columns: CSSProperties;
  index: number;
}) {
  const { ref, go, state } = useArrival();
  const { rise } = useVariants();
  const delay = rowDelay(index);

  return (
    <m.div ref={ref} role="row" className="relative grid" style={columns} {...state}>
      <RowRule delay={delay} strong />
      <LabelCell role="rowheader" className="py-7 lg:py-9">
        <m.span data-me-reveal variants={rise} custom={delay}>
          <FactLabel className="text-[1.125rem] lg:text-[1.375rem]">{label}</FactLabel>
        </m.span>
      </LabelCell>
      {values.map((value, col) => (
        <PlanCell key={col} col={col}>
          <m.span
            data-me-reveal
            variants={rise}
            custom={delay + col * COLUMN_STAGGER}
            className="tabular text-me-ivory group-data-[hot]/col:text-me-champagne-soft text-[clamp(1.75rem,0.9rem+2vw,2.75rem)] leading-none font-light transition-colors duration-500"
          >
            <CountUp value={value} suffix={suffix} go={go} delay={delay + col * COLUMN_STAGGER} />
          </m.span>
        </PlanCell>
      ))}
    </m.div>
  );
}

function BenefitRow({
  benefit,
  plans,
  columns,
  striped,
  index,
}: {
  benefit: string;
  plans: PlanColumn[];
  columns: CSSProperties;
  striped: boolean;
  index: number;
}) {
  const dict = useDictionary();
  const { ref, state } = useArrival();
  const { rise } = useVariants();
  const delay = rowDelay(index);

  return (
    <m.div
      ref={ref}
      role="row"
      className={cn("relative grid", striped && "bg-white/[0.018]")}
      style={columns}
      {...state}
    >
      <RowRule delay={delay} />
      <LabelCell role="rowheader" className="py-4 lg:py-5">
        <m.span
          data-me-reveal
          variants={rise}
          custom={delay}
          lang={autoLang(benefit)}
          className="text-me-ivory/90 text-small lg:text-body max-w-[22rem]"
        >
          {benefit}
        </m.span>
      </LabelCell>
      {plans.map((plan, col) => {
        const included = plan.benefits.includes(benefit);
        return (
          <PlanCell key={plan.slug} col={col}>
            <Mark
              included={included}
              delay={delay + col * COLUMN_STAGGER}
              className="ease-me transition-[scale] duration-500 group-data-[hot]/col:scale-110"
            />
            <span className="sr-only">
              {included ? dict.plans.included : dict.plans.notIncluded}
            </span>
          </PlanCell>
        );
      })}
    </m.div>
  );
}

function CtaRow({ plans, columns }: { plans: PlanColumn[]; columns: CSSProperties }) {
  const { ref, state } = useArrival();
  const { rise } = useVariants();
  const delay = rowDelay(1);

  return (
    <m.div ref={ref} role="row" className="relative grid" style={columns} {...state}>
      <RowRule delay={delay} />
      <LabelCell role="cell" />
      {plans.map((plan, col) => (
        <PlanCell key={plan.slug} col={col} className="py-8 lg:py-10">
          {plan.cta ? (
            <m.div
              data-me-reveal
              variants={rise}
              custom={delay + col * COLUMN_STAGGER}
              className="w-full max-w-[240px]"
            >
              <PlanCta plan={plan} className="w-full" />
            </m.div>
          ) : null}
        </PlanCell>
      ))}
    </m.div>
  );
}

// ── <768px: one plan at a time ───────────────────────────────────────────────

function PlanExplorer({ comparison }: { comparison: PlanComparison }) {
  const dict = useDictionary();
  const { digits } = useFormatter();
  const { on, rise } = useVariants();
  const { plans, benefits } = comparison;
  const [emblaRef, embla] = useEmblaCarousel({ align: "center" });
  const [active, setActive] = useState(0);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(triggerRef, VIEWPORT);
  const go = !on || inView;
  const state = { initial: "hidden", animate: go ? "shown" : "hidden" } as const;
  // Only the first arrival waits; a change of card redraws at once.
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      setActive(embla.selectedScrollSnap());
      setArrived(true);
    };
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  const plan = plans[active];
  if (!plan) return null;
  const markDelay = (index: number) => (arrived ? index * 0.04 : 0.5 + index * 0.06);

  return (
    <m.div data-testid="plan-explorer" className="w-full md:hidden" {...state}>
      <m.div ref={triggerRef} data-me-reveal variants={rise} custom={0}>
        <div ref={emblaRef} className="overflow-hidden">
          <ul className="flex">
            {plans.map((item, index) => {
              const current = index === active;
              return (
                <li
                  key={item.slug}
                  className="min-w-0 shrink-0 grow-0 basis-[78%] px-2"
                  // A tap on a neighbour brings it forward instead of leaving.
                  onClickCapture={(event) => {
                    if (current || !embla) return;
                    event.preventDefault();
                    embla.scrollTo(index);
                  }}
                >
                  <div
                    className={cn(
                      "ease-me relative transition-[scale] duration-500",
                      current ? "scale-100" : "scale-[0.92]",
                    )}
                  >
                    <MembershipCard
                      variant="home"
                      card={item.card}
                      name={item.name}
                      href={item.href ?? undefined}
                      sizes={SIZES}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "bg-me-night-deep pointer-events-none absolute inset-0 rounded-[4.5%_/_7.1%] transition-opacity duration-500",
                        current ? "opacity-0" : "opacity-45",
                      )}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </m.div>

      <m.div
        data-me-reveal
        variants={rise}
        custom={0.1}
        className="mt-6 flex flex-col items-center gap-1.5 text-center"
      >
        <p
          aria-live="polite"
          lang={autoLang(plan.name)}
          className="font-display text-me-ivory text-[1.5rem] leading-tight"
        >
          {plan.name}
        </p>
        <p aria-hidden className="text-label tabular text-me-parchment">
          {digits(pad(active + 1))}{" "}
          <span className="text-me-sage">/ {digits(pad(plans.length))}</span>
        </p>
      </m.div>

      <m.div
        data-me-reveal
        variants={rise}
        custom={0.2}
        className="border-me-hairline-gold shadow-me-deep mt-8 overflow-hidden rounded-[22px] border bg-[linear-gradient(to_bottom,rgb(30_46_39/0.45),rgb(14_26_21/0.7))]"
      >
        <dl className="divide-me-hairline-gold grid grid-cols-2 divide-x">
          {(
            [
              [dict.plans.shares, plan.shares, ""],
              [dict.plans.cashDiscount, plan.discount, "%"],
            ] as const
          ).map(([label, value, suffix], index) => (
            <div key={label} className="flex flex-col items-center gap-3 px-4 py-6 text-center">
              <dt>
                <FactLabel className="text-[1.0625rem]">{label}</FactLabel>
              </dt>
              <dd className="tabular text-me-ivory text-[2.5rem] leading-none font-light">
                <CountUp value={value} suffix={suffix} go={go} delay={0.35 + index * 0.1} />
              </dd>
            </div>
          ))}
        </dl>

        <ul className="border-me-hairline-gold border-t">
          {benefits.map((benefit, index) => {
            const included = plan.benefits.includes(benefit);
            return (
              <li
                key={benefit}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5",
                  index % 2 === 0 && "bg-white/[0.018]",
                )}
              >
                {/* Keyed by plan, so a change of card draws the marks again. */}
                <Mark
                  key={plan.slug}
                  included={included}
                  delay={markDelay(index)}
                  state={state}
                  className="size-8"
                />
                <span lang={autoLang(benefit)} className="text-small text-me-ivory/90">
                  {benefit}
                </span>
                <span className="sr-only">
                  {included ? dict.plans.included : dict.plans.notIncluded}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="border-me-hairline-gold border-t p-5">
          <PlanCta plan={plan} className="w-full" />
        </div>
      </m.div>
    </m.div>
  );
}

// ── The key ──────────────────────────────────────────────────────────────────

function Legend() {
  const dict = useDictionary();
  return (
    // Each cell already says which it is; the key is for the eye.
    <div aria-hidden>
      <RevealGroup
        as="ul"
        className="text-small text-me-parchment/80 flex items-center justify-center gap-8 md:gap-10"
      >
        {(
          [
            [true, dict.plans.included],
            [false, dict.plans.notIncluded],
          ] as const
        ).map(([included, label]) => (
          <RevealItem key={label} as="li" className="flex items-center gap-2.5">
            <Mark included={included} className="size-6 lg:size-6" />
            <span lang={autoLang(label)}>{label}</span>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
