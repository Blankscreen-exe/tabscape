// @ts-check
/**
 * Applies a theme with one fixed, documented sequence:
 *
 *   1. load + validate the new theme module (fallback theme on failure)
 *   2. preload its stylesheet (avoids a flash of unstyled widgets)
 *   3. unmount the old theme (dispose its scope -> stops loops, sounds, listeners)
 *   4. swap stylesheet, tokens, <html data-theme>, color-scheme
 *   5. mount the new theme's decorations/services into the decor layer
 *   6. emit THEME_APPLIED
 */
import { EVENTS } from "./events.js";
import { createScope } from "./scope.js";
import { loadStylesheet, removeStylesheet } from "./dom.js";
import { FALLBACK_THEME } from "./registry.js";

/**
 * @typedef {import("./registry.js").Registry} Registry
 * @typedef {import("./store.js").Store} Store
 * @typedef {import("./events.js").Bus} Bus
 * @typedef {import("./contracts.js").ThemeDef} ThemeDef
 */

/**
 * @param {{ registry: Registry, store: Store, bus: Bus, decorRoot: HTMLElement }} deps
 */
export function createThemeManager({ registry, store, bus, decorRoot }) {
  /** @type {ThemeDef | null} */
  let current = null;
  let scope = createScope();
  const tokenStyle = document.createElement("style");
  tokenStyle.id = "theme-tokens";
  document.head.append(tokenStyle);

  /** @param {string} id */
  async function loadWithFallback(id) {
    try {
      return await registry.theme(id);
    } catch (err) {
      console.error(`[theme] "${id}" failed to load, using "${FALLBACK_THEME}"`, err);
      return registry.theme(FALLBACK_THEME);
    }
  }

  return {
    get current() { return current; },

    /** @param {string} id @returns {Promise<ThemeDef>} */
    async apply(id) {
      const { def, url } = await loadWithFallback(id);

      if (def.css) await loadStylesheet(new URL(def.css, url).href, "theme-next");

      // unmount old
      scope.dispose();
      decorRoot.replaceChildren();

      // swap visuals
      removeStylesheet("theme");
      document.querySelector('link[data-owner="theme-next"]')?.setAttribute("data-owner", "theme");
      const decl = Object.entries(def.tokens).map(([k, v]) => `${k}: ${v};`).join(" ");
      tokenStyle.textContent = `@layer theme { :root { ${decl} } }`;
      const root = document.documentElement;
      root.dataset.theme = def.id;
      root.style.colorScheme = def.colorScheme;

      // mount new
      scope = createScope();
      current = def;
      if (def.mount) {
        const ctx = {
          root: decorRoot,
          theme: def,
          events: EVENTS,
          state: store.scope("themeState", def.id, structuredClone(def.initialState ?? {})),
          emit: bus.emit,
          /** @param {string} name @param {(p: any) => void} fn */
          on: (name, fn) => scope.add(bus.on(name, fn)),
          every: scope.every, after: scope.after, listen: scope.listen, loop: scope.loop, cleanup: scope.add,
          assetUrl: (/** @type {string} */ p) => new URL(p, url).href,
        };
        try {
          const ret = def.mount(ctx);
          if (typeof ret === "function") scope.add(ret);
        } catch (err) {
          console.error(`[theme] mount() of "${def.id}" failed — theme visuals still applied`, err);
        }
      }

      bus.emit(EVENTS.THEME_APPLIED, { themeId: def.id });
      return def;
    },
  };
}

/** @typedef {ReturnType<typeof createThemeManager>} ThemeManager */
