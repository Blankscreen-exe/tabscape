# Theme: Paper & Ink

| | |
|---|---|
| **Look** | Newspaper front page: warm paper with grain, serif type, ruled columns, a lined notebook, roman-numbered bookmarks. |
| **Decorations** | Masthead across the top (edition by time of day, "The Daily Tab", time and date). It updates every second via `ctx.every`. |
| **Services** | None. |
| **Accent** | Brick red. Role: section headings, search button, quote rule, hovered links. Ink, paper and notebook lines stay fixed. 4 presets. |
| **Variants requested** | `links: list`, `progress: almanac`. |
| **Signature widgets** | None. Uses core `progress`, `quote`, `notes`. |
| **Locked slots** | None. |
| **Origin** | `demos/paper-ink.html` |

## Quirks
- `#grid` gets `padding-top: 190px` to clear the masthead (150px on phones, where the masthead hides the time).
- The notebook's red margin line is an inset box-shadow, and its blue rules are a repeating gradient.
