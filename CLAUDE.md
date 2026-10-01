# Notes for AI assistants

Read `docs/MAINTAINING.md` (rules) and `docs/CONTRACTS.md` (theme/widget API) first. The most important rules:

- **G1: Git identity.** Commit only as `Blankscreen-exe <mhammad.hassan002@gmail.com>`. Do **not** add `Co-Authored-By`, `Signed-off-by` or any other identity/trailer. Never pass `--author`, never use `--no-verify`.
- **D1/D2:** No dependencies, no build step, no CDN or remote code. Plain ES modules + CSS.
- **A1:** Themes/widgets import only from `core/`, `vendor/` or their own folder.
- **A3:** Event names come from `core/events.js` only.
- **S1–S3:** Tokens only in widget CSS. Theme CSS is `@layer theme` + `[data-theme="<id>"]`.
- **S5: Accent.** Use `var(--accent)` / `--accent-soft` / `--accent-strong` / `--accent-contrast` (CSS) or `ctx.tokens.color("--accent")` + `ACCENT_CHANGED` (canvas/JS). Never repeat the accent hex. Every theme sets `accentRole`.
- **U1:** Any change to stored data shape = new migration + test.
- Run `npm run verify` before committing, and check `dev/gallery.html` after visual changes.
- `demos/` contains the original standalone designs. They are reference material for porting themes, not part of the app.
