# Maintaining this project

These rules keep the project easy to maintain years from now. Each rule has an id, so commits, reviews and decision records can refer to it (e.g. "violates D2"). Rules marked ✅ are enforced automatically by `npm run check`, the unit tests or the git hooks.

## G: Git

| Id | Rule |
|---|---|
| **G1** ✅ | **Commits use only `Blankscreen-exe <mhammad.hassan002@gmail.com>`.** No other author or committer, and no `Co-Authored-By` / `Signed-off-by` trailers with another identity. This applies to tools and AI assistants too. Enforced by `dev/hooks/pre-commit` and `dev/hooks/commit-msg`. |
| G2 | After cloning, run `git config core.hooksPath dev/hooks`, plus `git config user.name "Blankscreen-exe"` and `git config user.email "mhammad.hassan002@gmail.com"`. |
| G3 | Keep commits small, with one topic each. The message says *why*, not only *what*. |
| G4 | Never commit with `--no-verify`. If a hook fails, fix the cause. |
| G5 | Record user-visible changes in `CHANGELOG.md` in the same commit. |

## D: Dependencies

| Id | Rule |
|---|---|
| **D1** ✅ | Zero runtime dependencies and no build step. Plain ES modules, CSS and HTML only. `package.json` exists only for `"type": "module"` and script shortcuts. Never add `dependencies` to it. |
| **D2** ✅ | No remote code: no CDN scripts and no bare imports. Third-party code is copied into `vendor/<name>-<version>.js`, together with its licence, and updated only on purpose. |
| D3 | Dev tools (`dev/`) use only Node built-ins. |
| D4 | Anything on the internet (weather, quotes, APIs) sits behind a provider adapter in `providers/<kind>/<name>.js`. When a service dies, you replace one file. |

## A: Architecture

| Id | Rule |
|---|---|
| **A1** ✅ | Themes and widgets import only from `core/`, `vendor/` or their own folder. They never import from each other. |
| **A2** | Only `core/platform.js` may touch `chrome.*`, `browser.*` or raw browser storage. |
| **A3** ✅ | Every event name is listed in `core/events.js`, with a comment describing its payload. |
| A4 | Widgets talk to themes only through events ("data down, events up"). A widget never knows which theme is active, except through `ctx.variant`. |
| A5 | Theme and widget modules have no side effects when imported. DOM work happens in `mount()` / `render()`. (`npm run check` imports them in Node.) |
| A6 | Use `ctx.every/after/listen/loop/on/cleanup` instead of raw `setInterval`/`addEventListener`, so switching themes never leaks timers, sounds or listeners. |
| A7 | The core stays small. If a feature only matters to one theme, it belongs in that theme's `mount()` or in a signature widget, not in `core/`. |
| **A8** ✅ | The `default` theme must stay registered. It is the fallback when another theme fails. |

## C: Contracts

| Id | Rule |
|---|---|
| **C1** ✅ | Every theme and widget declares `apiVersion` and passes `validateTheme` / `validateWidget` (`core/contracts.js`). |
| C2 | Breaking contract changes bump `apiVersion`. The old version keeps working through an adapter in `normalizeTheme` / `normalizeWidget`. Old themes are never mass-edited. |
| C3 | `docs/CONTRACTS.md` and `core/contracts.js` change together, in the same commit. |
| **C4** ✅ | `id` is kebab-case and equals the folder name and the registry id. |

## S: Styling

| Id | Rule |
|---|---|
| **S1** ✅ | Every theme defines all `REQUIRED_TOKENS`. That list is **never** extended. New tokens go in `OPTIONAL_TOKENS` and **must** get a default in `core/tokens.css`. |
| **S2** ✅ | Widget CSS uses tokens only, with no hard-coded colours, and is wrapped in `@layer widgets` and scoped under `.w-<id>`. |
| **S3** ✅ | Theme CSS is wrapped in `@layer theme` and every selector starts with `[data-theme="<id>"]`. |
| S4 | No `!important`. The layer order `reset, core, widgets, theme, user` already decides who wins. Only the core writes to the `user` layer. |
| **S5** ✅ | **Accent:** whatever should follow the user's accent uses `var(--accent)` / `--accent-soft` / `--accent-strong` / `--accent-contrast` / `color-mix(… var(--accent) …)` in CSS, and `ctx.tokens.color("--accent")` + `ACCENT_CHANGED` in canvas/JS. Never repeat the accent hex. Every theme sets `accentRole`. |
| S6 | Core UI (panel, dialogs) sits on `var(--ui-surface)`, which is opaque even when a theme's `--surface` is translucent. |

## U: User data

| Id | Rule |
|---|---|
| **U1** ✅ | User data is never lost. Changing the data shape means: bump `CURRENT_SCHEMA`, add a migration, add a test. |
| U2 | Released migrations are never edited, only new ones added. |
| U3 | Shared data (`widgetData`) belongs to a widget type. Private theme data lives in `themeState[themeId]`. Removing a theme must not damage shared data. |
| U4 | Export/import must keep working. Test a round trip when touching the store. |

## Q: Quality

| Id | Rule |
|---|---|
| Q1 | Run `npm run verify` before each commit (the pre-commit hook does this). Run `npm run smoke` (real browser) after touching `core/` and before tagging a release. When a bug is fixed, add a smoke step that would have caught it. |
| Q2 | Look at `dev/gallery.html` after any visual change, at both desktop and phone width. Then run `npm run previews <theme-id>` and commit the updated README image. |
| Q3 | Every theme and widget folder has a `README.md` describing its decorations, services, data, variants and quirks. |
| Q4 | New themes and widgets start from `themes/_template` / `widgets/_template`. |
| Q5 | Important decisions get a short record in `docs/decisions/` (context → decision → consequences). |
| Q6 | Respect `prefers-reduced-motion`. Heavy animations and sounds in theme decorations must be optional or calm. |

## Common tasks

**Add a theme:** copy `themes/_template` to `themes/<id>`, fill in tokens and the layout, add it to `registry.json`, run `npm run verify`, then check the gallery.

**Add a widget:** copy `widgets/_template` to `widgets/core/<id>` or `widgets/signature/<id>`, fix the relative import depth, add it to `registry.json`, run `npm run verify`.

**Add an event:** add it to `EVENTS` in `core/events.js` with a payload comment, then emit it from the widget.

**Change the data shape:** follow U1/U2 in `core/migrations/index.js` and `dev/tests/migrations.test.mjs`.

**A browser changes its extension API:** edit `core/platform.js` and `manifest.json` only.
