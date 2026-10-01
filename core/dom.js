// @ts-check
/** Small DOM helpers shared by core, themes and widgets. No framework on purpose. */

/**
 * Create an element. `attrs` keys starting with "on" become listeners; `class`, `text`, `html` are special.
 * @param {string} tag
 * @param {Record<string, any>} [attrs]
 * @param {Array<Node | string | null | undefined | false>} [children]
 * @returns {HTMLElement}
 */
export function h(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v === true) node.setAttribute(k, "");
    else node.setAttribute(k, String(v));
  }
  for (const c of children) if (c != null && c !== false) node.append(c);
  return node;
}

/** Escape text for use inside innerHTML templates. @param {unknown} s */
export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

/**
 * Add a <link rel=stylesheet> and resolve when loaded (or failed — never blocks forever).
 * @param {string} href @param {string} owner value for data-owner, used to remove it later
 * @returns {Promise<HTMLLinkElement>}
 */
export function loadStylesheet(href, owner) {
  const existing = /** @type {HTMLLinkElement | null} */ (document.querySelector(`link[data-owner="${CSS.escape(owner)}"]`));
  if (existing && existing.href === href) return Promise.resolve(existing);
  existing?.remove();
  return new Promise(resolve => {
    const link = /** @type {HTMLLinkElement} */ (h("link", { rel: "stylesheet", href, "data-owner": owner }));
    const done = () => resolve(link);
    link.onload = done;
    link.onerror = () => { console.error(`[dom] stylesheet failed: ${href}`); done(); };
    document.head.append(link);
  });
}

/** @param {string} owner */
export function removeStylesheet(owner) {
  document.querySelectorAll(`link[data-owner="${CSS.escape(owner)}"]`).forEach(l => l.remove());
}

/** Short unique id for widget instances. @param {string} prefix */
export function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
