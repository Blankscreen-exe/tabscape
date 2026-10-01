// @ts-check
/**
 * Anti-Design — clashing colours, mixed type, rotated overlapping blocks, a marquee ticker.
 * Ported from demos/brutalist/anti-design.html.
 *
 * Decorations: scrolling ticker (top), drifting shapes (skipped for prefers-reduced-motion).
 * Signature widget: dice ("feeling lucky?").
 */

const TICKER = "★ WELCOME TO YOUR NEW TAB ★ DESIGN IS DEAD ★ LONG LIVE DESIGN ★ RULES ARE SUGGESTIONS ★ DRINK WATER ";
const SHAPES = ["✶", "☻", "✿", "⚡", "◉", "✌"];

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "anti-design",
  name: "Anti-Design",
  description: "Clashing colours, mixed fonts, tilted blocks and a ticker. Rules are suggestions.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#0000ff",
    "--surface": "#ffffff",
    "--surface-2": "#fffb00",
    "--text": "#000000",
    "--muted": "#3a3a3a",
    "--accent": "#00ff3c",
    "--accent-contrast": "#000000",
    "--border": "#000000",
    "--danger": "#ff2a00",
    "--radius": "0px",
    "--gap": "18px",
    "--shadow": "10px 10px 0 #000000",
    "--font-body": "\"Times New Roman\", Times, serif",
    "--font-display": "\"Arial Black\", Impact, sans-serif",
    "--font-mono": "\"Courier New\", monospace",
  },
  grid: { columns: 12, rowHeight: 76, maxWidth: "1200px" },
  signatureWidgets: ["dice"],
  accentRole: "the giant clock, buttons and the die",
  accentPresets: ["#00ff3c", "#ff00e5", "#fffb00", "#ff6a00"],
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 0, y: 0, w: 8, h: 3, settings: { greeting: false } },
    { id: "notes-1", widget: "notes", x: 8, y: 0, w: 4, h: 3, settings: { title: "scribble here" } },
    { id: "search-1", widget: "search", x: 1, y: 3, w: 10, h: 1, settings: { placeholder: "TYPE SOMETHING. ANYTHING.", button: "go!!", engine: "duckduckgo" } },
    { id: "links-1", widget: "links", x: 0, y: 4, w: 5, h: 4, settings: { title: "places" } },
    { id: "todo-1", widget: "todo", x: 5, y: 5, w: 4, h: 4, settings: { title: "do stuff", placeholder: "+ another thing to do…" } },
    { id: "dice-1", widget: "dice", x: 9, y: 4, w: 3, h: 4 },
  ],

  mount(ctx) {
    // ---- ticker ----------------------------------------------------------------
    const ticker = document.createElement("div");
    ticker.className = "anti-ticker";
    const track = document.createElement("div");
    track.textContent = TICKER.repeat(6);
    ticker.append(track);
    ctx.root.append(ticker);

    // ---- drifting shapes (motion-sensitive users get none) -----------------------
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const shapes = SHAPES.map((ch, i) => {
      const el = document.createElement("div");
      el.className = `anti-shape anti-shape-${i % 3}`;
      el.textContent = ch;
      ctx.root.append(el);
      return { el, x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * 1.2, r: 0 };
    });
    ctx.loop(() => {
      for (const s of shapes) {
        s.x += s.vx; s.y += s.vy; s.r += s.vx;
        if (s.x < 0 || s.x > innerWidth - 40) s.vx *= -1;
        if (s.y < 0 || s.y > innerHeight - 40) s.vy *= -1;
        s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg)`;
      }
    });
  },
};
