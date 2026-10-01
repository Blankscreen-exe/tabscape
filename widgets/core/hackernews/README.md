# Widget: Hacker News

| | |
|---|---|
| **What it does** | A ranked list of Hacker News stories: title (to the article), domain, points, a comments link and age. ↻ refreshes now. |
| **Settings** | Stories: **Top today** (default: posted in the last 24 h, ranked by points), Front page, Newest, Ask HN / Show HN (this week). How many (5–30), show meta, open in a new tab. |
| **Shared data** | `{ cache: { [feed]: { at, stories } } }`. 30 stories per feed are cached for 15 minutes, shared by all instances and tabs. |
| **Events emitted** | None. |
| **Variants** | `default`. |
| **Provider** | `providers/news/hackernews.js` (HN Search API by Algolia: one request per list, no key, no permission needed). |

## Quirks
- Text posts (Ask HN) have no external URL, so the title opens their comments page.
- Always fetches 30 stories, so changing "How many" never needs a new request.
- Offline, it keeps showing the last list with a note.
- Visited stories turn muted (`:visited`), like on HN itself.
- Story titles come from HN users and are shown as-is (escaped).
