// @ts-check
/** RPG-style dialogue box: a speaker greets you by time of day with typewriter text. Click for the next line. */

/** @param {number} h hour */
function greeting(h) {
  return h < 5 ? "The night is deep, hero. Even legends must sleep."
    : h < 12 ? "A new dawn rises, hero! Your quests await."
    : h < 18 ? "The sun is high. Press on, brave one!"
    : "Dusk falls. Finish your quests before the moon rises.";
}

const TIPS = [
  "Complete quests to earn XP and GOLD.",
  "Harder quests grant more experience.",
  "Rest is also a quest. Do not forget it.",
  "Type in the spell box below to search the realm.",
];

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "oracle",
  name: "Oracle",
  description: "An RPG dialogue box with a greeting and tips.",
  css: "widget.css",
  size: { w: 6, h: 2 },
  bestWith: ["rpg-quest"],
  settings: [
    { key: "speaker", label: "Speaker name", type: "text", default: "ORACLE" },
    { key: "speed", label: "Letters per second", type: "number", default: 35 },
  ],

  render(el, ctx) {
    el.innerHTML = `<span class="oracle-speaker"></span><p class="oracle-text" aria-live="polite"></p><span class="oracle-next" aria-hidden="true">▼</span>`;
    /** @type {HTMLElement} */ (el.querySelector(".oracle-speaker")).textContent = ctx.settings.speaker;
    const text = /** @type {HTMLElement} */ (el.querySelector(".oracle-text"));
    const lines = [greeting(new Date().getHours()), ...TIPS];
    const delay = 1000 / Math.max(5, Number(ctx.settings.speed) || 35);
    let line = 0;
    /** @type {() => void} */
    let cancel = () => {};

    /** @param {string} s */
    function say(s) {
      cancel();
      let i = 0;
      text.textContent = "";
      cancel = ctx.every(delay, () => {
        text.textContent = s.slice(0, ++i);
        if (i >= s.length) cancel();
      }, false);
    }
    say(lines[0]);
    el.title = "Click for the next line";
    ctx.listen(el, "click", () => { line = (line + 1) % lines.length; say(lines[line]); });
  },
};
