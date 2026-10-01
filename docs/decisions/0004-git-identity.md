# 0004: Single git identity

**Date:** 2026-10-01 · **Status:** accepted

## Context
The owner wants every commit in this repository attributed to one identity, including commits made with the help of tools or AI assistants.

## Decision
Commits use only `Blankscreen-exe <mhammad.hassan002@gmail.com>`, with no co-author or sign-off trailers for other identities (rule G1 in `docs/MAINTAINING.md`). This is enforced by `dev/hooks/pre-commit` (author/committer) and `dev/hooks/commit-msg` (trailers), enabled with `git config core.hooksPath dev/hooks`.

## Consequences
After a fresh clone, G2 must be run once to set the identity and enable the hooks.
