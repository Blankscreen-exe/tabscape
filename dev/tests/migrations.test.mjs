import { test } from "node:test";
import assert from "node:assert/strict";
import { CURRENT_SCHEMA, MIGRATIONS, emptyState, migrate } from "../../core/migrations/index.js";

test("there is exactly one migration per schema version", () => {
  assert.equal(MIGRATIONS.length, CURRENT_SCHEMA);
});

test("no stored data -> empty current state", () => {
  const { state, migrated } = migrate(undefined);
  assert.deepEqual(state, emptyState());
  assert.equal(migrated, true);
});

test("v0 (pre-release) data keeps its fields", () => {
  const { state } = migrate({ layouts: { zen: [] }, widgetData: { todo: { items: [{ id: "a" }] } } });
  assert.equal(state.schemaVersion, CURRENT_SCHEMA);
  assert.deepEqual(state.widgetData.todo.items, [{ id: "a" }]);
  assert.deepEqual(state.layouts.zen, []);
  assert.equal(state.settings.themeId, "default");
});

test("v1 -> v2 adds accent settings and keeps everything else", () => {
  const v1 = {
    schemaVersion: 1,
    settings: { themeId: "midnight" },
    layouts: { midnight: [{ id: "a", widget: "clock", x: 0, y: 0, w: 1, h: 1 }] },
    widgetData: { todo: { items: [{ id: "t" }] } },
    themeState: { midnight: { starsLaunched: 3 } },
  };
  const { state, migrated } = migrate(v1);
  assert.equal(migrated, true);
  assert.equal(state.schemaVersion, 2);
  assert.equal(state.settings.themeId, "midnight");
  assert.deepEqual(state.settings.accent, { mode: "per-theme", global: null, themes: {} });
  assert.deepEqual(state.layouts, v1.layouts);
  assert.deepEqual(state.widgetData, v1.widgetData);
  assert.deepEqual(state.themeState, v1.themeState);
});

test("current data is returned unchanged", () => {
  const doc = { ...emptyState(), settings: { themeId: "zen" } };
  const { state, migrated } = migrate(doc);
  assert.equal(migrated, false);
  assert.deepEqual(state, doc);
});

test("data from a newer version is refused, not mangled", () => {
  assert.throws(() => migrate({ schemaVersion: CURRENT_SCHEMA + 1 }), /newer|understands/);
});

test("migrate does not mutate its input", () => {
  const input = { widgetData: { notes: { text: "hi" } } };
  const copy = structuredClone(input);
  migrate(input);
  assert.deepEqual(input, copy);
});
