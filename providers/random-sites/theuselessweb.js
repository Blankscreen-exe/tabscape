// @ts-check
/**
 * Random-site list from The Useless Web (https://theuselessweb.com/, curated by Tim Holman).
 *
 * There is no public API: the list is hard-coded in the site's own script (/js/uselessweb.js),
 * which sends no CORS header — so the extension needs host access to theuselessweb.com
 * (requested at runtime, only when the user picks this source). Without it, or when the
 * format changes, callers fall back to the bundled SNAPSHOT.
 *
 * Provider rule (D4): the only file that knows this source. Pure + `fetchImpl` injectable.
 * Refresh the snapshot with:  npm run update:uselessweb
 */

export const ATTRIBUTION = { name: "The Useless Web", url: "https://theuselessweb.com/" };
export const ORIGIN = "https://theuselessweb.com/*";
export const SOURCE_URL = "https://theuselessweb.com/js/uselessweb.js";
/** Fewer than this many sites means the script's format changed — don't trust the result. */
const MIN_SITES = 20;

/**
 * Pull the active (not commented-out) site URLs out of the site's script.
 * @param {string} js
 * @returns {{ version: string, sites: string[] }}
 */
export function extractSites(js) {
  const start = js.indexOf("sitesList");
  if (start < 0) throw new Error("site list not found in script");
  const open = js.indexOf("[", start), close = js.indexOf("]", open);
  if (open < 0 || close < 0) throw new Error("site list not found in script");
  const sites = js.slice(open + 1, close).split("\n")
    .map(line => line.match(/^\s*['"](https?:\/\/[^'"\s]+)['"]\s*,?\s*$/)?.[1])
    .filter(/** @returns {u is string} */ u => Boolean(u));
  const unique = [...new Set(sites)];
  if (unique.length < MIN_SITES) throw new Error(`only ${unique.length} sites found — format changed?`);
  const version = js.match(/sitelistName\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? "";
  return { version, sites: unique };
}

/** @param {typeof fetch} [fetchImpl] @returns {Promise<{ version: string, sites: string[] }>} */
export async function fetchSites(fetchImpl = fetch) {
  const res = await fetchImpl(SOURCE_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`site list answered ${res.status}`);
  return extractSites(await res.text());
}
