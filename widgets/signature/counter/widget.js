// @ts-check
/** Retro "you are visitor number…" counter that counts your new tabs. */

// Count once per page load, even with several counter widgets or theme switches.
// (Module state is fine here: it is per page and set only inside render, not at import.)
let countedThisPage = false;

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "counter",
  name: "Tab Counter",
  description: "A retro visitor counter that counts your new tabs.",
  css: "widget.css",
  size: { w: 3, h: 2 },
  bestWith: ["raw-html"],
  data: { count: 0, since: "" },
  settings: [
    { key: "label", label: "Label", type: "text", default: "You are new tab number" },
    { key: "digits", label: "Digits", type: "number", default: 6 },
  ],

  render(el, ctx) {
    if (!countedThisPage) {
      countedThisPage = true;
      ctx.data.update(d => { d.count++; d.since ||= new Date().toLocaleDateString("sv"); });
    }
    el.innerHTML = `<p class="ctr-label"></p><span class="ctr-lcd"></span><small class="ctr-since"></small>`;
    /** @type {HTMLElement} */ (el.querySelector(".ctr-label")).textContent = ctx.settings.label;
    ctx.data.watch(d => {
      /** @type {HTMLElement} */ (el.querySelector(".ctr-lcd")).textContent = String(d.count).padStart(Math.max(1, Number(ctx.settings.digits) || 6), "0");
      /** @type {HTMLElement} */ (el.querySelector(".ctr-since")).textContent = d.since ? `since ${d.since}` : "";
    });
  },
};
