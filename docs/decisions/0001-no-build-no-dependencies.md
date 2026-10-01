# 0001: No build step, no dependencies

**Date:** 2026-10-01 · **Status:** accepted

## Context
This is a personal project meant to stay maintainable for 5+ years. Frameworks, bundlers and npm packages change every couple of years. A project that depends on them often won't even build after a long break.

## Decision
Use plain ES modules, plain CSS (with cascade layers and custom properties) and HTML. Type safety comes from `// @ts-check` + JSDoc, which VS Code checks with no compiler. Dev tools use Node built-ins only. If third-party code is ever needed, it is copied into `vendor/` with its version in the filename.

## Consequences
- The code from 2026 should still run unchanged in 2031. The web platform hardly ever breaks old code.
- There is no JSX, no Tailwind and no component framework. Small DOM helpers live in `core/dom.js`.
- ES modules don't load from `file://`, so development uses `npm run serve` (a zero-dependency server). The installed extension is unaffected.
