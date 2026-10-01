# Changelog

User-visible changes. Newest first. Format: `## [version] - YYYY-MM-DD`.

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
