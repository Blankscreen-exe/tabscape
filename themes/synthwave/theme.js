// @ts-check
/**
 * Synthwave — 80s neon sunset: striped sun, scrolling perspective grid, stars, chrome clock.
 * Ported from demos/synthwave.html.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "synthwave",
  name: "Synthwave",
  description: "Neon sunset, a striped sun and an endless grid. Outrun your inbox.",
  colorScheme: "dark",
  css: "theme.css",
  tokens: {
    "--bg": "#0d0221",
    "--surface": "rgb(13 2 33 / .62)",
    "--surface-2": "rgb(255 255 255 / .07)",
    "--text": "#fbe7ff",
    "--muted": "#b79cc9",
    "--accent": "#ff2a6d",
    "--accent-contrast": "#ffffff",
    "--border": "color-mix(in srgb, var(--accent) 60%, transparent)",
    "--danger": "#ff5c5c",
    "--radius": "0px",
    "--gap": "22px",
    "--shadow": "0 0 20px color-mix(in srgb, var(--accent) 25%, transparent)",
    "--font-body": "\"Segoe UI\", system-ui, sans-serif",
    "--font-display": "\"Arial Black\", \"Segoe UI Black\", Impact, sans-serif",
    "--font-mono": "\"Cascadia Mono\", Consolas, monospace",
  },
  grid: { columns: 12, rowHeight: 76, maxWidth: "1100px" },
  accentRole: "neon: the sun's lower half, the grid floor, borders and glow",
  accentPresets: ["#ff2a6d", "#05d9e8", "#b967ff", "#ff6c11"],
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 2, y: 0, w: 8, h: 3, settings: { greeting: false } },
    { id: "search-1", widget: "search", x: 3, y: 3, w: 6, h: 1, settings: { placeholder: "ENTER THE GRID…", button: "GO" } },
    { id: "links-1", widget: "links", x: 0, y: 6, w: 5, h: 3, settings: { title: "Warp links" } },
    { id: "countdown-1", widget: "countdown", x: 5, y: 6, w: 3, h: 3 },
    { id: "todo-1", widget: "todo", x: 8, y: 6, w: 4, h: 3, settings: { title: "Missions" } },
  ],

  mount(ctx) {
    const stars = Array.from({ length: 90 }, () =>
      `<i style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 3}s;opacity:${.3 + Math.random() * .7}"></i>`).join("");
    ctx.root.insertAdjacentHTML("beforeend", `
      <div class="sw-sky"></div>
      <div class="sw-stars">${stars}</div>
      <div class="sw-sun"></div>
      <div class="sw-floor"></div>`);
  },
};
