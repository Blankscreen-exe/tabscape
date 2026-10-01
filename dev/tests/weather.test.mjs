// Weather widget helpers + providers, with a fake fetch (no network).
import { test } from "node:test";
import assert from "node:assert/strict";
import { coarse, fetchForecast, forecastUrl, parseForecast, searchPlaces } from "../../providers/weather/open-meteo.js";
import { parseReverse, reverseGeocode } from "../../providers/geocode/bigdatacloud.js";
import { cacheKey, describe, distanceKm, isFresh, placeLabel, CACHE_MS } from "../../widgets/core/weather/widget.js";

/** Fake fetch that records URLs and answers with `body`. */
function fakeFetch(body, status = 200) {
  const calls = [];
  const fn = async url => { calls.push(String(url)); return { ok: status < 400, status, json: async () => body }; };
  fn.calls = calls;
  return fn;
}

const SAMPLE = {
  timezone: "Europe/London",
  current_units: { temperature_2m: "°C", wind_speed_10m: "km/h" },
  current: { temperature_2m: 18.7, apparent_temperature: 16.2, relative_humidity_2m: 51, wind_speed_10m: 13.7, weather_code: 1, is_day: 0 },
  daily: { time: ["2026-10-01", "2026-10-02"], weather_code: [51, 3], temperature_2m_max: [20.8, 20], temperature_2m_min: [14, 13.9] },
};

test("coordinates are rounded to ~1 km before leaving the device", () => {
  assert.equal(coarse(51.507351), 51.51);
  const url = forecastUrl({ lat: 51.507351, lon: -0.127758 }, "celsius");
  assert.match(url, /latitude=51\.51&longitude=-0\.13/);
  assert.doesNotMatch(url, /51\.5073/);
});

test("units switch both temperature and wind", () => {
  assert.match(forecastUrl({ lat: 1, lon: 1 }, "fahrenheit"), /temperature_unit=fahrenheit.*wind_speed_unit=mph/);
  assert.match(forecastUrl({ lat: 1, lon: 1 }, "celsius"), /temperature_unit=celsius.*wind_speed_unit=kmh/);
});

test("forecast response is parsed into the provider's stable shape", async () => {
  const f = fakeFetch(SAMPLE);
  const fc = await fetchForecast({ lat: 51.5, lon: -0.13 }, "celsius", f);
  assert.equal(f.calls.length, 1);
  assert.deepEqual(fc.current, { temp: 18.7, feels: 16.2, humidity: 51, wind: 13.7, code: 1, isDay: false });
  assert.deepEqual(fc.days[1], { date: "2026-10-02", code: 3, max: 20, min: 13.9 });
  assert.equal(fc.units.temp, "°C");
  assert.throws(() => parseForecast({ nope: true }), /unexpected/);
  await assert.rejects(fetchForecast({ lat: 1, lon: 1 }, "celsius", fakeFetch({}, 503)), /503/);
});

test("place search: results mapped, short queries skip the network", async () => {
  const f = fakeFetch({ results: [{ name: "Springfield", admin1: "Illinois", country_code: "US", latitude: 39.80172, longitude: -89.64371 }] });
  assert.deepEqual(await searchPlaces("S", f), []);
  assert.equal(f.calls.length, 0);
  const places = await searchPlaces("Springfield", f);
  assert.deepEqual(places, [{ name: "Springfield", region: "Illinois", country: "US", lat: 39.8, lon: -89.64 }]);
  assert.deepEqual(await searchPlaces("Nowhere", fakeFetch({})), []);
});

test("reverse geocoding: city name, region only when different, rounded request", async () => {
  assert.deepEqual(parseReverse({ city: "London", principalSubdivision: "England", countryCode: "GB" }), { name: "London", region: "England", country: "GB" });
  assert.deepEqual(parseReverse({ city: "", locality: "", principalSubdivision: "Bavaria", countryCode: "DE" }), { name: "Bavaria", region: "", country: "DE" });
  const f = fakeFetch({ city: "Paris", countryCode: "FR" });
  await reverseGeocode(48.856613, 2.352222, f);
  assert.match(f.calls[0], /latitude=48\.86&longitude=2\.35/);
});

test("weather helpers: icons, cache freshness, distance, labels", () => {
  assert.deepEqual(describe(0, true), { label: "Clear", icon: "☀️" });
  assert.equal(describe(0, false).icon, "🌙");
  assert.equal(describe(1234).label, "Unknown");
  const key = cacheKey({ lat: 51.507, lon: -0.128 }, "celsius");
  assert.equal(key, "51.51,-0.13,celsius");
  assert.equal(isFresh({ key, at: 1000, data: {} }, key, 1000 + CACHE_MS - 1), true);
  assert.equal(isFresh({ key, at: 1000, data: {} }, key, 1000 + CACHE_MS + 1), false);
  assert.equal(isFresh({ key, at: 1000, data: {} }, "other", 1001), false);
  assert.equal(isFresh(null, key, 0), false);
  assert.ok(Math.abs(distanceKm({ lat: 51.5, lon: -0.13 }, { lat: 48.86, lon: 2.35 }) - 343) < 15); // London–Paris
  assert.equal(placeLabel({ name: "Springfield", region: "Illinois", country: "US" }), "Springfield, Illinois, US");
  assert.equal(placeLabel({ name: "Monaco", region: "", country: "MC" }), "Monaco, MC");
  assert.equal(placeLabel({ name: "Tokyo", region: "Tokyo", country: "JP" }), "Tokyo, JP");
});
