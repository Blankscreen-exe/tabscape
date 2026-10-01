import { test } from "node:test";
import assert from "node:assert/strict";
import { pickAccent, resetAccent, setGlobalMode, userAccentFor } from "../../core/accent.js";
import { defaultAccent } from "../../core/migrations/index.js";

test("no picks -> theme's own accent (null)", () => {
  assert.equal(userAccentFor(defaultAccent(), "zen"), null);
});

test("per-theme picks only affect their theme", () => {
  const acc = pickAccent(defaultAccent(), "zen", "#B8322A");
  assert.equal(userAccentFor(acc, "zen"), "#b8322a");
  assert.equal(userAccentFor(acc, "midnight"), null);
});

test("global mode applies everywhere and keeps per-theme picks for later", () => {
  let acc = pickAccent(defaultAccent(), "zen", "#111111");
  acc = setGlobalMode(acc, true, "#222222");
  assert.equal(userAccentFor(acc, "zen"), "#222222");
  assert.equal(userAccentFor(acc, "midnight"), "#222222");
  acc = pickAccent(acc, "midnight", "#333333"); // picking in global mode changes the global colour
  assert.equal(userAccentFor(acc, "zen"), "#333333");
  acc = setGlobalMode(acc, false, "#333333");
  assert.equal(userAccentFor(acc, "zen"), "#111111"); // per-theme pick is back
  assert.equal(userAccentFor(acc, "midnight"), null);
});

test("themes with customAccent: false ignore every user pick", () => {
  const acc = setGlobalMode(defaultAccent(), true, "#abcdef");
  assert.equal(userAccentFor(acc, "raw", false), null);
});

test("reset clears this theme's pick, or leaves global mode", () => {
  let acc = pickAccent(pickAccent(defaultAccent(), "zen", "#111111"), "midnight", "#222222");
  acc = resetAccent(acc, "zen");
  assert.equal(userAccentFor(acc, "zen"), null);
  assert.equal(userAccentFor(acc, "midnight"), "#222222");
  acc = resetAccent(setGlobalMode(acc, true, "#999999"), "zen");
  assert.equal(acc.mode, "per-theme");
  assert.equal(acc.global, null);
});

test("invalid colours are rejected", () => {
  assert.throws(() => pickAccent(defaultAccent(), "zen", "red"));
});
