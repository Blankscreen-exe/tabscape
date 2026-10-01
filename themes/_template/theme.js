// @ts-check
/**
 * THEME TEMPLATE — copy this folder to themes/<your-id>/ and:
 *   1. set `id` (kebab-case, same as the folder name) and `name`
 *   2. fill in every token (all REQUIRED_TOKENS in core/contracts.js)
 *   3. design `defaultLayout` (12 columns by default; mark signature slots `locked: true` if they define the theme)
 *   4. add { "id": "<your-id>", "path": "themes/<your-id>/theme.js" } to registry.json
 *   5. run `npm run check` and look at dev/gallery.html
 *
 * Rules: no side effects at import time (Node imports this file for checks);
 * all DOM work happens inside mount(). Use ctx.every/after/listen/loop/on so cleanup is automatic.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "template",
  name: "Template",
  description: "One sentence shown in the theme picker.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#ffffff",
    "--surface": "#ffffff",
    "--surface-2": "#f4f4f4",
    "--text": "#111111",
    "--muted": "#777777",
    "--accent": "#ff5a36",
    "--accent-contrast": "#ffffff",
    "--border": "#e5e5e5",
    "--danger": "#d93a3a",
    "--radius": "12px",
    "--gap": "16px",
    "--shadow": "none",
    "--font-body": "system-ui, sans-serif",
    "--font-display": "system-ui, sans-serif",
    "--font-mono": "Consolas, monospace",
  },
  grid: { columns: 12, rowHeight: 80 },
  // variants: { todo: "quest-log" },          // ask core widgets to render a different variant
  // signatureWidgets: ["my-widget"],          // widgets designed for this theme
  // initialState: { xp: 0 },                  // private theme data, available as ctx.state
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 0, y: 0, w: 12, h: 2 },
    { id: "search-1", widget: "search", x: 2, y: 2, w: 8, h: 1 },
  ],

  // Optional. Decorations go in ctx.root (the #decor layer); services listen to ctx.on(ctx.events.X).
  // Return a function for any extra cleanup (usually not needed).
  mount(ctx) {
    // const el = document.createElement("div");
    // el.className = "template-decoration";
    // ctx.root.append(el);
    // ctx.on(ctx.events.TODO_COMPLETED, () => ctx.state.update(s => { s.xp += 10; }));
  },
};
