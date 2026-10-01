# Widget: Pomodoro

| | |
|---|---|
| **What it does** | Focus / short break / long break timer with a progress ring. |
| **Shared data** | `{ mode, endsAt, pausedLeft }`. Storing the **end time** (not a ticking counter) means a running timer survives closing the tab and shows the same countdown in every tab. |
| **Events emitted** | None (candidate for a future `POMODORO_DONE` event that themes could celebrate). |
| **Variants** | `default`. |

## Quirks
- When time is up, the tab title becomes "⏰ Time's up!" until the timer is started or reset.
