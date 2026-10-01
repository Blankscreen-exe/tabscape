# Widget: Weather

| | |
|---|---|
| **What it does** | Current conditions (icon, temperature, description, feels-like, humidity, wind) and a 3/5/7-day forecast. |
| **Location** | **Automatic by default**: the device location, named via reverse geocoding (e.g. "London"). Click the place name to **pick any place** by searching ("Springfield" lists every Springfield with region and country). "📍 Use my location" switches back to automatic. |
| **Shared data** | `{ place, auto, cache }`: the chosen place (`null` = automatic), the last automatic location, and the last forecast with its time. Shared by every weather widget and tab. |
| **Settings** | Title, units (°C + km/h or °F + mph), forecast days (none / 3 / 5 / 7), show details. |
| **Events emitted** | None. |
| **Variants** | `default`. |
| **Providers** | `providers/weather/open-meteo.js` (forecast + place search), `providers/geocode/bigdatacloud.js` (naming the automatic location). See `providers/README.md`. |

## Network and privacy
- Forecasts are **cached 30 minutes** in shared data. Most new tabs make no request and show instantly, even offline ("Offline — showing the last weather").
- Coordinates are **rounded to 2 decimals (~1 km)** before being sent to either service.
- The automatic location is only re-named after moving more than 5 km, so reverse geocoding runs rarely.
- The browser's location is requested with `maximumAge: 30 min`, so it usually answers instantly from its own cache. The extension declares the `geolocation` permission, so there's no prompt. On the dev server the browser asks once.
- If location is denied or unavailable and no place was ever known, the widget asks you to choose a place.
- Open-Meteo data is CC BY 4.0, so the widget always shows a small "Weather: Open-Meteo" credit link.

## Quirks
- Icons are emoji, so they look like the platform's own emoji set.
- Small tiles drop the forecast and details (container queries) rather than overflowing.
- Pure helpers (`describe`, `cacheKey`, `isFresh`, `distanceKm`, `placeLabel`) and both providers are unit-tested with a fake `fetch`.
