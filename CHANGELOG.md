# Changelog

User-visible changes. Newest first. Format: `## [version] - YYYY-MM-DD`.

## [0.1.0] - 2026-10-01

### Added
- Core engine: versioned store with migrations, event bus, theme/widget registry, theme manager with automatic cleanup, drag/resize widget grid with per-theme layouts and locked slots, settings dialog generated from widget declarations, backup export/import.
- Core widgets: Clock, Search, Links, To-do, Notes.
- Themes: Default (fallback) and Midnight (reference theme with decoration, service, variant and locked slot).
- Dev tooling: static server, project checker, unit tests, headless browser smoke test, theme gallery, git hooks.
- Original design demos kept in `demos/` as porting references.
