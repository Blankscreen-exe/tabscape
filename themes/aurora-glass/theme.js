// @ts-check
/**
 * Aurora Glass — dark night with slowly drifting aurora blobs behind frosted-glass widgets.
 * Ported from demos/aurora-glass.html.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "aurora-glass",
  name: "Aurora Glass",
  description: "Frosted-glass widgets over a slowly drifting aurora.",
  colorScheme: "dark",
  css: "theme.css",
  tokens: {
    "--bg": "#0b0f1e",
    "--surface": "rgb(255 255 255 / .07)",
    "--surface-2": "rgb(255 255 255 / .10)",
    "--text": "#eef1ff",
    "--muted": "#9aa3c7",
    "--accent": "#8be9fd",
    "--accent-contrast": "#0b0f1e",
    "--border": "rgb(255 255 255 / .14)",
    "--danger": "#ff6b81",
    "--radius": "20px",
    "--gap": "20px",
    "--shadow": "0 10px 40px rgb(0 0 0 / .25)",
    "--font-body": "\"Segoe UI Variable Text\", \"Segoe UI\", system-ui, sans-serif",
    "--font-display": "\"Segoe UI Variable Display\", \"Segoe UI\", system-ui, sans-serif",
    "--font-mono": "\"Cascadia Mono\", Consolas, monospace",
  },
  grid: { columns: 12, rowHeight: 80, maxWidth: "1180px" },
  accentRole: "buttons, highlights and one of the aurora lights",
  accentPresets: ["#8be9fd", "#c792ea", "#7ee787", "#ffb86c"],
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 0, y: 0, w: 12, h: 2, settings: { seconds: true } },
    { id: "search-1", widget: "search", x: 2, y: 2, w: 8, h: 1 },
    { id: "links-1", widget: "links", x: 0, y: 3, w: 7, h: 3, settings: { title: "Quick links" } },
    { id: "weather-1", widget: "weather", x: 7, y: 3, w: 5, h: 3 },
    { id: "todo-1", widget: "todo", x: 7, y: 6, w: 5, h: 3, settings: { title: "Today" } },
    { id: "quote-1", widget: "quote", x: 0, y: 6, w: 7, h: 2 },
  ],

  mount(ctx) {
    ctx.root.insertAdjacentHTML("beforeend", `<div class="aurora"><span></span><span></span><span></span></div>`);
  },
};
