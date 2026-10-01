// @ts-check
/**
 * Retro OS — a 90s desktop: every widget is a window (title from data-title), teal desktop,
 * links become desktop icons, taskbar with a Start button and tray clock.
 * Ported from demos/variety/retro-os.html. Window dragging is the core grid's edit mode.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "retro-os",
  name: "Retro OS",
  description: "A 90s desktop: every widget is a window. Start opens Customize.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#008080",
    "--surface": "#c0c0c0",
    "--surface-2": "#ffffff",
    "--text": "#000000",
    "--muted": "#404040",
    "--accent": "#000080",
    "--accent-contrast": "#ffffff",
    "--border": "#808080",
    "--danger": "#c00000",
    "--radius": "0px",
    "--gap": "14px",
    "--shadow": "inset -1px -1px #000000, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf",
    "--font-body": "\"MS Sans Serif\", \"Microsoft Sans Serif\", Tahoma, \"Segoe UI\", sans-serif",
    "--font-display": "\"MS Sans Serif\", \"Microsoft Sans Serif\", Tahoma, \"Segoe UI\", sans-serif",
    "--font-mono": "\"Courier New\", monospace",
    "--success": "#00a000",
    "--widget-padding": "30px 8px 8px",
  },
  grid: { columns: 12, rowHeight: 72, maxWidth: "1280px" },
  signatureWidgets: ["minesweeper"],
  accentRole: "window title bars, selections and the Start menu",
  accentPresets: ["#000080", "#008000", "#800080", "#800000"],
  defaultLayout: [
    { id: "links-1", widget: "links", x: 0, y: 0, w: 2, h: 7, settings: { title: "Desktop" } },
    { id: "search-1", widget: "search", x: 2, y: 0, w: 7, h: 2, settings: { placeholder: "Type what you are looking for…", button: "Search" } },
    { id: "clock-1", widget: "clock", x: 9, y: 0, w: 3, h: 2, settings: { seconds: true, greeting: false } },
    { id: "notes-1", widget: "notes", x: 2, y: 2, w: 4, h: 5, settings: { title: "Untitled - Notepad", mono: true } },
    { id: "todo-1", widget: "todo", x: 6, y: 2, w: 3, h: 5, settings: { title: "To Do List" } },
    { id: "minesweeper-1", widget: "minesweeper", x: 9, y: 2, w: 3, h: 5 },
  ],

  mount(ctx) {
    ctx.root.insertAdjacentHTML("beforeend", `
      <div class="ros-taskbar interactive">
        <button class="ros-start" title="Customize (Alt+C)"><span>🪟</span> Start</button>
        <div class="ros-tray"><span>🔊</span><span class="ros-time"></span></div>
      </div>`);
    const time = /** @type {HTMLElement} */ (ctx.root.querySelector(".ros-time"));
    ctx.every(10_000, () => { time.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); });
    // Start opens the core Customize panel through its documented shortcut (Alt+C).
    ctx.listen(/** @type {HTMLElement} */ (ctx.root.querySelector(".ros-start")), "click", () => {
      dispatchEvent(new KeyboardEvent("keydown", { key: "c", altKey: true }));
    });
  },
};
