// Runs dev/smoke.html in a headless Chrome/Edge and prints the result. Zero dependencies.
//   node dev/smoke.mjs        (starts its own server on a free port)
// Set BROWSER=/path/to/chrome to override browser detection.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findBrowser, startServer } from "./browser.mjs";

const browser = findBrowser();
const server = await startServer();
const profile = mkdtempSync(join(tmpdir(), "hp-smoke-"));
let dom = "";
try {
  dom = execFileSync(browser, [
    "--headless=new", "--disable-gpu", `--user-data-dir=${profile}`, "--window-size=1400,1000",
    "--virtual-time-budget=60000", "--dump-dom", `http://localhost:${server.port}/dev/smoke.html`,
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 300000 });
} finally {
  server.stop();
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* browser may still hold files */ }
}

const list = dom.slice(dom.indexOf('<ol id="out">'), dom.indexOf("</ol>"));
const steps = [...list.matchAll(/<li class="(pass|fail)">([\s\S]*?)<\/li>/g)].map(m => m[2].replace(/&lt;/g, "<").replace(/&amp;/g, "&"));
for (const s of steps) console.log(`  ${s}`);
const summary = dom.match(/SMOKE RESULT: (\d+) passed, (\d+) failed/);
if (!summary) { console.error("smoke: did not finish (no summary found)"); process.exit(1); }
console.log(`\n${summary[0]}`);
process.exit(Number(summary[2]) ? 1 : 0);
