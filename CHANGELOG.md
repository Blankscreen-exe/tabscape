# Changelog

User-visible changes. Newest first. Format: `## [version] - YYYY-MM-DD`.

## [Unreleased]

### Added
- **Hacker News** widget: today's top stories (last 24 h, ranked by points) by default, or front page, newest, Ask HN and Show HN. Points, comments link and age. One request per list via the HN Search API (Algolia), cached 15 minutes, works offline with the last list.
- **Feeling Lucky** can roll from **The Useless Web**'s collection: the live list (fetched weekly once you allow access to theuselessweb.com on the first roll) with a bundled 118-site fallback, credited in the widget. Also new: no repeats until every site was shown, and "go there right away".
- `npm run update:uselessweb` refreshes the bundled list. `core/url.js` holds the shared safe-link rule.
- **Weather widget**: current conditions plus a 3/5/7-day forecast. Your location is detected automatically (named via reverse geocoding), or you can pick any place by searching inside the widget. °C/km/h or °F/mph. Cached 30 minutes and works offline with the last data. Aurora Glass shows it by default.
- `providers/` for online services: Open-Meteo (forecast + place search) and BigDataCloud (location name). Coordinates are rounded to ~1 km before sending. The extension now requests the `geolocation` permission.

### Removed
- Search engine buttons ("pills") on the search bar. They broke narrow layouts as engines were added. The engine is chosen in the widget's settings only.

### Added
- Search engines Brave Search, Ecosia and Startpage, plus a **Custom…** engine (any URL with `{q}`).
- Links show each site's favicon, fetched directly from the site (no third-party service), and fall back to the first letter when there isn't one. Links can carry their own icon URL (`Name | url | icon-url`). A "Letters only" setting makes no network requests.
- README with install and usage instructions and a two-column preview gallery of all 17 themes (`docs/previews/`).
- `npm run previews` regenerates those images with headless Chrome/Edge. Browser detection is shared with the smoke test (`dev/browser.mjs`).

### Fixed
- Feeling Lucky's own list now also only allows web links (it accepted `javascript:` URLs like Links did).
- Links only allow `http(s)` URLs. A `javascript:` link could previously run code when clicked on the dev server (the installed extension's security policy already blocked it).

## [0.5.0] - 2026-10-01

All 15 original design demos are now themes (17 themes in total, with Default and Midnight).

### Added
- Themes: **Raw HTML**, **Neo Brutal**, **Swiss Grid**, **Concrete**, **Retro OS**, **Lo-fi Rain**, **Mission Control**.
- Core widgets: World Clocks, Stopwatch (survives closing the tab), Moon Phase (calculated locally).
- Signature widgets: Tab Counter, Habit Tracker, Minesweeper (first click always safe), Rain Sound (Web Audio), Orbit.
- To-do variant `go-no-go` (mission checklist with an "all stations go" summary).
- Theme hooks: widget roots carry `data-title`, grid frames carry `data-cell` (e.g. `A1`).
- Unit tests for the new widget helpers. The smoke test covers every new widget and theme feature (46 steps).

### Fixed
- Swiss Grid's danger colour no longer equals its accent (found by the S5 check).

## [0.4.0] - 2026-10-01

### Added
- Themes: **Aurora Glass**, **Paper & Ink** (masthead, lined notebook, almanac), **Terminal** (the accent is the phosphor colour), **Synthwave** (striped sun, neon grid floor), **Bento** (follows system light/dark).
- Core widgets: Quote, Progress (tiles or almanac), Calendar, Pomodoro (survives closing the tab), Countdown (weekend, end of day, any date).
- Signature widgets: Terminal (command line) and System Info.
- Search: optional engine buttons ("pills"); the last pick is remembered.
- Unit tests for widget helpers. The smoke test now covers terminal, pomodoro, calendar, engine pills, countdown and almanac.

## [0.3.0] - 2026-10-01

### Added
- Themes: **Zen** (ink-wash mountains, ensō clock, kanji date strip), **RPG Quest** (pixel HUD, level-up banner, +XP popups), **Anti-Design** (marquee ticker, drifting shapes, tilted clashing blocks).
- Signature widgets: Breathe, Intention, Haiku (Zen); Hero (XP, gold, levels, battle log) and Oracle (RPG); Feeling Lucky dice (Anti-Design). All of them can be placed in any theme.
- To-do variant `quest-log` with a difficulty per quest. Search setting for button text.
- Events `RPG_XP_CHANGED` and `RPG_LEVEL_UP`.
- The smoke test now boots every registered theme and covers the RPG, Zen and Anti-Design features.

### Fixed
- The clock no longer overflows narrow widgets (its size now follows width as well as height).

## [0.2.0] - 2026-10-01

### Added
- Accent colour picker in the Customize panel: per-theme accents, a "use for all themes" switch, theme-suggested swatches, a free colour picker, "use theme colour" reset and a low-contrast warning. Text on the accent stays readable automatically.
- Themes can declare `accentRole`, `accentPresets` and `customAccent`. New derived tokens `--accent-soft` and `--accent-strong`. New `ACCENT_CHANGED` event and `ctx.tokens` helper.

### Changed
- Stored data schema v2 (adds accent settings). Existing data is migrated automatically.
- The widget settings dialog saves on submit instead of waiting for the browser's (sometimes late) close event.

### Fixed
- A stray "false" label appeared in the Customize panel in edit mode.
- The Customize panel and dialogs were see-through in glass themes.

## [0.1.0] - 2026-10-01

### Added
- Core engine: versioned store with migrations, event bus, theme/widget registry, theme manager with automatic cleanup, drag/resize widget grid with per-theme layouts and locked slots, settings dialog generated from widget declarations, backup export/import.
- Core widgets: Clock, Search, Links, To-do, Notes.
- Themes: Default (fallback) and Midnight (reference theme with decoration, service, variant and locked slot).
- Dev tooling: static server, project checker, unit tests, headless browser smoke test, theme gallery, git hooks.
- Original design demos kept in `demos/` as porting references.
