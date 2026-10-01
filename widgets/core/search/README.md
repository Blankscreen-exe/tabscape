# Widget: Search

| | |
|---|---|
| **What it does** | Web search. Engines are listed in `ENGINES` at the top of `widget.js`. |
| **Shared data** | `{ picked }`: the engine last chosen with the engine buttons (shared, so every search widget remembers it). The default engine itself is a per-instance setting. |
| **Events emitted** | `SEARCH_SUBMITTED { query, engine }` just before navigating. |
| **Variants** | `default`. |

## Quirks
- Optional engine buttons: setting `pills`, e.g. `google, duckduckgo, youtube` (ids from `ENGINES`). Unknown ids are ignored.
- Optional submit button: setting `button` (e.g. RPG Quest's "CAST").
- Autofocus is skipped while editing the layout. Browsers may keep focus in the address bar on a new tab regardless.
