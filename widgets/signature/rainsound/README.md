# Widget: Rain Sound

| | |
|---|---|
| **What it does** | Plays rain generated with Web Audio (looped brown-ish noise through a low-pass filter, plus random droplet ticks). Volume and "storm" sliders. |
| **Shared data** | `{ volume, storm }`, remembered across tabs. Play state is per tab. |
| **Events emitted** | None. |
| **Variants** | `default`. |
| **Best with** | `lofi-rain` (ported from `demos/variety/lofi-rain.html`). |

## Quirks
- Never autoplays (browsers block audio before a click anyway).
- The `AudioContext` is closed on unmount (theme switch / widget removed), so sound always stops with the widget.
- The droplet loop uses `ctx.after`, so it is cleaned up automatically too.
