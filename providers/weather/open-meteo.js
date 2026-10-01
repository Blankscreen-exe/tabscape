// @ts-check
/**
 * Weather + place search via Open-Meteo (https://open-meteo.com).
 * Free, no API key, CORS-enabled. Data licence: CC BY 4.0 — show "Open-Meteo" attribution.
 *
 * Provider rule (D4): this is the ONLY file that knows Open-Meteo's URLs and response shapes.
 * If the service changes or disappears, replace this file and keep the exported shapes.
 * Pure + `fetchImpl` injectable, so it is unit-tested without the network.
 */

export const ATTRIBUTION = { name: "Open-Meteo", url: "https://open-meteo.com/" };

/**
 * @typedef {{ lat: number, lon: number }} Coords
 * @typedef {"celsius" | "fahrenheit"} Units
 * @typedef {{ name: string, region: string, country: string, lat: number, lon: number }} Place
 * @typedef {{ date: string, code: number, max: number, min: number }} Day
 * @typedef {{
 *   current: { temp: number, feels: number, humidity: number, wind: number, code: number, isDay: boolean },
 *   days: Day[], units: { temp: string, wind: string }, timezone: string
 * }} Forecast
 */

/** Round to 2 decimals (~1 km) so precise locations never leave the device. @param {number} n */
export const coarse = n => Math.round(n * 100) / 100;

/** @param {Coords} at @param {Units} units */
export function forecastUrl(at, units) {
  const p = new URLSearchParams({
    latitude: String(coarse(at.lat)),
    longitude: String(coarse(at.lon)),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "7",
    temperature_unit: units === "fahrenheit" ? "fahrenheit" : "celsius",
    wind_speed_unit: units === "fahrenheit" ? "mph" : "kmh",
  });
  return `https://api.open-meteo.com/v1/forecast?${p}`;
}

/** Open-Meteo JSON -> Forecast. Throws on anything unexpected. @param {any} j @returns {Forecast} */
export function parseForecast(j) {
  const c = j?.current, d = j?.daily;
  if (!c || !d || !Array.isArray(d.time)) throw new Error("unexpected weather response");
  return {
    current: {
      temp: c.temperature_2m, feels: c.apparent_temperature, humidity: c.relative_humidity_2m,
      wind: c.wind_speed_10m, code: c.weather_code, isDay: c.is_day === 1,
    },
    days: d.time.map((/** @type {string} */ date, /** @type {number} */ i) => ({
      date, code: d.weather_code[i], max: d.temperature_2m_max[i], min: d.temperature_2m_min[i],
    })),
    units: { temp: j.current_units?.temperature_2m ?? "°", wind: j.current_units?.wind_speed_10m ?? "" },
    timezone: j.timezone ?? "",
  };
}

/** @param {Coords} at @param {Units} units @param {typeof fetch} [fetchImpl] @returns {Promise<Forecast>} */
export async function fetchForecast(at, units, fetchImpl = fetch) {
  const res = await fetchImpl(forecastUrl(at, units));
  if (!res.ok) throw new Error(`weather service answered ${res.status}`);
  return parseForecast(await res.json());
}

/** Places matching a name (cities, towns…). @param {string} query @param {typeof fetch} [fetchImpl] @returns {Promise<Place[]>} */
export async function searchPlaces(query, fetchImpl = fetch) {
  const q = query.trim();
  if (q.length < 2) return [];
  const p = new URLSearchParams({ name: q, count: "8", language: navigator?.language?.slice(0, 2) || "en", format: "json" });
  const res = await fetchImpl(`https://geocoding-api.open-meteo.com/v1/search?${p}`);
  if (!res.ok) throw new Error(`place search answered ${res.status}`);
  const j = await res.json();
  return (j.results ?? []).map((/** @type {any} */ r) => ({
    name: r.name, region: r.admin1 ?? "", country: r.country_code ?? r.country ?? "",
    lat: coarse(r.latitude), lon: coarse(r.longitude),
  }));
}
