// @ts-check
/**
 * Terminal — CRT phosphor console. The accent IS the phosphor colour: all text and glow follow it,
 * so the accent picker replaces the demo's `color green|amber|cyan` command.
 * Ported from demos/terminal.html.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "terminal",
  name: "Terminal",
  description: "CRT phosphor console with a command line. Pick amber or cyan with the accent colour.",
  colorScheme: "dark",
  css: "theme.css",
  tokens: {
    "--bg": "#050805",
    "--surface": "#060a06",
    "--surface-2": "color-mix(in srgb, var(--accent) 8%, #050805)",
    "--text": "var(--accent)",
    "--muted": "color-mix(in srgb, var(--accent) 55%, #050805)",
    "--accent": "#39ff88",
    "--accent-contrast": "#050805",
    "--border": "color-mix(in srgb, var(--accent) 45%, #050805)",
    "--danger": "#ff5555",
    "--radius": "0px",
    "--gap": "24px",
    "--shadow": "none",
    "--font-body": "\"Cascadia Code\", \"Cascadia Mono\", Consolas, \"Courier New\", monospace",
    "--font-display": "\"Cascadia Code\", \"Cascadia Mono\", Consolas, \"Courier New\", monospace",
    "--font-mono": "\"Cascadia Code\", \"Cascadia Mono\", Consolas, \"Courier New\", monospace",
  },
  grid: { columns: 12, rowHeight: 72, maxWidth: "1100px" },
  variants: { links: "list" },
  signatureWidgets: ["terminal", "sysinfo"],
  accentRole: "the phosphor: all text, borders and glow",
  accentPresets: ["#39ff88", "#ffb000", "#5cf2ff", "#e8e8e8"],
  defaultLayout: [
    { id: "terminal-1", widget: "terminal", x: 0, y: 0, w: 8, h: 8 },
    { id: "clock-1", widget: "clock", x: 8, y: 0, w: 4, h: 2, settings: { seconds: true, hour12: false, greeting: false } },
    { id: "sysinfo-1", widget: "sysinfo", x: 8, y: 2, w: 4, h: 3 },
    { id: "links-1", widget: "links", x: 8, y: 5, w: 4, h: 3, settings: { title: "bookmarks" } },
  ],
};
