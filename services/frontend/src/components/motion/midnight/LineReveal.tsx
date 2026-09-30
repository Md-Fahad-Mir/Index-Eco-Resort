"use client";

import { m, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { DUR, EASE, VIEWPORT } from "./tokens";
import type { Trigger } from "./trigger";
import { useMotionOn, useRevealScale } from "./useMotionOn";

const TAGS = { h1: m.h1, h2: m.h2, h3: m.h3, p: m.p } as const;

/** Longest we wait for the display face before measuring with what is there. */
const FONT_WAIT_MS = 1200;

type Phase = "waiting" | "lines" | "whole" | "done";

/**
 * A heading whose lines rise out of a mask, one after another (§3).
 *
 * Lines are the real ones: once the heading's own font has loaded, each word's
 * position is read through a DOM Range — the text node is never touched — and
 * words sharing a top form a line. Splitting is on whitespace only, so a Bangla
 * conjunct or a grapheme cluster is never cut. Any failure falls back to a
 * whole-heading reveal. When the rise is over the heading returns to one plain
 * text node, so it reflows normally on resize.
 *
 * The text is in the markup from the first byte and stays the accessible name
 * throughout; only its presentation is split.
 */
export function LineReveal({
  text,
  as = "h2",
  className,
  lang,
  delay = 0,
  stagger = 0.11,
  trigger = "inView",
}: {
  text: string;
  as?: keyof typeof TAGS;
  className?: string;
  lang?: "bn";
  /** Seconds, measured from mount (or from entering view). */
  delay?: number;
  /** Seconds between lines. */
  stagger?: number;
  trigger?: Trigger;
}) {
  const on = useMotionOn();
  const { distance, time } = useRevealScale();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, VIEWPORT);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [lines, setLines] = useState<string[]>([]);
  // What is left of `delay` once measuring has taken its share.
  const [remaining, setRemaining] = useState(delay);

  const go = on && (trigger === "mount" || inView);

  useEffect(() => {
    if (!go || phase !== "waiting") return;
    const el = ref.current;
    if (!el) return;
    const started = performance.now();
    let cancelled = false;
    void measureLines(el).then((measured) => {
      if (cancelled) return;
      setRemaining(Math.max(0, delay - (performance.now() - started) / 1000));
      if (measured && measured.length > 0) {
        setLines(measured);
        setPhase("lines");
      } else {
        setPhase("whole");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [go, phase, delay]);

  const Tag = TAGS[as];
  const textDuration = DUR.text * time;

  // The heading itself: hidden until its lines are ready, or revealed whole.
  const shown =
    !on || phase === "lines" || phase === "done"
      ? { opacity: 1, y: 0, transition: { duration: 0 } }
      : phase === "whole"
        ? { opacity: 1, y: 0, transition: { duration: textDuration, ease: EASE, delay: remaining } }
        : undefined;

  return (
    <Tag
      ref={ref}
      lang={lang}
      data-me-reveal
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={shown}
    >
      {on && phase === "lines"
        ? lines.map((line, index) => (
            // The mask. `overflow-y: clip` leaves the x axis visible, and the
            // padding/negative margin pair lets ascenders, descenders and
            // Bangla vowel signs overhang the line box without being clipped.
            <span
              key={index}
              className="-my-[0.2em] block overflow-y-clip py-[0.2em] whitespace-nowrap"
            >
              <m.span
                className="block"
                initial={{ y: "115%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: textDuration,
                  ease: EASE,
                  delay: remaining + index * stagger,
                }}
                onAnimationComplete={
                  index === lines.length - 1 ? () => setPhase("done") : undefined
                }
              >
                {index < lines.length - 1 ? `${line} ` : line}
              </m.span>
            </span>
          ))
        : text}
    </Tag>
  );
}

/**
 * The heading's rendered lines, from the positions of its words. `null` when
 * the element does not hold a single text node or anything throws.
 */
async function measureLines(el: HTMLElement): Promise<string[] | null> {
  try {
    const style = getComputedStyle(el);
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    await Promise.race([
      document.fonts.load(font, el.textContent ?? ""),
      new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS)),
    ]);

    const node = el.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE || el.childNodes.length !== 1) return null;
    const data = (node as Text).data;

    const range = document.createRange();
    const lines: string[][] = [];
    let lastTop: number | null = null;
    const words = /\S+/g;
    for (let match = words.exec(data); match; match = words.exec(data)) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const top = range.getClientRects()[0]?.top;
      if (top === undefined) return null;
      // A new line starts where a word sits clearly lower than the last one.
      if (lastTop === null || top - lastTop > 2) {
        lines.push([match[0]]);
        lastTop = top;
      } else {
        lines[lines.length - 1]!.push(match[0]);
      }
    }
    return lines.map((line) => line.join(" "));
  } catch {
    return null;
  }
}
