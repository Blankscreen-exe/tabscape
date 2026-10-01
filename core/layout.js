// @ts-check
/**
 * Pure layout math (no DOM) — unit-tested in dev/tests/layout.test.mjs.
 * Coordinates are grid cells: x = column (0-based), y = row (0-based).
 */

/** @typedef {import("./migrations/index.js").LayoutItem} LayoutItem */
/** @typedef {{ x: number, y: number, w: number, h: number }} Rect */

/** @param {Rect} a @param {Rect} b */
export function overlaps(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/**
 * Can `rect` be placed without leaving the grid or overlapping others?
 * @param {LayoutItem[]} layout @param {Rect} rect @param {number} columns @param {string} [ignoreId] item being moved
 */
export function canPlace(layout, rect, columns, ignoreId) {
  if (rect.x < 0 || rect.y < 0 || rect.w < 1 || rect.h < 1 || rect.x + rect.w > columns) return false;
  return layout.every(it => it.id === ignoreId || !overlaps(it, rect));
}

/**
 * First free spot scanning row by row, left to right.
 * @param {LayoutItem[]} layout @param {number} w @param {number} h @param {number} columns
 * @returns {{ x: number, y: number }}
 */
export function findFreeSpot(layout, w, h, columns) {
  w = Math.min(w, columns);
  for (let y = 0; y < 1000; y++) {
    for (let x = 0; x + w <= columns; x++) if (canPlace(layout, { x, y, w, h }, columns)) return { x, y };
  }
  return { x: 0, y: bottom(layout) };
}

/** First empty row below everything. @param {LayoutItem[]} layout */
export function bottom(layout) {
  return layout.reduce((m, it) => Math.max(m, it.y + it.h), 0);
}

/**
 * Drop references to widgets that no longer exist and fix items that overflow the grid
 * (e.g. a theme with fewer columns). Returns a new array.
 * @param {LayoutItem[]} layout @param {number} columns @param {(type: string) => boolean} widgetExists
 */
export function sanitize(layout, columns, widgetExists) {
  /** @type {LayoutItem[]} */
  const out = [];
  for (const raw of layout) {
    if (!widgetExists(raw.widget)) continue;
    const it = { ...raw, w: Math.max(1, Math.min(raw.w, columns)), h: Math.max(1, raw.h) };
    it.x = Math.max(0, Math.min(it.x, columns - it.w));
    if (!canPlace(out, it, columns)) Object.assign(it, findFreeSpot(out, it.w, it.h, columns));
    out.push(it);
  }
  return out;
}

/** Items sorted in reading order (used for the single-column mobile layout). @param {LayoutItem[]} layout */
export function readingOrder(layout) {
  return [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
}
