// @ts-check
/**
 * Concrete — industrial brutalism: raw concrete, hazard tape, exposed grid coordinates, stencil mono.
 * Each slab shows its grid cell (frame data-cell, e.g. "A1").
 * Ported from demos/brutalist/concrete.html.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "concrete",
  name: "Concrete",
  description: "Raw concrete slabs, hazard tape and grid coordinates.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#9a9893",
    "--surface": "rgb(255 255 255 / .06)",
    "--surface-2": "#b4b1ab",
    "--text": "#1b1b1a",
    "--muted": "#3d3c39",
    "--accent": "#f5c400",
    "--accent-contrast": "#1b1b1a",
    "--border": "#1b1b1a",
    "--danger": "#b6461d",
    "--radius": "0px",
    "--gap": "0px",
    "--shadow": "none",
    "--font-body": "\"Cascadia Mono\", Consolas, \"Lucida Console\", monospace",
    "--font-display": "\"Cascadia Mono\", Consolas, \"Lucida Console\", monospace",
    "--font-mono": "\"Cascadia Mono\", Consolas, \"Lucida Console\", monospace",
    "--widget-padding": "30px 18px 18px",
  },
  grid: { columns: 12, rowHeight: 72, maxWidth: "1200px" },
  accentRole: "hazard: tape, header text, buttons and the shift slab",
  accentPresets: ["#f5c400", "#ff6a13", "#3fd0c9", "#e8e8e8"],
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 0, y: 0, w: 9, h: 3, settings: { seconds: true, greeting: false } },
    { id: "countdown-1", widget: "countdown", x: 9, y: 0, w: 3, h: 3, settings: { mode: "eod", title: "Shift ends in" } },
    { id: "search-1", widget: "search", x: 0, y: 3, w: 12, h: 1, settings: { placeholder: "> QUERY", button: "EXECUTE" } },
    { id: "links-1", widget: "links", x: 0, y: 4, w: 6, h: 3, settings: { title: "Access points" } },
    { id: "todo-1", widget: "todo", x: 6, y: 4, w: 3, h: 3, settings: { title: "Work orders", placeholder: "+ ORDER" } },
    { id: "stopwatch-1", widget: "stopwatch", x: 9, y: 4, w: 3, h: 3 },
  ],

  mount(ctx) {
    ctx.root.insertAdjacentHTML("beforeend", `
      <div class="cc-tape"></div>
      <header class="cc-head"><span>⚠ SITE: NEW-TAB / BLOCK B</span><span class="cc-day"></span></header>
      <div class="cc-tape cc-bottom"></div>`);
    const day = /** @type {HTMLElement} */ (ctx.root.querySelector(".cc-day"));
    ctx.every(60_000, () => { day.textContent = new Date().toLocaleDateString(undefined, { weekday: "long" }).toUpperCase(); });
  },
};
