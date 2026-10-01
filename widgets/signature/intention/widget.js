// @ts-check
/** One intention for the day. Optionally starts blank each new day. */

const today = () => new Date().toLocaleDateString("sv"); // YYYY-MM-DD, local time

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "intention",
  name: "Intention",
  description: "A single intention for today.",
  css: "widget.css",
  size: { w: 3, h: 2 },
  bestWith: ["zen"],
  data: { text: "", date: "" },
  settings: [
    { key: "title", label: "Title", type: "text", default: "Intention" },
    { key: "placeholder", label: "Placeholder", type: "text", default: "today, I will…" },
    { key: "daily", label: "Start blank each new day", type: "toggle", default: true },
  ],

  render(el, ctx) {
    el.innerHTML = `<h3 class="int-title"></h3><textarea class="int-text" rows="2" spellcheck="false"></textarea>`;
    /** @type {HTMLElement} */ (el.querySelector(".int-title")).textContent = ctx.settings.title;
    const ta = /** @type {HTMLTextAreaElement} */ (el.querySelector("textarea"));
    ta.placeholder = ctx.settings.placeholder;

    ctx.data.watch(d => {
      const value = ctx.settings.daily && d.date !== today() ? "" : d.text;
      if (value !== ta.value) ta.value = value;
    });

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let t;
    ctx.listen(ta, "input", () => {
      clearTimeout(t);
      t = setTimeout(() => ctx.data.set({ text: ta.value, date: today() }), 300);
    });
    ctx.cleanup(() => clearTimeout(t));
  },
};
