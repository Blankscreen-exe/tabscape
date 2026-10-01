import { test } from "node:test";
import assert from "node:assert/strict";
import { blend, contrast, parseColor, readableOn, toHex } from "../../core/color.js";

test("parses every format getComputedStyle can return", () => {
  assert.deepEqual(parseColor("#fff"), { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual(parseColor("#ff000080"), { r: 255, g: 0, b: 0, a: 128 / 255 });
  assert.deepEqual(parseColor("rgb(10, 20, 30)"), { r: 10, g: 20, b: 30, a: 1 });
  assert.deepEqual(parseColor("rgba(10, 20, 30, 0.5)"), { r: 10, g: 20, b: 30, a: 0.5 });
  assert.deepEqual(parseColor("rgb(255 255 255 / .06)"), { r: 255, g: 255, b: 255, a: 0.06 });
  assert.deepEqual(parseColor("color(srgb 1 0.5 0 / 0.25)"), { r: 255, g: 127.5, b: 0, a: 0.25 });
  assert.equal(parseColor("not a colour"), null);
  assert.equal(parseColor("#12345"), null);
});

test("toHex round trip", () => {
  assert.equal(toHex(parseColor("#3b6cf6")), "#3b6cf6");
});

test("contrast ratio matches WCAG reference values", () => {
  assert.equal(Math.round(contrast(parseColor("#000"), parseColor("#fff"))), 21);
  assert.equal(contrast(parseColor("#777"), parseColor("#777")), 1);
});

test("readableOn picks black text on light accents and white on dark ones", () => {
  assert.equal(readableOn(parseColor("#ffd23f")), "#111111"); // yellow
  assert.equal(readableOn(parseColor("#000080")), "#ffffff"); // navy
  assert.equal(readableOn(parseColor("#3b6cf6")), "#ffffff"); // default blue
});

test("blend composites transparent surfaces over the background", () => {
  const out = blend({ r: 255, g: 255, b: 255, a: 0.5 }, { r: 0, g: 0, b: 0, a: 1 });
  assert.deepEqual(out, { r: 127.5, g: 127.5, b: 127.5, a: 1 });
});
