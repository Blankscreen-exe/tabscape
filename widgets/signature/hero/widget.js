// @ts-check
/**
 * RPG hero panel: level, XP, gold, HP (= day left), MP (= week left) and a battle log.
 *
 * Game rules (all here, nowhere else):
 *  - completing a to-do awards its XP (item.xp from the quest-log variant, default 25) and half that in gold
 *  - un-completing takes it back (no farming by toggling)
 *  - awards are recorded per to-do id, so several hero instances or tabs never award twice
 *  - level n needs 100 + (n-1)*50 XP
 * XP is only earned while a hero widget is on the page (it is locked in the RPG Quest layout).
 */
import { esc } from "../../../core/dom.js";

const DEFAULT_XP = 25;
const MAX_AWARD_RECORDS = 500;
const MAX_LOG = 30;

/** Gold for an XP amount. @param {number} xp */
export const goldFor = xp => Math.round(xp / 2);

/** @param {number} lv */
const need = lv => 100 + (lv - 1) * 50;
/** @param {number} xp */
export function levelInfo(xp) {
  let lv = 1;
  while (xp >= need(lv)) { xp -= need(lv); lv++; }
  return { lv, cur: xp, max: need(lv) };
}

/**
 * Log entries are plain data (never HTML), rendered with escaping.
 * @typedef {{ kind: "done" | "reopen" | "level", text: string, xp?: number }} LogEntry
 * @typedef {{ xp: number, gold: number, awarded: Record<string, number>, log: LogEntry[] }} HeroData
 */

/** @param {LogEntry} e */
function logLine(e) {
  if (e?.kind === "level") return `<b>Reached ${esc(e.text)}!</b>`;
  if (e?.kind === "reopen") return `Quest reopened: ${esc(e.text)} (−${Number(e.xp) || 0} XP)`;
  if (e?.kind === "done") return `<b>Quest complete!</b> ${esc(e.text)} (+${Number(e.xp) || 0} XP)`;
  return "";
}

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "hero",
  name: "Hero",
  description: "RPG stats: finishing to-dos earns XP and gold.",
  css: "widget.css",
  size: { w: 3, h: 6 },
  bestWith: ["rpg-quest"],
  data: { xp: 0, gold: 0, awarded: {}, log: [] },
  settings: [
    { key: "name", label: "Hero name", type: "text", default: "Player 1" },
    { key: "avatar", label: "Avatar", type: "select", default: "🧙",
      options: ["🧙", "🧝", "🥷", "🧛", "🤖", "🐉", "🦊"].map(v => ({ value: v, label: v })) },
    { key: "log", label: "Show battle log", type: "toggle", default: true },
  ],

  render(el, ctx) {
    const s = ctx.settings;
    el.innerHTML = `
      <div class="hero-head">
        <div class="hero-face" aria-hidden="true"></div>
        <div><div class="hero-name"></div><div class="hero-lvl"></div></div>
      </div>
      <div class="hero-stat hp"><div class="hero-lbl"><span>HP · day left</span><span class="v"></span></div><div class="hero-bar"><span></span></div></div>
      <div class="hero-stat mp"><div class="hero-lbl"><span>MP · week left</span><span class="v"></span></div><div class="hero-bar"><span></span></div></div>
      <div class="hero-stat xp"><div class="hero-lbl"><span>XP</span><span class="v"></span></div><div class="hero-bar"><span></span></div></div>
      <div class="hero-gold"><span>GOLD</span><b></b></div>
      ${s.log ? `<h4 class="hero-log-title">BATTLE LOG</h4><div class="hero-log" aria-live="polite"></div>` : ""}`;
    /** @type {HTMLElement} */ (el.querySelector(".hero-face")).textContent = s.avatar;
    /** @type {HTMLElement} */ (el.querySelector(".hero-name")).textContent = s.name;
    const q = (/** @type {string} */ sel) => /** @type {HTMLElement} */ (el.querySelector(sel));

    /** @param {string} cls @param {number} pct @param {string} text */
    const bar = (cls, pct, text) => {
      q(`.${cls} .hero-bar span`).style.width = `${Math.max(0, Math.min(100, pct))}%`;
      q(`.${cls} .v`).textContent = text;
    };

    ctx.every(30_000, () => {
      const d = new Date();
      const hp = 100 - Math.round((d.getHours() * 60 + d.getMinutes()) / 14.4);
      const mp = 100 - Math.round((((d.getDay() + 6) % 7) * 24 + d.getHours()) / 1.68);
      bar("hp", hp, `${hp}/100`);
      bar("mp", mp, `${mp}/100`);
    });

    ctx.data.watch((/** @type {HeroData} */ d) => {
      const L = levelInfo(d.xp);
      q(".hero-lvl").textContent = `LV ${L.lv}`;
      bar("xp", L.cur / L.max * 100, `${L.cur}/${L.max}`);
      q(".hero-gold b").textContent = `${d.gold} G`;
      if (s.log) q(".hero-log").innerHTML = d.log.length ? d.log.map(e => `<div>${logLine(e)}</div>`).join("") : "<div>Nothing has happened yet.</div>";
    });

    /** @param {string} id @param {number} amount positive = award, negative = take back @param {LogEntry} line */
    function change(id, amount, line) {
      let applied = false, before = 0, after = 0;
      ctx.data.update((/** @type {HeroData} */ d) => {
        const already = id in d.awarded;
        if (amount > 0 ? already : !already) return; // idempotent across instances and tabs
        applied = true;
        before = levelInfo(d.xp).lv;
        d.xp = Math.max(0, d.xp + amount);
        d.gold = Math.max(0, d.gold + Math.sign(amount) * goldFor(Math.abs(amount))); // symmetric: reopening takes back exactly what was given
        if (amount > 0) d.awarded[id] = amount; else delete d.awarded[id];
        const keys = Object.keys(d.awarded);
        if (keys.length > MAX_AWARD_RECORDS) for (const k of keys.slice(0, keys.length - MAX_AWARD_RECORDS)) delete d.awarded[k];
        d.log = [line, ...d.log].slice(0, MAX_LOG);
        after = levelInfo(d.xp).lv;
        if (after > before) d.log.unshift({ kind: "level", text: `LV ${after}` });
      });
      if (!applied) return;
      ctx.emit(ctx.events.RPG_XP_CHANGED, { amount, total: ctx.data.get().xp, reason: line.text });
      if (after > before) ctx.emit(ctx.events.RPG_LEVEL_UP, { level: after });
    }

    ctx.on(ctx.events.TODO_COMPLETED, ({ item }) => {
      const xp = item.xp ?? DEFAULT_XP;
      change(item.id, xp, { kind: "done", text: item.text, xp });
    });
    ctx.on(ctx.events.TODO_UNCOMPLETED, ({ item }) => {
      const xp = ctx.data.get().awarded[item.id];
      if (xp) change(item.id, -xp, { kind: "reopen", text: item.text, xp });
    });
  },
};
