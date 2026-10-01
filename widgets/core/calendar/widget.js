// @ts-check
/** Month calendar with today highlighted. Arrows browse months; clicking the title returns to today. */

/** Weeks of a month as arrays of { day, month: -1 | 0 | 1 } (previous / this / next). @param {number} y @param {number} m @param {boolean} mondayFirst */
export function monthGrid(y, m, mondayFirst = true) {
  const first = new Date(y, m, 1).getDay();
  const lead = mondayFirst ? (first + 6) % 7 : first;
  const days = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  /** @type {{ day: number, month: -1 | 0 | 1 }[]} */
  const cells = [];
  for (let i = lead - 1; i >= 0; i--) cells.push({ day: prevDays - i, month: -1 });
  for (let d = 1; d <= days; d++) cells.push({ day: d, month: 0 });
  for (let d = 1; cells.length % 7; d++) cells.push({ day: d, month: 1 });
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "calendar",
  name: "Calendar",
  description: "This month at a glance.",
  css: "widget.css",
  size: { w: 3, h: 4 },
  settings: [
    { key: "mondayFirst", label: "Weeks start on Monday", type: "toggle", default: true },
  ],

  render(el, ctx) {
    const mondayFirst = !!ctx.settings.mondayFirst;
    let offset = 0; // months from the current one

    function draw() {
      const now = new Date();
      const view = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const names = Array.from({ length: 7 }, (_, i) =>
        new Date(2024, 0, (mondayFirst ? 1 : 7) + i).toLocaleDateString(undefined, { weekday: "narrow" }));
      const isThisMonth = view.getFullYear() === now.getFullYear() && view.getMonth() === now.getMonth();
      el.innerHTML = `
        <div class="cal-head">
          <button class="cal-nav" data-d="-1" aria-label="Previous month">‹</button>
          <button class="cal-month" title="Back to today">${view.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</button>
          <button class="cal-nav" data-d="1" aria-label="Next month">›</button>
        </div>
        <table class="cal-table">
          <tr>${names.map(n => `<th>${n}</th>`).join("")}</tr>
          ${monthGrid(view.getFullYear(), view.getMonth(), mondayFirst).map(w => `<tr>${w.map(c =>
            `<td class="${c.month ? "other" : ""}${isThisMonth && !c.month && c.day === now.getDate() ? " today" : ""}"><span>${c.day}</span></td>`).join("")}</tr>`).join("")}
        </table>`;
    }

    ctx.listen(el, "click", e => {
      const t = /** @type {HTMLElement} */ (e.target);
      const nav = /** @type {HTMLElement | null} */ (t.closest(".cal-nav"));
      if (nav) { offset += Number(nav.dataset.d); draw(); }
      else if (t.closest(".cal-month")) { offset = 0; draw(); }
    });
    draw();
    ctx.every(60 * 60_000, () => { if (offset === 0) draw(); }, false); // roll over at midnight-ish
  },
};
