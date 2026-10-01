// Zero-dependency static file server for development.
//   node dev/serve.mjs [port]      then open http://localhost:5173/newtab.html
// (ES modules don't load from file://, so the page needs a server outside the extension.)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.argv[2] ?? 5173);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".ogg": "audio/ogg",
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://x");
    let path = normalize(join(ROOT, decodeURIComponent(url.pathname)));
    if (!path.startsWith(ROOT + sep) && path !== ROOT) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = join(path, url.pathname === "/" ? "newtab.html" : "index.html");
    const body = await readFile(path);
    res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream", "cache-control": "no-store" }).end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
  }
}).listen(PORT, () => {
  console.log(`Serving ${ROOT}`);
  console.log(`  App:     http://localhost:${PORT}/newtab.html`);
  console.log(`  Gallery: http://localhost:${PORT}/dev/gallery.html`);
  console.log(`  Demos:   http://localhost:${PORT}/demos/index.html`);
});
