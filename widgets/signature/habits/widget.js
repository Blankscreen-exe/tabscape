// @ts-check
/** Weekly habit tracker: tick each habit per day. Weeks start on Monday; the last 12 weeks are kept. */

const KEEP_WEEKS = 12;

/** Local YYYY-MM-DD of the Monday of the week containing `d`. @param {Date} d */
export function weekKey(d) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return m.toLocaleDateString("sv");
}

/** @typedef {{ weeks: Record<string, Record<string, boolean>> }} HabitData  marks keyed by "habit text|dayIndex" */

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "habits",
  name: "Habit Tracker",
  description: "Tick off habits for each day of the week.",
  css: "widget.css",
  size: { w: 12, h: 3 },
  bestWith: ["neo-brutal"],
  data: { weeks: {} },
  settings: [
    { key: "title", label: "Title", type: "text", default: "Habit tracker · this week" },
    { key: "habits", label: "Habits (one per line)", type: "textarea", default: "Water 💧\nMove 🏃\nRead 📖\nNo doomscroll 📵" },
  ],

  render(el, ctx) {
    const habits = String(ctx.settings.habits).split("\n").map(h => h.trim()).filter(Boolean);
    const days = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(undefined, { weekday: "short" }));
    el.innerHTML = `<h3 class="hb-title"></h3><table class="hb-table"></table>`;
    /** @type {HTMLElement} */ (el.querySelector(".hb-title")).textContent = ctx.settings.title;
    const table = /** @type {HTMLElement} */ (el.querySelector("table"));

    ctx.data.watch((/** @type {HabitData} */ d) => {
      const now = new Date(), wk = weekKey(now), today = (now.getDay() + 6) % 7;
      const marks = d.weeks[wk] ?? {};
      table.innerHTML = `<tr><th></th>${days.map(n => `<th>${n}</th>`).join("")}</tr>` + habits.map((h, hi) => `<tr><td class="hb-name"></td>${days.map((_, di) =>
        `<td><button class="hb-cell${marks[`${h}|${di}`] ? " on" : ""}${di === today ? " today" : ""}" data-h="${hi}" data-d="${di}" aria-pressed="${!!marks[`${h}|${di}`]}" aria-label="${days[di]}">${marks[`${h}|${di}`] ? "✓" : ""}</button></td>`).join("")}</tr>`).join("");
      table.querySelectorAll(".hb-name").forEach((n, i) => { n.textContent = habits[i]; });
    });

    ctx.listen(table, "click", e => {
      const b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest(".hb-cell"));
      if (!b) return;
      const key = `${habits[Number(b.dataset.h)]}|${b.dataset.d}`, wk = weekKey(new Date());
      ctx.data.update((/** @type {HabitData} */ d) => {
        d.weeks[wk] ??= {};
        if (d.weeks[wk][key]) delete d.weeks[wk][key]; else d.weeks[wk][key] = true;
        for (const old of Object.keys(d.weeks).sort().slice(0, -KEEP_WEEKS)) delete d.weeks[old];
      });
    });
  },
};
