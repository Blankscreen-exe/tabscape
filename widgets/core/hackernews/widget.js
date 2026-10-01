// @ts-check
/**
 * Hacker News: today's top stories (or front page / newest / Ask HN / Show HN).
 * One request per list (providers/news/hackernews.js), cached 15 minutes in shared data,
 * so most new tabs show instantly and it still works offline with the last list.
 */
import { esc } from "../../../core/dom.js";
import { safeWebUrl } from "../../../core/url.js";
import { ATTRIBUTION, FEEDS, fetchStories } from "../../../providers/news/hackernews.js";

export const CACHE_MS = 15 * 60_000;

/** "5m", "3h", "2d" @param {number} at ms @param {number} [now] ms */
export function ago(at, now = Date.now()) {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m`;
  if (s < 86_400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86_400)}d`;
}

/**
 * @typedef {import("../../../providers/news/hackernews.js").Story} Story
 * @typedef {{ cache: Record<string, { at: number, stories: Story[] }> }} HnData   keyed by feed
 */

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "hackernews",
  name: "Hacker News",
  description: "Today's top stories from Hacker News.",
  css: "widget.css",
  size: { w: 4, h: 5 },
  data: { cache: {} },
  settings: [
    { key: "feed", label: "Stories", type: "select", default: "today",
      options: Object.entries(FEEDS).map(([value, f]) => ({ value, label: f.label })) },
    { key: "count", label: "How many", type: "select", default: "10",
      options: ["5", "10", "15", "20", "30"].map(v => ({ value: v, label: v })) },
    { key: "meta", label: "Show points, comments and age", type: "toggle", default: true },
    { key: "newTab", label: "Open stories in a new tab", type: "toggle", default: false },
  ],

  render(el, ctx) {
    const s = ctx.settings;
    const feed = s.feed in FEEDS ? s.feed : "today";
    const count = Number(s.count) || 10;
    const label = FEEDS[/** @type {keyof typeof FEEDS} */ (feed)].label;
    const target = s.newTab ? ` target="_blank" rel="noopener"` : "";
    let alive = true, busy = false, status = "";
    ctx.cleanup(() => { alive = false; });

    const entry = () => /** @type {HnData} */ (ctx.data.get()).cache?.[feed] ?? null;

    function draw() {
      const e = entry();
      const stories = (e?.stories ?? []).slice(0, count);
      el.innerHTML = `
        <div class="hn-head">
          <a class="hn-title" href="${ATTRIBUTION.url}"${target}><span class="hn-logo" aria-hidden="true">Y</span>Hacker News</a>
          <span class="hn-feed">${esc(label)}</span>
          <button class="hn-refresh" title="Refresh" aria-label="Refresh"${busy ? " disabled" : ""}>↻</button>
        </div>
        ${stories.length ? `<ol class="hn-list">${stories.map((st, i) => `
          <li>
            <span class="hn-rank">${i + 1}</span>
            <div class="hn-body">
              <a class="hn-link" href="${esc(safeWebUrl(st.url))}"${target}>${esc(st.title)}</a>${st.domain ? ` <span class="hn-domain">(${esc(st.domain)})</span>` : ""}
              ${s.meta ? `<div class="hn-meta">${st.points} points · <a href="${esc(st.commentsUrl)}"${target}>${st.comments} comments</a> · ${ago(st.at)}</div>` : ""}
            </div>
          </li>`).join("")}</ol>`
        : `<p class="hn-empty">${esc(status || "Loading stories…")}</p>`}
        ${stories.length && status ? `<p class="hn-status">${esc(status)}</p>` : ""}`;
      el.querySelector(".hn-refresh")?.addEventListener("click", () => refresh(true));
    }

    /** @param {boolean} [force] */
    async function refresh(force = false) {
      const e = entry();
      if (busy || (!force && e && Date.now() - e.at < CACHE_MS)) return;
      busy = true; status = ""; draw();
      try {
        const stories = await fetchStories(feed, 30); // always fetch 30, so changing "How many" needs no request
        if (!alive) return;
        busy = false;
        ctx.data.update(d => { d.cache = { ...d.cache, [feed]: { at: Date.now(), stories } }; });
      } catch (err) {
        busy = false;
        status = navigator.onLine ? `Couldn't load stories (${/** @type {Error} */ (err).message}).` : "Offline — showing the last stories.";
        if (alive) draw();
      }
    }

    ctx.data.watch(draw);
    refresh();
    ctx.every(CACHE_MS, () => refresh(), false);
  },
};
