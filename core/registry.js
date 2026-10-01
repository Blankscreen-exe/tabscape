// @ts-check
/**
 * Loads themes and widgets listed in registry.json.
 *
 * Browser extensions cannot list directories at runtime, so registry.json is the
 * one place a theme/widget is "installed". dev/check.mjs verifies it matches the folders.
 * Modules are imported lazily and validated against core/contracts.js.
 */
import { assetUrl } from "./platform.js";
import { normalizeTheme, normalizeWidget, validateTheme, validateWidget } from "./contracts.js";

/**
 * @typedef {import("./contracts.js").ThemeDef} ThemeDef
 * @typedef {import("./contracts.js").WidgetDef} WidgetDef
 * @typedef {{ id: string, path: string }} Entry
 * @typedef {{ themes: Entry[], widgets: Entry[] }} RegistryFile
 * @typedef {{ def: ThemeDef, url: string }} LoadedTheme
 * @typedef {{ def: WidgetDef, url: string }} LoadedWidget
 */

export const FALLBACK_THEME = "default";

export async function createRegistry() {
  /** @type {RegistryFile} */
  const file = await (await fetch(assetUrl("registry.json"))).json();

  /** @type {Map<string, Promise<LoadedTheme>>} */
  const themeCache = new Map();
  /** @type {Map<string, Promise<LoadedWidget>>} */
  const widgetCache = new Map();

  /**
   * @template T
   * @param {Entry[]} list @param {string} id @param {string} kind
   * @param {(def: any) => string[]} validate @param {(def: any) => T} normalize
   * @returns {Promise<{ def: T, url: string }>}
   */
  async function load(list, id, kind, validate, normalize) {
    const entry = list.find(e => e.id === id);
    if (!entry) throw new Error(`${kind} "${id}" is not in registry.json`);
    const url = assetUrl(entry.path);
    const mod = await import(url);
    const errors = validate(mod.default);
    if (mod.default?.id !== id) errors.push(`module id "${mod.default?.id}" does not match registry id "${id}"`);
    if (errors.length) throw new Error(`${kind} "${id}" is invalid:\n - ${errors.join("\n - ")}`);
    return { def: normalize(mod.default), url };
  }

  return {
    themeIds: () => file.themes.map(e => e.id),
    widgetIds: () => file.widgets.map(e => e.id),
    hasTheme: (/** @type {string} */ id) => file.themes.some(e => e.id === id),
    hasWidget: (/** @type {string} */ id) => file.widgets.some(e => e.id === id),

    /** @param {string} id @returns {Promise<LoadedTheme>} */
    theme(id) {
      if (!themeCache.has(id)) {
        const p = load(file.themes, id, "theme", validateTheme, normalizeTheme);
        p.catch(() => themeCache.delete(id)); // allow retry after a fix
        themeCache.set(id, p);
      }
      return /** @type {Promise<LoadedTheme>} */ (themeCache.get(id));
    },

    /** @param {string} id @returns {Promise<LoadedWidget>} */
    widget(id) {
      if (!widgetCache.has(id)) {
        const p = load(file.widgets, id, "widget", validateWidget, normalizeWidget);
        p.catch(() => widgetCache.delete(id));
        widgetCache.set(id, p);
      }
      return /** @type {Promise<LoadedWidget>} */ (widgetCache.get(id));
    },

    /** Load every theme (for the picker). Broken ones are skipped with a console error. */
    async allThemes() {
      const res = await Promise.allSettled(file.themes.map(e => this.theme(e.id)));
      return res.flatMap((r, i) => r.status === "fulfilled" ? [r.value.def] : (console.error(`[registry] theme "${file.themes[i].id}"`, r.reason), []));
    },

    /** Load every widget (for the "add widget" list). */
    async allWidgets() {
      const res = await Promise.allSettled(file.widgets.map(e => this.widget(e.id)));
      return res.flatMap((r, i) => r.status === "fulfilled" ? [r.value.def] : (console.error(`[registry] widget "${file.widgets[i].id}"`, r.reason), []));
    },
  };
}

/** @typedef {Awaited<ReturnType<typeof createRegistry>>} Registry */
