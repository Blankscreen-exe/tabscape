// Project consistency checker. Zero dependencies.   node dev/check.mjs
//
// Verifies the rules in docs/MAINTAINING.md that a machine can verify:
//  - registry.json <-> folders on disk (nothing missing, nothing orphaned)
//  - every theme/widget passes its contract (core/contracts.js), ids match registry + folder
//  - declared css files exist; theme css is layered + scoped
//  - default layouts only reference registered widgets; requested variants exist
//  - themes/widgets import only from core/ or their own folder
//  - every ctx.events.X used exists in core/events.js
//  - widget css uses tokens, not hard-coded colours (warning)
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateTheme, validateWidget } from "../core/contracts.js";
import { EVENTS } from "../core/events.js";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
const rel = p => relative(ROOT, p).split(sep).join("/");
const dirs = p => existsSync(p) ? readdirSync(p).filter(n => statSync(join(p, n)).isDirectory()) : [];

/** All .js/.css files under a folder (recursive). */
function files(dir, exts) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true }).map(f => join(dir, String(f))).filter(f => exts.some(e => f.endsWith(e)) && statSync(f).isFile());
}

async function importDef(file) {
  try { return (await import(pathToFileURL(file).href)).default; }
  catch (e) { err(rel(file), `failed to import: ${e.message}`); return null; }
}

// ------------------------------------------------------------------ registry
const registry = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf8"));
const widgetIds = new Set(registry.widgets.map(w => w.id));
const loadedWidgets = new Map();

for (const kind of ["themes", "widgets"]) {
  const seen = new Set();
  for (const entry of registry[kind]) {
    if (seen.has(entry.id)) err("registry.json", `duplicate ${kind} id "${entry.id}"`);
    seen.add(entry.id);
    if (!existsSync(join(ROOT, entry.path))) err("registry.json", `${entry.id}: missing file ${entry.path}`);
  }
}

// orphans: folders that exist but are not registered
const registeredPaths = new Set([...registry.themes, ...registry.widgets].map(e => dirname(e.path)));
const folders = [
  ...dirs(join(ROOT, "themes")).filter(n => !n.startsWith("_")).map(n => `themes/${n}`),
  ...["core", "signature"].flatMap(g => dirs(join(ROOT, "widgets", g)).map(n => `widgets/${g}/${n}`)),
];
for (const f of folders) if (!registeredPaths.has(f)) err(f, "folder is not listed in registry.json");

// ------------------------------------------------------------------ widgets
async function checkWidget(file, registryId) {
  const where = rel(file);
  const def = await importDef(file);
  if (!def) return;
  validateWidget(def).forEach(m => err(where, m));
  if (registryId && def.id !== registryId) err(where, `id "${def.id}" != registry id "${registryId}"`);
  if (registryId && def.id !== dirname(file).split(sep).pop()) err(where, `id "${def.id}" should equal its folder name`);
  if (def.css && !existsSync(join(dirname(file), def.css))) err(where, `css file "${def.css}" not found`);
  loadedWidgets.set(def.id, def);
}
for (const w of registry.widgets) if (existsSync(join(ROOT, w.path))) await checkWidget(join(ROOT, w.path), w.id);

