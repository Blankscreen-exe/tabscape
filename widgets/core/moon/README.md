# Widget: Moon Phase

| | |
|---|---|
| **What it does** | Shows the current moon phase name, illumination and age, with a drawing. Calculated locally from a known new moon (6 Jan 2000) and the synodic month. No network. |
| **Shared data** | None. |
| **Events emitted** | None. |
| **Variants** | `default`. |

## Quirks
- Accurate to within about a day, which is fine for a new tab and not for astronomy. `moonPhase()` and `litPath()` are unit-tested.
