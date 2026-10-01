# Widget: World Clocks

| | |
|---|---|
| **What it does** | Shows the time and weekday in a list of cities. |
| **Shared data** | None. Cities are a per-instance setting: one per line, city name and IANA time zone (e.g. `Europe/London`) separated by a vertical bar. |
| **Events emitted** | None. |
| **Variants** | `default`. Swiss Grid restyles it with CSS. |

## Quirks
- Invalid zones show "?" with the bad name instead of breaking the widget. `parseZones()` is unit-tested.
