// @ts-check
/** Free-text notes, autosaved. Shared across themes. */

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "notes",
  name: "Notes",
  description: "A notepad that saves as you type.",
  css: "widget.css",
  size: { w: 4, h: 4 },
  data: { text: "" },
  settings: [
    { key: "title", label: "Title", type: "text", default: "Notes" },
    { key: "mono", label: "Monospace font", type: "toggle", default: false },
  ],

  render(el, ctx) {
    el.innerHTML = `<h3 class="notes-title"></h3><textarea class="notes-text" spellcheck="false" placeholder="Write something…"></textarea>`;
    /** @type {HTMLElement} */ (el.querySelector(".notes-title")).textContent = ctx.settings.title;
    const ta = /** @type {HTMLTextAreaElement} */ (el.querySelector("textarea"));
    ta.classList.toggle("mono", !!ctx.settings.mono);

    // Only overwrite the textarea when the change came from elsewhere (keeps the caret stable while typing).
    ctx.data.watch(data => { if (data.text !== ta.value) ta.value = data.text; });

    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let t;
    ctx.listen(ta, "input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        ctx.data.set({ text: ta.value });
        ctx.emit(ctx.events.NOTE_EDITED, { length: ta.value.length });
      }, 300);
    });
    ctx.cleanup(() => { clearTimeout(t); if (ta.value !== ctx.data.get().text) ctx.data.set({ text: ta.value }); });
  },
};
