// @ts-check
/**
 * Automatic cleanup. Every widget instance and every mounted theme gets a scope;
 * anything registered through it (events, timers, listeners, animation loops) is
 * released automatically when the widget is removed or the theme is switched.
 *
 * This is why widgets/themes rarely need their own destroy code.
 */

export function createScope() {
  /** @type {Array<() => void>} */
  let cleanups = [];
  let disposed = false;

  const scope = {
    /** Register any cleanup function. @param {() => void} fn */
    add(fn) {
      if (disposed) { fn(); return fn; }
      cleanups.push(fn);
      return fn;
    },

    /** setInterval that is cleared automatically. Calls fn once immediately when `immediate`. @param {number} ms @param {() => void} fn */
    every(ms, fn, immediate = true) {
      if (immediate) fn();
      const id = setInterval(fn, ms);
      return scope.add(() => clearInterval(id));
    },

    /** @param {number} ms @param {() => void} fn */
    after(ms, fn) {
      const id = setTimeout(fn, ms);
      return scope.add(() => clearTimeout(id));
    },

    /**
     * addEventListener that is removed automatically.
     * @param {EventTarget} target @param {string} type @param {EventListenerOrEventListenerObject} fn
     * @param {AddEventListenerOptions | boolean} [opts]
     */
    listen(target, type, fn, opts) {
      target.addEventListener(type, fn, opts);
      return scope.add(() => target.removeEventListener(type, fn, opts));
    },

    /** requestAnimationFrame loop; fn receives the timestamp. Stops automatically. @param {(t: number) => void} fn */
    loop(fn) {
      let id = 0;
      const step = (/** @type {number} */ t) => { fn(t); id = requestAnimationFrame(step); };
      id = requestAnimationFrame(step);
      return scope.add(() => cancelAnimationFrame(id));
    },

    /** Run all cleanups (in reverse order). Safe to call twice. */
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const fn of cleanups.reverse()) {
        try { fn(); } catch (err) { console.error("[scope] cleanup failed", err); }
      }
      cleanups = [];
    },

    get disposed() { return disposed; },
  };
  return scope;
}

/** @typedef {ReturnType<typeof createScope>} Scope */
