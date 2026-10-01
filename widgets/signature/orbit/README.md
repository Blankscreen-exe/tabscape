# Widget: Orbit

| | |
|---|---|
| **What it does** | Animated orbital view (three satellites around a planet) and "mission elapsed time", which is simply the time since local midnight. |
| **Shared data** | None. |
| **Events emitted** | None. |
| **Variants** | `default`. |
| **Best with** | `mission-control` (ported from `demos/variety/mission-control.html`). |

## Quirks
- The main satellite uses the accent. The others use `--warning` / `--success`.
- The planet gradient (cyan → deep blue) is fixed artwork.
- Orbits are CSS animations, so they stop under `prefers-reduced-motion`.
