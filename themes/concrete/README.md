# Theme: Concrete

| | |
|---|---|
| **Look** | Raw concrete texture with exposed grid lines, hazard-tape stripes top and bottom, ink-bordered slabs with bolt heads and grid-cell tags (A1, J4…), uppercase stencil mono. |
| **Decorations** | Hazard tape (top + bottom) and a black site header with the weekday. |
| **Services** | None. |
| **Accent** | Hazard yellow. Role: tape, header text, buttons, the shift slab. Concrete, ink and rust (`--danger`) stay fixed. 4 presets. |
| **Variants requested** | None. |
| **Signature widgets** | None. Uses core `countdown` (end of day, as "Shift ends in") and `stopwatch`. |
| **Locked slots** | None. |
| **Origin** | `demos/brutalist/concrete.html`. The "shift status" panel became the end-of-day countdown. |

## Quirks
- Slab tags use `.g-item::before { content: attr(data-cell) }`. The grid sets `data-cell` from each widget's position, so tags update when you move a slab.
- `--gap: 0px` with `outline-offset: -1.5px` makes neighbouring 3px borders overlap into single rules.
