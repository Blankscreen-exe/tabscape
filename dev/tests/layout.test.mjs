import { test } from "node:test";
import assert from "node:assert/strict";
import { canPlace, findFreeSpot, overlaps, readingOrder, sanitize } from "../../core/layout.js";

const item = (id, x, y, w, h, widget = "clock") => ({ id, widget, x, y, w, h });

test("overlaps", () => {
  assert.equal(overlaps(item("a", 0, 0, 2, 2), item("b", 1, 1, 2, 2)), true);
  assert.equal(overlaps(item("a", 0, 0, 2, 2), item("b", 2, 0, 2, 2)), false); // touching edges is fine
});

test("canPlace respects bounds and other items, ignoring the moving item", () => {
  const layout = [item("a", 0, 0, 6, 2), item("b", 6, 0, 6, 2)];
  assert.equal(canPlace(layout, { x: 0, y: 2, w: 12, h: 1 }, 12), true);
  assert.equal(canPlace(layout, { x: 7, y: 0, w: 6, h: 1 }, 12), false); // overflows
  assert.equal(canPlace(layout, { x: 3, y: 0, w: 3, h: 1 }, 12), false); // overlaps a
  assert.equal(canPlace(layout, { x: 1, y: 0, w: 5, h: 2 }, 12, "a"), true);
});

test("findFreeSpot fills gaps first", () => {
  const layout = [item("a", 0, 0, 6, 2)];
  assert.deepEqual(findFreeSpot(layout, 6, 2, 12), { x: 6, y: 0 });
  assert.deepEqual(findFreeSpot(layout, 12, 1, 12), { x: 0, y: 2 });
});

test("sanitize drops unknown widgets, clamps to columns, resolves overlaps", () => {
  const out = sanitize([
    item("a", 0, 0, 12, 2),
    item("gone", 0, 2, 2, 2, "deleted-widget"),
    item("wide", 4, 2, 20, 1),
    item("clash", 0, 0, 4, 1),
  ], 12, w => w !== "deleted-widget");
  assert.deepEqual(out.map(i => i.id), ["a", "wide", "clash"]);
  const wide = out.find(i => i.id === "wide");
  assert.equal(wide.w, 12);
  assert.equal(wide.x, 0);
  for (const a of out) for (const b of out) if (a !== b) assert.equal(overlaps(a, b), false, `${a.id} overlaps ${b.id}`);
});

test("readingOrder sorts top-to-bottom, left-to-right", () => {
  const out = readingOrder([item("c", 6, 1, 1, 1), item("a", 0, 0, 1, 1), item("b", 0, 1, 1, 1)]);
  assert.deepEqual(out.map(i => i.id), ["a", "b", "c"]);
});
