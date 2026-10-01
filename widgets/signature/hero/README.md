# Widget: Hero

| | |
|---|---|
| **What it does** | RPG stats: level, XP, gold, HP (= how much of the day is left), MP (= how much of the week is left), battle log. |
| **Shared data** | `{ xp, gold, awarded: { [todoId]: xp }, log: [{ kind, text, xp? }] }`, with `kind` one of `done`, `reopen`, `level`. The log is plain data and is escaped when shown. |
| **Listens to** | `TODO_COMPLETED` (award `item.xp ?? 25` XP and half in gold), `TODO_UNCOMPLETED` (take it back). |
| **Events emitted** | `RPG_XP_CHANGED { amount, total, reason }`, `RPG_LEVEL_UP { level }`. The RPG Quest theme uses these for its level-up banner. |
| **Variants** | `default`. |
| **Best with** | `rpg-quest` (ported from `demos/variety/rpg-quest.html`). |

## Quirks
- **All game rules live in this widget.** Themes only celebrate (they listen to the RPG events).
- Awards are keyed by to-do id, so two hero widgets, or two open tabs, never award the same quest twice. The award record is capped at 500 entries.
- XP is only earned while a hero widget is on the page. In RPG Quest it is a locked slot, so it always is.
- Bar colours: `--hero-hp`, `--hero-mp`, `--hero-xp` (token defaults; themes may override).
