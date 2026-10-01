// @ts-check
/**
 * The widget grid: positions widget frames on a CSS grid and, in edit mode,
 * lets the user drag (move) and resize them. Locked items stay put.
 *
 * The grid never writes to the store itself; it reports a new layout via onChange.
 */
import { h } from "./dom.js";
import { canPlace, readingOrder } from "./layout.js";

/**
 * @typedef {import("./migrations/index.js").LayoutItem} LayoutItem
 * @typedef {import("./contracts.js").ThemeDef} ThemeDef
 * @typedef {import("./widget-host.js").WidgetHost} WidgetHost
 */

/**
 * @param {{
 *   container: HTMLElement,
 *   host: WidgetHost,
 *   onChange: (layout: LayoutItem[]) => void,
 *   onRemove: (id: string) => void,
 *   onSettings: (id: string) => void,
 *   widgetName: (type: string) => string,
 * }} deps
 */
export function createGrid({ container, host, onChange, onRemove, onSettings, widgetName }) {
  /** @type {Map<string, { frame: HTMLElement, body: HTMLElement, sig: string }>} */
  const frames = new Map();
  /** @type {LayoutItem[]} */
  let layout = [];
  /** @type {ThemeDef | null} */
  let theme = null;
  let editing = false;

  const columns = () => theme?.grid?.columns ?? 12;
  const rowHeight = () => theme?.grid?.rowHeight ?? 80;

  /** @param {HTMLElement} el @param {{x:number,y:number,w:number,h:number}} r */
  function position(el, r) {
    el.style.gridColumn = `${r.x + 1} / span ${r.w}`;
    el.style.gridRow = `${r.y + 1} / span ${r.h}`;
    el.style.setProperty("--h", String(r.h)); // used by the single-column phone layout
  }

  /** Cell size in px, from the live container width. */
  function cell() {
    const cs = getComputedStyle(container);
    const gap = parseFloat(cs.columnGap) || 0;
    const width = container.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return { cw: (width - gap * (columns() - 1)) / columns(), rh: rowHeight(), gap };
  }

  /**
   * Shared pointer logic for move + resize.
   * @param {PointerEvent} e @param {LayoutItem} item @param {HTMLElement} frame @param {"move" | "resize"} mode
   */
  function startDrag(e, item, frame, mode) {
    if (!editing || item.locked || e.button !== 0) return;
    e.preventDefault();
    const { cw, rh, gap } = cell();
    const sx = e.clientX, sy = e.clientY;
    const ghost = h("div", { class: "g-ghost" });
    position(ghost, item);
    container.append(ghost);
    frame.classList.add("g-dragging");
    let target = { x: item.x, y: item.y, w: item.w, h: item.h };

    /** @param {PointerEvent} ev */
    const move = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (mode === "move") {
        frame.style.transform = `translate(${dx}px, ${dy}px)`;
        target = { ...target, x: item.x + Math.round(dx / (cw + gap)), y: item.y + Math.round(dy / (rh + gap)) };
        target.x = Math.max(0, Math.min(target.x, columns() - item.w));
        target.y = Math.max(0, target.y);
      } else {
        target = { ...target, w: Math.max(1, item.w + Math.round(dx / (cw + gap))), h: Math.max(1, item.h + Math.round(dy / (rh + gap))) };
        target.w = Math.min(target.w, columns() - item.x);
        frame.style.width = `${target.w * cw + (target.w - 1) * gap}px`;
        frame.style.height = `${target.h * rh + (target.h - 1) * gap}px`;
      }
      const ok = canPlace(layout, target, columns(), item.id);
      ghost.classList.toggle("g-ghost-bad", !ok);
      position(ghost, target);
    };
    const up = () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      ghost.remove();
      frame.classList.remove("g-dragging");
      frame.style.transform = frame.style.width = frame.style.height = "";
      if (canPlace(layout, target, columns(), item.id) && (target.x !== item.x || target.y !== item.y || target.w !== item.w || target.h !== item.h)) {
        onChange(layout.map(it => it.id === item.id ? { ...it, ...target } : it));
      }
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
  }

  /** @param {LayoutItem} item */
  function buildFrame(item) {
    const body = h("div");
    const frame = h("div", { class: "g-item", "data-id": item.id }, [
      body,
      h("div", { class: "g-chrome" }, [
        h("div", { class: "g-bar", title: item.locked ? "Locked by theme" : "Drag to move" }, [
          h("span", { class: "g-name", text: (item.locked ? "🔒 " : "⠿ ") + widgetName(item.widget) }),
          h("button", { class: "g-btn", title: "Settings", text: "⚙", onclick: () => onSettings(item.id) }),
          !item.locked && h("button", { class: "g-btn", title: "Remove", text: "✕", onclick: () => onRemove(item.id) }),
        ]),
        !item.locked && h("div", { class: "g-resize", title: "Drag to resize" }),
      ]),
    ]);
    const bar = /** @type {HTMLElement} */ (frame.querySelector(".g-bar"));
    bar.addEventListener("pointerdown", e => { if (!(/** @type {HTMLElement} */ (e.target)).closest("button")) startDrag(e, current(item.id), frame, "move"); });
    frame.querySelector(".g-resize")?.addEventListener("pointerdown", e => startDrag(/** @type {PointerEvent} */ (e), current(item.id), frame, "resize"));
    return { frame, body };
  }

  /** Always act on the latest version of an item (layout may have changed since the frame was built). @param {string} id */
  const current = id => /** @type {LayoutItem} */ (layout.find(it => it.id === id));

  return {
    /**
     * Render a layout. Frames are reused; widgets only remount when their type/settings/lock changed
     * or `remountAll` is set (theme switch).
     * @param {LayoutItem[]} next @param {ThemeDef} nextTheme @param {{ remountAll?: boolean }} [opts]
     */
    render(next, nextTheme, opts = {}) {
      layout = next;
      theme = nextTheme;
      container.style.setProperty("--grid-columns", String(columns()));
      container.style.setProperty("--grid-row-height", `${rowHeight()}px`);
      if (theme.grid?.maxWidth) container.style.setProperty("--grid-max-width", theme.grid.maxWidth);
      else container.style.removeProperty("--grid-max-width");

      const ids = new Set(next.map(it => it.id));
      for (const [id, f] of frames) if (!ids.has(id)) { host.unmount(id); f.frame.remove(); frames.delete(id); }

      const order = readingOrder(next);
      for (const item of next) {
        const sig = JSON.stringify([item.widget, item.settings ?? {}, !!item.locked]);
        let f = frames.get(item.id);
        /** @type {HTMLElement | null} */
        let replaced = null;
        if (f && f.sig !== sig) { host.unmount(item.id); replaced = f.frame; frames.delete(item.id); f = undefined; }
        if (!f) {
          const built = buildFrame(item);
          f = { ...built, sig };
          frames.set(item.id, f);
          if (replaced) replaced.replaceWith(f.frame); // keep DOM (= tab) order stable
          else container.append(f.frame);
          host.mount(item, f.body, nextTheme);
        } else if (opts.remountAll) {
          host.mount(item, f.body, nextTheme);
        }
        position(f.frame, item);
        f.frame.style.order = String(order.indexOf(item));
        f.frame.classList.toggle("g-locked", !!item.locked);
      }
    },

    /** @param {boolean} on */
    setEditing(on) {
      editing = on;
      container.classList.toggle("g-editing", on);
    },
  };
}
