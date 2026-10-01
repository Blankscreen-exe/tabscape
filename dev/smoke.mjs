// Runs dev/smoke.html in a headless Chrome/Edge and prints the result. Zero dependencies.
//   node dev/smoke.mjs        (starts its own server on a free port)
// Set BROWSER=/path/to/chrome to override browser detection.
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CANDIDATES = [
  process.env.BROWSER,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge",
].filter(Boolean);

const browser = CANDIDATES.find(p => existsSync(p));
if (!browser) { console.error("smoke: no Chrome/Edge found — set BROWSER=/path/to/browser"); process.exit(2); }

const port = 5900 + Math.floor(Math.random() * 90);
const server = spawn(process.execPath, ["dev/serve.mjs", String(port)], { stdio: "ignore" });
await new Promise(r => setTimeout(r, 600));

const profile = mkdtempSync(join(tmpdir(), "hp-smoke-"));
let dom = "";
try {
  dom = execFileSync(browser, [
    "--headless=new", "--disable-gpu", `--user-data-dir=${profile}`, "--window-size=1400,1000",
    "--virtual-time-budget=30000", "--dump-dom", `http://localhost:${port}/dev/smoke.html`,
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 120000 });
} finally {
  server.kill();
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* browser may still hold files */ }
}

const list = dom.slice(dom.indexOf('<ol id="out">'), dom.indexOf("</ol>"));
const steps = [...list.matchAll(/<li class="(pass|fail)">([\s\S]*?)<\/li>/g)].map(m => m[2].replace(/&lt;/g, "<").replace(/&amp;/g, "&"));
for (const s of steps) console.log(`  ${s}`);
const summary = dom.match(/SMOKE RESULT: (\d+) passed, (\d+) failed/);
if (!summary) { console.error("smoke: did not finish (no summary found)"); process.exit(1); }
console.log(`\n${summary[0]}`);
process.exit(Number(summary[2]) ? 1 : 0);
