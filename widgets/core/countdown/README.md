# Widget: Countdown

| | |
|---|---|
| **What it does** | Time left until the weekend (Saturday 00:00), the end of the day, or a chosen date. |
| **Shared data** | None. |
| **Events emitted** | None. |
| **Variants** | `default`. Synthwave styles it as a neon readout with CSS. |

## Quirks
- During the weekend, weekend mode shows "IT'S NOW".
- `targetFor()` is exported and unit-tested. A date-only value (`YYYY-MM-DD`) means local midnight; anything else is passed to `new Date()` (e.g. `2026-12-24T18:00`).
