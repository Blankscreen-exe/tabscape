// @ts-check
/**
 * Web search. The engine is chosen in the widget's settings (⚙ in edit mode), never with
 * buttons on the bar itself — inline engine buttons don't scale and break narrow layouts.
 * Emits SEARCH_SUBMITTED before navigating.
 */

/** Add engines here. `{q}` is replaced by the encoded query. */
export const ENGINES = {
  google: { label: "Google", url: "https://www.google.com/search?q={q}" },
  duckduckgo: { label: "DuckDuckGo", url: "https://duckduckgo.com/?q={q}" },
  bing: { label: "Bing", url: "https://www.bing.com/search?q={q}" },
  brave: { label: "Brave Search", url: "https://search.brave.com/search?q={q}" },
  ecosia: { label: "Ecosia", url: "https://www.ecosia.org/search?q={q}" },
  startpage: { label: "Startpage", url: "https://www.startpage.com/do/search?q={q}" },
  youtube: { label: "YouTube", url: "https://www.youtube.com/results?search_query={q}" },
  github: { label: "GitHub", url: "https://github.com/search?q={q}" },
  wikipedia: { label: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?search={q}" },
};

/**
 * Search URL for a query. `custom` must be an http(s) URL containing {q}; otherwise the engine is used.
 * @param {string} engine @param {string} custom @param {string} query
 */
export function searchUrl(engine, custom, query) {
  const q = encodeURIComponent(query);
  if (engine === "custom" && /^https?:\/\/.+\{q\}/i.test(custom.trim())) return custom.trim().replace("{q}", q);
  return (ENGINES[/** @type {keyof typeof ENGINES} */ (engine)] ?? ENGINES.google).url.replace("{q}", q);
}

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "search",
  name: "Search",
  description: "Search the web.",
  css: "widget.css",
  size: { w: 8, h: 1 },
  settings: [
    { key: "engine", label: "Search engine", type: "select", default: "google",
      options: [...Object.entries(ENGINES).map(([value, e]) => ({ value, label: e.label })), { value: "custom", label: "Custom…" }] },
    { key: "custom", label: "Custom engine URL (for “Custom…”), with {q} where the query goes", type: "text", default: "" },
    { key: "placeholder", label: "Placeholder text", type: "text", default: "Search the web…" },
    { key: "button", label: "Button text (empty = no button)", type: "text", default: "" },
    { key: "autofocus", label: "Focus on new tab", type: "toggle", default: true },
    { key: "newTab", label: "Open results in a new tab", type: "toggle", default: false },
  ],

  render(el, ctx) {
    const s = ctx.settings;
    el.innerHTML = `
      <form class="search-form" role="search">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input class="search-input" name="q" autocomplete="off">
      </form>`;
    const form = /** @type {HTMLFormElement} */ (el.querySelector("form"));
    const input = /** @type {HTMLInputElement} */ (el.querySelector("input"));
    const engineName = s.engine === "custom" ? "custom engine" : (ENGINES[/** @type {keyof typeof ENGINES} */ (s.engine)] ?? ENGINES.google).label;
    input.placeholder = s.placeholder;
    input.setAttribute("aria-label", `Search with ${engineName}`);
    input.title = `Searching with ${engineName} · change it in this widget's settings`;
    if (s.button) {
      const btn = document.createElement("button");
      btn.className = "search-button";
      btn.textContent = s.button;
      form.append(btn);
    }
    if (s.autofocus && !ctx.isEditing()) ctx.after(50, () => input.focus());

    ctx.listen(form, "submit", e => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      ctx.emit(ctx.events.SEARCH_SUBMITTED, { query, engine: s.engine });
      const url = searchUrl(s.engine, s.custom, query);
      if (s.newTab) open(url, "_blank", "noopener"); else location.href = url;
    });
  },
};
