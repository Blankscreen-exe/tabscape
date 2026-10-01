// @ts-check
/** "Feeling lucky?" — roll a die, get a random site from your list. */
import { esc } from "../../../core/dom.js";

const DEFAULT_SITES = [
  "Wikipedia: random article | https://en.wikipedia.org/wiki/Special:Random",
  "Radio Garden | https://radio.garden",
  "Window Swap | https://www.window-swap.com",
  "Neal.fun | https://neal.fun",
  "The Useless Web | https://theuselessweb.com",
  "Hacker News | https://news.ycombinator.com",
].join("\n");

/** @param {string} text */
function parse(text) {
  return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const [name, url] = line.includes("|") ? line.split("|").map(p => p.trim()) : [line, line];
    return { name, url: /^[a-z]+:\/\//i.test(url) ? url : `https://${url}` };
  });
}

const FACES = "⚀⚁⚂⚃⚄⚅";

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "dice",
  name: "Feeling Lucky",
  description: "Roll a die to get a random site from your list.",
  css: "widget.css",
  size: { w: 3, h: 4 },
  bestWith: ["anti-design"],
  settings: [
    { key: "title", label: "Title", type: "text", default: "feeling lucky?" },
    { key: "sites", label: "Sites (Name | url, one per line)", type: "textarea", default: DEFAULT_SITES },
  ],

  render(el, ctx) {
    const sites = parse(ctx.settings.sites);
    el.innerHTML = `
      <h3 class="dice-title"></h3>
      <button class="dice-die" aria-label="Roll the die">?</button>
      <p class="dice-out" aria-live="polite">click the die → random site</p>`;
    /** @type {HTMLElement} */ (el.querySelector(".dice-title")).textContent = ctx.settings.title;
    const die = /** @type {HTMLElement} */ (el.querySelector(".dice-die"));
    const out = /** @type {HTMLElement} */ (el.querySelector(".dice-out"));

    ctx.listen(die, "click", () => {
      if (!sites.length) { out.textContent = "add some sites in the settings"; return; }
      const pick = Math.floor(Math.random() * sites.length);
      die.classList.remove("roll");
      void die.offsetWidth; // restart the animation
      die.classList.add("roll");
      die.textContent = FACES[pick % 6];
      out.innerHTML = `you rolled ${pick % 6 + 1} → <a href="${esc(sites[pick].url)}">${esc(sites[pick].name)}</a>`;
    });
  },
};
