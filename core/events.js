// @ts-check
/**
 * Event bus + the single catalog of event names.
 *
 * Rule: every event name used anywhere in the project is listed in EVENTS.
 * Add new names here (with a comment describing the payload) — never inline strings.
 */

export const EVENTS = Object.freeze({
  // ---- app lifecycle -------------------------------------------------------
  /** payload: { themeId } — after a theme has been fully applied */
  THEME_APPLIED: "theme:applied",
  /** payload: { editing: boolean } */
  LAYOUT_EDIT_MODE: "layout:edit-mode",
  /** payload: { themeId } — after the layout for a theme was saved */
  LAYOUT_CHANGED: "layout:changed",

  // ---- store ---------------------------------------------------------------
  /** payload: { source: "local" | "external" } — state changed */
  STORE_CHANGED: "store:changed",

  // ---- widget domain events (themes/services may react to these) ----------
  /** payload: { item } */
  TODO_ADDED: "todo:added",
  /** payload: { item } */
  TODO_COMPLETED: "todo:completed",
  /** payload: { item } */
  TODO_UNCOMPLETED: "todo:uncompleted",
  /** payload: { item } */
  TODO_REMOVED: "todo:removed",
  /** payload: { query, engine } — fired just before navigating */
  SEARCH_SUBMITTED: "search:submitted",
  /** payload: { url, name } */
  LINK_OPENED: "link:opened",
  /** payload: { length } */
  NOTE_EDITED: "note:edited",
});

const KNOWN = new Set(Object.values(EVENTS));

/**
 * @typedef {(payload: any) => void} Handler
 */

export function createBus() {
  /** @type {Map<string, Set<Handler>>} */
  const handlers = new Map();

  /** @param {string} name */
  function assertKnown(name) {
    if (!KNOWN.has(name)) console.warn(`[events] unknown event "${name}" — add it to EVENTS in core/events.js`);
  }

  return {
    /**
     * @param {string} name
     * @param {Handler} fn
     * @returns {() => void} unsubscribe
     */
    on(name, fn) {
      assertKnown(name);
      if (!handlers.has(name)) handlers.set(name, new Set());
      handlers.get(name)?.add(fn);
      return () => handlers.get(name)?.delete(fn);
    },

    /**
     * @param {string} name
     * @param {any} [payload]
     */
    emit(name, payload) {
      assertKnown(name);
      for (const fn of [...(handlers.get(name) ?? [])]) {
        try { fn(payload); } catch (err) { console.error(`[events] handler for "${name}" failed`, err); }
      }
    },

    /** Number of handlers (used by tests). @param {string} name */
    count(name) { return handlers.get(name)?.size ?? 0; },
  };
}

/** @typedef {ReturnType<typeof createBus>} Bus */
