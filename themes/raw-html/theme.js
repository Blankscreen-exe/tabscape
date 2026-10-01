// @ts-check
/**
 * Raw HTML — classic web brutalism: browser defaults, Times, blue underlined links, table borders.
 * Ported from demos/brutalist/raw-html.html.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "raw-html",
  name: "Raw HTML",
  description: "Browser defaults, Times, blue links, table borders. Best viewed in any browser.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#ffffff",
    "--surface": "#ffffff",
    "--surface-2": "#eeeeee",
    "--text": "#000000",
    "--muted": "#555555",
    "--accent": "#0000ee",
    "--accent-contrast": "#ffffff",
    "--border": "#000000",
    "--danger": "#cc0000",
    "--radius": "0px",
    "--gap": "10px",
    "--shadow": "none",
    "--font-body": "\"Times New Roman\", Times, serif",
    "--font-display": "\"Times New Roman\", Times, serif",
    "--font-mono": "\"Courier New\", Courier, monospace",
    "--success": "#00cc00",
  },
  grid: { columns: 12, rowHeight: 72, maxWidth: "100%" },
  variants: { links: "list" },
  signatureWidgets: ["counter"],
  accentRole: "links and buttons",
  accentPresets: ["#0000ee", "#551a8b", "#cc0000", "#008000"],
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 0, y: 0, w: 12, h: 2, settings: { seconds: true, greeting: false } },
    { id: "search-1", widget: "search", x: 0, y: 2, w: 12, h: 1, settings: { placeholder: "", button: "Submit Query" } },
    { id: "links-1", widget: "links", x: 0, y: 3, w: 4, h: 4 },
    { id: "todo-1", widget: "todo", x: 4, y: 3, w: 4, h: 4 },
    { id: "counter-1", widget: "counter", x: 8, y: 3, w: 4, h: 2, settings: { label: "You are new tab number" } },
    { id: "quote-1", widget: "quote", x: 8, y: 5, w: 4, h: 2, settings: { title: "Quote" } },
  ],

  mount(ctx) {
    ctx.root.insertAdjacentHTML("beforeend", `
      <header class="raw-head"><h1>NEW TAB</h1><p class="raw-mono">last modified: <span class="raw-lm"></span></p><hr></header>
      <address class="raw-foot">no css frameworks were harmed in the making of this page.</address>`);
    /** @type {HTMLElement} */ (ctx.root.querySelector(".raw-lm")).textContent = document.lastModified;
  },
};
