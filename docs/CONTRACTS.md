# Contracts (apiVersion 1)

Two contracts hold the whole system together. Themes and widgets may rely on **only** what is documented here. Machine-checkable version: `core/contracts.js`. Keep both in sync (rule C3).

---

## Layers

```
#decor   ← theme decorations (canvas, marquee, effects). Not clickable by default; add class "interactive" to opt in.
#grid    ← widget frames placed on a CSS grid (default 12 columns)
store    ← one versioned JSON document: settings, layouts, widgetData, themeState
```

---

## Theme

A theme is a folder `themes/<id>/` with a `theme.js` that has `export default { … }`:

| Field | Required | Description |
|---|---|---|
| `apiVersion` | ✔ | `1` |
| `id` | ✔ | kebab-case, equal to the folder name and the registry id |
| `name` | ✔ | shown in the theme picker |
| `description` | | one sentence for the picker tooltip |
| `colorScheme` | ✔ | `"light"` or `"dark"` (sets native control colours) |
| `css` | | stylesheet path relative to `theme.js` |
| `tokens` | ✔ | every `REQUIRED_TOKENS` entry (see below); optional tokens may be added |
| `grid` | | `{ columns = 12, rowHeight = 80, maxWidth = "1200px" }` |
| `variants` | | `{ [widgetId]: variantName }`: asks widgets to render differently |
| `signatureWidgets` | | widget ids designed for this theme |
| `initialState` | | default value of the theme's private state (`ctx.state`) |
| `accentRole` | | what the accent colours in this theme, shown in the accent picker (e.g. `"buttons, neon sun, grid"`) |
| `accentPresets` | | suggested accents (`#rrggbb`) shown as swatches in the picker |
| `customAccent` | | `false` = the user can't change this theme's accent (default `true`; use only if a custom accent truly can't work) |
| `defaultLayout` | ✔ | array of layout items (below) used until the user changes the layout |
| `mount(ctx)` | | starts decorations and services; may return a cleanup function |

### Layout item

```js
{ id: "clock-1", widget: "clock", x: 0, y: 0, w: 12, h: 2, locked?: true, settings?: { … } }
```

`x`/`y` are 0-based grid cells and `w`/`h` are spans. `locked` items can't be moved or removed by the user. If a theme update adds a new locked slot, it is merged into users' saved layouts automatically.

### Theme `ctx` (inside `mount`)

| Member | Description |
|---|---|
| `root` | the `#decor` element; put decorations here |
| `theme` | this theme's definition |
| `events` | the `EVENTS` catalog |
| `state` | `{ get(), set(v), update(fn) }`: private, persisted, starts from `initialState` |
| `on(name, fn)` | subscribe to an event (auto-unsubscribed) |
| `emit(name, payload)` | publish an event |
| `every(ms, fn, immediate = true)` · `after(ms, fn)` · `listen(target, type, fn)` · `loop(fn)` · `cleanup(fn)` | auto-cleaned timers, listeners, animation loops and custom cleanups |
| `assetUrl(path)` | URL of a file in the theme folder (images, sounds) |
| `tokens` | `get("--x")` raw token value · `color("--x")` resolved `rgb(…)` string, for canvas/JS. Re-read it on `ACCENT_CHANGED`. |

Everything registered through `ctx` is released when the user switches theme.

### Theme CSS

```css
@layer theme {
  [data-theme="<id>"] .w-todo { … }
  [data-theme="<id>"] .w-todo[data-variant="quest-log"] { … }
}
```

---

## Widget

A widget is a folder `widgets/core/<id>/` or `widgets/signature/<id>/` with a `widget.js` that has `export default { … }`:

| Field | Required | Description |
|---|---|---|
| `apiVersion` | ✔ | `1` |
| `id`, `name` | ✔ | same rules as themes |
| `description` | | shown in the add-widget list |
| `css` | | stylesheet path relative to `widget.js` |
| `size` | ✔ | default `{ w, h }` when added |
| `bestWith` | | theme ids it was designed for (shown in the picker; never enforced) |
| `variants` | | variant names `render` understands; unknown requests fall back to `"default"` |
| `data` | | default shared data for this widget type |
| `settings` | | per-instance settings; the settings dialog is generated from these |
| `render(el, ctx)` | ✔ | draws into `el`; may return a cleanup function |

### Setting

```js
{ key: "hour12", label: "12-hour clock", type: "toggle", default: false }
// type: "text" | "textarea" | "toggle" | "select" (needs options: [{ value, label }]) | "number"
```

### Widget `ctx`

| Member | Description |
|---|---|
| `id` · `type` · `el` | instance id, widget id, root element (`.w.w-<id>` with `data-variant`) |
| `settings` | resolved per-instance settings (defaults + saved) |
| `variant` | the variant to render (from the active theme, validated) |
| `theme` | `{ id, colorScheme }`: for information only; prefer variants and tokens |
| `data` | `{ get(), set(v), update(fn), watch(fn) }`: shared by all instances of this widget type in every theme and tab. `watch` calls `fn` now and on every change. |
| `events` · `emit` · `on` | event catalog and bus (auto-unsubscribed) |
| `every` · `after` · `listen` · `loop` · `cleanup` | auto-cleaned helpers |
| `isEditing()` | true while the user edits the layout |
| `assetUrl(path)` | URL of a file in the widget folder |
| `tokens` | same helper as for themes |

**Pattern: data down, events up.** User actions change `ctx.data`, `ctx.data.watch` redraws, and meaningful moments are announced with `ctx.emit(ctx.events.X)`. That keeps several instances and tabs in sync, and lets themes react without coupling.

### Widget CSS

```css
@layer widgets {
  .w-<id> { … }   /* tokens only: var(--accent), var(--surface)… */
}
```

---

## Tokens

Required (v1, frozen forever): `--bg --surface --surface-2 --text --muted --accent --accent-contrast --border --danger --radius --gap --shadow --font-body --font-display --font-mono`

Optional (default in `core/tokens.css`): `--success --warning --focus-ring --widget-padding --accent-soft --accent-strong`

### Accent colour

Users can pick an accent per theme, or one for all themes. The core writes it in the `user` CSS layer (above `theme`) as `--accent`, plus a recomputed `--accent-contrast` (black or white, whichever reads better).

- **CSS:** anything that should follow the accent uses `var(--accent)`, `var(--accent-soft)`, `var(--accent-strong)` or `var(--accent-contrast)`, or `color-mix(… var(--accent) …)`. Never repeat the accent's hex value. `npm run check` warns about it.
- **Derived tokens** (`--accent-soft`, `--accent-strong`, `--focus-ring`) may be overridden by a theme only with values that reference `var(--accent)`. This is validated.
- **Canvas/JS:** read `ctx.tokens.color("--accent")` and re-read it on `ctx.events.ACCENT_CHANGED`.
- Colours that are part of the theme's identity but are *not* the accent stay hard-coded. That's intended, and `accentRole` tells the user what does change.

Cascade layers: `reset → core → widgets → theme → user`.

---

## Events

See `core/events.js`, the single source of truth. Current domain events: `todo:added`, `todo:completed`, `todo:uncompleted`, `todo:removed`, `search:submitted`, `link:opened`, `note:edited`. App events: `theme:applied`, `accent:changed`, `layout:edit-mode`, `layout:changed`, `store:changed`.

---

## Stored data (schema v2)

```js
{
  schemaVersion: 2,
  settings:   {
    themeId,
    accent: { mode: "per-theme" | "global", global: "#rrggbb" | null, themes: { [themeId]: "#rrggbb" } },
  },
  layouts:    { [themeId]: LayoutItem[] },  // absent = theme default
  widgetData: { [widgetId]: any },          // shared across themes
  themeState: { [themeId]: any },           // private per theme
}
```
