// @ts-check
/**
 * RPG Quest — retro pixel RPG HUD. To-dos become quests (todo variant "quest-log"),
 * the hero widget turns finished quests into XP and gold, links become the inventory.
 * Ported from demos/variety/rpg-quest.html.
 *
 * The theme itself holds no game rules (they live in widgets/signature/hero).
 * It only celebrates: a level-up banner and floating "+XP" text.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "rpg-quest",
  name: "RPG Quest",
  description: "Pixel RPG: to-dos are quests, finishing them earns XP and gold.",
  colorScheme: "dark",
  css: "theme.css",
  tokens: {
    "--bg": "#1a1c2c",
    "--surface": "#29366f",
    "--surface-2": "#1d2450",
    "--text": "#f4f4f4",
    "--muted": "#94b0c2",
    "--accent": "#ffcd75",
    "--accent-contrast": "#1a1c2c",
    "--border": "#f4f4f4",
    "--danger": "#b13e53",
    "--radius": "6px",
    "--gap": "26px",
    "--shadow": "0 0 0 4px #0b0d18, 6px 6px 0 4px #0b0d18",
    "--font-body": "\"Cascadia Mono\", Consolas, \"Courier New\", monospace",
    "--font-display": "\"Cascadia Mono\", Consolas, \"Courier New\", monospace",
    "--font-mono": "\"Cascadia Mono\", Consolas, \"Courier New\", monospace",
    "--success": "#a7f070",
  },
  grid: { columns: 12, rowHeight: 70, maxWidth: "1180px" },
  variants: { todo: "quest-log" },
  signatureWidgets: ["hero", "oracle"],
  accentRole: "titles, gold, highlights and buttons",
  accentPresets: ["#ffcd75", "#a7f070", "#ff8fd8", "#73eff7"],
  defaultLayout: [
    { id: "hero-1", widget: "hero", x: 0, y: 0, w: 3, h: 8, locked: true },
    { id: "oracle-1", widget: "oracle", x: 3, y: 0, w: 6, h: 2 },
    { id: "search-1", widget: "search", x: 3, y: 2, w: 6, h: 1, settings: { placeholder: "Cast a search spell…", button: "CAST" } },
    { id: "todo-1", widget: "todo", x: 3, y: 3, w: 6, h: 5 },
    { id: "links-1", widget: "links", x: 9, y: 0, w: 3, h: 5, settings: { title: "Inventory" } },
    { id: "clock-1", widget: "clock", x: 9, y: 5, w: 3, h: 3, settings: { greeting: false } },
  ],

  mount(ctx) {
    const banner = document.createElement("div");
    banner.className = "rpg-banner";
    ctx.root.append(banner);

    ctx.on(ctx.events.RPG_LEVEL_UP, ({ level }) => {
      banner.textContent = `LEVEL UP! LV ${level}`;
      banner.classList.remove("show");
      void banner.offsetWidth;
      banner.classList.add("show");
    });

    ctx.on(ctx.events.RPG_XP_CHANGED, ({ amount }) => {
      const pop = document.createElement("div");
      pop.className = "rpg-pop" + (amount < 0 ? " neg" : "");
      pop.textContent = `${amount > 0 ? "+" : "−"}${Math.abs(amount)} XP`;
      ctx.root.append(pop);
      ctx.after(1400, () => pop.remove());
    });
  },
};
