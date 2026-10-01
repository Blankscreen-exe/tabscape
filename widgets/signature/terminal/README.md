# Widget: Terminal

| | |
|---|---|
| **What it does** | Command line: `g`, `d`, `yt`, `gh`, `w` + query search; `open` + bookmark key or url; `ls`, `date`, `clear`, `help`. A bookmark key on its own opens it, and anything else searches Google. ↑/↓ for history. |
| **Shared data** | None. Bookmarks are a per-instance setting: one per line, as key, name and url separated by vertical bars. |
| **Events emitted** | `SEARCH_SUBMITTED { query, engine: "terminal" }` before navigating. |
| **Variants** | `default`. |
| **Best with** | `terminal` (ported from `demos/terminal.html`). |

## Quirks
- `interpret()` is pure and unit-tested. Add commands there.
- The demo's `color amber` command is gone: the accent picker does that now, for every theme.
