# Theme: RPG Quest

| | |
|---|---|
| **Look** | Retro pixel RPG: checkerboard background, thick white window borders, hard pixel shadows, bold mono font. |
| **Decorations** | Level-up banner and floating `+XP` / `−XP` text, driven by `RPG_LEVEL_UP` and `RPG_XP_CHANGED`. |
| **Services** | None. **Game rules live in the `hero` widget**, so the theme only celebrates. |
| **Accent** | Gold. Role: titles, gold, highlights, buttons. HP/MP/XP bar colours (red/blue/green) stay fixed. 4 presets. |
| **Variants requested** | `todo: quest-log` (difficulty → XP per quest). |
| **Signature widgets** | `hero` (stats, XP, gold, battle log), `oracle` (dialogue box). |
| **Locked slots** | `hero-1`: XP is only earned while a hero widget is on the page. |
| **Origin** | `demos/variety/rpg-quest.html` |

## Quirks
- Search is the core search widget with settings `placeholder: "Cast a search spell…"` and `button: "CAST"`.
- Links are shown as inventory slots (3-column grid) purely through theme CSS.
- `#0b0d18` (pixel shadow) and the checkerboard colour are fixed identity colours, not the accent.
