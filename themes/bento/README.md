# Theme: Bento

| | |
|---|---|
| **Look** | Clean rounded "bento box" tiles. The clock tile is inverted. Light or dark, following the system setting. |
| **Decorations** | None. |
| **Services** | None. |
| **Accent** | Orange. Role: buttons, today on the calendar, timer ring, progress bars, the "one thing" tile. 5 presets. |
| **Variants requested** | None. |
| **Signature widgets** | None. Uses core `calendar`, `pomodoro`, `progress`, and the `intention` widget as "Today's one thing". |
| **Locked slots** | None. |
| **Origin** | `demos/bento.html`. The demo's manual light/dark tile was replaced by following the system setting. |

## Quirks
- Dark mode lives in `theme.css` under `@media (prefers-color-scheme: dark)`. It overrides the light tokens from `theme.js` because it is in the same layer with the same specificity and loads later. `colorScheme: "light"` in `theme.js` is the default only.
- The accent picker's contrast warning measures against the active background, so it adapts to light and dark.
