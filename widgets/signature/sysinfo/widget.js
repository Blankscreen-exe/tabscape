// @ts-check
/** System panel: session uptime, screen, language, network, day-progress bar (ASCII). */

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "sysinfo",
  name: "System Info",
  description: "Uptime, screen, language, network and a text-mode day bar.",
  css: "widget.css",
  size: { w: 4, h: 3 },
  bestWith: ["terminal", "mission-control"],
  settings: [
    { key: "title", label: "Title", type: "text", default: "sys" },
  ],

  render(el, ctx) {
    el.innerHTML = `<h3 class="sys-title"></h3><dl class="sys-kv">
      <dt>session</dt><dd data-k="up"></dd>
      <dt>screen</dt><dd data-k="res"></dd>
      <dt>lang</dt><dd data-k="lang"></dd>
      <dt>net</dt><dd data-k="net"></dd>
    </dl><div class="sys-bar"></div>`;
    /** @type {HTMLElement} */ (el.querySelector(".sys-title")).textContent = ctx.settings.title;
    const set = (/** @type {string} */ k, /** @type {string} */ v) => { /** @type {HTMLElement} */ (el.querySelector(`[data-k="${k}"]`)).textContent = v; };
    const bar = /** @type {HTMLElement} */ (el.querySelector(".sys-bar"));
    const t0 = Date.now();

    ctx.every(1000, () => {
      const s = Math.floor((Date.now() - t0) / 1000);
      set("up", s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${Math.floor(s / 3600)}h ${Math.floor(s / 60) % 60}m`);
      set("res", `${innerWidth}×${innerHeight}`);
      set("lang", navigator.language);
      set("net", navigator.onLine ? "online" : "offline");
      const d = new Date(), frac = (d.getHours() * 60 + d.getMinutes()) / 1440, n = 18, filled = Math.round(frac * n);
      bar.textContent = `day [${"#".repeat(filled)}${".".repeat(n - filled)}] ${Math.round(frac * 100)}%`;
    });
  },
};