// ------------------------------------------------------------------ themes
async function checkTheme(file, registryId) {
  const where = rel(file);
  const def = await importDef(file);
  if (!def) return;
  validateTheme(def).forEach(m => err(where, m));
  if (registryId && def.id !== registryId) err(where, `id "${def.id}" != registry id "${registryId}"`);
  if (registryId && def.id !== dirname(file).split(sep).pop()) err(where, `id "${def.id}" should equal its folder name`);
  if (def.css) {
    const cssPath = join(dirname(file), def.css);
    if (!existsSync(cssPath)) err(where, `css file "${def.css}" not found`);
    else {
      const css = readFileSync(cssPath, "utf8");
      if (!css.includes("@layer theme")) warn(rel(cssPath), "should wrap rules in @layer theme");
      if (registryId && !css.includes(`[data-theme="${def.id}"]`)) warn(rel(cssPath), `selectors should be scoped with [data-theme="${def.id}"]`);
    }
  }
  // S5: the accent's literal value must not be repeated — repeated copies won't follow the user's accent.
  const accentLiteral = String(def.tokens?.["--accent"] ?? "").trim().toLowerCase();
  if (registryId && /^#[0-9a-f]{3,8}$/.test(accentLiteral)) {
    const count = (/** @type {string} */ text) => text.toLowerCase().split(accentLiteral).length - 1;
    const jsSrc = readFileSync(file, "utf8");
    const allowed = 1 + (def.accentPresets ?? []).filter(c => c.toLowerCase() === accentLiteral).length;
    if (count(jsSrc) > allowed) warn(where, `accent ${accentLiteral} is repeated — use ctx.tokens.color("--accent") so the user's accent applies`);
    if (def.css && existsSync(join(dirname(file), def.css)) && count(readFileSync(join(dirname(file), def.css), "utf8"))) {
      warn(rel(join(dirname(file), def.css)), `accent ${accentLiteral} is hard-coded — use var(--accent) / var(--accent-soft) / var(--accent-strong)`);
    }
  }
  if (registryId && def.customAccent !== false && !def.accentRole) warn(where, "add accentRole (shown in the accent picker)");

  if (!registryId) return; // templates: contract only
  for (const item of def.defaultLayout ?? []) {
    if (!widgetIds.has(item.widget)) err(where, `defaultLayout uses unregistered widget "${item.widget}"`);
  }
  for (const [widget, variant] of Object.entries(def.variants ?? {})) {
    const w = loadedWidgets.get(widget);
    if (!w) err(where, `variant requested for unknown widget "${widget}"`);
    else if (!(w.variants ?? ["default"]).includes(variant)) warn(where, `widget "${widget}" has no variant "${variant}" (will render "default")`);
  }
  for (const s of def.signatureWidgets ?? []) if (!widgetIds.has(s)) err(where, `signature widget "${s}" is not registered`);
}
for (const t of registry.themes) if (existsSync(join(ROOT, t.path))) await checkTheme(join(ROOT, t.path), t.id);
if (!registry.themes.some(t => t.id === "default")) err("registry.json", 'the fallback theme "default" must stay registered');

// templates must always be valid examples
await checkTheme(join(ROOT, "themes/_template/theme.js"));
await checkWidget(join(ROOT, "widgets/_template/widget.js"));

// ------------------------------------------------------------------ source rules
const knownEvents = new Set(Object.keys(EVENTS));
const pluginRoots = [
  ...registry.themes.map(t => dirname(join(ROOT, t.path))),
  ...registry.widgets.map(w => dirname(join(ROOT, w.path))),
  join(ROOT, "themes/_template"), join(ROOT, "widgets/_template"),
];
const coreDir = join(ROOT, "core") + sep;

for (const dir of pluginRoots) {
  for (const file of files(dir, [".js"])) {
    const raw = readFileSync(file, "utf8");
    // ignore block comments and whole-line // comments (examples in docs are not code)
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const m of raw.matchAll(/(?:import\s[^"']*?from\s*|import\s*\(\s*|import\s+)["']([^"']+)["']/g)) {
      const spec = m[1];
      if (!spec.startsWith(".")) { err(rel(file), `bare/remote import "${spec}" — vendor it under vendor/ instead`); continue; }
      const target = resolve(dirname(file), spec);
      if (!target.startsWith(coreDir) && !target.startsWith(dir + sep) && !target.startsWith(join(ROOT, "vendor") + sep)) {
        err(rel(file), `imports "${spec}" — themes/widgets may only import from core/, vendor/ or their own folder`);
      }
    }
    for (const m of src.matchAll(/events\.([A-Z][A-Z0-9_]*)/g)) {
      if (!knownEvents.has(m[1])) err(rel(file), `unknown event EVENTS.${m[1]} — add it to core/events.js`);
    }
  }
}

for (const file of files(join(ROOT, "widgets"), [".css"])) {
  const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  if (/#[0-9a-f]{3,8}\b|rgba?\(\s*\d/i.test(css)) warn(rel(file), "hard-coded colour — widgets should use tokens (var(--…))");
  if (!css.includes("@layer widgets")) warn(rel(file), "should wrap rules in @layer widgets");
}

// ------------------------------------------------------------------ report
for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
console.log(`\ncheck: ${registry.themes.length} themes, ${registry.widgets.length} widgets — ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
