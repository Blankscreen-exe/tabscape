// @ts-check
/** Guided breathing: an orb that grows and shrinks with a chosen breathing pattern. */

/** Phases: [label, seconds, orb size ("big" | "small")]. Add patterns here. */
const PATTERNS = {
  calm: { label: "Calm · 4 in · 4 hold · 6 out", phases: [["in", 4, "big"], ["hold", 4, "big"], ["out", 6, "small"]] },
  box: { label: "Box · 4 · 4 · 4 · 4", phases: [["in", 4, "big"], ["hold", 4, "big"], ["out", 4, "small"], ["hold", 4, "small"]] },
  relax: { label: "Relax · 4 in · 7 hold · 8 out", phases: [["in", 4, "big"], ["hold", 7, "big"], ["out", 8, "small"]] },
};

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "breath",
  name: "Breathe",
  description: "A breathing guide. Click the orb to start or stop.",
  css: "widget.css",
  size: { w: 4, h: 3 },
  bestWith: ["zen"],
  settings: [
    { key: "pattern", label: "Pattern", type: "select", default: "calm",
      options: Object.entries(PATTERNS).map(([value, p]) => ({ value, label: p.label })) },
  ],

  render(el, ctx) {
    const pattern = PATTERNS[/** @type {keyof typeof PATTERNS} */ (ctx.settings.pattern)] ?? PATTERNS.calm;
    el.innerHTML = `
      <button class="breath-orb" aria-label="Start breathing exercise"><span class="breath-word">start</span></button>
      <p class="breath-hint"></p>`;
    const orb = /** @type {HTMLButtonElement} */ (el.querySelector(".breath-orb"));
    const word = /** @type {HTMLElement} */ (el.querySelector(".breath-word"));
    const hint = /** @type {HTMLElement} */ (el.querySelector(".breath-hint"));
    const idle = () => { hint.textContent = `click to breathe · ${pattern.label.split(" · ").slice(1).join(" · ")}`; };
    idle();

    /** @type {Array<() => void>} */
    let pending = [];
    let running = false;

    function stop() {
      pending.forEach(cancel => cancel());
      pending = [];
      running = false;
      orb.classList.remove("big");
      orb.style.transitionDuration = "";
      word.textContent = "start";
      orb.setAttribute("aria-label", "Start breathing exercise");
      idle();
    }

    /** @param {number} i */
    function phase(i) {
      const [label, secs, size] = pattern.phases[i % pattern.phases.length];
      orb.style.transitionDuration = `${secs}s`;
      orb.classList.toggle("big", size === "big");
      word.textContent = String(label);
      hint.textContent = label === "hold" ? "hold…" : `breathe ${label}…`;
      pending.push(ctx.after(Number(secs) * 1000, () => phase(i + 1)));
    }

    ctx.listen(orb, "click", () => {
      if (running) return stop();
      running = true;
      orb.setAttribute("aria-label", "Stop breathing exercise");
      phase(0);
    });
  },
};
