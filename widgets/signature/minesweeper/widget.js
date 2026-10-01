// @ts-check
/** Classic Minesweeper. Left click opens, right click flags. Click the face for a new game. */

const LEVELS = {
  easy: { n: 9, mines: 10 },
  medium: { n: 12, mines: 22 },
};
const COLORS = ["", "#2563eb", "#16a34a", "#dc2626", "#1e3a8a", "#7f1d1d", "#0f766e", "#111827", "#6b7280"];

/** Neighbour indices of cell i in an n×n board. @param {number} i @param {number} n */
export function neighbours(i, n) {
  const r = Math.floor(i / n), c = i % n, out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const rr = r + dr, cc = c + dc;
    if ((dr || dc) && rr >= 0 && rr < n && cc >= 0 && cc < n) out.push(rr * n + cc);
  }
  return out;
}

/**
 * New board with `mines` mines, never on `safe` or its neighbours (first click is always safe).
 * @param {number} n @param {number} mines @param {number} safe @param {() => number} [rand]
 */
export function makeBoard(n, mines, safe, rand = Math.random) {
  const forbidden = new Set([safe, ...neighbours(safe, n)]);
  const cells = Array.from({ length: n * n }, () => ({ mine: false, open: false, flag: false, count: 0 }));
  let placed = 0;
  while (placed < mines) {
    const i = Math.floor(rand() * n * n);
    if (!cells[i].mine && !forbidden.has(i)) { cells[i].mine = true; placed++; }
  }
  cells.forEach((c, i) => { c.count = neighbours(i, n).filter(j => cells[j].mine).length; });
  return cells;
}

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "minesweeper",
  name: "Minesweeper",
  description: "The classic. Right-click to flag.",
  css: "widget.css",
  size: { w: 3, h: 4 },
  bestWith: ["retro-os"],
  settings: [
    { key: "level", label: "Board", type: "select", default: "easy", options: [{ value: "easy", label: "9×9, 10 mines" }, { value: "medium", label: "12×12, 22 mines" }] },
  ],

  render(el, ctx) {
    const { n, mines } = LEVELS[/** @type {keyof typeof LEVELS} */ (ctx.settings.level)] ?? LEVELS.easy;
    el.innerHTML = `
      <div class="ms-top"><span class="ms-lcd ms-left"></span><button class="ms-face" aria-label="New game">🙂</button><span class="ms-lcd ms-time">000</span></div>
      <div class="ms-board" style="grid-template-columns: repeat(${n}, 1fr)"></div>`;
    const board = /** @type {HTMLElement} */ (el.querySelector(".ms-board"));
    const face = /** @type {HTMLElement} */ (el.querySelector(".ms-face"));
    /** @type {ReturnType<typeof makeBoard> | null} */
    let cells = null;
    let over = false, opened = 0, flags = 0, secs = 0;
    /** @type {(() => void) | null} */
    let stopTimer = null;

    function reset() {
      cells = null; over = false; opened = 0; flags = 0; secs = 0;
      stopTimer?.(); stopTimer = null;
      face.textContent = "🙂";
      draw();
    }

    /** @param {number} i */
    function open(i) {
      if (!cells) return;
      const c = cells[i];
      if (c.open || c.flag) return;
      c.open = true; opened++;
      if (c.mine) { over = true; cells.forEach(x => { if (x.mine) x.open = true; }); face.textContent = "😵"; stopTimer?.(); return; }
      if (!c.count) neighbours(i, n).forEach(open);
    }

    function draw() {
      board.innerHTML = Array.from({ length: n * n }, (_, i) => {
        const c = cells?.[i];
        if (!c || !c.open) return `<button class="ms-cell" data-i="${i}" aria-label="cell">${c?.flag ? "🚩" : ""}</button>`;
        return `<button class="ms-cell open" data-i="${i}" style="color:${COLORS[c.count]}">${c.mine ? "💣" : c.count || ""}</button>`;
      }).join("");
      /** @type {HTMLElement} */ (el.querySelector(".ms-left")).textContent = String(mines - flags).padStart(3, "0");
      /** @type {HTMLElement} */ (el.querySelector(".ms-time")).textContent = String(Math.min(secs, 999)).padStart(3, "0");
    }

    ctx.listen(face, "click", reset);
    ctx.listen(board, "click", e => {
      const b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest(".ms-cell"));
      if (!b || over) return;
      const i = Number(b.dataset.i);
      if (!cells) {
        cells = makeBoard(n, mines, i);
        stopTimer = ctx.every(1000, () => { secs++; draw(); }, false);
      }
      open(i);
      if (!over && opened === n * n - mines) { over = true; face.textContent = "😎"; stopTimer?.(); }
      draw();
    });
    ctx.listen(board, "contextmenu", e => {
      e.preventDefault();
      const b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest(".ms-cell"));
      if (!b || over || !cells) return;
      const c = cells[Number(b.dataset.i)];
      if (c.open) return;
      c.flag = !c.flag; flags += c.flag ? 1 : -1;
      draw();
    });
    reset();
  },
};
