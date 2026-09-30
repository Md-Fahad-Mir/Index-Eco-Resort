/**
 * The night gallery's mosaic (prompts/06b-home-redesign.md §5.5): tile spans
 * for a `grid-auto-flow: dense` grid that fill a clean rectangle — no hole —
 * for any number of photographs.
 *
 * Wide (≥768px): four columns cycling 2×2, 1×1 ×4, 2×1. A cycle only closes
 * cleanly at some counts, so each count is packed exactly as CSS would pack
 * it, and if a hole is left the nearest variation that closes it is used.
 * Under four photographs the grid is simply that many equal columns.
 *
 * Narrow: two columns, every fifth tile spanning both, and a lone last tile
 * widened so the final row is never half empty.
 */

export type Span = { col: 1 | 2; row: 1 | 2 };
export type Tile = Span & { x: number; y: number };

const BIG: Span = { col: 2, row: 2 };
const ONE: Span = { col: 1, row: 1 };
const WIDE: Span = { col: 2, row: 1 };
const CYCLE: Span[] = [BIG, ONE, ONE, ONE, ONE, WIDE];
const CHOICES: Span[] = [ONE, WIDE, BIG];

/** A copy of `spans` with index `i` replaced. */
const swap = (spans: Span[], i: number, span: Span) => spans.map((s, k) => (k === i ? span : s));

/**
 * Where CSS grid's dense auto-placement puts each span on `cols` columns: for
 * each item, the first cell, scanning rows then columns, where it fits.
 */
export function pack(spans: Span[], cols: number): { tiles: Tile[]; holes: number } {
  const taken: boolean[][] = [];
  const isTaken = (y: number, x: number) => taken[y]?.[x] ?? false;
  const tiles: Tile[] = [];

  for (const span of spans) {
    const col = Math.min(span.col, cols) as Span["col"];
    for (let y = 0, placed = false; !placed; y++) {
      for (let x = 0; x + col <= cols && !placed; x++) {
        let fits = true;
        for (let dy = 0; dy < span.row && fits; dy++) {
          for (let dx = 0; dx < col && fits; dx++) if (isTaken(y + dy, x + dx)) fits = false;
        }
        if (!fits) continue;
        for (let dy = 0; dy < span.row; dy++) {
          taken[y + dy] ??= [];
          for (let dx = 0; dx < col; dx++) taken[y + dy]![x + dx] = true;
        }
        tiles.push({ col, row: span.row, x, y });
        placed = true;
      }
    }
  }

  let filled = 0;
  for (const row of taken) for (let x = 0; x < cols; x++) if (row?.[x]) filled++;
  return { tiles, holes: taken.length * cols - filled };
}

/** The four-column mosaic for `count` photographs, hole-free. */
export function wideMosaic(count: number): { cols: number; tiles: Tile[] } {
  if (count < 4) return { cols: Math.max(count, 1), tiles: pack(Array(count).fill(ONE), 4).tiles };

  const base = Array.from({ length: count }, (_, i) => CYCLE[i % CYCLE.length]!);
  const first = pack(base, 4);
  if (first.holes === 0) return { cols: 4, tiles: first.tiles };

  // Change as few tiles as possible, latest first, so the opening of the
  // mosaic — the part seen first — keeps its rhythm.
  const order = Array.from({ length: count }, (_, i) => count - 1 - i);
  for (const i of order) {
    for (const choice of CHOICES) {
      if (choice === base[i]) continue;
      const spans = swap(base, i, choice);
      const result = pack(spans, 4);
      if (result.holes === 0) return { cols: 4, tiles: result.tiles };
    }
  }
  for (const i of order) {
    for (const j of order) {
      if (j >= i) continue;
      for (const a of CHOICES) {
        for (const b of CHOICES) {
          const spans = swap(swap(base, i, a), j, b);
          const result = pack(spans, 4);
          if (result.holes === 0) return { cols: 4, tiles: result.tiles };
        }
      }
    }
  }
  // Always closes: equal tiles, widened at the end to make up the last row.
  const spans: Span[] = Array(count).fill(ONE);
  for (let k = 0; k < (4 - (count % 4)) % 4; k++) spans[count - 1 - k] = WIDE;
  return { cols: 4, tiles: pack(spans, 4).tiles };
}

/** The two-column mosaic: every fifth tile full width, no half-empty last row. */
export function narrowMosaic(count: number): Tile[] {
  const spans: Span[] = Array.from({ length: count }, (_, i) => ((i + 1) % 5 === 0 ? WIDE : ONE));
  // Single tiles after the last full-width one: an odd run leaves a gap.
  let run = 0;
  for (let i = count - 1; i >= 0 && spans[i] === ONE; i--) run++;
  if (run % 2 === 1) spans[count - 1] = WIDE;
  return pack(spans, 2).tiles;
}
