# Widget: Oracle

| | |
|---|---|
| **What it does** | Dialogue box: a time-of-day greeting typed out letter by letter, then tips. Click for the next line. |
| **Shared data** | None. |
| **Events emitted** | None. |
| **Variants** | `default`. |
| **Best with** | `rpg-quest` (ported from `demos/variety/rpg-quest.html`). |

## Quirks
- Lines are `greeting()` + `TIPS` in `widget.js`.
- The speaker tag sits above the box (`overflow: visible`). Leave a little room above the widget.
