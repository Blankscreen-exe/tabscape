// @ts-check
/**
 * Weather: current conditions + daily forecast.
 * Location: automatic (device location, named via reverse geocoding) or a place picked in the widget.
 * Data: Open-Meteo (providers/weather), cached 30 minutes in shared data so most new tabs make
 * no request and show instantly (and offline). Coordinates are rounded to ~1 km before sending.
 */
import { esc } from "../../../core/dom.js";
import { getPosition } from "../../../core/platform.js";
import { ATTRIBUTION, coarse, fetchForecast, searchPlaces } from "../../../providers/weather/open-meteo.js";
import { reverseGeocode } from "../../../providers/geocode/bigdatacloud.js";

export const CACHE_MS = 30 * 60_000;
const AUTO_RENAME_KM = 5; // re-name the automatic location only after moving this far

/**
 * @typedef {import("../../../providers/weather/open-meteo.js").Place} Place
 * @typedef {import("../../../providers/weather/open-meteo.js").Forecast} Forecast
 * @typedef {{
 *   place: Place | null,                                  // null = automatic
 *   auto: (Place & { at: number }) | null,                // last known automatic location
 *   cache: { key: string, at: number, data: Forecast } | null
 * }} WeatherData
 */

/** WMO weather code -> [label, day icon, night icon]. */
const WMO = /** @type {Record<number, [string, string, string]>} */ ({
  0: ["Clear", "☀️", "🌙"], 1: ["Mainly clear", "🌤️", "🌙"], 2: ["Partly cloudy", "⛅", "☁️"], 3: ["Overcast", "☁️", "☁️"],
  45: ["Fog", "🌫️", "🌫️"], 48: ["Freezing fog", "🌫️", "🌫️"],
  51: ["Light drizzle", "🌦️", "🌧️"], 53: ["Drizzle", "🌦️", "🌧️"], 55: ["Heavy drizzle", "🌧️", "🌧️"],
  56: ["Freezing drizzle", "🌧️", "🌧️"], 57: ["Freezing drizzle", "🌧️", "🌧️"],
  61: ["Light rain", "🌦️", "🌧️"], 63: ["Rain", "🌧️", "🌧️"], 65: ["Heavy rain", "🌧️", "🌧️"],
  66: ["Freezing rain", "🌧️", "🌧️"], 67: ["Freezing rain", "🌧️", "🌧️"],
  71: ["Light snow", "🌨️", "🌨️"], 73: ["Snow", "🌨️", "🌨️"], 75: ["Heavy snow", "❄️", "❄️"], 77: ["Snow grains", "🌨️", "🌨️"],
  80: ["Showers", "🌦️", "🌧️"], 81: ["Showers", "🌧️", "🌧️"], 82: ["Heavy showers", "⛈️", "⛈️"],
  85: ["Snow showers", "🌨️", "🌨️"], 86: ["Snow showers", "🌨️", "🌨️"],
  95: ["Thunderstorm", "⛈️", "⛈️"], 96: ["Thunderstorm, hail", "⛈️", "⛈️"], 99: ["Thunderstorm, hail", "⛈️", "⛈️"],
});

/** @param {number} code @param {boolean} [isDay] */
export function describe(code, isDay = true) {
  const w = WMO[code] ?? ["Unknown", "🌡️", "🌡️"];
  return { label: w[0], icon: isDay ? w[1] : w[2] };
}

/** Cache key for a location + units. @param {{ lat: number, lon: number }} at @param {string} units */
export const cacheKey = (at, units) => `${coarse(at.lat)},${coarse(at.lon)},${units}`;

/** Is the cache usable for this key at time `now`? @param {WeatherData["cache"]} cache @param {string} key @param {number} now */
export const isFresh = (cache, key, now) => Boolean(cache && cache.key === key && now - cache.at < CACHE_MS);

/** Rough distance in km (equirectangular; plenty for "did I move?"). @param {{lat:number,lon:number}} a @param {{lat:number,lon:number}} b */
export function distanceKm(a, b) {
  const x = (b.lon - a.lon) * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180), y = b.lat - a.lat;
  return Math.sqrt(x * x + y * y) * 111.32;
}

