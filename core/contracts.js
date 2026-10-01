// @ts-check
/**
 * Theme + widget contracts: the shapes every theme/widget module must export,
 * plus validators used by both the app (at load time) and dev/check.mjs.
 *
 * Full human documentation: docs/CONTRACTS.md — keep the two in sync.
 * Pure module: importable in Node.
 */

/** apiVersions the core can load. When v2 arrives, keep 1 here and add an adapter in `normalize*`. */
export const SUPPORTED_API_VERSIONS = [1];

/** Tokens every v1 theme must define. NEVER add to this list — new tokens go in OPTIONAL_TOKENS with a default in core/tokens.css. */
export const REQUIRED_TOKENS = Object.freeze([
  "--bg", "--surface", "--surface-2", "--text", "--muted",
  "--accent", "--accent-contrast", "--border", "--danger",
  "--radius", "--gap", "--shadow",
  "--font-body", "--font-display", "--font-mono",
]);

/** Tokens added after v1. Each MUST have a default in core/tokens.css. */
export const OPTIONAL_TOKENS = Object.freeze([
  "--success", "--warning", "--focus-ring", "--widget-padding",
]);

export const SETTING_TYPES = Object.freeze(["text", "textarea", "toggle", "select", "number"]);

const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * @typedef {import("./migrations/index.js").LayoutItem} LayoutItem
 *
 * @typedef {object} ThemeDef
 * @property {number} apiVersion
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {"light" | "dark"} colorScheme
 * @property {string} [css]                 stylesheet path relative to theme.js
 * @property {Record<string, string>} tokens
 * @property {{ columns?: number, rowHeight?: number, maxWidth?: string }} [grid]
 * @property {Record<string, string>} [variants]   widget type -> variant name
 * @property {string[]} [signatureWidgets]
 * @property {LayoutItem[]} defaultLayout
 * @property {any} [initialState]           default for the theme's private state (ctx.state)
 * @property {(ctx: any) => void | (() => void)} [mount]
 *
 * @typedef {object} SettingDef
 * @property {string} key
 * @property {string} label
 * @property {string} type
 * @property {any} [default]
 * @property {Array<{ value: string, label: string }>} [options]
 *
 * @typedef {object} WidgetDef
 * @property {number} apiVersion
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [css]
 * @property {string[]} [bestWith]          theme ids this widget was designed for
 * @property {string[]} [variants]          variant names render() understands
 * @property {{ w: number, h: number, minW?: number, minH?: number }} size
 * @property {any} [data]                   default shared data (widgetData)
 * @property {SettingDef[]} [settings]
 * @property {(el: HTMLElement, ctx: any) => void | (() => void)} render
 */

/** @param {any} v */ const isObj = v => v && typeof v === "object" && !Array.isArray(v);

/** @param {any} def @param {string[]} errors */
function checkCommon(def, errors) {
  if (!isObj(def)) { errors.push("module must `export default` an object"); return false; }
  if (!SUPPORTED_API_VERSIONS.includes(def.apiVersion)) errors.push(`apiVersion ${def.apiVersion} not supported (supported: ${SUPPORTED_API_VERSIONS.join(", ")})`);
  if (typeof def.id !== "string" || !ID_RE.test(def.id)) errors.push(`id "${def.id}" must be kebab-case`);
  if (typeof def.name !== "string" || !def.name) errors.push("name is required");
  return true;
}

/**
 * @param {any} item @param {number} columns @param {string[]} errors @param {string} where
 */
function checkLayoutItem(item, columns, errors, where) {
  if (!isObj(item)) return errors.push(`${where}: not an object`);
  for (const k of ["x", "y", "w", "h"]) if (!Number.isInteger(item[k]) || item[k] < 0) errors.push(`${where}: ${k} must be a non-negative integer`);
  if (item.w < 1 || item.h < 1) errors.push(`${where}: w/h must be >= 1`);
  if (item.x + item.w > columns) errors.push(`${where}: overflows ${columns} columns`);
  if (typeof item.id !== "string" || !item.id) errors.push(`${where}: id is required`);
  if (typeof item.widget !== "string") errors.push(`${where}: widget is required`);
}

/**
 * @param {any} def
 * @returns {string[]} errors (empty = valid)
 */
export function validateTheme(def) {
  /** @type {string[]} */
  const errors = [];
  if (!checkCommon(def, errors)) return errors;
  if (!["light", "dark"].includes(def.colorScheme)) errors.push('colorScheme must be "light" or "dark"');
  if (!isObj(def.tokens)) errors.push("tokens object is required");
  else for (const t of REQUIRED_TOKENS) if (!(t in def.tokens)) errors.push(`missing required token ${t}`);
  if (def.mount !== undefined && typeof def.mount !== "function") errors.push("mount must be a function");
  if (!Array.isArray(def.defaultLayout)) errors.push("defaultLayout array is required");
  else {
    const cols = def.grid?.columns ?? 12;
    const ids = new Set();
    def.defaultLayout.forEach((item, i) => {
      checkLayoutItem(item, cols, errors, `defaultLayout[${i}]`);
      if (ids.has(item?.id)) errors.push(`defaultLayout[${i}]: duplicate id "${item.id}"`);
      ids.add(item?.id);
    });
  }
  return errors;
}

/**
 * @param {any} def
 * @returns {string[]} errors (empty = valid)
 */
export function validateWidget(def) {
  /** @type {string[]} */
  const errors = [];
  if (!checkCommon(def, errors)) return errors;
  if (typeof def.render !== "function") errors.push("render(el, ctx) is required");
  if (!isObj(def.size) || !Number.isInteger(def.size.w) || !Number.isInteger(def.size.h)) errors.push("size { w, h } is required");
  for (const [i, s] of (def.settings ?? []).entries()) {
    if (!s?.key || !s?.label) errors.push(`settings[${i}]: key and label are required`);
    if (!SETTING_TYPES.includes(s?.type)) errors.push(`settings[${i}]: type must be one of ${SETTING_TYPES.join(", ")}`);
    if (s?.type === "select" && !Array.isArray(s.options)) errors.push(`settings[${i}]: select needs options`);
  }
  return errors;
}

/**
 * Upgrade older contract versions to the current in-memory shape.
 * Today only v1 exists, so this is the identity. Add adapters here — never edit old themes.
 * @param {ThemeDef} def
 * @returns {ThemeDef}
 */
export function normalizeTheme(def) {
  return def;
}

/** @param {WidgetDef} def @returns {WidgetDef} */
export function normalizeWidget(def) {
  return def;
}

/** Per-instance settings = widget defaults overlaid by saved values. @param {WidgetDef} def @param {Record<string, any>} [saved] */
export function resolveSettings(def, saved = {}) {
  /** @type {Record<string, any>} */
  const out = {};
  for (const s of def.settings ?? []) out[s.key] = s.key in saved ? saved[s.key] : s.default;
  return out;
}
