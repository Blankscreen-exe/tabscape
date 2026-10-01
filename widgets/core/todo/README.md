# Widget: To-do

| | |
|---|---|
| **What it does** | Task list: add, toggle done (click the text or circle), delete. |
| **Shared data** | `{ items: [{ id, text, done, created, doneAt? }] }`, shared by every theme (RPG quests, GO/NO-GO checklists… are variants of this). |
| **Events emitted** | `TODO_ADDED`, `TODO_COMPLETED`, `TODO_UNCOMPLETED`, `TODO_REMOVED` (payload `{ item }`). Themes build gamification on these. |
| **Variants** | `default`. Planned: `quest-log` (RPG), `go-no-go` (Mission Control). |

## Quirks
- Follows "data down, events up": click handlers only change data, and `ctx.data.watch` redraws.
