// @ts-check
/**
 * Bento — clean bento-box grid, follows the system light/dark setting.
 * Ported from demos/bento.html.
 */

/** @type {import("../../core/contracts.js").ThemeDef} */
export default {
  apiVersion: 1,
  id: "bento",
  name: "Bento",
  description: "Clean rounded boxes. Follows your system's light or dark mode.",
  colorScheme: "light",
  css: "theme.css",
  tokens: {
    "--bg": "#eef0f4",
    "--surface": "#ffffff",
    "--surface-2": "#f6f7f9",
    "--text": "#15171c",
    "--muted": "#6b7280",
    "--accent": "#ff5a36",
    "--accent-contrast": "#ffffff",
    "--border": "#e5e7eb",
    "--danger": "#e5484d",
    "--radius": "26px",
    "--gap": "16px",
    "--shadow": "0 1px 2px rgb(16 24 40 / .04), 0 8px 24px -12px rgb(16 24 40 / .12)",
    "--font-body": "\"Segoe UI Variable Text\", \"Segoe UI\", system-ui, sans-serif",
    "--font-display": "\"Segoe UI Variable Display\", \"Segoe UI\", system-ui, sans-serif",
    "--font-mono": "\"Cascadia Mono\", Consolas, monospace",
    "--success": "#22c55e",
  },
  grid: { columns: 12, rowHeight: 80, maxWidth: "1160px" },
  accentRole: "buttons, today on the calendar, the timer ring, progress bars",
  accentPresets: ["#ff5a36", "#3b82f6", "#22c55e", "#a855f7", "#eab308"],
  defaultLayout: [
    { id: "clock-1", widget: "clock", x: 0, y: 0, w: 6, h: 2 },
    { id: "calendar-1", widget: "calendar", x: 6, y: 0, w: 3, h: 4 },
    { id: "pomodoro-1", widget: "pomodoro", x: 9, y: 0, w: 3, h: 4 },
    { id: "search-1", widget: "search", x: 0, y: 2, w: 6, h: 1, settings: { placeholder: "Search…", pills: "google, duckduckgo, youtube" } },
    { id: "links-1", widget: "links", x: 0, y: 3, w: 6, h: 5, settings: { title: "Favorites" } },
    { id: "intention-1", widget: "intention", x: 6, y: 4, w: 6, h: 2, settings: { title: "🎯 Today's one thing", placeholder: "What matters most today?" } },
    { id: "progress-1", widget: "progress", x: 6, y: 6, w: 6, h: 2, settings: { title: "Time" } },
  ],
};
