// @ts-check
/**
 * Zen — rice paper, ink-wash mountains, an ensō around the clock, lots of empty space.
 * Ported from demos/variety/zen.html.
 *
 * Decorations: layered mountains + sun (accent), vertical date strip with a seal (accent).
 * Signature widgets: breath, intention, haiku.
 */

/** Kanji numerals for the vertical date (1–31, 1–12). @param {number} n */
function kanjiNum(n) {
  const k = "〇一二三四五六七八九";
  if (n < 10) return k[n];
  if (n === 10) return "十";
  if (n < 20) return "十" + k[n - 10];
  return k[Math.floor(n / 10)] + "十" + (n % 10 ? k[n % 10] : "");
}

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "zen",
  name: "Zen",
  description: "Rice paper, ink-wash mountains and a brushed ensō. Breathe, then begin.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#f3eee4",
    "--surface": "rgb(251 248 242 / .55)",
    "--surface-2": "rgb(31 29 26 / .05)",
    "--text": "#1f1d1a",
    "--muted": "#7d776d",
    "--accent": "#b8322a",
    "--accent-contrast": "#f3eee4",
    "--border": "rgb(31 29 26 / .14)",
    "--danger": "#8f2a20",
    "--radius": "4px",
    "--gap": "26px",
    "--shadow": "none",
    "--font-body": "\"Yu Gothic UI\", \"Segoe UI\", system-ui, sans-serif",
    "--font-display": "\"Yu Mincho\", \"Hiragino Mincho ProN\", \"MS Mincho\", Georgia, serif",
    "--font-mono": "\"Cascadia Mono\", Consolas, monospace",
  },
  grid: { columns: 12, rowHeight: 72, maxWidth: "1100px" },
  variants: { links: "list" },
  signatureWidgets: ["breath", "intention", "haiku"],
  accentRole: "the sun, the seal, focus rings and hovered links",
  accentPresets: ["#b8322a", "#2f5d50", "#3d4f7c", "#8a6d3b"],
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 3, y: 0, w: 6, h: 4, locked: true, settings: { greeting: false } },
    { id: "search-1", widget: "search", x: 3, y: 4, w: 6, h: 1, settings: { placeholder: "seek", engine: "duckduckgo" } },
    { id: "breath-1", widget: "breath", x: 4, y: 5, w: 4, h: 3 },
    { id: "links-1", widget: "links", x: 9, y: 0, w: 3, h: 4, settings: { title: "Paths" } },
    { id: "intention-1", widget: "intention", x: 9, y: 4, w: 3, h: 2 },
    { id: "haiku-1", widget: "haiku", x: 9, y: 6, w: 3, h: 2 },
  ],

  mount(ctx) {
    // ---- ink-wash mountains + sun ------------------------------------------
    ctx.root.insertAdjacentHTML("beforeend", `
      <svg class="zen-mountains" viewBox="0 0 1440 500" preserveAspectRatio="none">
        <defs><filter id="zen-blur"><feGaussianBlur stdDeviation="6"/></filter></defs>
        <path d="M0 300 L120 220 L260 290 L420 170 L560 260 L720 140 L880 250 L1040 180 L1200 270 L1340 200 L1440 240 L1440 500 L0 500Z" class="zen-far" filter="url(#zen-blur)"/>
        <path d="M0 360 L180 280 L300 340 L470 250 L640 350 L820 270 L980 340 L1160 260 L1320 330 L1440 300 L1440 500 L0 500Z" class="zen-mid" filter="url(#zen-blur)"/>
        <path d="M0 430 L220 360 L400 420 L600 370 L800 430 L1000 380 L1220 440 L1440 400 L1440 500 L0 500Z" class="zen-near"/>
      </svg>
      <div class="zen-sun"></div>
      <aside class="zen-strip"><span class="zen-seal">静</span><span class="zen-date"></span><span class="zen-motto">— breathe, then begin —</span></aside>`);

    // ---- vertical kanji date -------------------------------------------------
    const date = /** @type {HTMLElement} */ (ctx.root.querySelector(".zen-date"));
    ctx.every(60_000, () => {
      const d = new Date();
      date.textContent = `${kanjiNum(d.getMonth() + 1)}月${kanjiNum(d.getDate())}日`;
    });
  },
};
