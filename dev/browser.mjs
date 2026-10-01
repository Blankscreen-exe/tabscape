// Shared helpers for dev scripts that drive a real browser (smoke test, README previews).
// Zero dependencies. Set BROWSER=/path/to/chrome to override detection.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

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

/** Path to an installed Chromium browser, or exits with a helpful message. */
export function findBrowser() {
  const found = CANDIDATES.find(p => existsSync(p));
  if (!found) { console.error("no Chrome/Edge found — set BROWSER=/path/to/browser"); process.exit(2); }
  return found;
}

/** Start dev/serve.mjs on a random free-ish port. @returns {Promise<{ port: number, stop: () => void }>} */
export async function startServer() {
  const port = 5900 + Math.floor(Math.random() * 90);
  const server = spawn(process.execPath, ["dev/serve.mjs", String(port)], { stdio: "ignore" });
  await new Promise(r => setTimeout(r, 600));
  return { port, stop: () => server.kill() };
}
