# Widget: Search

| | |
|---|---|
| **What it does** | Web search with the engine chosen in the widget's settings. |
| **Shared data** | None. Engine, placeholder and button are per-instance settings. |
| **Events emitted** | `SEARCH_SUBMITTED { query, engine }` just before navigating. |
| **Variants** | `default`. |
| **Settings** | Search engine (Google, DuckDuckGo, Bing, Brave Search, Ecosia, Startpage, YouTube, GitHub, Wikipedia, or **Custom…** with a URL containing `{q}`), placeholder, optional button text (e.g. RPG Quest's "CAST"), focus on new tab, open in new tab. |

## Quirks
- **No engine buttons on the bar, on purpose.** They don't scale: every extra engine widens the bar until narrow layouts break. The engine is a setting, shown as a tooltip on the input ("Searching with …").
- Engines live in `ENGINES` at the top of `widget.js`. `searchUrl()` is unit-tested. Custom URLs must be `http(s)` and contain `{q}`, otherwise Google is used.
- Autofocus is skipped while editing the layout. Browsers may keep focus in the address bar on a new tab regardless.
- Older saved data may contain a `pills` setting or a `picked` engine from v0.4–0.5. Both are ignored.
