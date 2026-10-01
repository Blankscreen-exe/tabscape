# Widget: Minesweeper

| | |
|---|---|
| **What it does** | Classic Minesweeper: left click opens, right click flags, the face starts a new game. Mines left and seconds are shown on the counters. |
| **Shared data** | None (a game lasts as long as the tab). |
| **Events emitted** | None (candidate: `GAME_WON` for RPG XP). |
| **Variants** | `default`. |
| **Best with** | `retro-os` (ported from `demos/variety/retro-os.html`). |

## Quirks
- Improvement over the demo: the board is generated on the **first click**, which is never a mine and never next to one.
- Number colours (`COLORS`) are the classic fixed palette. They're game identity, not theme colours.
- `neighbours()` and `makeBoard()` are unit-tested.
