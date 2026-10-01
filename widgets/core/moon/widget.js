// @ts-check
/** Current moon phase, computed locally (no network). */

const SYNODIC = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const NAMES = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];

/**
 * @param {Date} date
 * @returns {{ age: number, fraction: number, illumination: number, name: string }}
 *   age in days since new moon, fraction 0..1 through the cycle, illumination 0..1
 */
export function moonPhase(date) {
  const age = (((date.getTime() - KNOWN_NEW_MOON) / 864e5) % SYNODIC + SYNODIC) % SYNODIC;
  const fraction = age / SYNODIC;
  return { age, fraction, illumination: (1 - Math.cos(2 * Math.PI * fraction)) / 2, name: NAMES[Math.round(fraction * 8) % 8] };
}

/** SVG path for the lit part of a moon of radius r centred at (c, c). @param {number} fraction @param {number} r @param {number} c */
export function litPath(fraction, r, c) {
  const k = Math.abs(Math.cos(2 * Math.PI * fraction)) * r;
  const waxing = fraction < .5;
  const crescent = fraction < .25 || fraction > .75;
  const outer = waxing ? 1 : 0;
  const inner = crescent ? (waxing ? 0 : 1) : (waxing ? 1 : 0);
  return `M${c} ${c - r} A${r} ${r} 0 0 ${outer} ${c} ${c + r} A${k} ${r} 0 0 ${inner} ${c} ${c - r}Z`;
}

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "moon",
  name: "Moon Phase",
  description: "Tonight's moon, calculated on your device.",
  css: "widget.css",
  size: { w: 3, h: 2 },
  settings: [
    { key: "title", label: "Title", type: "text", default: "Moon" },
  ],

  render(el, ctx) {
    el.innerHTML = `<h3 class="moon-title"></h3><div class="moon-row"><svg class="moon-svg" viewBox="0 0 64 64" aria-hidden="true"></svg><div><b class="moon-name"></b><span class="moon-info"></span></div></div>`;
    /** @type {HTMLElement} */ (el.querySelector(".moon-title")).textContent = ctx.settings.title;
    ctx.every(60 * 60_000, () => {
      const m = moonPhase(new Date());
      /** @type {HTMLElement} */ (el.querySelector(".moon-name")).textContent = m.name;
      /** @type {HTMLElement} */ (el.querySelector(".moon-info")).textContent = `${Math.round(m.illumination * 100)}% lit · day ${m.age.toFixed(1)}`;
      /** @type {SVGElement} */ (el.querySelector(".moon-svg")).innerHTML =
        `<circle class="moon-dark" cx="32" cy="32" r="28"/><path class="moon-lit" d="${litPath(m.fraction, 28, 32)}"/>`;
    });
  },
};
