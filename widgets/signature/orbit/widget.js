// @ts-check
/** Mission-control orbital view: animated satellites around a planet + mission elapsed time (since local midnight). */

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "orbit",
  name: "Orbit",
  description: "Satellites circling a planet, with mission elapsed time.",
  css: "widget.css",
  size: { w: 5, h: 6 },
  bestWith: ["mission-control"],
  settings: [
    { key: "title", label: "Title", type: "text", default: "Orbital view" },
    { key: "label", label: "Caption", type: "text", default: "Mission elapsed time · since 00:00 local" },
  ],

  render(el, ctx) {
    el.innerHTML = `
      <h3 class="ob-title"></h3>
      <svg class="ob-svg" viewBox="0 0 420 420" aria-hidden="true">
        <defs><radialGradient id="ob-planet" cx="35%" cy="35%"><stop offset="0" stop-color="#7fe3ff"/><stop offset=".6" stop-color="#1b6c9a"/><stop offset="1" stop-color="#062033"/></radialGradient></defs>
        <circle class="ob-ring" cx="210" cy="210" r="190" stroke-dasharray="2 6"/>
        <circle class="ob-ring" cx="210" cy="210" r="140"/>
        <circle class="ob-ring" cx="210" cy="210" r="90" stroke-dasharray="4 4"/>
        <line class="ob-ring" x1="210" y1="0" x2="210" y2="420"/><line class="ob-ring" x1="0" y1="210" x2="420" y2="210"/>
        <circle cx="210" cy="210" r="46" fill="url(#ob-planet)"/>
        <g class="ob-sat" style="animation-duration: 20s"><circle cx="210" cy="70" r="5" class="ob-a"/><circle cx="210" cy="70" r="12" class="ob-halo"/></g>
        <g class="ob-sat" style="animation-duration: 45s; animation-direction: reverse"><circle cx="400" cy="210" r="4" class="ob-b"/></g>
        <g class="ob-sat" style="animation-duration: 12s"><rect x="207" y="117" width="6" height="6" class="ob-c"/></g>
      </svg>
      <div class="ob-met" role="timer"></div>
      <small class="ob-label"></small>`;
    /** @type {HTMLElement} */ (el.querySelector(".ob-title")).textContent = ctx.settings.title;
    /** @type {HTMLElement} */ (el.querySelector(".ob-label")).textContent = ctx.settings.label;
    const met = /** @type {HTMLElement} */ (el.querySelector(".ob-met"));
    const p = (/** @type {number} */ n) => String(n).padStart(2, "0");
    ctx.every(1000, () => { const d = new Date(); met.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; });
  },
};
