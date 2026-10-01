// @ts-check
/**
 * Lo-fi Rain — cosy night: city skyline with lit windows, rain on the glass, warm light.
 * Ported from demos/variety/lofi-rain.html. The rain *sound* is the rainsound widget.
 *
 * Decorations: skyline canvas (window lights use the accent), rain canvas (static drizzle
 * for prefers-reduced-motion), fog/vignette overlay.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "lofi-rain",
  name: "Lo-fi Rain",
  description: "Rain on the window, city lights, a warm lamp. Stay in.",
  colorScheme: "dark",
  css: "theme.css",
  tokens: {
    "--bg": "#0b1026",
    "--surface": "rgb(20 24 48 / .55)",
    "--surface-2": "rgb(255 255 255 / .06)",
    "--text": "#f3e9dc",
    "--muted": "#a59fb8",
    "--accent": "#ffb46b",
    "--accent-contrast": "#1b1530",
    "--border": "color-mix(in srgb, var(--accent) 20%, transparent)",
    "--danger": "#ff7b7b",
    "--radius": "18px",
    "--gap": "18px",
    "--shadow": "none",
    "--font-body": "\"Segoe UI\", system-ui, sans-serif",
    "--font-display": "\"Segoe UI\", system-ui, sans-serif",
    "--font-mono": "\"Cascadia Mono\", Consolas, monospace",
  },
  grid: { columns: 12, rowHeight: 76, maxWidth: "1000px" },
  variants: { links: "list" },
  signatureWidgets: ["rainsound"],
  accentRole: "lamp glow, lit windows in the city, buttons and titles",
  accentPresets: ["#ffb46b", "#8fd3ff", "#ff9ecb", "#b5f09a"],
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 2, y: 0, w: 8, h: 3, settings: { greeting: false } },
    { id: "search-1", widget: "search", x: 3, y: 3, w: 6, h: 1, settings: { engine: "youtube", placeholder: "search youtube for something cozy…" } },
    { id: "rainsound-1", widget: "rainsound", x: 0, y: 5, w: 4, h: 4 },
    { id: "links-1", widget: "links", x: 4, y: 5, w: 4, h: 4, settings: { title: "Places" } },
    { id: "todo-1", widget: "todo", x: 8, y: 5, w: 4, h: 4, settings: { title: "Tonight", placeholder: "+ something small" } },
  ],

  mount(ctx) {
    ctx.root.insertAdjacentHTML("beforeend", `<canvas class="lofi-city"></canvas><canvas class="lofi-rain"></canvas><div class="lofi-fog"></div>`);
    const city = /** @type {HTMLCanvasElement} */ (ctx.root.querySelector(".lofi-city"));
    const rain = /** @type {HTMLCanvasElement} */ (ctx.root.querySelector(".lofi-rain"));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- skyline: deterministic, so it doesn't jump between tabs; lights follow the accent
    function drawCity() {
      const dpr = devicePixelRatio || 1, W = innerWidth, H = innerHeight;
      city.width = W * dpr; city.height = H * dpr;
      const g = /** @type {CanvasRenderingContext2D} */ (city.getContext("2d"));
      g.scale(dpr, dpr);
      const lit = ctx.tokens.color("--accent");
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (const [base, col, density] of /** @type {const} */ ([[.62, "#121633", .5], [.72, "#070a18", 1]])) {
        let x = 0;
        while (x < W) {
          const w = 40 + rnd() * 90, h = H * (1 - base) + rnd() * H * .28;
          g.fillStyle = col; g.fillRect(x, H - h, w, h);
          for (let wy = H - h + 10; wy < H - 10; wy += 16) for (let wx = x + 6; wx < x + w - 8; wx += 12) {
            if (rnd() < .22 * density) { g.globalAlpha = rnd() < .8 ? .85 : .55; g.fillStyle = rnd() < .8 ? lit : "#8cbeff"; g.fillRect(wx, wy, 5, 7); g.globalAlpha = 1; }
          }
          x += w + 2;
        }
      }
    }
    drawCity();
    ctx.listen(window, "resize", drawCity);
    ctx.on(ctx.events.ACCENT_CHANGED, drawCity);

    // ---- rain on the glass
    const rg = /** @type {CanvasRenderingContext2D} */ (rain.getContext("2d"));
    /** @type {{x:number,y:number,l:number,v:number}[]} */
    let drops = [];
    const sizeRain = () => { rain.width = innerWidth; rain.height = innerHeight; };
    sizeRain();
    ctx.listen(window, "resize", sizeRain);
    const drawDrops = () => {
      rg.clearRect(0, 0, rain.width, rain.height);
      rg.strokeStyle = "rgba(180,200,255,.28)"; rg.lineWidth = 1; rg.beginPath();
      for (const d of drops) { rg.moveTo(d.x, d.y); rg.lineTo(d.x - d.l * .25, d.y + d.l); }
      rg.stroke();
    };
    const target = () => Math.round(innerWidth * innerHeight / 2600);
    const spawn = () => ({ x: Math.random() * innerWidth * 1.2, y: Math.random() * innerHeight, l: 10 + Math.random() * 18, v: 9 + Math.random() * 9 });
    drops = Array.from({ length: target() }, spawn);
    if (reduced) { drawDrops(); return; }
    ctx.loop(() => {
      while (drops.length < target()) drops.push(spawn());
      for (const d of drops) {
        d.y += d.v; d.x -= d.v * .25;
        if (d.y > rain.height) { d.y = -20; d.x = Math.random() * rain.width * 1.2; }
      }
      drawDrops();
    });
  },
};
