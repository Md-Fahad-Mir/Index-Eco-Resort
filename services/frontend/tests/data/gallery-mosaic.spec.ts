import { expect, test } from "@playwright/test";
import { narrowMosaic, pack, wideMosaic } from "../../src/components/sections/home/galleryMosaic";
import home from "../../src/fixtures/home.json";

/**
 * Home's night gallery mosaic (sections/home/galleryMosaic.ts) packs clean
 * rectangles: whatever a category holds, the dense grid never leaves a hole.
 * Pure layout logic, so it runs with the data checks, without a browser.
 */

const spansOf = (tiles: { col: 1 | 2; row: 1 | 2 }[]) =>
  tiles.map(({ col, row }) => ({ col, row }));

test("hole-free at four columns and at two, for every count up to 30", () => {
  for (let count = 1; count <= 30; count++) {
    const wide = wideMosaic(count);
    expect(wide.tiles, `wide tiles for ${count}`).toHaveLength(count);
    expect(pack(spansOf(wide.tiles), wide.cols).holes, `wide holes for ${count}`).toBe(0);

    const narrow = narrowMosaic(count);
    expect(narrow, `narrow tiles for ${count}`).toHaveLength(count);
    expect(pack(spansOf(narrow), 2).holes, `narrow holes for ${count}`).toBe(0);
  }
});

test("under four photographs the wall is that many equal columns", () => {
  for (const count of [1, 2, 3]) {
    const wide = wideMosaic(count);
    expect(wide.cols).toBe(count);
    expect(wide.tiles.every((t) => t.col === 1 && t.row === 1)).toBe(true);
  }
});

test("the live counts keep the mosaic's large tiles", () => {
  // "All" (12) and the largest category both open on a 2×2 tile.
  const counts = [
    home.gallery.items.length,
    ...Object.values(home.gallery.itemsByCategory).map((items) => items.length),
  ].filter((n) => n >= 4);
  for (const count of counts) {
    expect(wideMosaic(count).tiles[0], `first tile for ${count}`).toMatchObject({ col: 2, row: 2 });
  }
});
