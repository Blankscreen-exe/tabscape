// @ts-check
/**
 * To-do list. Data is shared by every theme; themes can restyle it through variants
 * and react to its events (TODO_COMPLETED -> XP, shooting stars, etc.).
 *
 * Variants:
 *   default    plain task list
 *   quest-log  RPG wording + a difficulty per task, stored as the optional `item.xp`
 *              (other variants ignore it; the hero widget reads it from TODO_COMPLETED)
 *
 * Pattern used here ("data down, events up"): user actions only change data;
 * ctx.data.watch() redraws. That keeps several instances / tabs in sync for free.
 */
import { esc } from "../../../core/dom.js";

/** @typedef {{ id: string, text: string, done: boolean, created: number, doneAt?: number, xp?: number }} Item */

const DIFFICULTY = [
  { label: "EASY", xp: 10 },
  { label: "NORMAL", xp: 25 },
  { label: "HARD", xp: 50 },
];
const DEFAULT_XP = 25;

/** Wording per variant; settings override it only when the user changed them from the defaults. */
const COPY = {
  default: { title: "To-do", placeholder: "Add a task…", add: "+", empty: "Nothing to do.", del: "Delete" },
  "quest-log": { title: "Quest log", placeholder: "New quest…", add: "ACCEPT", empty: "No active quests. The realm is at peace.", del: "Abandon quest" },
};

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "todo",
  name: "To-do",
  description: "A simple task list.",
  css: "widget.css",
  size: { w: 4, h: 4 },
  variants: ["default", "quest-log"],
  data: { items: [] },
  settings: [
    { key: "title", label: "Title", type: "text", default: "To-do" },
    { key: "hideDone", label: "Hide completed tasks", type: "toggle", default: false },
    { key: "placeholder", label: "Input placeholder", type: "text", default: "Add a task…" },
  ],

  render(el, ctx) {
    const s = ctx.settings;
    const quest = ctx.variant === "quest-log";
    const copy = COPY[quest ? "quest-log" : "default"];
    const title = s.title !== COPY.default.title ? s.title : copy.title;
    const placeholder = s.placeholder !== COPY.default.placeholder ? s.placeholder : copy.placeholder;

    el.innerHTML = `
      <h3 class="todo-title"></h3>
      <form class="todo-form">
        <input class="todo-input" autocomplete="off">
        ${quest ? `<select class="todo-diff" aria-label="Difficulty">${DIFFICULTY.map(d => `<option value="${d.xp}" ${d.xp === DEFAULT_XP ? "selected" : ""}>${d.label}</option>`).join("")}</select>` : ""}
        <button class="todo-add" aria-label="Add">${copy.add}</button>
      </form>
      <ul class="todo-list"></ul>
      <p class="todo-empty"></p>`;
    /** @type {HTMLElement} */ (el.querySelector(".todo-title")).textContent = title;
    /** @type {HTMLElement} */ (el.querySelector(".todo-empty")).textContent = copy.empty;
    const input = /** @type {HTMLInputElement} */ (el.querySelector(".todo-input"));
    const diff = /** @type {HTMLSelectElement | null} */ (el.querySelector(".todo-diff"));
    const list = /** @type {HTMLElement} */ (el.querySelector(".todo-list"));
    const empty = /** @type {HTMLElement} */ (el.querySelector(".todo-empty"));
    input.placeholder = placeholder;

    ctx.listen(/** @type {HTMLElement} */ (el.querySelector("form")), "submit", e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      /** @type {Item} */
      const item = { id: Math.random().toString(36).slice(2, 10), text, done: false, created: Date.now() };
      if (diff) item.xp = Number(diff.value);
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
          ${quest ? `<span class="todo-xp">${i.done ? "✓ " : "+"}${i.xp ?? DEFAULT_XP} XP</span>` : ""}
          <button class="todo-del" aria-label="${copy.del}" title="${copy.del}">✕</button>
        </li>`).join("");
      empty.hidden = items.length > 0;
    });
  },
};
