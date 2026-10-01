# providers/

Adapters for **online services** (rule D4). Each file is the only place that knows one service's URLs and response format, and exports small, stable shapes. When a service changes its API or shuts down, replace that one file. Widgets don't change.

Rules:
- Pure ES modules with no side effects at import. Every network function takes an optional `fetchImpl`, so tests run without the network.
- Send as little as possible. Coordinates are rounded to 2 decimals (~1 km) before leaving the device (`coarse()`).
- Only free, no-key, CORS-enabled services. No secrets ever live in this repo.
- Record each service's licence and attribution requirements here.

| File | Service | Used by | Sends | Licence / attribution |
|---|---|---|---|---|
| `weather/open-meteo.js` | [Open-Meteo](https://open-meteo.com) forecast + geocoding | `weather` widget | rounded coordinates, or the typed place name | Data CC BY 4.0: the widget shows an "Open-Meteo" credit link |
| `random-sites/theuselessweb.js` | [The Useless Web](https://theuselessweb.com/) (no API; the site list is read from the site's own script) | `dice` widget, "The Useless Web" source | nothing but the request; needs optional host access, asked on first use | Curated by Tim Holman. The widget always credits it with a link. Fetched at most weekly. A bundled snapshot (`theuselessweb-snapshot.js`, `npm run update:uselessweb`) is the fallback. |
| `geocode/bigdatacloud.js` | [BigDataCloud](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) free client-side reverse geocoding | `weather` widget (naming "my location") | rounded coordinates | Free client-side API, meant for the user's own location |
