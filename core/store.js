// @ts-check
/**
 * The single source of truth for user data.
 *
 *  - One JSON document under STORAGE_KEY, versioned + migrated (see core/migrations).
 *  - Writes are debounced and flushed on page hide.
 *  - Changes made in other tabs are picked up and announced via EVENTS.STORE_CHANGED.
 *  - Widgets/themes never see the whole document; they get a scoped slice (see `scope`).
 */
import { EVENTS } from "./events.js";
import { CURRENT_SCHEMA, emptyState, migrate } from "./migrations/index.js";

export const STORAGE_KEY = "homepage.state";
const SAVE_DELAY_MS = 150;

/**
 * @typedef {import("./migrations/index.js").State} State
 * @typedef {import("./platform.js").StorageAdapter} StorageAdapter
 * @typedef {import("./events.js").Bus} Bus
 */

/**
 * @typedef {object} Scoped
 * @property {() => any} get           current value (a copy; mutate freely)
 * @property {(value: any) => void} set
 * @property {(fn: (draft: any) => any) => void} update  mutate the draft or return a new value
 */

/**
 * @param {StorageAdapter} storage
 * @param {Bus} bus
 */
export function createStore(storage, bus) {
  /** @type {State} */
  let state = emptyState();
  let rev = "";
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  let dirty = false;

  const newRev = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  async function flush() {
    clearTimeout(timer);
    if (!dirty) return;
    dirty = false;
    rev = newRev();
    await storage.set(STORAGE_KEY, { ...state, _rev: rev });
  }

  function scheduleSave() {
    dirty = true;
    clearTimeout(timer);
    timer = setTimeout(flush, SAVE_DELAY_MS);
  }

  /** @param {any} raw */
  function adopt(raw) {
    const { state: s, migrated } = migrate(raw);
    delete (/** @type {any} */ (s))._rev;
    state = s;
    return migrated;
  }

  const api = {
    async load() {
      const raw = await storage.get(STORAGE_KEY);
      try {
        if (adopt(raw)) { dirty = true; await flush(); }
      } catch (err) {
        // Newer/corrupt data: keep it untouched in storage, run on defaults in memory only.
        console.error("[store] could not load data; running on defaults without saving", err);
        state = emptyState();
        api.readOnly = true;
      }
      storage.onExternalChange(STORAGE_KEY, value => {
        if (!value || value._rev === rev) return; // our own write echoing back
        try { adopt(value); bus.emit(EVENTS.STORE_CHANGED, { source: "external" }); }
        catch (err) { console.error("[store] ignored external change", err); }
      });
      if (typeof addEventListener === "function") addEventListener("pagehide", () => { flush(); });
      return api;
    },

    /** True when stored data could not be read; nothing will be written. */
    readOnly: false,

    /** Read-only snapshot of the whole state. */
    snapshot() { return structuredClone(state); },

    /**
     * Mutate state. `fn` receives a draft; mutate it or return a replacement.
     * @param {(draft: State) => State | void} fn
     */
    update(fn) {
      const draft = structuredClone(state);
      const result = fn(draft);
      state = result ?? draft;
      if (!api.readOnly) scheduleSave();
      bus.emit(EVENTS.STORE_CHANGED, { source: "local" });
    },

    /**
     * A slice of state for one owner. `defaults` are returned when the slice is empty.
     * @param {"widgetData" | "themeState"} area
     * @param {string} key  widget type id or theme id
     * @param {any} [defaults]
     * @returns {Scoped}
     */
    scope(area, key, defaults) {
      return {
        get: () => structuredClone(state[area][key] ?? defaults),
        set: value => api.update(s => { s[area][key] = value; }),
        update: fn => api.update(s => {
          const draft = structuredClone(s[area][key] ?? defaults);
          const result = fn(draft);
          s[area][key] = result ?? draft;
        }),
      };
    },

    flush,

    /** Full backup as pretty JSON. */
    exportJSON() {
      return JSON.stringify({ app: "browser-home-pages", exportedAt: new Date().toISOString(), data: state }, null, 2);
    },

    /**
     * Replace everything with a backup (runs migrations). Throws on invalid input.
     * @param {string} text
     */
    async importJSON(text) {
      const parsed = JSON.parse(text);
      if (parsed?.app !== "browser-home-pages" || !parsed.data) throw new Error("Not a browser-home-pages backup file.");
      adopt(parsed.data);
      dirty = true;
      await flush();
      bus.emit(EVENTS.STORE_CHANGED, { source: "local" });
    },

    schemaVersion: CURRENT_SCHEMA,
  };
  return api;
}

/** @typedef {ReturnType<typeof createStore>} Store */
