# Theme: Midnight

The reference theme: it uses every theme feature in a small amount of code. Copy patterns from here.

| | |
|---|---|
| **Look** | Dark navy sky, frosted-glass widgets, glowing hero clock. |
| **Decorations** | Full-screen twinkling starfield canvas in `#decor` (`ctx.loop`, resizes with `ctx.listen`). |
| **Services** | Listens to `TODO_COMPLETED`: launches a shooting star and counts it in `ctx.state.starsLaunched`. |
| **Accent** | Role: buttons, link icons, shooting stars. The canvas re-reads the accent on `ACCENT_CHANGED`, which is the reference pattern for canvas effects. |
| **Variants requested** | `links: list` |
| **Signature widgets** | None yet. |
| **Locked slots** | `clock-1` (the hero clock defines the look). |
| **Origin** | New. Loosely based on `demos/aurora-glass.html`. |
