# Changelog

User-visible changes. Newest first. Format: `## [version] - YYYY-MM-DD`.

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
