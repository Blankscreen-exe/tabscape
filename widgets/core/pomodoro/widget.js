// @ts-check
/**
 * Pomodoro timer. The end time is stored in shared data, so a running timer survives
 * closing the tab and shows the same countdown in every tab.
 */

/** @typedef {{ mode: string, endsAt: number | null, pausedLeft: number | null }} PomoData */

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "pomodoro",
  name: "Pomodoro",
  description: "Focus timer with short and long breaks.",
  css: "widget.css",
  size: { w: 3, h: 4 },
  data: { mode: "focus", endsAt: null, pausedLeft: null },
  settings: [
    { key: "focus", label: "Focus minutes", type: "number", default: 25 },
    { key: "short", label: "Short break minutes", type: "number", default: 5 },
    { key: "long", label: "Long break minutes", type: "number", default: 15 },
  ],

  render(el, ctx) {
    const minutes = (/** @type {string} */ mode) => Math.max(1, Number(ctx.settings[mode]) || 25);
    const R = 66, C = 2 * Math.PI * R;
    el.innerHTML = `
      <div class="pomo-modes" role="tablist">
        <button data-m="focus">Focus</button><button data-m="short">Short</button><button data-m="long">Long</button>
      </div>
      <div class="pomo-ring">
        <svg viewBox="0 0 150 150" aria-hidden="true"><circle class="pomo-track" cx="75" cy="75" r="${R}"/><circle class="pomo-arc" cx="75" cy="75" r="${R}" stroke-dasharray="${C}"/></svg>
        <div class="pomo-val" role="timer"></div>
      </div>
      <div class="pomo-btns"><button class="pomo-start"></button><button class="pomo-reset">Reset</button></div>`;
    const q = (/** @type {string} */ s) => /** @type {HTMLElement} */ (el.querySelector(s));
    const original = document.title;

    /** @param {PomoData} d */
    const leftMs = d => d.endsAt ? Math.max(0, d.endsAt - Date.now()) : (d.pausedLeft ?? minutes(d.mode) * 60_000);

    function paint() {
      /** @type {PomoData} */
      const d = ctx.data.get();
      const left = leftMs(d), total = minutes(d.mode) * 60_000;
      const secs = Math.ceil(left / 1000);
      q(".pomo-val").textContent = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
      q(".pomo-arc").setAttribute("stroke-dashoffset", String(C * (1 - left / total)));
      q(".pomo-start").textContent = d.endsAt ? "Pause" : "Start";
      el.querySelectorAll(".pomo-modes button").forEach(b => b.classList.toggle("on", /** @type {HTMLElement} */ (b).dataset.m === d.mode));
      if (d.endsAt && left === 0) {
        ctx.data.set({ mode: d.mode, endsAt: null, pausedLeft: null });
        document.title = "⏰ Time's up!";
      }
    }

    ctx.listen(el, "click", e => {
      const t = /** @type {HTMLElement} */ (e.target);
      const mode = /** @type {HTMLElement | null} */ (t.closest(".pomo-modes button"))?.dataset.m;
      if (mode) ctx.data.set({ mode, endsAt: null, pausedLeft: null });
      if (t.closest(".pomo-start")) ctx.data.update((/** @type {PomoData} */ d) => {
        if (d.endsAt) { d.pausedLeft = Math.max(0, d.endsAt - Date.now()); d.endsAt = null; }
        else { d.endsAt = Date.now() + (d.pausedLeft ?? minutes(d.mode) * 60_000); d.pausedLeft = null; document.title = original; }
      });
      if (t.closest(".pomo-reset")) { ctx.data.update((/** @type {PomoData} */ d) => { d.endsAt = null; d.pausedLeft = null; }); document.title = original; }
    });

    ctx.data.watch(paint);
    ctx.every(1000, paint);
    ctx.cleanup(() => { if (document.title.startsWith("⏰")) document.title = original; });
  },
};
