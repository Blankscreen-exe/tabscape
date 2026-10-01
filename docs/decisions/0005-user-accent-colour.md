# 0005: User accent colour

**Date:** 2026-10-01 · **Status:** accepted

## Context
Users want to choose the accent colour of every theme, and optionally one accent for all themes. Themes vary a lot. Some have one accent, some have several signature colours (Synthwave, Anti-design), and some draw on canvas, where CSS variables don't apply.

## Decision
- The accent lives in stored settings (`settings.accent`, schema v2): per-theme picks plus an optional global mode. Precedence logic is in `core/accent.js` and is unit-tested.
- The core writes the override in a new top CSS layer `user`, and recomputes `--accent-contrast` for readability. Derived tokens (`--accent-soft`, `--accent-strong`, `--focus-ring`) are built from `var(--accent)`, so they follow automatically.
- Each theme declares what the accent means for it (`accentRole`) and may suggest swatches (`accentPresets`). The accent changes the *primary* accent only, and other identity colours stay fixed. `customAccent: false` exists as an escape hatch but should be rare.
- Canvas/JS effects read `ctx.tokens.color("--accent")` and listen for `ACCENT_CHANGED`.
- The picker warns when contrast against the theme background is below 3:1 (WCAG 1.4.11), but does not block the choice.

## Consequences
- All future themes must follow rule S5. `npm run check` warns when a theme repeats its accent hex.
- Theme authors must decide which of their colours is "the accent". The picker shows this to users as "Colours: …".
