# Theme: Terminal

| | |
|---|---|
| **Look** | CRT phosphor console: black screen, glowing monospace text, scanlines, boxes with `[ title ]` notches. |
| **Decorations** | Scanlines + rare flicker as `body::after` (pure CSS, no JS). |
| **Services** | None. |
| **Accent** | **The phosphor itself**: `--text`, `--muted`, `--border` and `--surface-2` are all derived from `var(--accent)`, so picking amber turns the whole screen amber. Presets: green, amber, cyan, white. |
| **Variants requested** | `links: list` (shown as `> name`). |
| **Signature widgets** | `terminal` (command line), `sysinfo`. |
| **Locked slots** | None. |
| **Origin** | `demos/terminal.html`. The demo's `color` command was replaced by the accent picker, and the joke syslog was dropped. |

## Quirks
- Widgets get `overflow: visible` so the `[ title ]` notch can sit on the top border.
- Text and accent are the same colour, so a very dark pick makes *everything* hard to read. The low-contrast warning in the picker covers that.
