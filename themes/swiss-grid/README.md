# Theme: Swiss Grid

| | |
|---|---|
| **Look** | International typographic style: a full-width giant clock, a strict ruled grid with no gaps, numbered sections ("01 — Clock"), black/white/red. |
| **Decorations** | None. The section labels are CSS: a counter on `.g-item` plus the widget's `data-title`. |
| **Services** | None. |
| **Accent** | Swiss red. Role: section numbers, date, search button hover, task numbers. 4 presets. |
| **Variants requested** | None. Links use the per-instance `style: list` setting. |
| **Signature widgets** | None. Uses core `worldclock`. |
| **Locked slots** | None. |
| **Origin** | `demos/brutalist/swiss-grid.html`. The red date block became the red date line on the clock. |

## Quirks
- `--gap: 0px`. Rules come from `box-shadow: 0 0 0 1px` on every widget, so neighbours combine into 2px lines.
- Section numbers follow DOM order, which is the order widgets were added. After rearranging, numbers may not match reading order.
