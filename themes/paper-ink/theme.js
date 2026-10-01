// @ts-check
/**
 * Paper & Ink — a warm newspaper front page: masthead, serif type, ruled columns, a lined notebook.
 * Ported from demos/paper-ink.html.
 *
 * Decoration: the masthead (edition, title, date and time) across the top.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "paper-ink",
  name: "Paper & Ink",
  description: "A warm newspaper front page with a lined notebook.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#f4efe6",
    "--surface": "#fbf8f2",
    "--surface-2": "#efe7da",
    "--text": "#2b2620",
    "--muted": "#8a7f70",
    "--accent": "#b5452f",
    "--accent-contrast": "#fbf8f2",
    "--border": "#e3dacb",
    "--danger": "#a33a28",
    "--radius": "2px",
    "--gap": "32px",
    "--shadow": "none",
    "--font-body": "\"Iowan Old Style\", \"Palatino Linotype\", Palatino, Georgia, serif",
    "--font-display": "\"Iowan Old Style\", \"Palatino Linotype\", Palatino, Georgia, serif",
    "--font-mono": "\"Courier New\", Courier, monospace",
  },
  grid: { columns: 12, rowHeight: 72, maxWidth: "1040px" },
  variants: { links: "list", progress: "almanac" },
  accentRole: "section headings, the search button, quote rule and hovered links",
  accentPresets: ["#b5452f", "#2e5e8c", "#3f6b3a", "#6b3f87"],
  defaultLayout: [
    { id: "search-1", widget: "search", x: 0, y: 0, w: 12, h: 1, settings: { placeholder: "Inquire…", button: "search →", engine: "duckduckgo" } },
    { id: "links-1", widget: "links", x: 0, y: 1, w: 4, h: 5, settings: { title: "Bookmarks" } },
    { id: "notes-1", widget: "notes", x: 4, y: 1, w: 4, h: 5, settings: { title: "Notes" } },
    { id: "progress-1", widget: "progress", x: 8, y: 1, w: 4, h: 3, settings: { title: "Almanac" } },
    { id: "quote-1", widget: "quote", x: 8, y: 4, w: 4, h: 2, settings: { title: "" } },
  ],

  mount(ctx) {
    ctx.root.insertAdjacentHTML("beforeend", `
      <header class="paper-mast">
        <div><small class="paper-edition"></small><h1>The Daily Tab</h1></div>
        <div class="paper-time"><div class="t"></div><div class="d"></div></div>
      </header>`);
    const q = (/** @type {string} */ s) => /** @type {HTMLElement} */ (ctx.root.querySelector(s));
    ctx.every(1000, () => {
      const d = new Date(), h = d.getHours();
      q(".paper-time .t").textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      q(".paper-time .d").textContent = d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      q(".paper-edition").textContent = `Vol. ${d.getFullYear() - 2025} · ${h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening"} Edition`;
    });
  },
};
