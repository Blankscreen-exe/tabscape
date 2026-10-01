# Widget: Search

| | |
|---|---|
| **What it does** | Web search. Engines are listed in `ENGINES` at the top of `widget.js`. |
| **Shared data** | None (engine is a per-instance setting). |
| **Events emitted** | `SEARCH_SUBMITTED { query, engine }` just before navigating. |
| **Variants** | `default`. |

## Quirks
- Autofocus is skipped while editing the layout. Browsers may keep focus in the address bar on a new tab regardless.
