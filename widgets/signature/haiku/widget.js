// @ts-check
/** A haiku by a classical Japanese master (short English renderings), one per day or per tab. */

/** [lines, poet] — add more here. */
const HAIKU = [
  [["An old silent pond", "a frog jumps into the pond—", "splash! Silence again."], "Bashō"],
  [["Over the wintry", "forest, winds howl in rage", "with no leaves to blow."], "Sōseki"],
  [["Light of the moon", "moves west, flowers' shadows", "creep eastward."], "Buson"],
  [["Everything I touch", "with tenderness, alas,", "pricks like a bramble."], "Issa"],
  [["The light of a candle", "is transferred to another candle—", "spring twilight."], "Buson"],
  [["A world of dew,", "and within every dewdrop", "a world of struggle."], "Issa"],
];

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "haiku",
  name: "Haiku",
  description: "A haiku by Bashō, Buson, Issa or Sōseki.",
  css: "widget.css",
  size: { w: 3, h: 2 },
  bestWith: ["zen"],
  settings: [
    { key: "title", label: "Title", type: "text", default: "Haiku" },
    { key: "change", label: "New haiku", type: "select", default: "daily",
      options: [{ value: "daily", label: "Every day" }, { value: "tab", label: "Every new tab" }] },
  ],

  render(el, ctx) {
    const day = Math.floor(Date.now() / 864e5);
    const index = ctx.settings.change === "tab" ? Math.floor(Math.random() * HAIKU.length) : day % HAIKU.length;
    const [lines, poet] = HAIKU[index];
    el.innerHTML = `<h3 class="haiku-title"></h3><p class="haiku-text"></p><p class="haiku-poet"></p>`;
    /** @type {HTMLElement} */ (el.querySelector(".haiku-title")).textContent = ctx.settings.title;
    const text = /** @type {HTMLElement} */ (el.querySelector(".haiku-text"));
    for (const [i, line] of /** @type {string[]} */ (lines).entries()) {
      if (i) text.append(document.createElement("br"));
      text.append(line);
    }
    /** @type {HTMLElement} */ (el.querySelector(".haiku-poet")).textContent = `— ${poet}`;
  },
};
