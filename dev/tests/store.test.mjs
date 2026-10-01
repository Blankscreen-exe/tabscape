import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore, STORAGE_KEY } from "../../core/store.js";
import { createBus, EVENTS } from "../../core/events.js";
import { createMemoryAdapter } from "../../core/platform.js";
import { CURRENT_SCHEMA } from "../../core/migrations/index.js";

const setup = async (initial) => {
  const storage = createMemoryAdapter(initial ? { [STORAGE_KEY]: initial } : {});
  const bus = createBus();
  const store = await createStore(storage, bus).load();
  return { storage, bus, store };
};

test("load writes migrated data back", async () => {
  const { storage } = await setup();
  const saved = await storage.get(STORAGE_KEY);
  assert.equal(saved.schemaVersion, CURRENT_SCHEMA);
});

test("update + flush persists, and emits STORE_CHANGED", async () => {
  const { storage, bus, store } = await setup();
  let events = 0;
  bus.on(EVENTS.STORE_CHANGED, () => events++);
  store.update(s => { s.settings.themeId = "zen"; });
  await store.flush();
  assert.equal(events, 1);
  assert.equal((await storage.get(STORAGE_KEY)).settings.themeId, "zen");
});

test("scope returns defaults and isolates owners", async () => {
  const { store } = await setup();
  const todo = store.scope("widgetData", "todo", { items: [] });
  const notes = store.scope("widgetData", "notes", { text: "" });
  assert.deepEqual(todo.get(), { items: [] });
  todo.update(d => { d.items.push({ id: "1" }); });
  assert.deepEqual(todo.get().items, [{ id: "1" }]);
  assert.deepEqual(notes.get(), { text: "" });
});

test("scope.get returns a copy (callers cannot mutate state by accident)", async () => {
  const { store } = await setup();
  const s = store.scope("themeState", "rpg", { xp: 0 });
  s.set({ xp: 5 });
  const v = s.get();
  v.xp = 999;
  assert.equal(s.get().xp, 5);
});

test("export -> import round trip", async () => {
  const a = await setup();
  a.store.update(s => { s.widgetData.notes = { text: "hello" }; s.settings.themeId = "midnight"; });
  const json = a.store.exportJSON();
  const b = await setup();
  await b.store.importJSON(json);
  assert.equal(b.store.snapshot().widgetData.notes.text, "hello");
  assert.equal(b.store.snapshot().settings.themeId, "midnight");
});

test("import rejects foreign files", async () => {
  const { store } = await setup();
  await assert.rejects(store.importJSON(JSON.stringify({ hello: 1 })), /Not a browser-home-pages backup/);
});

test("newer stored data puts the store in read-only mode and leaves storage untouched", async () => {
  const newer = { schemaVersion: CURRENT_SCHEMA + 1, secret: true };
  const { storage, store } = await setup(newer);
  assert.equal(store.readOnly, true);
  store.update(s => { s.settings.themeId = "x"; });
  await store.flush();
  assert.deepEqual(await storage.get(STORAGE_KEY), newer);
});
