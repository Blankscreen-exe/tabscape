// @ts-check
/**
 * How much of the day / week / month / year has passed.
 * Variants: default (big numbers + bars, e.g. Bento) · almanac (label/value list, e.g. Paper & Ink).
 */

/** @param {Date} d */
export function progress(d) {
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (d.getTime() - dayStart.getTime()) / 864e5;
  const week = (((d.getDay() + 6) % 7) + day) / 7; // weeks start on Monday
  const mStart = new Date(d.getFullYear(), d.getMonth(), 1), mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const yStart = new Date(d.getFullYear(), 0, 1), yEnd = new Date(d.getFullYear() + 1, 0, 1);
  const month = (d.getTime() - mStart.getTime()) / (mEnd.getTime() - mStart.getTime());
  const year = (d.getTime() - yStart.getTime()) / (yEnd.getTime() - yStart.getTime());
  const dayOfYear = Math.floor((dayStart.getTime() - yStart.getTime()) / 864e5) + 1;
  // ISO-8601 week number
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const isoWeek = Math.ceil(((t.getTime() - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
  return { day, week, month, year, dayOfYear, isoWeek };
}

const PERIODS = /** @type {const} */ (["day", "week", "month", "year"]);

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "progress",
  name: "Progress",
  description: "How much of the day, week, month and year has passed.",
  css: "widget.css",
  size: { w: 6, h: 2 },
  variants: ["default", "almanac"],
  settings: [
    { key: "title", label: "Title", type: "text", default: "Progress" },
    { key: "day", label: "Show day", type: "toggle", default: true },
    { key: "week", label: "Show week", type: "toggle", default: true },
    { key: "month", label: "Show month", type: "toggle", default: false },
    { key: "year", label: "Show year", type: "toggle", default: true },
  ],

  render(el, ctx) {
    const shown = PERIODS.filter(p => ctx.settings[p]);
    const almanac = ctx.variant === "almanac";
    el.innerHTML = `<h3 class="pg-title"></h3><div class="pg-${almanac ? "almanac" : "tiles"}"></div>`;
    /** @type {HTMLElement} */ (el.querySelector(".pg-title")).textContent = ctx.settings.title;
    const body = /** @type {HTMLElement} */ (el.querySelector(`.pg-${almanac ? "almanac" : "tiles"}`));

    if (almanac) {
      body.innerHTML = `<dl>
        <dt>Day of year</dt><dd data-k="doy"></dd>
        <dt>Week</dt><dd data-k="wk"></dd>
        ${shown.map(p => `<dt>${p[0].toUpperCase() + p.slice(1)} done</dt><dd><span data-v="${p}"></span><div class="pg-bar"><span data-b="${p}"></span></div></dd>`).join("")}
      </dl>`;
    } else {
      body.innerHTML = shown.map(p => `<div class="pg-tile"><div class="pg-label">${p}</div><div class="pg-num" data-v="${p}"></div><div class="pg-bar"><span data-b="${p}"></span></div></div>`).join("");
    }

    ctx.every(30_000, () => {
      const pr = progress(new Date());
      for (const p of shown) {
        const pct = pr[p] * 100;
        const v = /** @type {HTMLElement | null} */ (body.querySelector(`[data-v="${p}"]`));
        const b = /** @type {HTMLElement | null} */ (body.querySelector(`[data-b="${p}"]`));
        if (v) v.textContent = `${pct.toFixed(almanac && p === "year" ? 1 : 0)}%`;
        if (b) b.style.width = `${pct}%`;
      }
      const doy = body.querySelector('[data-k="doy"]'), wk = body.querySelector('[data-k="wk"]');
      if (doy) doy.textContent = String(pr.dayOfYear);
      if (wk) wk.textContent = String(pr.isoWeek);
    });
  },
};
