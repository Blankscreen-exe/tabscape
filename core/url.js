// @ts-check
/** URL safety helpers shared by widgets that turn user text into links. Pure (Node-testable). */

/**
 * Only web links: http(s) URLs pass unchanged; anything else (javascript:, data:, bare host names)
 * becomes an https:// address, so a user-entered link can never run code when clicked.
 * @param {string} url
 */
export function safeWebUrl(url) {
  const u = String(url ?? "").trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u.replace(/^[a-z][a-z0-9+.-]*:\/*/i, "")}`;
}

/** "puginarug.com" from "https://www.puginarug.com/x" (falls back to the input). @param {string} url */
export function hostLabel(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
