// @ts-check
/**
 * Quick links. The link list is shared data (same links in every theme);
 * how they are shown (grid / list) is per instance or decided by the theme variant.
 * No favicon services on purpose: no third-party requests, nothing that can disappear.
 */
import { esc } from "../../../core/dom.js";

/** @typedef {{ name: string, url: string }} Link */

/** @param {string} text @returns {Link[]} */
function parse(text) {
  return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const [name, url] = line.includes("|") ? line.split("|").map(p => p.trim()) : [line, line];
    return { name: name || url, url: /^[a-z]+:\/\//i.test(url) ? url : `https://${url}` };
  });
}

/** @param {Link[]} items */
const serialize = items => items.map(l => `${l.name} | ${l.url}`).join("\n");

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "links",
  name: "Links",
  description: "Your favourite sites.",
  css: "widget.css",
  size: { w: 6, h: 3 },
  variants: ["default", "list"],
  data: {
    items: [
      { name: "GitHub", url: "https://github.com" },
      { name: "YouTube", url: "https://youtube.com" },
      { name: "Gmail", url: "https://mail.google.com" },
      { name: "Wikipedia", url: "https://wikipedia.org" },
      { name: "Reddit", url: "https://reddit.com" },
      { name: "Maps", url: "https://maps.google.com" },
    ],
  },
  settings: [
    { key: "style", label: "Style", type: "select", default: "auto",
      options: [{ value: "auto", label: "Theme decides" }, { value: "default", label: "Icon grid" }, { value: "list", label: "List" }] },
    { key: "title", label: "Title", type: "text", default: "Links" },
  ],

  render(el, ctx) {
    const style = ctx.settings.style === "auto" ? ctx.variant : ctx.settings.style;
    let editingList = false;

    ctx.data.watch(data => draw(data.items));

    /** @param {Link[]} items */
    function draw(items) {
      if (editingList) return;
      el.innerHTML = `
        <div class="links-head"><h3>${esc(ctx.settings.title)}</h3><button class="links-edit" title="Edit links">✎</button></div>
        <div class="links-body links-${style === "list" ? "list" : "grid"}">
          ${items.map(l => `<a href="${esc(l.url)}" title="${esc(l.url)}"><span class="links-ico" aria-hidden="true">${esc(l.name.slice(0, 1).toUpperCase())}</span><span class="links-name">${esc(l.name)}</span></a>`).join("")}
        </div>`;
      el.querySelector(".links-edit")?.addEventListener("click", () => edit(items));
      el.querySelectorAll("a").forEach((a, i) => a.addEventListener("click", () => ctx.emit(ctx.events.LINK_OPENED, { url: items[i].url, name: items[i].name })));
    }

    /** @param {Link[]} items */
    function edit(items) {
      editingList = true;
      el.innerHTML = `
        <div class="links-head"><h3>Edit links</h3></div>
        <p class="links-help">One per line: <code>Name | https://site.com</code></p>
        <textarea class="links-text" spellcheck="false"></textarea>
        <div class="links-actions"><button class="links-cancel">Cancel</button><button class="links-save">Save</button></div>`;
      const ta = /** @type {HTMLTextAreaElement} */ (el.querySelector("textarea"));
      ta.value = serialize(items);
      ta.focus();
      el.querySelector(".links-cancel")?.addEventListener("click", () => { editingList = false; draw(ctx.data.get().items); });
      el.querySelector(".links-save")?.addEventListener("click", () => {
        editingList = false;
        ctx.data.update(d => { d.items = parse(ta.value); });
      });
    }
  },
};
