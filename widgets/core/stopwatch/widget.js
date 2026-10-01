// @ts-check
/**
 * Stopwatch with laps. Like the pomodoro, it stores the start time (not a ticking counter),
 * so it keeps running across tabs and after closing the page.
 */

/** @typedef {{ startedAt: number | null, acc: number, laps: number[] }} SwData */

/** mm:ss.cc (or h:mm:ss.cc). @param {number} ms */
export function formatMs(ms) {
  const p = (/** @type {number} */ n) => String(n).padStart(2, "0");
  const h = Math.floor(ms / 36e5), m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1000) % 60, cs = Math.floor(ms / 10) % 100;
  return `${h ? `${h}:` : ""}${p(m)}:${p(s)}.${p(cs)}`;
}

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "stopwatch",
  name: "Stopwatch",
  description: "Start, stop, lap, reset.",
  css: "widget.css",
  size: { w: 3, h: 3 },
  data: { startedAt: null, acc: 0, laps: [] },
  settings: [
    { key: "title", label: "Title", type: "text", default: "Stopwatch" },
  ],

  render(el, ctx) {
    el.innerHTML = `
      <h3 class="sw-title"></h3>
      <div class="sw-time" role="timer"></div>
      <div class="sw-btns"><button class="sw-go"></button><button class="sw-lap">Lap</button><button class="sw-rst">Reset</button></div>
      <ol class="sw-laps"></ol>`;
    /** @type {HTMLElement} */ (el.querySelector(".sw-title")).textContent = ctx.settings.title;
    const q = (/** @type {string} */ s) => /** @type {HTMLElement} */ (el.querySelector(s));
    /** @param {SwData} d */
    const elapsed = d => d.acc + (d.startedAt ? Date.now() - d.startedAt : 0);

    ctx.loop(() => { q(".sw-time").textContent = formatMs(elapsed(ctx.data.get())); });
    ctx.data.watch((/** @type {SwData} */ d) => {
      q(".sw-go").textContent = d.startedAt ? "Stop" : "Start";
      q(".sw-laps").innerHTML = d.laps.map((l, i) => `<li><span>Lap ${String(d.laps.length - i).padStart(2, "0")}</span><span>${formatMs(l)}</span></li>`).join("");
      q(".sw-time").textContent = formatMs(elapsed(d));
    });

    ctx.listen(el, "click", e => {
      const t = /** @type {HTMLElement} */ (e.target);
      if (t.closest(".sw-go")) ctx.data.update((/** @type {SwData} */ d) => {
        if (d.startedAt) { d.acc += Date.now() - d.startedAt; d.startedAt = null; } else d.startedAt = Date.now();
      });
      if (t.closest(".sw-lap")) ctx.data.update((/** @type {SwData} */ d) => { const v = elapsed(d); if (v) d.laps = [v, ...d.laps].slice(0, 50); });
      if (t.closest(".sw-rst")) ctx.data.set({ startedAt: null, acc: 0, laps: [] });
    });
  },
};
