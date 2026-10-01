// @ts-check
/**
 * Coordinates -> place name, via BigDataCloud's free client-side reverse geocoding
 * (https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api).
 * No API key; intended for exactly this use: naming the user's own browser location.
 *
 * Provider rule (D4): the only file that knows this service. Replaceable without touching widgets.
 * Pure + `fetchImpl` injectable for tests.
 */
import { coarse } from "../weather/open-meteo.js";

/** @typedef {{ name: string, region: string, country: string }} PlaceName */

/** @param {any} j @returns {PlaceName} */
export function parseReverse(j) {
  const name = j?.city || j?.locality || j?.principalSubdivision || "";
  const sub = j?.principalSubdivision || "";
  return { name, region: sub && sub !== name ? sub : "", country: j?.countryCode || "" };
}

/** @param {number} lat @param {number} lon @param {typeof fetch} [fetchImpl] @returns {Promise<PlaceName>} */
export async function reverseGeocode(lat, lon, fetchImpl = fetch) {
  const p = new URLSearchParams({
    latitude: String(coarse(lat)), longitude: String(coarse(lon)),
    localityLanguage: navigator?.language?.slice(0, 2) || "en",
  });
  const res = await fetchImpl(`https://api.bigdatacloud.net/data/reverse-geocode-client?${p}`);
  if (!res.ok) throw new Error(`reverse geocoding answered ${res.status}`);
  return parseReverse(await res.json());
}
