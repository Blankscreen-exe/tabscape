// @ts-check
/**
 * "Feeling lucky?" — roll a die, get a random site.
 *
 * Sources:
 *   mine       your own list (setting)
 *   useless    The Useless Web's list (providers/random-sites). Fetched about weekly once the user
 *              grants host access (asked on the first roll — browsers only allow that during a click);
 *              otherwise, or offline, the bundled snapshot is used.
 * No-repeat mode works like The Useless Web's own button: every site once before any repeats.
 */
import { esc } from "../../../core/dom.js";
import { hostLabel, safeWebUrl } from "../../../core/url.js";
import { requestHostAccess } from "../../../core/platform.js";
import { ATTRIBUTION, ORIGIN, fetchSites } from "../../../providers/random-sites/theuselessweb.js";
import { SNAPSHOT } from "../../../providers/random-sites/theuselessweb-snapshot.js";

export const LIST_MAX_AGE = 7 * 864e5;
const MAX_SEEN = 1000;
const FACES = "⚀⚁⚂⚃⚄⚅";

const DEFAULT_SITES = [
  "Wikipedia: random article | https://en.wikipedia.org/wiki/Special:Random",
  "Radio Garden | https://radio.garden",
  "Window Swap | https://www.window-swap.com",
  "Neal.fun | https://neal.fun",
  "The Useless Web | https://theuselessweb.com",
  "Hacker News | https://news.ycombinator.com",
].join("\n");

/** "Name | url" per line (or a bare url). Only web links. @param {string} text */
export function parseSites(text) {
  return String(text).split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const [name, url] = line.includes("|") ? line.split("|").map(p => p.trim()) : [line, line];
    const safe = safeWebUrl(url || name);
    return { name: name && name !== url ? name : hostLabel(safe), url: safe };
  });
}

/**
 * Pick the next site. With `noRepeat`, only sites not in `seen` qualify; once all were seen, start over.
 * Returns the pick and the updated seen-list (trimmed to the current pool).
 * @template {{ url: string }} T
 * @param {T[]} pool @param {string[]} seen @param {boolean} noRepeat @param {() => number} [rand]
 * @returns {{ pick: T | null, index: number, seen: string[] }}
 */
export function pickNext(pool, seen, noRepeat, rand = Math.random) {
  if (!pool.length) return { pick: null, index: -1, seen: [] };
  const inPool = new Set(pool.map(p => p.url));
  let history = noRepeat ? seen.filter(u => inPool.has(u)) : [];
  let candidates = pool.filter(p => !history.includes(p.url));
  if (!candidates.length) { history = []; candidates = pool; }
  const pick = candidates[Math.floor(rand() * candidates.length)];
  return { pick, index: pool.indexOf(pick), seen: noRepeat ? [...history, pick.url].slice(-MAX_SEEN) : [] };
}

/**
 * @typedef {{
 *   useless: { at: number, version: string, sites: string[] } | null,   // last live list
 *   declined: boolean,                                                  // user said no to host access
 *   seen: { mine: string[], useless: string[] }
 * }} DiceData
 */

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "dice",
  name: "Feeling Lucky",
  description: "Roll a die for a random site: your own list or The Useless Web.",
  css: "widget.css",
  size: { w: 3, h: 4 },
  bestWith: ["anti-design"],
  data: { useless: null, declined: false, seen: { mine: [], useless: [] } },
  settings: [
    { key: "title", label: "Title", type: "text", default: "feeling lucky?" },
    { key: "source", label: "Sites from", type: "select", default: "mine",
      options: [{ value: "mine", label: "My list (below)" }, { value: "useless", label: "The Useless Web (theuselessweb.com)" }] },
    { key: "sites", label: "My list (Name | url, one per line)", type: "textarea", default: DEFAULT_SITES },
    { key: "noRepeat", label: "No repeats until every site was shown", type: "toggle", default: true },
    { key: "open", label: "After rolling", type: "select", default: "show",
      options: [{ value: "show", label: "Show the link" }, { value: "go", label: "Go there right away" }] },
  ],

  render(el, ctx) {
    const s = ctx.settings;
    const useless = s.source === "useless";
    const data = () => /** @type {DiceData} */ (ctx.data.get());
    let alive = true;
    ctx.cleanup(() => { alive = false; });

    el.innerHTML = `
      <h3 class="dice-title"></h3>
      <button class="dice-die" aria-label="Roll the die">?</button>
      <p class="dice-out" aria-live="polite">click the die → random site</p>
      ${useless ? `<p class="dice-src"></p>` : ""}`;
    /** @type {HTMLElement} */ (el.querySelector(".dice-title")).textContent = s.title;
    const die = /** @type {HTMLElement} */ (el.querySelector(".dice-die"));
    const out = /** @type {HTMLElement} */ (el.querySelector(".dice-out"));
    const src = /** @type {HTMLElement | null} */ (el.querySelector(".dice-src"));

    /** Current pool of sites for the selected source. */
    function pool() {
      if (!useless) return parseSites(s.sites);
      const list = data().useless?.sites ?? SNAPSHOT.sites;
      return list.map(url => ({ name: hostLabel(url), url: safeWebUrl(url) }));
    }

    /** Footer for The Useless Web: credit, which list is in use, and a way to allow the live list. */
    function drawSource() {
      if (!src) return;
      const d = data();
      const live = d.useless && Date.now() - d.useless.at < LIST_MAX_AGE * 4;
      src.innerHTML = `Sites: <a href="${ATTRIBUTION.url}">${ATTRIBUTION.name}</a> · ${pool().length} sites, ${live ? "live list" : "built-in list"}`
        + (d.declined ? ` · <button class="dice-allow">use live list</button>` : "");
      src.querySelector(".dice-allow")?.addEventListener("click", () => {
        const asked = requestHostAccess(ORIGIN); // synchronous in the click (browser rule)
        ctx.data.update(dd => { dd.declined = false; });
        refreshList(asked);
      });
    }

    /** Fetch the live list if access is granted. @param {Promise<boolean>} asked */
    async function refreshList(asked) {
      const ok = await asked;
      if (!alive) return;
      if (!ok) { ctx.data.update(d => { d.declined = true; }); return; }
      try {
        const live = await fetchSites();
        if (alive) ctx.data.update(d => { d.useless = { at: Date.now(), version: live.version, sites: live.sites }; d.declined = false; });
      } catch { /* keep the saved or built-in list */ }
    }

    function roll() {
      const key = useless ? "useless" : "mine";
      const d = data();
      const { pick, index, seen } = pickNext(pool(), d.seen?.[key] ?? [], !!s.noRepeat);
      die.classList.remove("roll");
      void die.offsetWidth; // restart the animation
      die.classList.add("roll");
      if (!pick) { out.textContent = "add some sites in the settings"; return; }
      ctx.data.update(dd => { dd.seen = { mine: [], useless: [], ...dd.seen, [key]: seen }; });
      die.textContent = FACES[index % 6];
      out.innerHTML = `you rolled ${index % 6 + 1} → <a href="${esc(pick.url)}">${esc(pick.name)}</a>`;
      if (s.open === "go") ctx.after(500, () => { location.href = pick.url; });
    }

    ctx.listen(die, "click", () => {
      // The permission prompt must start synchronously inside this click.
      const d = data();
      if (useless && !d.declined && !(d.useless && Date.now() - d.useless.at < LIST_MAX_AGE)) refreshList(requestHostAccess(ORIGIN));
      roll();
    });
    ctx.data.watch(drawSource);
  },
};
