// @ts-check
/**
 * Hacker News stories via the HN Search API by Algolia (https://hn.algolia.com/api).
 * Free, no key, CORS-enabled, one request per list (the official Firebase API needs one
 * request per story). Provider rule (D4): the only file that knows this service.
 * Pure + `fetchImpl` / `now` injectable for tests.
 */

export const ATTRIBUTION = { name: "Hacker News", url: "https://news.ycombinator.com/" };

/** Feed id -> query. Times are relative to `now` (seconds). */
export const FEEDS = {
  today: { label: "Top today", path: "search", tags: "story", since: 86_400 },
  front: { label: "Front page", path: "search", tags: "front_page", since: 0 },
  newest: { label: "Newest", path: "search_by_date", tags: "story", since: 0 },
  ask: { label: "Ask HN (this week)", path: "search", tags: "ask_hn", since: 7 * 86_400 },
  show: { label: "Show HN (this week)", path: "search", tags: "show_hn", since: 7 * 86_400 },
};

/**
 * @typedef {{ id: string, title: string, url: string, domain: string, points: number,
 *             comments: number, commentsUrl: string, by: string, at: number }} Story   at = unix ms
 */

/** @param {string} feed @param {number} count @param {number} [now] ms */
export function feedUrl(feed, count, now = Date.now()) {
  const f = FEEDS[/** @type {keyof typeof FEEDS} */ (feed)] ?? FEEDS.today;
  const p = new URLSearchParams({ tags: f.tags, hitsPerPage: String(Math.max(1, Math.min(50, count))) });
  if (f.since) p.set("numericFilters", `created_at_i>${Math.floor(now / 1000) - f.since}`);
  return `https://hn.algolia.com/api/v1/${f.path}?${p}`;
}

/** Algolia hits -> Story[]. Text posts (Ask HN) link to their comments page. @param {any} j @returns {Story[]} */
export function parseStories(j) {
  if (!Array.isArray(j?.hits)) throw new Error("unexpected Hacker News response");
  return j.hits.filter((/** @type {any} */ h) => h?.title && h?.objectID).map((/** @type {any} */ h) => {
    const commentsUrl = `https://news.ycombinator.com/item?id=${encodeURIComponent(h.objectID)}`;
    const url = typeof h.url === "string" && /^https?:\/\//i.test(h.url) ? h.url : commentsUrl;
    let domain = "";
    try { domain = url === commentsUrl ? "" : new URL(url).hostname.replace(/^www\./, ""); } catch { /* keep empty */ }
    return {
      id: String(h.objectID), title: String(h.title), url, domain,
      points: Number(h.points) || 0, comments: Number(h.num_comments) || 0, commentsUrl,
      by: String(h.author ?? ""), at: (Number(h.created_at_i) || 0) * 1000,
    };
  });
}

/** @param {string} feed @param {number} count @param {typeof fetch} [fetchImpl] @param {number} [now] @returns {Promise<Story[]>} */
export async function fetchStories(feed, count, fetchImpl = fetch, now = Date.now()) {
  const res = await fetchImpl(feedUrl(feed, count, now));
  if (!res.ok) throw new Error(`Hacker News search answered ${res.status}`);
  return parseStories(await res.json());
}
