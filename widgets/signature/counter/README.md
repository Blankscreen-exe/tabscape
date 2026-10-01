# Widget: Tab Counter

| | |
|---|---|
| **What it does** | Counts new tabs ("You are new tab number 000123"), with a "since" date. |
| **Shared data** | `{ count, since }` |
| **Events emitted** | None. |
| **Variants** | `default`. |
| **Best with** | `raw-html` (ported from `demos/brutalist/raw-html.html`). |

## Quirks
- Counts **once per page load**, using a module-level flag, so two counter widgets or a theme switch don't double count. Preview pages (`?preview`) use memory storage and never touch the real count.
