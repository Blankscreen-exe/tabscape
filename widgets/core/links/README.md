# Widget: Links

| | |
|---|---|
| **What it does** | Quick links; edit inline with the ✎ button (`Name | url` per line). |
| **Shared data** | `{ items: [{ name, url }] }`, the same links in every theme. |
| **Events emitted** | `LINK_OPENED { url, name }`. |
| **Variants** | `default` (icon grid), `list`. Setting `style` can override the theme's choice. |

## Quirks
- Icons are letter tiles on purpose: no favicon services (no third-party requests, nothing that can disappear).
