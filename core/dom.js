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

/** Current value of a CSS custom property on :root, as written (e.g. "#3b6cf6" or "color-mix(…)"). @param {string} name */
export function readToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** @type {HTMLElement | null} */
let probe = null;
/**
 * Resolve any CSS colour (including var(--x) and color-mix()) to the browser's computed form,
 * e.g. "rgb(59, 108, 246)". Use with core/color.js parseColor().
 * @param {string} value
 */
export function resolveColor(value) {
  if (!probe) {
    probe = h("span", { "aria-hidden": "true", style: { position: "absolute", width: "0", height: "0", overflow: "hidden", visibility: "hidden" } });
    document.documentElement.append(probe);
  }
  probe.style.color = "";
  probe.style.color = value;
  return getComputedStyle(probe).color;
}

/**
 * The `ctx.tokens` helper given to themes and widgets.
 * get("--accent") -> raw value · color("--accent") -> resolved "rgb(…)" (safe for canvas fillStyle)
 */
export const tokens = Object.freeze({
  get: readToken,
  /** @param {string} name */
  color: name => resolveColor(`var(${name})`),
});

/** Short unique id for widget instances. @param {string} prefix */
export function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
