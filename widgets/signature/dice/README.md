# Widget: Feeling Lucky (dice)

| | |
|---|---|
| **What it does** | Roll the die for a random site, from **your own list** or from **[The Useless Web](https://theuselessweb.com/)**'s collection. |
| **Settings** | Source (my list / The Useless Web), my list (one site per line: name and URL separated by a vertical bar, or just a URL), no repeats until every site was shown (default on), after rolling: show the link or go there right away. |
| **Shared data** | `{ useless, declined, seen }`: the last live Useless Web list (with fetch time and list version), whether host access was declined, and the per-source history used for no-repeat. |
| **Events emitted** | None. |
| **Variants** | `default`. |
| **Best with** | `anti-design` (ported from `demos/brutalist/anti-design.html`). |

## The Useless Web source
- There is no public API. The list lives in the site's own script, which other pages may not read (no CORS), so the extension declares `optional_host_permissions: ["https://theuselessweb.com/*"]`.
- **The first roll asks for that access.** Browsers only allow the prompt during a click, so it's requested synchronously in the click handler. The roll itself never waits: it uses the saved list or the **bundled snapshot** (`providers/random-sites/theuselessweb-snapshot.js`) right away, while the live list downloads in the background.
- With access, the live list is re-fetched when it's older than 7 days (one small request a week).
- If you decline, the widget keeps using the built-in list and shows a "use live list" button to ask again. It never re-prompts on its own.
- If their script changes format, `extractSites()` refuses fewer than 20 sites and the widget keeps the last good list.
- A credit line ("Sites: The Useless Web · 118 sites, live list") is always shown for this source.
- Refresh the bundled snapshot with `npm run update:uselessweb`, then review and commit the diff.

## Quirks
- No-repeat history is per source and only keeps sites still in the pool, so a changed list doesn't break it.
- The die face shows `index % 6 + 1`, so it's just for fun with longer lists.
- All URLs pass `safeWebUrl()` (core/url.js): `javascript:` and other schemes can't sneak in.
