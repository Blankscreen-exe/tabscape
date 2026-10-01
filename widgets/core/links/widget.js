// @ts-check
/**
 * Quick links. The link list is shared data (same links in every theme);
 * how they are shown (grid / list) is per instance or decided by the theme variant.
 *
 * Icons: each link shows its site's favicon, fetched directly from that site
 * (`<origin>/favicon.ico`) or from an icon URL given per link. If the image fails or is
 * empty, the first letter is shown instead. No third-party favicon services on purpose:
 * they would receive the whole link list on every new tab, and they can disappear.
 */
import { esc } from "../../../core/dom.js";
import { safeWebUrl } from "../../../core/url.js";

/** @typedef {{ name: string, url: string, icon?: string }} Link */

/** Only web links (shared rule in core/url.js). */
export const normalizeUrl = safeWebUrl;

/** Custom icon: http(s) URL or a path inside the extension; anything else is dropped. @param {string | undefined} icon */
export function normalizeIcon(icon) {
  const i = (icon ?? "").trim();
  if (!i) return undefined;
  if (/^https?:\/\//i.test(i) || /^(\/|\.\.?\/)/.test(i)) return i;
  return undefined;
}

/** Where to look for a link's icon: its own icon, else the site's /favicon.ico. @param {Link} link */
export function iconUrl(link) {
  if (link.icon) return link.icon;
  try { return new URL("/favicon.ico", link.url).href; } catch { return null; }
}

/** "Name | url | icon-url" per line (icon optional; a bare url works too). @param {string} text @returns {Link[]} */
export function parse(text) {
  return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const [name, url, icon] = line.includes("|") ? line.split("|").map(p => p.trim()) : [line, line, ""];
    const link = /** @type {Link} */ ({ name: name || url, url: normalizeUrl(url || name) });
    const ic = normalizeIcon(icon);
    if (ic) link.icon = ic;
    return link;
  });
}

/** @param {Link[]} items */
export const serialize = items => items.map(l => `${l.name} | ${l.url}${l.icon ? ` | ${l.icon}` : ""}`).join("\n");

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
    { key: "icons", label: "Icons", type: "select", default: "favicon",
      options: [{ value: "favicon", label: "Site icons (letter if none)" }, { value: "letters", label: "Letters only (no network requests)" }] },
    { key: "title", label: "Title", type: "text", default: "Links" },
  ],

  render(el, ctx) {
    const style = ctx.settings.style === "auto" ? ctx.variant : ctx.settings.style;
    const favicons = ctx.settings.icons !== "letters";
    let editingList = false;

    ctx.data.watch(data => draw(data.items));

    /** @param {Link[]} items */
    function draw(items) {
      if (editingList) return;
      el.innerHTML = `
        <div class="links-head"><h3>${esc(ctx.settings.title)}</h3><button class="links-edit" title="Edit links">✎</button></div>
        <div class="links-body links-${style === "list" ? "list" : "grid"}">
          ${items.map(l => `<a href="${esc(normalizeUrl(l.url))}" title="${esc(l.url)}"><span class="links-ico" aria-hidden="true"><span class="links-letter">${esc(l.name.slice(0, 1).toUpperCase())}</span></span><span class="links-name">${esc(l.name)}</span></a>`).join("")}
        </div>`;
      el.querySelector(".links-edit")?.addEventListener("click", () => edit(items));
      el.querySelectorAll("a").forEach((a, i) => {
        a.addEventListener("click", () => ctx.emit(ctx.events.LINK_OPENED, { url: items[i].url, name: items[i].name }));
        if (favicons) loadIcon(/** @type {HTMLElement} */ (a.querySelector(".links-ico")), items[i]);
      });
    }

    /**
     * Swap the letter for the real icon only once it has loaded and is not an empty/1px image.
     * @param {HTMLElement} tile @param {Link} link
     */
    function loadIcon(tile, link) {
      const src = iconUrl(link);
      if (!src) return;
      const img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.className = "links-img";
      img.onload = () => {
        if (img.naturalWidth > 1 && tile.isConnected) { tile.append(img); tile.classList.add("has-img"); }
      };
      img.src = src; // errors simply leave the letter in place
    }

    /** @param {Link[]} items */
    function edit(items) {
      editingList = true;
      el.innerHTML = `
        <div class="links-head"><h3>Edit links</h3></div>
        <p class="links-help">One per line: <code>Name | https://site.com</code>, optionally <code>| icon-url</code></p>
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
