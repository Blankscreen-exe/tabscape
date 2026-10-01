# Theme: Zen

| | |
|---|---|
| **Look** | Rice paper, ink-wash mountains, a brushed ensō around the clock, generous empty space, no widget boxes. |
| **Decorations** | Layered mountain SVG + sun at the bottom. A vertical kanji date strip with a seal on the left (hidden below 1100px wide). |
| **Services** | None. |
| **Accent** | Seal red. Role: sun, seal, focus rings, hovered links. The ink, paper and mountains stay fixed. 4 presets. |
| **Variants requested** | `links: list` (icons hidden by theme CSS). |
| **Signature widgets** | `breath`, `intention`, `haiku`. |
| **Locked slots** | `clock-1`: the ensō clock is the theme's centrepiece. |
| **Origin** | `demos/variety/zen.html` |

## Quirks
- The ensō is a CSS `::before` on `.w-clock` (an SVG data URI in ink colour). It fades in rather than being drawn stroke by stroke.
- Default layout sets `search` to DuckDuckGo with the placeholder "seek", and turns off the clock greeting.
