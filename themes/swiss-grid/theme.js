// @ts-check
/**
 * Swiss Grid — typographic brutalism: giant grotesk numerals, a strict ruled grid, black/white/red.
 * Section labels ("01 — Clock") come from the widget frame's data-title + a CSS counter.
 * Ported from demos/brutalist/swiss-grid.html.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "swiss-grid",
  name: "Swiss Grid",
  description: "Giant type, a strict ruled grid, black, white and red.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#f2f2ee",
    "--surface": "#f2f2ee",
    "--surface-2": "#e4e4de",
    "--text": "#0a0a0a",
    "--muted": "#7a7a76",
    "--accent": "#e10600",
    "--accent-contrast": "#ffffff",
    "--border": "#0a0a0a",
    "--danger": "#b30500",
    "--radius": "0px",
    "--gap": "0px",
    "--shadow": "none",
    "--font-body": "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
    "--font-display": "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
    "--font-mono": "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
    "--widget-padding": "18px 20px",
  },
  grid: { columns: 12, rowHeight: 64, maxWidth: "1400px" },
  accentRole: "section numbers, the date and the search button",
  accentPresets: ["#e10600", "#0047ff", "#00a86b", "#ff6a00"],
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 0, y: 0, w: 12, h: 5, settings: { greeting: false } },
    { id: "search-1", widget: "search", x: 0, y: 5, w: 12, h: 2, settings: { placeholder: "Type to search", button: "GO" } },
    { id: "links-1", widget: "links", x: 0, y: 7, w: 4, h: 6, settings: { title: "Index", style: "list" } },
    { id: "todo-1", widget: "todo", x: 4, y: 7, w: 4, h: 6, settings: { title: "Tasks" } },
    { id: "worldclock-1", widget: "worldclock", x: 8, y: 7, w: 4, h: 6 },
  ],
};
