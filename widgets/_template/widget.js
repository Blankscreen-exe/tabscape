// @ts-check
/**
 * WIDGET TEMPLATE — copy this folder to widgets/core/<id>/ or widgets/signature/<id>/ and:
 *   1. set `id` (kebab-case, same as the folder name), `name`, `size`
 *   2. declare `settings` (the settings dialog is generated from them)
 *   3. declare default shared `data` if the widget stores anything
 *   4. add { "id": "<id>", "path": "widgets/.../<id>/widget.js" } to registry.json
 *   5. fix the relative "../" depth of the core imports below (one extra "../" inside widgets/core|signature/)
 *   6. run `npm run check` and look at dev/gallery.html
 *
 * Rules:
 *  - import only from core/ (never from a theme or another widget)
 *  - no side effects at import time
 *  - style only with tokens (var(--accent) etc.), never hard-coded colours
 *  - use ctx.every/after/listen/loop/on — they are cleaned up automatically
 *  - "data down, events up": change data with ctx.data.update(), redraw in ctx.data.watch()
 *  - announce meaningful actions with ctx.emit(ctx.events.X) so themes can react (add names to core/events.js)
 */

/** @type {import("../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "template",
  name: "Template",
  description: "One sentence shown in the add-widget list.",
  css: "widget.css",
  size: { w: 4, h: 2 },
  // bestWith: ["zen"],                 // shown as "best with zen" in the picker
  // variants: ["default", "fancy"],    // variant names themes may request
  data: { count: 0 },
  settings: [
    { key: "title", label: "Title", type: "text", default: "Template" },
  ],

  render(el, ctx) {
    el.innerHTML = `<h3 class="tpl-title"></h3><button class="tpl-btn"></button>`;
    /** @type {HTMLElement} */ (el.querySelector(".tpl-title")).textContent = ctx.settings.title;
    const btn = /** @type {HTMLElement} */ (el.querySelector(".tpl-btn"));

    ctx.listen(btn, "click", () => ctx.data.update(d => { d.count++; }));
    ctx.data.watch(d => { btn.textContent = `Clicked ${d.count} times`; });
  },
};
