# Widget: Stopwatch

| | |
|---|---|
| **What it does** | Start/stop, laps (newest first, up to 50), reset. |
| **Shared data** | `{ startedAt, acc, laps }`. It stores the start time and accumulated time, so it keeps running across tabs and after closing the page. |
| **Events emitted** | None. |
| **Variants** | `default`. |

## Quirks
- The display updates every animation frame (`ctx.loop`), and stops automatically when the widget unmounts.
- `formatMs()` is unit-tested.
