# Theme: Retro OS

| | |
|---|---|
| **Look** | 90s desktop: teal background, grey bevelled windows with gradient title bars, desktop icons, taskbar. |
| **Decorations** | Taskbar (clickable, class `interactive`) with a Start button and tray clock. |
| **Services** | None. |
| **Accent** | Navy. Role: window title bars (gradient to a lighter mix), selections, desktop icon letters. Grey bevels and teal desktop stay fixed. 4 presets. |
| **Variants requested** | None. Links become desktop icons purely with CSS. |
| **Signature widgets** | `minesweeper`. |
| **Locked slots** | None. |
| **Origin** | `demos/variety/retro-os.html`. The demo's free-floating window dragging is replaced by the core grid's edit mode. |

## Quirks
- Window titles are `.w::before { content: attr(data-title) }`. The widget host sets `data-title` to the widget's name. The `_ □ ✕` buttons are decorative (`.w::after`). Use edit mode to move or remove windows.
- **Start opens the Customize panel** by dispatching the documented `Alt+C` shortcut. If that shortcut ever changes, update `mount()`.
- The core ✦ button is restyled to sit in the taskbar corner.