/** "Springfield, Illinois, US" — region skipped when it repeats the name ("Tokyo, JP"). @param {Partial<Place>} p */
export const placeLabel = p => [p.name, p.region !== p.name ? p.region : "", p.country].filter(Boolean).join(", ");

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "weather",
  name: "Weather",
  description: "Current weather and forecast for your location or any place.",
  css: "widget.css",
  size: { w: 4, h: 3 },
  data: { place: null, auto: null, cache: null },
  settings: [
    { key: "title", label: "Title", type: "text", default: "Weather" },
    { key: "units", label: "Units", type: "select", default: "celsius",
      options: [{ value: "celsius", label: "°C, km/h" }, { value: "fahrenheit", label: "°F, mph" }] },
    { key: "days", label: "Forecast days", type: "select", default: "5",
      options: [{ value: "0", label: "None" }, { value: "3", label: "3 days" }, { value: "5", label: "5 days" }, { value: "7", label: "7 days" }] },
    { key: "details", label: "Show feels-like, humidity and wind", type: "toggle", default: true },
  ],

  render(el, ctx) {
    const s = ctx.settings;
    const units = s.units === "fahrenheit" ? "fahrenheit" : "celsius";
    let alive = true;
    ctx.cleanup(() => { alive = false; });
    /** @type {string} */
    let status = "";          // transient message ("Locating…", errors)
    let picking = false;      // place picker open
    let busy = false;         // a refresh is running

    const data = () => /** @type {WeatherData} */ (ctx.data.get());
    /** The location weather is shown for, if known. */
    const target = () => data().place ?? data().auto;

    // ---------------------------------------------------------------- drawing
    function draw() {
      if (picking) return; // the picker owns the widget while open
      const d = data(), t = target();
      const fc = t && d.cache?.key === cacheKey(t, units) ? d.cache.data : null;
      const days = Math.min(Number(s.days) || 0, fc?.days.length ?? 0);
      const now = fc ? describe(fc.current.code, fc.current.isDay) : null;
      const r = (/** @type {number} */ n) => Math.round(n);
      el.innerHTML = `
        <div class="wx-head">
          <h3 class="wx-title">${esc(s.title)}</h3>
          <button class="wx-place" title="Change location">${d.place ? "" : "📍 "}${esc(t ? t.name || "Your location" : "Choose a place")} <span aria-hidden="true">▾</span></button>
        </div>
        ${fc && now ? `
          <div class="wx-now">
            <span class="wx-icon" aria-hidden="true">${now.icon}</span>
            <div><div class="wx-temp">${r(fc.current.temp)}${esc(fc.units.temp)}</div><div class="wx-label">${esc(now.label)}</div></div>
          </div>
          ${s.details ? `<div class="wx-details">
            <span>Feels ${r(fc.current.feels)}°</span><span>💧 ${r(fc.current.humidity)}%</span><span>💨 ${r(fc.current.wind)} ${esc(fc.units.wind)}</span>
          </div>` : ""}
          ${days ? `<div class="wx-days">${fc.days.slice(0, days).map((day, i) => {
            const w = describe(day.code);
            const name = i === 0 ? "Today" : new Date(`${day.date}T12:00`).toLocaleDateString(undefined, { weekday: "short" });
            return `<div class="wx-day" title="${esc(w.label)}"><span>${esc(name)}</span><span aria-hidden="true">${w.icon}</span><b>${r(day.max)}°</b><small>${r(day.min)}°</small></div>`;
          }).join("")}</div>` : ""}`
        : `<p class="wx-empty">${esc(status || (t ? "Loading weather…" : "Locating…"))}</p>`}
        <div class="wx-foot">
          <span class="wx-status">${fc && status ? esc(status) : ""}</span>
          <a href="${ATTRIBUTION.url}" class="wx-credit">Weather: ${ATTRIBUTION.name}</a>
        </div>`;
      el.querySelector(".wx-place")?.addEventListener("click", openPicker);
    }

    // ---------------------------------------------------------------- data flow
    /** Resolve the automatic location (device position → name), updating shared data. */
    async function locate() {
      const prev = data().auto;
      const pos = await getPosition();
      const at = { lat: coarse(pos.lat), lon: coarse(pos.lon) };
      if (prev && distanceKm(prev, at) < AUTO_RENAME_KM && prev.name) {
        if (Date.now() - prev.at > 6 * 3600_000) ctx.data.update(d => { d.auto = { ...prev, ...at, at: Date.now() }; });
        return;
      }
      let name = { name: "", region: "", country: "" };
      try { name = await reverseGeocode(at.lat, at.lon); } catch { /* unnamed location still works */ }
      if (!alive) return;
      ctx.data.update(d => { d.auto = { ...name, ...at, at: Date.now() }; });
    }

    /** Fetch the forecast for the current target unless the cache is fresh. @param {boolean} [force] */
    async function refresh(force = false) {
      if (busy) return;
      busy = true;
      try {
        if (!data().place) {
          try { await locate(); }
          catch (err) {
            if (!data().auto) { status = `${/** @type {Error} */ (err).message} — choose a place instead.`; draw(); return; }
          }
        }
        const t = target();
        if (!t || !alive) return;
        const key = cacheKey(t, units);
        if (!force && isFresh(data().cache, key, Date.now())) return;
        status = data().cache?.key === key ? "Updating…" : "";
        draw();
        const fc = await fetchForecast(t, units);
        if (!alive) return;
        status = "";
        ctx.data.update(d => { d.cache = { key, at: Date.now(), data: fc }; });
      } catch (err) {
        status = navigator.onLine ? `Couldn't load weather (${/** @type {Error} */ (err).message}).` : "Offline — showing the last weather.";
        if (alive) draw();
      } finally { busy = false; }
    }

    // ---------------------------------------------------------------- place picker
    function openPicker() {
      picking = true;
      el.innerHTML = `
        <div class="wx-head"><h3 class="wx-title">Choose a place</h3></div>
        <input class="wx-search" placeholder="Search a city or town…" autocomplete="off" aria-label="Search a place">
        <ul class="wx-results" role="listbox"></ul>
        <div class="wx-picker-actions">
          <button class="wx-auto">📍 Use my location</button>
          <button class="wx-cancel">Cancel</button>
        </div>`;
      const input = /** @type {HTMLInputElement} */ (el.querySelector(".wx-search"));
      const list = /** @type {HTMLElement} */ (el.querySelector(".wx-results"));
      /** @type {Place[]} */
      let results = [];
      /** @type {ReturnType<typeof setTimeout> | undefined} */
      let t;
      input.focus();
      const close = () => { picking = false; clearTimeout(t); draw(); };

      input.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(async () => {
          const q = input.value;
          if (q.trim().length < 2) { list.innerHTML = ""; return; }
          list.innerHTML = `<li class="wx-hint">Searching…</li>`;
          try { results = await searchPlaces(q); }
          catch { list.innerHTML = `<li class="wx-hint">Search failed — check your connection.</li>`; return; }
          if (!alive || input.value !== q) return;
          list.innerHTML = results.length
            ? results.map((p, i) => `<li><button data-i="${i}" role="option">${esc(placeLabel(p))}</button></li>`).join("")
            : `<li class="wx-hint">No places found.</li>`;
        }, 350);
      });
      list.addEventListener("click", e => {
        const b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("button[data-i]"));
        if (!b) return;
        const place = results[Number(b.dataset.i)];
        picking = false;
        ctx.data.update(d => { d.place = place; });
        refresh();
      });
      el.querySelector(".wx-auto")?.addEventListener("click", () => {
        picking = false;
        ctx.data.update(d => { d.place = null; });
        refresh();
      });
      el.querySelector(".wx-cancel")?.addEventListener("click", close);
      input.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); close(); } });
    }

    ctx.data.watch(draw);
    refresh();
    ctx.every(CACHE_MS, () => refresh(), false);
  },
};
