// @ts-check
/**
 * Default theme — also the FALLBACK theme (core/registry.js) used when another theme fails.
 * Keep it simple and dependency-free; never delete it.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "default",
  name: "Default",
  description: "Clean and neutral. The fallback theme.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#f3f4f6",
    "--surface": "#ffffff",
    "--surface-2": "#f1f2f4",
    "--text": "#16181d",
    "--muted": "#6b7280",
    "--accent": "#3b6cf6",
    "--accent-contrast": "#ffffff",
    "--border": "#e4e6ea",
    "--danger": "#d93a3a",
    "--radius": "16px",
    "--gap": "16px",
    "--shadow": "0 1px 2px rgb(16 24 40 / .04), 0 8px 24px -12px rgb(16 24 40 / .14)",
    "--font-body": "\"Segoe UI Variable Text\", \"Segoe UI\", system-ui, sans-serif",
    "--font-display": "\"Segoe UI Variable Display\", \"Segoe UI\", system-ui, sans-serif",
    "--font-mono": "\"Cascadia Mono\", Consolas, monospace",
  },
  grid: { columns: 12, rowHeight: 80, maxWidth: "1180px" },
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 0, y: 0, w: 12, h: 2 },
    { id: "search-1", widget: "search", x: 2, y: 2, w: 8, h: 1 },
    { id: "links-1", widget: "links", x: 0, y: 3, w: 6, h: 3 },
    { id: "todo-1", widget: "todo", x: 6, y: 3, w: 3, h: 4 },
    { id: "notes-1", widget: "notes", x: 9, y: 3, w: 3, h: 4 },
  ],
};
