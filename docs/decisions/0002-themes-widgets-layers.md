# 0002: Themes, widgets and the three layers

**Date:** 2026-10-01 · **Status:** accepted

## Context
Themes are not just colour schemes. Several have their own features: RPG gold/XP, Zen breathing and intention, the Mission Control radar, the Anti-design marquee. Users can switch themes at any time, and their data must survive the switch.

## Decision
- **Decorations and services** (the marquee, rain, starfield, XP rules) live in the theme's `mount()`, inside the `#decor` layer. They are cleaned up automatically on theme switch.
- **Widgets** are independent of themes. Core widgets (clock, search, links, to-do, notes) share their data across all themes. Themes restyle them with CSS and can request **variants** (e.g. `todo: quest-log`).
- **Signature widgets** are normal widgets tagged `bestWith`. They can be placed in any theme; nothing is locked to a theme.
- Widgets announce actions through **events**, and themes react (to-do completed → XP). No widget knows about any theme.
- Each theme ships a **default layout**. The user's layout is saved **per theme**. A theme can mark slots `locked` to keep its identity.

## Consequences
- Switching themes never loses to-dos, notes or links.
- New gamification or effects only need event subscriptions, with no changes to widgets.
- Per-theme layouts mean a widget added in one theme does not appear in the others. This is by design.
