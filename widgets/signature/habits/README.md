# Widget: Habit Tracker

| | |
|---|---|
| **What it does** | Grid of habits × weekdays for the current week. Click to tick. Today is outlined. |
| **Shared data** | `{ weeks: { [mondayYYYY-MM-DD]: { "habit text|dayIndex": true } } }`. Only the last 12 weeks are kept. |
| **Events emitted** | None (candidate: `HABIT_TICKED`, e.g. for RPG XP). |
| **Variants** | `default`. |
| **Best with** | `neo-brutal` (ported from `demos/brutalist/neo-brutal.html`). |

## Quirks
- Marks are keyed by the habit's **text**, so reordering habits in the settings keeps their ticks. Renaming a habit starts it fresh.
- `weekKey()` is unit-tested (local Monday, not UTC).
