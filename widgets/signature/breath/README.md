# Widget: Breathe

| | |
|---|---|
| **What it does** | Breathing guide: the orb grows (in), holds, shrinks (out). Click to start or stop. |
| **Shared data** | None. |
| **Events emitted** | None. |
| **Variants** | `default`. |
| **Best with** | `zen` (ported from `demos/variety/zen.html`). |

## Quirks
- Patterns are in `PATTERNS` at the top of `widget.js`. Each phase is `[label, seconds, "big" | "small"]`.
- Under `prefers-reduced-motion` the orb doesn't animate (global rule in `core/tokens.css`), but the words still guide the timing.
