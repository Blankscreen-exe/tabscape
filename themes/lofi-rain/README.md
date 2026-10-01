# Theme: Lo-fi Rain

| | |
|---|---|
| **Look** | Night city skyline with lit windows, rain streaking across the glass, warm lamp glow from below, frosted widgets. |
| **Decorations** | Skyline canvas (seeded random, so it looks the same in every tab), rain canvas (`ctx.loop`; a still drizzle for `prefers-reduced-motion`), fog/vignette. |
| **Services** | None. |
| **Accent** | Warm lamp orange. Role: lamp glow, most lit windows (the skyline redraws on `ACCENT_CHANGED`), titles, buttons. Night sky and blue windows stay fixed. 4 presets. |
| **Variants requested** | `links: list`. |
| **Signature widgets** | `rainsound` (generated rain audio). |
| **Locked slots** | None. |
| **Origin** | `demos/variety/lofi-rain.html` |

## Quirks
- Rain density scales with window area (`innerWidth × innerHeight / 2600` drops).
- Search defaults to YouTube in this theme's layout.
