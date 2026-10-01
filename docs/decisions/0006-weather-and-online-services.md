# 0006: Weather and the first online services

**Date:** 2026-10-01 · **Status:** accepted

## Context
The weather widget is the first feature that needs data from the internet, and the first that uses the device location. Both have privacy and longevity costs.

## Decision
- **Open-Meteo** for forecasts and place search: free, no API key (so no secret ever lives in the repo), CORS-enabled, CC BY 4.0 data (credited in the widget).
- **BigDataCloud's free client-side reverse geocoding** only to put a name on the automatic location, because Open-Meteo has no reverse geocoding.
- Both sit behind `providers/` adapters (rule D4) with injectable `fetch`, so a dead service means replacing one file, and tests never hit the network.
- **Send the minimum:** coordinates are rounded to 2 decimals (~1 km). Re-naming the location only happens after moving more than 5 km.
- **Cache in shared data for 30 minutes:** most new tabs make no request, and the widget still shows the last weather offline.
- The extension declares the `geolocation` permission, so the automatic location works without a prompt. If it's denied or unavailable, the widget asks the user to choose a place.

## Consequences
- The extension now makes network requests to two weather/geo services, in addition to search pages, the sites you open and link icons. This is documented in the README.
- The users' chosen place and the last forecast live in `widgetData.weather`, and are included in backups.
