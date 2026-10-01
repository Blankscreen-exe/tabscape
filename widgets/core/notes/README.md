# Widget: Notes

| | |
|---|---|
| **What it does** | Notepad, autosaved 300 ms after typing stops (and on removal/theme switch). |
| **Shared data** | `{ text }`, shared by every theme and every notes instance. |
| **Events emitted** | `NOTE_EDITED { length }`. |
| **Variants** | `default`. |

## Quirks
- Only overwrites the textarea when the text changed elsewhere, so the caret doesn't jump while typing.
