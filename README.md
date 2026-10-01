# Browser Home Pages

A themeable new tab page for Chrome, Edge, Brave and Firefox. Pick a theme, and each theme can bring its own effects (stars, rain, a marquee…) and features (XP and gold, breathing exercises…). Widgets can be dragged and resized. To-dos, notes and links stay the same whatever theme you use.

Zero dependencies and no build step: plain HTML, CSS and JavaScript modules.

## Use it

**As an extension (new tab page):**
1. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
2. Click **Load unpacked** and choose this folder.
3. Open a new tab.

Firefox: `about:debugging` → *This Firefox* → *Load Temporary Add-on* → choose `manifest.json`.

**In a normal browser tab (development):**
```sh
npm run serve        # or: node dev/serve.mjs
# http://localhost:5173/newtab.html        the app
# http://localhost:5173/dev/gallery.html   every theme side by side
# http://localhost:5173/demos/index.html   original design demos
```

Customize with the **✦** button (bottom right) or **Alt+C**: switch theme, edit the layout (drag the bar to move, drag the corner to resize), add widgets, reset, and export/import a backup.

## Develop

```sh
npm run check    # project rules: registry, contracts, imports, events, CSS
npm test         # unit tests (Node's built-in runner)
npm run verify   # both (also run by the pre-commit hook)
npm run smoke    # drives the real app in headless Chrome/Edge (dev/smoke.html)
```

After cloning, run once:
```sh
git config core.hooksPath dev/hooks
git config user.name "Blankscreen-exe"
git config user.email "mhammad.hassan002@gmail.com"
```

## Layout

```
manifest.json        extension manifest (MV3)
newtab.html          the only page
registry.json        installed themes + widgets
core/                small, stable engine: app, store, events, registry, grid, ui, platform, tokens.css
themes/<id>/         theme.js + theme.css + README.md       (_template/ to start a new one)
widgets/core/<id>/   clock, search, links, todo, notes, quote, progress, calendar, pomodoro, countdown
widgets/signature/   breath, intention, haiku, hero, oracle, dice, terminal, sysinfo
dev/                 serve, check, tests, smoke test, gallery, git hooks
docs/                CONTRACTS.md, MAINTAINING.md, decisions/
demos/               the original standalone design demos (reference for porting)
```

Read **[docs/MAINTAINING.md](docs/MAINTAINING.md)** (rules) and **[docs/CONTRACTS.md](docs/CONTRACTS.md)** (theme/widget API) before changing anything.
