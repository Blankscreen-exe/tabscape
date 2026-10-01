// @ts-check
/** Countdown to the weekend, the end of the day, or any date you choose. */

/**
 * Next target time for a mode. Weekend = next Saturday 00:00 (null while it is the weekend).
 * @param {string} mode @param {string} date YYYY-MM-DD or YYYY-MM-DDTHH:MM (custom mode) @param {Date} now
 * @returns {Date | null}
 */
export function targetFor(mode, date, now) {
  if (mode === "eod") return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (mode === "custom") {
    const m = String(date).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/); // date only -> local midnight
    const t = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(date);
    return Number.isNaN(t.getTime()) ? null : t;
  }
  const dow = now.getDay();
  if (dow === 6 || dow === 0) return null;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dow));
}

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "countdown",
  name: "Countdown",
  description: "Time left until the weekend, the end of the day, or a date of your choice.",
  css: "widget.css",
  size: { w: 4, h: 2 },
  settings: [
    { key: "mode", label: "Count down to", type: "select", default: "weekend",
      options: [{ value: "weekend", label: "The weekend" }, { value: "eod", label: "End of the day" }, { value: "custom", label: "A date…" }] },
    { key: "date", label: "Date (for “A date…”), e.g. 2026-12-25", type: "text", default: "" },
    { key: "title", label: "Title (empty = automatic)", type: "text", default: "" },
  ],

  render(el, ctx) {
    const s = ctx.settings;
    const auto = { weekend: "Weekend in", eod: "Day ends in", custom: "Countdown" }[/** @type {"weekend"} */ (s.mode)] ?? "Countdown";
    el.innerHTML = `<h3 class="cd-title"></h3><div class="cd-big" role="timer"></div><small class="cd-sub"></small>`;
    /** @type {HTMLElement} */ (el.querySelector(".cd-title")).textContent = s.title || auto;
    const big = /** @type {HTMLElement} */ (el.querySelector(".cd-big"));
    const sub = /** @type {HTMLElement} */ (el.querySelector(".cd-sub"));
    const p = (/** @type {number} */ n) => String(n).padStart(2, "0");

    ctx.every(1000, () => {
      const now = new Date();
      const target = targetFor(s.mode, s.date, now);
      if (!target) {
        big.textContent = s.mode === "weekend" ? "IT'S NOW" : "—";
        sub.textContent = s.mode === "weekend" ? "Enjoy the weekend 🌴" : "Set a date in the widget settings";
        return;
      }
      const ms = target.getTime() - now.getTime();
      if (ms <= 0) { big.textContent = "NOW"; sub.textContent = target.toLocaleString(); return; }
      const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, sec = Math.floor(ms / 1000) % 60;
      big.textContent = d ? `${d}d ${p(h)}h ${p(m)}m` : `${p(h)}:${p(m)}:${p(sec)}`;
      sub.textContent = `until ${target.toLocaleString(undefined, { weekday: "long", hour: "2-digit", minute: "2-digit", ...(d > 6 ? { day: "numeric", month: "short" } : {}) })}`;
    });
  },
};
