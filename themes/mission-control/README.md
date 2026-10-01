# Theme: Mission Control

| | |
|---|---|
| **Look** | Dark sci-fi console: cyan grid lines, a vignette, thin panels with corner brackets, mono labels, a blinking LIVE header. |
| **Decorations** | Header bar with the LIVE date. Grid and vignette are CSS. |
| **Services** | None. |
| **Accent** | Cyan. Role: lines, brackets, titles, the main satellite, buttons. `--border`, `--surface-2` and the grid lines derive from the accent. Amber T-minus and green GO stay fixed. 4 presets. |
| **Variants requested** | `todo: go-no-go`, `links: list` (shown as `CH-01 … ● OPEN`). |
| **Signature widgets** | `orbit`, `sysinfo` (as Telemetry). Uses core `moon` and `countdown` (end of day). |
| **Locked slots** | None. |
| **Origin** | `demos/variety/mission-control.html` |

## Quirks
- In the GO/NO-GO checklist, clicking an item toggles GO and NO-GO (it's the shared to-do list). The summary line says "ALL STATIONS GO" when every item is done.
