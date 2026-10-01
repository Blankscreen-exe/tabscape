// @ts-check
/**
 * Boot + orchestration. Wires platform -> store -> registry -> theme -> grid -> UI.
 *
 * URL parameters (handy for development and dev/gallery.html):
 *   ?theme=<id>   show this theme without changing the saved choice
 *   ?preview      in-memory storage (nothing is saved) + test hook for dev/smoke.html
 *   ?embed        hide the control panel (dev/gallery.html thumbnails)
 */
import { createBus, EVENTS } from "./events.js";
import { detectStorage, downloadText, pickTextFile } from "./platform.js";
import { createStore } from "./store.js";
import { createRegistry, FALLBACK_THEME } from "./registry.js";
import { createThemeManager } from "./theme-manager.js";
import { createWidgetHost } from "./widget-host.js";
import { createGrid } from "./grid.js";
import { findFreeSpot, sanitize } from "./layout.js";
import { uid } from "./dom.js";
import { createUI } from "./ui.js";

/**
 * @typedef {import("./migrations/index.js").LayoutItem} LayoutItem
 * @typedef {import("./contracts.js").ThemeDef} ThemeDef
 */

async function boot() {
  const params = new URLSearchParams(location.search);
  const preview = params.has("preview");
  const themeOverride = params.get("theme");

  const bus = createBus();
  const store = await createStore(detectStorage({ preview }), bus).load();
  const registry = await createRegistry();

  const decorRoot = /** @type {HTMLElement} */ (document.getElementById("decor"));
  const gridEl = /** @type {HTMLElement} */ (document.getElementById("grid"));
  const themes = createThemeManager({ registry, store, bus, decorRoot });

  let editing = false;
  /** @type {Record<string, string>} widget type -> display name */
  const widgetNames = {};

  const host = createWidgetHost({ registry, store, bus, isEditing: () => editing });
  const grid = createGrid({
    container: gridEl,
    host,
    onChange: saveLayout,
    onRemove: id => saveLayout(currentLayout().filter(it => it.id !== id)),
    onSettings: openSettings,
    widgetName: type => widgetNames[type] ?? type,
  });

  // ---------------------------------------------------------------- layout
  /** The layout for the active theme: saved one, or the theme's default. Always sanitized. */
  function currentLayout() {
    const theme = /** @type {ThemeDef} */ (themes.current);
    const saved = store.snapshot().layouts[theme.id];
    /** @type {LayoutItem[]} */
    let layout = saved ?? structuredClone(theme.defaultLayout);
    // Locked slots added to a theme after the user saved a layout are merged in.
    for (const slot of theme.defaultLayout) {
      if (slot.locked && !layout.some(it => it.id === slot.id)) layout = [structuredClone(slot), ...layout];
    }
    return sanitize(layout, theme.grid?.columns ?? 12, registry.hasWidget);
  }

  /** @param {LayoutItem[]} layout */
  function saveLayout(layout) {
    const theme = /** @type {ThemeDef} */ (themes.current);
    store.update(s => { s.layouts[theme.id] = layout; });
    grid.render(currentLayout(), theme);
    bus.emit(EVENTS.LAYOUT_CHANGED, { themeId: theme.id });
  }

  // ---------------------------------------------------------------- actions
  /** @param {string} id @param {{ persist?: boolean }} [opts] */
  async function switchTheme(id, opts = { persist: true }) {
    const def = await themes.apply(registry.hasTheme(id) ? id : FALLBACK_THEME);
    if (opts.persist && store.snapshot().settings.themeId !== def.id) store.update(s => { s.settings.themeId = def.id; });
    grid.render(currentLayout(), def, { remountAll: true });
  }

  /** @param {string} type */
  async function addWidget(type) {
    const { def } = await registry.widget(type);
    const theme = /** @type {ThemeDef} */ (themes.current);
    const layout = currentLayout();
    const cols = theme.grid?.columns ?? 12;
    const w = Math.min(def.size.w, cols);
    const spot = findFreeSpot(layout, w, def.size.h, cols);
    saveLayout([...layout, { id: uid(type), widget: type, ...spot, w, h: def.size.h }]);
  }

  /** @param {string} id */
  async function openSettings(id) {
    const item = currentLayout().find(it => it.id === id);
    if (!item) return;
    const { def } = await registry.widget(item.widget);
    const next = await ui.editSettings(def, item.settings ?? {});
    if (next) saveLayout(currentLayout().map(it => it.id === id ? { ...it, settings: next } : it));
  }

  /** @param {boolean} on */
  function setEditing(on) {
    editing = on;
    grid.setEditing(on);
    bus.emit(EVENTS.LAYOUT_EDIT_MODE, { editing: on });
  }

  const ui = createUI({
    registry,
    hidden: params.has("embed"),
    currentThemeId: () => themes.current?.id ?? FALLBACK_THEME,
    isEditing: () => editing,
    onTheme: id => switchTheme(id),
    onEdit: setEditing,
    onAddWidget: addWidget,
    onResetLayout: () => {
      const theme = /** @type {ThemeDef} */ (themes.current);
      store.update(s => { delete s.layouts[theme.id]; });
      grid.render(currentLayout(), theme, { remountAll: true });
    },
    onExport: () => downloadText(`homepage-backup-${new Date().toLocaleDateString("sv")}.json`, store.exportJSON()),
    onImport: async () => {
      const text = await pickTextFile();
      if (!text) return;
      try { await store.importJSON(text); await switchTheme(store.snapshot().settings.themeId, { persist: false }); ui.toast("Backup restored"); }
      catch (err) { ui.toast(`Import failed: ${/** @type {Error} */ (err).message}`); }
    },
  });

  // Another tab changed the data: follow its theme choice / layout.
  bus.on(EVENTS.STORE_CHANGED, async ({ source }) => {
    if (source !== "external") return;
    const wanted = store.snapshot().settings.themeId;
    if (!themeOverride && wanted !== themes.current?.id) await switchTheme(wanted, { persist: false });
    else grid.render(currentLayout(), /** @type {ThemeDef} */ (themes.current));
  });

  // ---------------------------------------------------------------- start
  (await registry.allWidgets()).forEach(w => { widgetNames[w.id] = w.name; });
  await switchTheme(themeOverride ?? store.snapshot().settings.themeId, { persist: !themeOverride });
  if (store.readOnly) ui.toast("Saved data is from a newer version — changes won't be saved.");
  document.documentElement.classList.add("ready");
  // Test hook for dev/smoke.html. Only in preview mode, which never touches real data.
  if (preview) /** @type {any} */ (window).__homepage = { store, bus, registry, events: EVENTS };
}

boot().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML("beforeend", `<pre class="boot-error">Home page failed to start:\n${String(err?.stack ?? err)}</pre>`);
});
