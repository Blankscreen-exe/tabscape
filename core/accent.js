// @ts-check
/**
 * Accent colour rules (pure, unit-tested in dev/tests/accent.test.mjs).
 *
 * Precedence for the active theme:
 *   theme.customAccent === false  -> theme's own accent, always
 *   mode "global" + global colour -> global colour
 *   per-theme colour              -> that colour
 *   otherwise                     -> theme's own accent
 */
import { HEX_RE } from "./color.js";

/** @typedef {import("./migrations/index.js").AccentSettings} AccentSettings */

/**
 * The user's accent for a theme, or null when the theme's own accent applies.
 * @param {AccentSettings} acc @param {string} themeId @param {boolean} [customizable]
 * @returns {string | null}
 */
export function userAccentFor(acc, themeId, customizable = true) {
  if (!customizable) return null;
  if (acc.mode === "global" && acc.global) return acc.global;
  return acc.themes[themeId] ?? null;
}

/**
 * Pick a colour. In global mode it becomes the global accent; otherwise it applies to this theme only.
 * @param {AccentSettings} acc @param {string} themeId @param {string} color #rrggbb
 * @returns {AccentSettings}
 */
export function pickAccent(acc, themeId, color) {
  if (!HEX_RE.test(color)) throw new Error(`accent must be #rrggbb, got "${color}"`);
  const c = color.toLowerCase();
  return acc.mode === "global"
    ? { ...acc, global: c }
    : { ...acc, themes: { ...acc.themes, [themeId]: c } };
}

/**
 * Turn "use for all themes" on/off. Turning it on adopts the colour currently shown,
 * so nothing visibly changes at the moment of switching. Per-theme picks are kept for later.
 * @param {AccentSettings} acc @param {boolean} on @param {string} currentColor #rrggbb
 * @returns {AccentSettings}
 */
export function setGlobalMode(acc, on, currentColor) {
  return on
    ? { ...acc, mode: "global", global: (acc.global ?? currentColor).toLowerCase() }
    : { ...acc, mode: "per-theme" };
}

/**
 * Back to the theme's own accent. In global mode this clears the global colour and
 * returns to per-theme mode; otherwise it clears this theme's pick.
 * @param {AccentSettings} acc @param {string} themeId
 * @returns {AccentSettings}
 */
export function resetAccent(acc, themeId) {
  if (acc.mode === "global") return { ...acc, mode: "per-theme", global: null };
  const themes = { ...acc.themes };
  delete themes[themeId];
  return { ...acc, themes };
}
