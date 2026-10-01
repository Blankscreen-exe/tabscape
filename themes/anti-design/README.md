# Theme: Anti-Design

| | |
|---|---|
| **Look** | Pure blue page, clashing neon blocks, mixed fonts (Times, Arial Black, Courier, Comic Sans), tilted widgets with hard shadows. |
| **Decorations** | Yellow marquee ticker at the top. Six drifting shapes (`ctx.loop`), skipped entirely for `prefers-reduced-motion`. |
| **Services** | None. |
| **Accent** | Neon green. Role: the giant clock, buttons, the die. Pink, yellow and orange are fixed identity colours (`--anti-pink`, `--anti-yellow`, `--anti-orange`). 4 presets. |
| **Variants requested** | None. Links are restyled into mismatched stickers purely with CSS. |
| **Signature widgets** | `dice`. |
| **Locked slots** | None. Chaos is optional. |
| **Origin** | `demos/brutalist/anti-design.html` |

## Quirks
- Widget tilts are on `.w` (not the grid frame) and are **removed in edit mode**, so drag handles line up.
- `#grid` gets extra top padding to clear the ticker.
