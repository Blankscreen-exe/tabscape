// Regenerates the README theme previews in docs/previews/<theme-id>.png. Zero dependencies.
//   node dev/previews.mjs              all registered themes
//   node dev/previews.mjs zen bento    only these
// Renders each theme at 1440×900 in preview mode (sample state, nothing saved) and saves it at half size.
// Run after visual changes to a theme (rule Q2), then commit the images.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { findBrowser, startServer } from "./browser.mjs";

const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const wanted = process.argv.slice(2);
const themes = registry.themes.map(t => t.id).filter(id => !wanted.length || wanted.includes(id));
const outDir = resolve("docs/previews");
mkdirSync(outDir, { recursive: true });

const browser = findBrowser();
const server = await startServer();
const profile = mkdtempSync(join(tmpdir(), "hp-previews-"));
try {
  for (const id of themes) {
    const file = join(outDir, `${id}.png`);
    execFileSync(browser, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${profile}`,
      "--window-size=1440,900", "--force-device-scale-factor=0.5",
      // Light system theme so "follows the system" themes (Bento) render consistently.
      "--blink-settings=preferredColorScheme=1",
      "--virtual-time-budget=5000", `--screenshot=${file}`,
      `http://localhost:${server.port}/newtab.html?preview&embed&theme=${id}`,
    ], { stdio: "ignore", timeout: 60000 });
    console.log(`  ${id.padEnd(16)} ${(statSync(file).size / 1024).toFixed(0)} KB`);
  }
} finally {
  server.stop();
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* ignore */ }
}
console.log(`\n${themes.length} preview(s) written to docs/previews/`);
