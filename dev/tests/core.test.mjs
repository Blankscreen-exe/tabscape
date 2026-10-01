import { test } from "node:test";
import assert from "node:assert/strict";
import { createBus, EVENTS } from "../../core/events.js";
import { createScope } from "../../core/scope.js";
import { REQUIRED_TOKENS, OPTIONAL_TOKENS, resolveSettings, validateTheme, validateWidget } from "../../core/contracts.js";
import { readFileSync } from "node:fs";

test("bus: on/emit/unsubscribe, and a failing handler doesn't stop others", () => {
  const bus = createBus();
  const seen = [];
  const off = bus.on(EVENTS.TODO_ADDED, p => seen.push(p));
  bus.on(EVENTS.TODO_ADDED, () => { throw new Error("boom"); });
  const origError = console.error; console.error = () => {};
  bus.emit(EVENTS.TODO_ADDED, 1);
  console.error = origError;
  off();
  bus.emit(EVENTS.TODO_ADDED, 2);
  assert.deepEqual(seen, [1]);
});

test("event names are unique", () => {
  const values = Object.values(EVENTS);
  assert.equal(new Set(values).size, values.length);
});

test("scope disposes everything once, in reverse order", () => {
  const scope = createScope();
  const order = [];
  scope.add(() => order.push(1));
  scope.add(() => order.push(2));
  let ticks = 0;
  scope.every(10_000, () => ticks++); // immediate call
  scope.dispose();
  scope.dispose();
  assert.deepEqual(order, [2, 1]);
  assert.equal(ticks, 1);
  let late = false;
  scope.add(() => { late = true; }); // registering after dispose runs immediately
  assert.equal(late, true);
});

test("every token has a default in core/tokens.css", () => {
  const css = readFileSync(new URL("../../core/tokens.css", import.meta.url), "utf8");
  for (const t of [...REQUIRED_TOKENS, ...OPTIONAL_TOKENS]) assert.ok(css.includes(`${t}:`), `${t} has no default`);
});

test("validateTheme catches common mistakes", () => {
  const errs = validateTheme({ apiVersion: 99, id: "Bad Id", name: "", colorScheme: "blue", tokens: {}, defaultLayout: [{ id: "a", widget: "x", x: 10, y: 0, w: 5, h: 1 }] });
  const text = errs.join("\n");
  for (const needle of ["apiVersion", "kebab-case", "name", "colorScheme", "--bg", "overflows"]) assert.match(text, new RegExp(needle));
});

test("validateTheme enforces accent rules", () => {
  const base = { apiVersion: 1, id: "t", name: "T", colorScheme: "light", defaultLayout: [],
    tokens: Object.fromEntries(REQUIRED_TOKENS.map(t => [t, "#000"])) };
  assert.deepEqual(validateTheme(base), []);
  assert.deepEqual(validateTheme({ ...base, tokens: { ...base.tokens, "--accent-soft": "color-mix(in srgb, var(--accent) 20%, white)" } }), []);
  assert.match(validateTheme({ ...base, tokens: { ...base.tokens, "--accent-soft": "#ffeeee" } }).join(), /derived from var\(--accent\)/);
  assert.match(validateTheme({ ...base, accentPresets: ["red"] }).join(), /#rrggbb/);
  assert.match(validateTheme({ ...base, customAccent: "no" }).join(), /boolean/);
});

test("validateWidget + resolveSettings", () => {
  assert.deepEqual(validateWidget({ apiVersion: 1, id: "ok", name: "Ok", size: { w: 1, h: 1 }, render() {} }), []);
  assert.ok(validateWidget({ apiVersion: 1, id: "ok", name: "Ok", size: { w: 1, h: 1 }, render() {}, settings: [{ key: "a", label: "A", type: "colour" }] }).length);
  const def = { settings: [{ key: "a", label: "A", type: "toggle", default: true }, { key: "b", label: "B", type: "text", default: "x" }] };
  assert.deepEqual(resolveSettings(def, { b: "y", stale: 1 }), { a: true, b: "y" });
});
