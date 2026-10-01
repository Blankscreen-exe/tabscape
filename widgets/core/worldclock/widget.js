// @ts-check
/** Times in other cities. Zones are IANA names (e.g. Europe/London); invalid ones are shown as such. */

const DEFAULT_ZONES = ["London | Europe/London", "New York | America/New_York", "Tokyo | Asia/Tokyo", "Dubai | Asia/Dubai", "Sydney | Australia/Sydney"].join("\n");

/** "City | Area/Zone" per line. @param {string} text */
export function parseZones(text) {
  return text.split("\n").map(l => l.split("|").map(p => p.trim())).filter(p => p[0]).map(([city, tz]) => {
    const zone = tz || city;
    let valid = true;
    try { new Intl.DateTimeFormat(undefined, { timeZone: zone }); } catch { valid = false; }
    return { city, zone, valid };
  });
}

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "worldclock",
  name: "World Clocks",
  description: "The time in other cities.",
  css: "widget.css",
  size: { w: 4, h: 4 },
  settings: [
    { key: "title", label: "Title", type: "text", default: "World" },
    { key: "zones", label: "Cities (City | Area/Zone, one per line)", type: "textarea", default: DEFAULT_ZONES },
    { key: "hour12", label: "12-hour clock", type: "toggle", default: false },
  ],

  render(el, ctx) {
    const zones = parseZones(ctx.settings.zones);
    el.innerHTML = `<h3 class="wc-title"></h3><dl class="wc-list"></dl>`;
    /** @type {HTMLElement} */ (el.querySelector(".wc-title")).textContent = ctx.settings.title;
    const list = /** @type {HTMLElement} */ (el.querySelector(".wc-list"));
    list.innerHTML = zones.map((z, i) => `<dt><span class="wc-city"></span><small data-i="${i}" class="wc-day"></small></dt><dd data-i="${i}" class="wc-time"></dd>`).join("");
    list.querySelectorAll(".wc-city").forEach((n, i) => { n.textContent = zones[i].city; });

    ctx.every(1000, () => {
      const now = new Date();
      zones.forEach((z, i) => {
        const time = /** @type {HTMLElement} */ (list.querySelector(`.wc-time[data-i="${i}"]`));
        const day = /** @type {HTMLElement} */ (list.querySelector(`.wc-day[data-i="${i}"]`));
        if (!z.valid) { time.textContent = "?"; day.textContent = `unknown zone "${z.zone}"`; return; }
        time.textContent = now.toLocaleTimeString([], { timeZone: z.zone, hour: "2-digit", minute: "2-digit", hour12: !!ctx.settings.hour12 });
        day.textContent = now.toLocaleDateString(undefined, { timeZone: z.zone, weekday: "short" });
      });
    });
  },
};
