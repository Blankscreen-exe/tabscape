// @ts-check
/**
 * Mission Control — sci-fi console: thin cyan lines, corner brackets, telemetry, orbit, GO/NO-GO poll.
 * Ported from demos/variety/mission-control.html.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "mission-control",
  name: "Mission Control",
  description: "Telemetry, an orbital view, the moon and a GO/NO-GO checklist.",
  colorScheme: "dark",
  css: "theme.css",
  tokens: {
    "--bg": "#03070d",
    "--surface": "rgb(10 26 40 / .65)",
    "--surface-2": "color-mix(in srgb, var(--accent) 8%, transparent)",
    "--text": "#d8f6ff",
    "--muted": "#5f9fb3",
    "--accent": "#50dcff",
    "--accent-contrast": "#03070d",
    "--border": "color-mix(in srgb, var(--accent) 28%, transparent)",
    "--danger": "#ff4d5e",
    "--radius": "0px",
    "--gap": "18px",
    "--shadow": "none",
    "--font-body": "\"Cascadia Mono\", Consolas, monospace",
    "--font-display": "\"Bahnschrift\", \"Segoe UI\", system-ui, sans-serif",
    "--font-mono": "\"Cascadia Mono\", Consolas, monospace",
    "--success": "#4dffa6",
    "--warning": "#ffb547",
  },
  grid: { columns: 12, rowHeight: 72, maxWidth: "1240px" },
  variants: { todo: "go-no-go", links: "list" },
  signatureWidgets: ["orbit", "sysinfo"],
  accentRole: "lines, brackets, titles, the main satellite and buttons",
  accentPresets: ["#50dcff", "#4dffa6", "#ffb547", "#ff6bd6"],
  defaultLayout: [
    { id: "sysinfo-1", widget: "sysinfo", x: 0, y: 0, w: 3, h: 4, settings: { title: "Telemetry" } },
    { id: "orbit-1", widget: "orbit", x: 3, y: 0, w: 6, h: 7 },
    { id: "countdown-1", widget: "countdown", x: 9, y: 0, w: 3, h: 2, settings: { mode: "eod", title: "T-minus · end of day" } },
    { id: "moon-1", widget: "moon", x: 9, y: 2, w: 3, h: 2, settings: { title: "Lunar" } },
    { id: "links-1", widget: "links", x: 0, y: 4, w: 3, h: 4, settings: { title: "Comms" } },
    { id: "todo-1", widget: "todo", x: 9, y: 4, w: 3, h: 4 },
    { id: "search-1", widget: "search", x: 3, y: 7, w: 6, h: 1, settings: { placeholder: "transmit search query…", button: "SEND" } },
  ],

  mount(ctx) {
    ctx.root.insertAdjacentHTML("beforeend", `<header class="mc-head"><span>MISSION CONTROL · NEW TAB PROGRAM</span><span class="mc-live"></span></header>`);
    const live = /** @type {HTMLElement} */ (ctx.root.querySelector(".mc-live"));
    ctx.every(60_000, () => { live.textContent = `LIVE · ${new Date().toISOString().slice(0, 10)}`; });
  },
};
