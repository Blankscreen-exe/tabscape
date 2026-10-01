// @ts-check
/**
 * A command line for the new tab: search engines, bookmarks, history.
 * Bookmarks are its own setting (widgets never read another widget's data, rule A1/U3).
 */
import { esc } from "../../../core/dom.js";

const ENGINES = {
  g: ["Google", "https://www.google.com/search?q="],
  d: ["DuckDuckGo", "https://duckduckgo.com/?q="],
  yt: ["YouTube", "https://www.youtube.com/results?search_query="],
  gh: ["GitHub", "https://github.com/search?q="],
  w: ["Wikipedia", "https://en.wikipedia.org/w/index.php?search="],
};

const DEFAULT_BOOKMARKS = ["gh | GitHub | https://github.com", "yt | YouTube | https://youtube.com", "hn | Hacker News | https://news.ycombinator.com",
  "rd | Reddit | https://reddit.com", "ml | Gmail | https://mail.google.com", "so | Stack Overflow | https://stackoverflow.com"].join("\n");

/** "key | Name | url" per line. @param {string} text */
export function parseBookmarks(text) {
  return text.split("\n").map(l => l.split("|").map(p => p.trim())).filter(p => p.length >= 3 && p[0])
    .map(([key, name, url]) => ({ key, name, url: /^[a-z]+:\/\//i.test(url) ? url : `https://${url}` }));
}

/**
 * Interpret one command line. Pure: returns what to print and/or where to go.
 * @param {string} line @param {ReturnType<typeof parseBookmarks>} bookmarks
 * @returns {{ print?: string, go?: string, clear?: boolean }}
 */
export function interpret(line, bookmarks) {
  const [c, ...rest] = line.trim().split(/\s+/);
  const arg = rest.join(" ");
  if (!c) return {};
  if (c === "help") return { print: `commands:
  <b>help</b>                 this message
  <b>g|d|yt|gh|w</b> &lt;query&gt;  search google / duckduckgo / youtube / github / wikipedia
  <b>open</b> &lt;key|url&gt;       open a bookmark or any url
  <b>ls</b>                   list bookmarks
  <b>date</b>                 print the date
  <b>clear</b>                clear the screen
  &lt;key&gt;                a bookmark key on its own opens it
  anything else          searches google` };
  if (c === "clear") return { clear: true };
  if (c === "ls") return { print: bookmarks.map(b => `${esc(b.key.padEnd(4))} ${esc(b.name.padEnd(16))} <span class="term-dim">${esc(b.url)}</span>`).join("\n") || "no bookmarks — add some in the widget settings" };
  if (c === "date") return { print: esc(new Date().toString()) };
  if (c === "open") {
    const b = bookmarks.find(b => b.key === arg);
    if (b) return { go: b.url };
    if (arg) return { go: /^[a-z]+:\/\//i.test(arg) ? arg : `https://${arg}` };
    return { print: "usage: open &lt;key|url&gt;" };
  }
  const engine = ENGINES[/** @type {keyof typeof ENGINES} */ (c)];
  if (engine && arg) return { go: engine[1] + encodeURIComponent(arg) };
  const b = bookmarks.find(b => b.key === c);
  if (b && !arg) return { go: b.url };
  return { go: ENGINES.g[1] + encodeURIComponent(line.trim()) };
}

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "terminal",
  name: "Terminal",
  description: "Search and open bookmarks by typing commands. Try `help`.",
  css: "widget.css",
  size: { w: 8, h: 6 },
  bestWith: ["terminal"],
  settings: [
    { key: "prompt", label: "Prompt", type: "text", default: "guest@newtab:~$" },
    { key: "bookmarks", label: "Bookmarks (key | Name | url, one per line)", type: "textarea", default: DEFAULT_BOOKMARKS },
  ],

  render(el, ctx) {
    const bookmarks = parseBookmarks(ctx.settings.bookmarks);
    el.innerHTML = `
      <div class="term-out" aria-live="polite"></div>
      <form class="term-line"><span class="term-ps"></span><input class="term-cmd" autocomplete="off" spellcheck="false" aria-label="Command"></form>`;
    const out = /** @type {HTMLElement} */ (el.querySelector(".term-out"));
    const input = /** @type {HTMLInputElement} */ (el.querySelector(".term-cmd"));
    /** @type {HTMLElement} */ (el.querySelector(".term-ps")).textContent = ctx.settings.prompt;

    /** @param {string} html @param {string} [cls] */
    const print = (html, cls) => {
      const div = document.createElement("div");
      if (cls) div.className = cls;
      div.innerHTML = html;
      out.append(div);
      out.scrollTop = out.scrollHeight;
    };

    print(`<span class="term-dim">NEWTAB OS — last login: ${esc(new Date().toLocaleString())}</span>`);
    print("type <b>help</b> to see commands. try <b>yt lofi</b> or <b>ls</b>.");
    if (!ctx.isEditing()) ctx.after(50, () => input.focus());

    /** @type {string[]} */
    const history = [];
    let hIdx = 0;
    ctx.listen(/** @type {HTMLElement} */ (el.querySelector("form")), "submit", e => {
      e.preventDefault();
      const line = input.value;
      input.value = "";
      if (line.trim()) { history.push(line); hIdx = history.length; }
      print(`<span class="term-dim">${esc(ctx.settings.prompt)}</span> ${esc(line)}`);
      const r = interpret(line, bookmarks);
      if (r.clear) out.innerHTML = "";
      if (r.print) print(r.print);
      if (r.go) {
        const url = r.go;
        print(`<span class="term-dim">→ ${esc(url)}</span>`);
        ctx.emit(ctx.events.SEARCH_SUBMITTED, { query: line.trim(), engine: "terminal" });
        ctx.after(200, () => { location.href = url; });
      }
    });
    ctx.listen(input, "keydown", e => {
      const k = /** @type {KeyboardEvent} */ (e).key;
      if (k === "ArrowUp" && hIdx > 0) { input.value = history[--hIdx]; e.preventDefault(); }
      if (k === "ArrowDown") { hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] ?? ""; }
    });
    ctx.listen(el, "click", e => { if (!(/** @type {HTMLElement} */ (e.target)).closest("a") && !getSelection()?.toString()) input.focus(); });
  },
};
