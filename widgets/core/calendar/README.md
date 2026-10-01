# Widget: Calendar

| | |
|---|---|
| **What it does** | Month grid with today highlighted. ‹ › browse months, and clicking the month name jumps back to today. |
| **Shared data** | None. |
| **Events emitted** | None. |
| **Variants** | `default`. |

## Quirks
- Day names come from the browser locale (`toLocaleDateString`), so they follow the user's language.
- `monthGrid()` is exported and unit-tested.
