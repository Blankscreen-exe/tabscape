// @ts-check
/**
 * To-do list. Data is shared by every theme; themes can restyle it through variants
 * (e.g. RPG "quest-log") and react to its events (TODO_COMPLETED -> XP, etc.).
 *
 * Pattern used here ("data down, events up"): user actions only change data;
 * ctx.data.watch() redraws. That keeps several instances / tabs in sync for free.
 */
import { esc } from "../../../core/dom.js";

/** @typedef {{ id: string, text: string, done: boolean, created: number, doneAt?: number }} Item */

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "todo",
  name: "To-do",
  description: "A simple task list.",
  css: "widget.css",
  size: { w: 4, h: 4 },
  variants: ["default"],
  data: { items: [] },
  settings: [
    { key: "title", label: "Title", type: "text", default: "To-do" },
    { key: "hideDone", label: "Hide completed tasks", type: "toggle", default: false },
    { key: "placeholder", label: "Input placeholder", type: "text", default: "Add a task…" },
  ],

  render(el, ctx) {
    const s = ctx.settings;
    el.innerHTML = `
      <h3 class="todo-title"></h3>
      <form class="todo-form"><input class="todo-input" autocomplete="off"><button class="todo-add" aria-label="Add">+</button></form>
      <ul class="todo-list"></ul>
      <p class="todo-empty">Nothing to do.</p>`;
    /** @type {HTMLElement} */ (el.querySelector(".todo-title")).textContent = s.title;
    const input = /** @type {HTMLInputElement} */ (el.querySelector(".todo-input"));
    const list = /** @type {HTMLElement} */ (el.querySelector(".todo-list"));
    const empty = /** @type {HTMLElement} */ (el.querySelector(".todo-empty"));
    input.placeholder = s.placeholder;

    ctx.listen(/** @type {HTMLElement} */ (el.querySelector("form")), "submit", e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      /** @type {Item} */
      const item = { id: Math.random().toString(36).slice(2, 10), text, done: false, created: Date.now() };
      ctx.data.update(d => { d.items.push(item); });
      ctx.emit(ctx.events.TODO_ADDED, { item });
      input.value = "";
    });

    ctx.listen(list, "click", e => {
      const target = /** @type {HTMLElement} */ (e.target);
      const li = target.closest("li");
      if (!li) return;
      const id = li.dataset.id;
      /** @type {Item | undefined} */
      let item;
      if (target.closest(".todo-del")) {
        ctx.data.update(d => { const i = d.items.findIndex((/** @type {Item} */ x) => x.id === id); item = d.items[i]; d.items.splice(i, 1); });
        if (item) ctx.emit(ctx.events.TODO_REMOVED, { item });
      } else if (target.closest(".todo-check, .todo-text")) {
        ctx.data.update(d => {
          item = d.items.find((/** @type {Item} */ x) => x.id === id);
          if (!item) return;
          item.done = !item.done;
          item.doneAt = item.done ? Date.now() : undefined;
        });
        if (item) ctx.emit(item.done ? ctx.events.TODO_COMPLETED : ctx.events.TODO_UNCOMPLETED, { item });
      }
    });

    ctx.data.watch(data => {
      /** @type {Item[]} */
      const items = data.items.filter((/** @type {Item} */ i) => !(s.hideDone && i.done));
      list.innerHTML = items.map(i => `
        <li data-id="${esc(i.id)}" class="${i.done ? "done" : ""}">
          <button class="todo-check" aria-label="${i.done ? "Mark as not done" : "Mark as done"}"></button>
          <span class="todo-text">${esc(i.text)}</span>
          <button class="todo-del" aria-label="Delete">✕</button>
        </li>`).join("");
      empty.hidden = items.length > 0;
    });
  },
};
