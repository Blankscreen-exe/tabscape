# Widget: Links

| | |
|---|---|
| **What it does** | Quick links with site icons. Edit inline with the ✎ button: one link per line, as name and URL separated by a vertical bar, optionally followed by a third part with an icon URL. |
| **Shared data** | `{ items: [{ name, url, icon? }] }`, the same links in every theme. |
| **Events emitted** | `LINK_OPENED { url, name }`. |
| **Variants** | `default` (icon grid), `list`. Setting `style` can override the theme's choice. |
| **Settings** | `icons`: "Site icons (letter if none)" (default) or "Letters only (no network requests)". |

## Icons
- The icon is fetched **directly from the linked site** (`<origin>/favicon.ico`), or from the link's own icon URL if given. No third-party favicon service is used: such a service would receive the whole link list on every new tab, and could disappear.
- The first letter is always rendered first. The image replaces it only after it has loaded and is larger than 1px, so failures (404, offline, a login redirect, an empty image) silently keep the letter.
- Sites that don't serve `/favicon.ico` (e.g. Gmail redirects it to a login page) show the letter. Give them an icon URL as the third part of the line to fix that.
- Requests use `referrerpolicy="no-referrer"`. The browser's HTTP cache makes repeat tabs cheap.
- Icons sit on a light tile (`--links-icon-bg`, near-white tinted with the accent), because most favicons are drawn for light browser tabs. Themes may override it. Themes that hide `.links-ico` (Zen, Paper & Ink, Terminal…) stay text-only.

## Quirks
- URLs are normalised to `http(s)` only (`normalizeUrl`): `javascript:` and other schemes are turned into a harmless `https://` address. Icon URLs must be `http(s)` or a path inside the extension (`normalizeIcon`). Both are unit-tested.
