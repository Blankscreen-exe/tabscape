// @ts-check
/**
 * Colour maths for the accent feature: parsing, WCAG contrast, readable text colour.
 * Pure module (no DOM) — unit-tested in dev/tests/color.test.mjs.
 *
 * Parses the formats browsers return from getComputedStyle():
 *   #rgb #rgba #rrggbb #rrggbbaa · rgb()/rgba() with commas or spaces (+ "/ alpha") · color(srgb r g b / a)
 */

/** @typedef {{ r: number, g: number, b: number, a: number }} RGBA  r,g,b in 0..255, a in 0..1 */

export const HEX_RE = /^#[0-9a-f]{6}$/i;

/** @param {string} input @returns {RGBA | null} */
export function parseColor(input) {
  const s = String(input ?? "").trim().toLowerCase();

  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let hex = m[1];
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map(c => c + c).join("");
    if (hex.length !== 6 && hex.length !== 8) return null;
    const n = (/** @type {number} */ i) => parseInt(hex.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? n(6) / 255 : 1 };
  }

  m = s.match(/^rgba?\((.+)\)$/);
  if (m) {
    const parts = m[1].replace(/\s*\/\s*/, " / ").split(/[\s,]+/).filter(p => p && p !== "/");
    if (parts.length < 3) return null;
    const ch = (/** @type {string} */ p) => p.endsWith("%") ? parseFloat(p) * 2.55 : parseFloat(p);
    const alpha = parts[3] === undefined ? 1 : parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    const out = { r: ch(parts[0]), g: ch(parts[1]), b: ch(parts[2]), a: alpha };
    return Object.values(out).some(Number.isNaN) ? null : out;
  }

  m = s.match(/^color\(srgb\s+([^)]+)\)$/);
  if (m) {
    const [rgb, alpha] = m[1].split("/").map(p => p.trim());
    const [r, g, b] = rgb.split(/\s+/).map(Number);
    const out = { r: r * 255, g: g * 255, b: b * 255, a: alpha === undefined ? 1 : parseFloat(alpha) };
    return Object.values(out).some(Number.isNaN) ? null : out;
  }
  return null;
}

/** @param {RGBA} c @returns {string} #rrggbb (alpha dropped) */
export function toHex(c) {
  const h = (/** @type {number} */ n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

/** Composite a (possibly transparent) colour over an opaque background. @param {RGBA} fg @param {RGBA} bg @returns {RGBA} */
export function blend(fg, bg) {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

/** WCAG relative luminance. @param {RGBA} c */
export function luminance(c) {
  const lin = (/** @type {number} */ v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/** WCAG contrast ratio, 1..21. @param {RGBA} a @param {RGBA} b */
export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Black or white text, whichever reads better on `bg`. @param {RGBA} bg @returns {"#111111" | "#ffffff"} */
export function readableOn(bg) {
  const dark = { r: 17, g: 17, b: 17, a: 1 }, light = { r: 255, g: 255, b: 255, a: 1 };
  return contrast(bg, dark) >= contrast(bg, light) ? "#111111" : "#ffffff";
}

/** Minimum contrast between an accent and the page background before the picker warns (WCAG 1.4.11 non-text). */
export const MIN_ACCENT_CONTRAST = 3;
