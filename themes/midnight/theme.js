// @ts-check
/**
 * Midnight — a small reference theme that exercises every theme feature:
 *  - decoration (animated starfield canvas in the decor layer, auto-cleaned)
 *  - a service (counts completed to-dos in private theme state, shows a "shooting star")
 *  - a widget variant (links shown as a list)
 *  - a locked slot in the default layout (the clock)
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "midnight",
  name: "Midnight",
  description: "Dark sky with drifting stars. Finishing a task launches a shooting star.",
  colorScheme: "dark",
  css: "theme.css",
  tokens: {
    "--bg": "#070b17",
    "--surface": "rgb(255 255 255 / .06)",
    "--surface-2": "rgb(255 255 255 / .08)",
    "--text": "#e8ecff",
    "--muted": "#8b93b8",
    "--accent": "#9db4ff",
    "--accent-contrast": "#0a0f22",
    "--border": "rgb(255 255 255 / .12)",
    "--danger": "#ff6b81",
    "--radius": "18px",
    "--gap": "18px",
    "--shadow": "0 10px 40px rgb(0 0 0 / .35)",
    "--font-body": "\"Segoe UI\", system-ui, sans-serif",
    "--font-display": "\"Segoe UI Light\", \"Segoe UI\", system-ui, sans-serif",
    "--font-mono": "\"Cascadia Mono\", Consolas, monospace",
  },
  grid: { columns: 12, rowHeight: 80, maxWidth: "1100px" },
  variants: { links: "list" },
  accentRole: "buttons, link icons, shooting stars",
  accentPresets: ["#ffd479", "#7ef0c8", "#ff9ecb", "#c3a6ff"],
  initialState: { starsLaunched: 0 },
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 0, y: 0, w: 12, h: 2, locked: true },
    { id: "search-1", widget: "search", x: 3, y: 2, w: 6, h: 1 },
    { id: "todo-1", widget: "todo", x: 0, y: 3, w: 4, h: 4 },
    { id: "links-1", widget: "links", x: 4, y: 3, w: 4, h: 4 },
    { id: "notes-1", widget: "notes", x: 8, y: 3, w: 4, h: 4 },
  ],

  mount(ctx) {
    // ---- decoration: starfield --------------------------------------------
    const canvas = document.createElement("canvas");
    canvas.className = "midnight-stars";
    ctx.root.append(canvas);
    const g = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));
    /** @type {{x:number,y:number,r:number,tw:number}[]} */
    let stars = [];
    /** @type {{x:number,y:number,vx:number,vy:number,life:number}[]} */
    const shooting = [];
    // Canvas can't use CSS variables, so read the live accent and refresh it when it changes (rule S5).
    let accent = ctx.tokens.color("--accent");
    ctx.on(ctx.events.ACCENT_CHANGED, () => { accent = ctx.tokens.color("--accent"); });

    const resize = () => {
      canvas.width = innerWidth; canvas.height = innerHeight;
      stars = Array.from({ length: Math.round(innerWidth * innerHeight / 9000) }, () => ({
        x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.3 + .2, tw: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    ctx.listen(window, "resize", resize);

    ctx.loop(t => {
      g.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        g.globalAlpha = .35 + .65 * Math.abs(Math.sin(t / 1600 + s.tw));
        g.fillStyle = "#dfe6ff";
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fill();
      }
      for (let i = shooting.length - 1; i >= 0; i--) {
        const s = shooting[i];
        g.globalAlpha = Math.max(0, s.life);
        g.strokeStyle = accent; g.lineWidth = 2;
        g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x - s.vx * 8, s.y - s.vy * 8); g.stroke();
        s.x += s.vx; s.y += s.vy; s.life -= .015;
        if (s.life <= 0) shooting.splice(i, 1);
      }
      g.globalAlpha = 1;
    });

    // ---- service: react to core widget events -----------------------------
    ctx.on(ctx.events.TODO_COMPLETED, () => {
      shooting.push({ x: Math.random() * innerWidth * .6, y: Math.random() * innerHeight * .3, vx: 9, vy: 4, life: 1 });
      ctx.state.update(s => { s.starsLaunched++; });
    });
  },
};
