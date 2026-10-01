// @ts-check
/** Clock + date + greeting. Stateless (no shared data). */

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "clock",
  name: "Clock",
  description: "Time, date and a greeting.",
  css: "widget.css",
  size: { w: 12, h: 2 },
  settings: [
    { key: "hour12", label: "12-hour clock", type: "toggle", default: false },
    { key: "seconds", label: "Show seconds", type: "toggle", default: false },
    { key: "date", label: "Show date", type: "toggle", default: true },
    { key: "greeting", label: "Show greeting", type: "toggle", default: true },
    { key: "name", label: "Your name (for the greeting)", type: "text", default: "" },
  ],

  render(el, ctx) {
    const s = ctx.settings;
    el.innerHTML = `<div class="clock-time"></div><div class="clock-sub"></div>`;
    const time = /** @type {HTMLElement} */ (el.querySelector(".clock-time"));
    const sub = /** @type {HTMLElement} */ (el.querySelector(".clock-sub"));

    ctx.every(1000, () => {
      const d = new Date();
      time.textContent = d.toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit", second: s.seconds ? "2-digit" : undefined, hour12: s.hour12,
      });
      const parts = [];
      if (s.greeting) {
        const h = d.getHours();
        const g = h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
        parts.push(s.name ? `${g}, ${s.name}` : g);
      }
      if (s.date) parts.push(d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }));
      sub.textContent = parts.join(" · ");
    });
  },
};
