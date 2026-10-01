// @ts-check
/**
 * The ONLY file allowed to touch browser-extension APIs (chrome.*, browser.*)
 * or raw browser storage. Everything else goes through these adapters.
 *
 * If Chrome/Firefox change their extension APIs, this is the file to edit.
 * Must stay importable in Node (no top-level access to window/document).
 */

/**
 * @typedef {object} StorageAdapter
 * @property {string} kind
 * @property {(key: string) => Promise<any>} get
 * @property {(key: string, value: any) => Promise<void>} set
 * @property {(key: string, fn: (value: any) => void) => () => void} onExternalChange
 *   Called when another tab/window changed the key.
 */

/** In-memory storage: tests, previews (?preview), and the fallback when nothing else works. */
export function createMemoryAdapter(initial = {}) {
  /** @type {Record<string, any>} */
  const data = structuredClone(initial);
  return /** @type {StorageAdapter} */ ({
    kind: "memory",
    async get(key) { return data[key] === undefined ? undefined : structuredClone(data[key]); },
    async set(key, value) { data[key] = structuredClone(value); },
    onExternalChange() { return () => {}; },
  });
}

/** window.localStorage — used when the page is opened as a normal web page (dev server). */
export function createLocalStorageAdapter() {
  const ls = globalThis.localStorage;
  return /** @type {StorageAdapter} */ ({
    kind: "localStorage",
    async get(key) {
      const raw = ls.getItem(key);
      return raw == null ? undefined : JSON.parse(raw);
    },
    async set(key, value) { ls.setItem(key, JSON.stringify(value)); },
    onExternalChange(key, fn) {
      /** @param {StorageEvent} e */
      const h = e => { if (e.key === key) fn(e.newValue == null ? undefined : JSON.parse(e.newValue)); };
      globalThis.addEventListener("storage", h);
      return () => globalThis.removeEventListener("storage", h);
    },
  });
}

/** chrome.storage.local — used inside the installed extension (Chrome, Edge, Brave, Firefox). */
export function createExtensionAdapter() {
  // Firefox exposes `browser`, Chromium exposes `chrome`; both support the promise API in MV3.
  const api = /** @type {any} */ (globalThis).browser ?? /** @type {any} */ (globalThis).chrome;
  const area = api.storage.local;
  return /** @type {StorageAdapter} */ ({
    kind: "extension",
    async get(key) { return (await area.get(key))[key]; },
    async set(key, value) { await area.set({ [key]: value }); },
    onExternalChange(key, fn) {
      /** @param {Record<string, {newValue?: any}>} changes @param {string} areaName */
      const h = (changes, areaName) => { if (areaName === "local" && key in changes) fn(changes[key].newValue); };
      api.storage.onChanged.addListener(h);
      return () => api.storage.onChanged.removeListener(h);
    },
  });
}

export function isExtension() {
  const g = /** @type {any} */ (globalThis);
  return Boolean((g.browser ?? g.chrome)?.storage?.local && (g.browser ?? g.chrome)?.runtime?.id);
}

/**
 * Pick the best available storage.
 * @param {{ preview?: boolean }} [opts] preview = never persist (gallery iframes)
 * @returns {StorageAdapter}
 */
export function detectStorage(opts = {}) {
  if (opts.preview) return createMemoryAdapter();
  if (isExtension()) return createExtensionAdapter();
  try {
    const probe = "__probe__";
    globalThis.localStorage.setItem(probe, "1");
    globalThis.localStorage.removeItem(probe);
    return createLocalStorageAdapter();
  } catch {
    console.warn("[platform] no persistent storage available — changes will not be saved");
    return createMemoryAdapter();
  }
}

/**
 * Resolve a project-relative path to a URL usable by fetch()/import()/<link>.
 * @param {string} path e.g. "themes/zen/theme.js"
 */
export function assetUrl(path) {
  const g = /** @type {any} */ (globalThis);
  const rt = (g.browser ?? g.chrome)?.runtime;
  if (rt?.getURL && rt?.id) return rt.getURL(path);
  return new URL(path, g.document?.baseURI ?? "http://localhost/").href;
}

/** Download a text file (used by export). @param {string} filename @param {string} text */
export function downloadText(filename, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Ask the user for a text file (used by import). @returns {Promise<string | null>} */
export function pickTextFile(accept = ".json,application/json") {
  return new Promise(resolve => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = async () => resolve(input.files?.[0] ? await input.files[0].text() : null);
    input.click();
  });
}
