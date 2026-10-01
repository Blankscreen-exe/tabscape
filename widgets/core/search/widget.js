// @ts-check
/** Web search with selectable engines. Emits SEARCH_SUBMITTED before navigating. */

/** Add engines here. `{q}` is replaced by the encoded query. */
const ENGINES = {
  google: { label: "Google", url: "https://www.google.com/search?q={q}" },
  duckduckgo: { label: "DuckDuckGo", url: "https://duckduckgo.com/?q={q}" },
  bing: { label: "Bing", url: "https://www.bing.com/search?q={q}" },
  youtube: { label: "YouTube", url: "https://www.youtube.com/results?search_query={q}" },
  github: { label: "GitHub", url: "https://github.com/search?q={q}" },
  wikipedia: { label: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?search={q}" },
};

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "search",
  name: "Search",
  description: "Search the web.",
  css: "widget.css",
  size: { w: 8, h: 1 },
  data: { picked: null }, // engine last picked with the pills, shared by all search widgets
  settings: [
    { key: "engine", label: "Search engine", type: "select", default: "google",
      options: Object.entries(ENGINES).map(([value, e]) => ({ value, label: e.label })) },
    { key: "placeholder", label: "Placeholder text", type: "text", default: "Search the web…" },
    { key: "button", label: "Button text (empty = no button)", type: "text", default: "" },
    { key: "pills", label: "Engine buttons to switch between (comma separated ids, empty = none)", type: "text", default: "" },
    { key: "autofocus", label: "Focus on new tab", type: "toggle", default: true },
    { key: "newTab", label: "Open results in a new tab", type: "toggle", default: false },
  ],

  render(el, ctx) {
    const s = ctx.settings;
    /** @param {string} id */
    const known = id => Object.hasOwn(ENGINES, id);
    const pills = String(s.pills).split(",").map(p => p.trim()).filter(known);
    let current = known(s.engine) ? s.engine : "google";
    el.innerHTML = `
      <form class="search-form" role="search">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input class="search-input" name="q" autocomplete="off" aria-label="Search">
      </form>`;
    const form = /** @type {HTMLFormElement} */ (el.querySelector("form"));
    const input = /** @type {HTMLInputElement} */ (el.querySelector("input"));
    input.placeholder = s.placeholder;
    if (s.button) {
      const btn = document.createElement("button");
      btn.className = "search-button";
      btn.textContent = s.button;
      form.append(btn);
    }
    if (pills.length) {
      const bar = document.createElement("div");
      bar.className = "search-pills";
      bar.innerHTML = pills.map(id => `<button type="button" data-e="${id}">${ENGINES[/** @type {keyof typeof ENGINES} */ (id)].label}</button>`).join("");
      form.append(bar);
      ctx.listen(bar, "click", e => {
        const id = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("button"))?.dataset.e;
        if (id) { ctx.data.set({ picked: id }); input.focus(); }
      });
      ctx.data.watch(d => {
        current = d.picked && pills.includes(d.picked) ? d.picked : (pills.includes(s.engine) ? s.engine : pills[0]);
        bar.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.e === current));
      });
    }
    if (s.autofocus && !ctx.isEditing()) ctx.after(50, () => input.focus());

    ctx.listen(form, "submit", e => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      ctx.emit(ctx.events.SEARCH_SUBMITTED, { query, engine: current });
      const url = ENGINES[/** @type {keyof typeof ENGINES} */ (current)].url.replace("{q}", encodeURIComponent(query));
      if (s.newTab) open(url, "_blank", "noopener"); else location.href = url;
    });
  },
};
