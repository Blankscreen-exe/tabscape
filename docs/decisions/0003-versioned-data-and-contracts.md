# 0003: Versioned data and versioned contracts

**Date:** 2026-10-01 · **Status:** accepted

## Context
Over the years both the stored data shape and the theme/widget API will need to change. Without versions, every change risks wiping user data or forcing rewrites of all themes.

## Decision
- Stored data has a `schemaVersion`. Every change gets a pure, tested migration (`core/migrations`). Data from a *newer* build is never overwritten: the store goes read-only instead.
- Themes and widgets declare `apiVersion`. Breaking API changes add an adapter in `normalizeTheme` / `normalizeWidget`, so old themes keep loading untouched.
- Required design tokens are frozen. New tokens are optional and always have a default.

## Consequences
- A small amount of extra work per change (migration + test), in exchange for never losing data.
- 15+ themes don't have to be touched when the core evolves.
