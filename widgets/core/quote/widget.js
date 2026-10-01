// @ts-check
/** Quote of the day (or per tab). Your own quotes can be added in the settings. */

const QUOTES = [
  ["The best way to predict the future is to invent it.", "Alan Kay"],
  ["Simplicity is prerequisite for reliability.", "Edsger W. Dijkstra"],
  ["Make it work, make it right, make it fast.", "Kent Beck"],
  ["Well done is better than well said.", "Benjamin Franklin"],
  ["Not all those who wander are lost.", "J.R.R. Tolkien"],
  ["The secret of getting ahead is getting started.", "Mark Twain"],
  ["Begin at the beginning, and go on till you come to the end: then stop.", "Lewis Carroll"],
  ["Nothing in life is to be feared, it is only to be understood.", "Marie Curie"],
];

/** "text — author" per line. @param {string} text @returns {string[][]} */
function parse(text) {
  return text.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const i = l.lastIndexOf(" — ");
    return i > 0 ? [l.slice(0, i), l.slice(i + 3)] : [l, ""];
  });
}

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "quote",
  name: "Quote",
  description: "A quote of the day.",
  css: "widget.css",
  size: { w: 6, h: 2 },
  settings: [
    { key: "title", label: "Title", type: "text", default: "Thought of the day" },
    { key: "change", label: "New quote", type: "select", default: "daily",
      options: [{ value: "daily", label: "Every day" }, { value: "tab", label: "Every new tab" }] },
    { key: "own", label: "Your own quotes (one per line: text — author). Leave empty for the built-in list.", type: "textarea", default: "" },
  ],

  render(el, ctx) {
    const list = parse(ctx.settings.own);
    const quotes = list.length ? list : QUOTES;
    const day = Math.floor(Date.now() / 864e5);
    const [text, author] = quotes[ctx.settings.change === "tab" ? Math.floor(Math.random() * quotes.length) : day % quotes.length];
    el.innerHTML = `<h3 class="quote-title"></h3><blockquote class="quote-text"></blockquote><cite class="quote-by"></cite>`;
    /** @type {HTMLElement} */ (el.querySelector(".quote-title")).textContent = ctx.settings.title;
    /** @type {HTMLElement} */ (el.querySelector(".quote-text")).textContent = `“${text}”`;
    /** @type {HTMLElement} */ (el.querySelector(".quote-by")).textContent = author ? `— ${author}` : "";
  },
};
