// @ts-check
/**
 * Mounts widget instances. Each instance gets:
 *  - its own cleanup scope (auto-disposed on unmount / theme switch),
 *  - a ctx object (the ONLY API a widget may rely on — documented in docs/CONTRACTS.md),
 *  - an error boundary: a crashing widget shows an error card instead of breaking the page.
 */
import { EVENTS } from "./events.js";
import { createScope } from "./scope.js";
import { esc, loadStylesheet, tokens } from "./dom.js";
import { resolveSettings } from "./contracts.js";

/**
 * @typedef {import("./registry.js").Registry} Registry
 * @typedef {import("./store.js").Store} Store
 * @typedef {import("./events.js").Bus} Bus
 * @typedef {import("./migrations/index.js").LayoutItem} LayoutItem
 * @typedef {import("./contracts.js").ThemeDef} ThemeDef
 */

/**
 * @param {{ registry: Registry, store: Store, bus: Bus, isEditing: () => boolean }} deps
 */
export function createWidgetHost({ registry, store, bus, isEditing }) {
  /** @type {Map<string, { scope: ReturnType<typeof createScope>, el: HTMLElement }>} */
  const mounted = new Map();

  /**
   * @param {LayoutItem} item
   * @param {HTMLElement} el      empty element owned by the widget
   * @param {ThemeDef} theme
   */
  async function mount(item, el, theme) {
    unmount(item.id);
    const scope = createScope();
    mounted.set(item.id, { scope, el });
    el.className = `w w-${item.widget}`;
    el.dataset.widget = item.widget;

    try {
      const { def, url } = await registry.widget(item.widget);
      if (scope.disposed) return; // unmounted while loading
      el.dataset.title = def.name; // themes may show it, e.g. as a window title (Retro OS)
      if (def.css) await loadStylesheet(new URL(def.css, url).href, `widget:${def.id}`);
      if (scope.disposed) return;

      const variant = theme.variants?.[def.id] ?? "default";
      el.dataset.variant = variant;
      const data = store.scope("widgetData", def.id, structuredClone(def.data ?? null));

      const ctx = {
        id: item.id,
        type: def.id,
        el,
        settings: resolveSettings(def, item.settings),
        variant: def.variants?.includes(variant) ? variant : "default",
        theme: { id: theme.id, colorScheme: theme.colorScheme },
        events: EVENTS,
        data: {
          ...data,
          /** Call fn now and whenever this widget type's shared data changes (any tab, any instance). @param {(v: any) => void} fn */
          watch(fn) {
            let last = JSON.stringify(data.get());
            fn(data.get());
            scope.add(bus.on(EVENTS.STORE_CHANGED, () => {
              const now = JSON.stringify(data.get());
              if (now !== last) { last = now; fn(data.get()); }
            }));
          },
        },
        emit: bus.emit,
        /** @param {string} name @param {(p: any) => void} fn */
        on: (name, fn) => scope.add(bus.on(name, fn)),
        every: scope.every, after: scope.after, listen: scope.listen, loop: scope.loop, cleanup: scope.add,
        isEditing,
        assetUrl: (/** @type {string} */ p) => new URL(p, url).href,
        tokens,
      };

      const ret = def.render(el, ctx);
      if (typeof ret === "function") scope.add(ret);
    } catch (err) {
      console.error(`[widget] "${item.widget}" (${item.id}) failed`, err);
      el.innerHTML = `<div class="w-error"><b>Widget "${esc(item.widget)}" failed to load.</b><small>${esc(/** @type {Error} */ (err)?.message ?? err)}</small></div>`;
    }
  }

  /** @param {string} id */
  function unmount(id) {
    const m = mounted.get(id);
    if (!m) return;
    m.scope.dispose();
    m.el.replaceChildren();
    mounted.delete(id);
  }

  function unmountAll() { for (const id of [...mounted.keys()]) unmount(id); }

  return { mount, unmount, unmountAll };
}

/** @typedef {ReturnType<typeof createWidgetHost>} WidgetHost */
