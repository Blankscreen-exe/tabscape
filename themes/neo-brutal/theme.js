// @ts-check
/**
 * Neo Brutal — loud flat colours, thick black borders, hard offset shadows, buttons that press in.
 * Ported from demos/brutalist/neo-brutal.html.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "neo-brutal",
  name: "Neo Brutal",
  description: "Loud colours, thick borders, hard shadows. Buttons that press in.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#fff4d6",
    "--surface": "#ffffff",
    "--surface-2": "#fff4d6",
    "--text": "#000000",
    "--muted": "#333333",
    "--accent": "#ffd23f",
    "--accent-contrast": "#000000",
    "--border": "#000000",
    "--danger": "#ff4d4d",
    "--radius": "10px",
    "--gap": "22px",
    "--shadow": "6px 6px 0 #000000",
    "--font-body": "\"Segoe UI\", Arial, sans-serif",
    "--font-display": "\"Arial Black\", \"Segoe UI Black\", \"Segoe UI\", sans-serif",
    "--font-mono": "Consolas, monospace",
  },
  grid: { columns: 12, rowHeight: 76, maxWidth: "1140px" },
  signatureWidgets: ["habits"],
  accentRole: "the clock tile, buttons and ticked habits",
  accentPresets: ["#ffd23f", "#ff8fd8", "#7aa2ff", "#74f0a7", "#ff7a45"],
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 0, y: 0, w: 8, h: 2 },
    { id: "quote-1", widget: "quote", x: 8, y: 0, w: 4, h: 2, settings: { title: "Sticker of the day" } },
    { id: "search-1", widget: "search", x: 0, y: 2, w: 12, h: 1, settings: { placeholder: "Search anything…", button: "SEARCH →" } },
    { id: "links-1", widget: "links", x: 0, y: 3, w: 6, h: 3 },
    { id: "todo-1", widget: "todo", x: 6, y: 3, w: 6, h: 3 },
    { id: "habits-1", widget: "habits", x: 0, y: 6, w: 12, h: 4 },
  ],
};
