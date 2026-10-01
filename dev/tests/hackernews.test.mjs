import { test } from "node:test";
import assert from "node:assert/strict";
import { feedUrl, fetchStories, parseStories } from "../../providers/news/hackernews.js";
import { ago } from "../../widgets/core/hackernews/widget.js";

const NOW = Date.UTC(2026, 9, 2, 12, 0, 0);

test("feed URLs: today = stories from the last 24 h; newest uses search_by_date", () => {
  const today = feedUrl("today", 10, NOW);
  assert.match(today, /\/search\?tags=story&hitsPerPage=10&numericFilters=created_at_i%3E(\d+)/);
  assert.equal(Number(today.match(/%3E(\d+)/)[1]), NOW / 1000 - 86_400);
  assert.match(feedUrl("newest", 5, NOW), /\/search_by_date\?tags=story&hitsPerPage=5$/);
  assert.doesNotMatch(feedUrl("front", 5, NOW), /numericFilters/);
  assert.match(feedUrl("nonsense", 500, NOW), /tags=story&hitsPerPage=50/); // unknown feed → today, count capped
});

test("stories: link posts, text posts and junk", () => {
  const stories = parseStories({ hits: [
    { objectID: "1", title: "A link", url: "https://www.example.com/x", points: 120, num_comments: 30, author: "pg", created_at_i: 1790000000 },
    { objectID: "2", title: "Ask HN: something?", url: null, points: 5, num_comments: 2, author: "u", created_at_i: 1790000100 },
    { objectID: "3", title: "Sneaky", url: "javascript:alert(1)" },
    { title: "no id" },
  ] });
  assert.equal(stories.length, 3);
  assert.deepEqual(stories[0], { id: "1", title: "A link", url: "https://www.example.com/x", domain: "example.com", points: 120, comments: 30, commentsUrl: "https://news.ycombinator.com/item?id=1", by: "pg", at: 1790000000000 });
  assert.equal(stories[1].url, "https://news.ycombinator.com/item?id=2");
  assert.equal(stories[1].domain, "");
  assert.equal(stories[2].url, stories[2].commentsUrl); // unsafe URL replaced by the HN page
  assert.throws(() => parseStories({}), /unexpected/);
});

test("fetch: one request, errors surface", async () => {
  const calls = [];
  const ok = async url => { calls.push(url); return { ok: true, status: 200, json: async () => ({ hits: [] }) }; };
  assert.deepEqual(await fetchStories("today", 30, ok, NOW), []);
  assert.equal(calls.length, 1);
  await assert.rejects(fetchStories("today", 30, async () => ({ ok: false, status: 429 }), NOW), /429/);
});

test("relative age", () => {
  assert.equal(ago(NOW - 30_000, NOW), "1m");
  assert.equal(ago(NOW - 45 * 60_000, NOW), "45m");
  assert.equal(ago(NOW - 5 * 3600_000, NOW), "5h");
  assert.equal(ago(NOW - 3 * 86_400_000, NOW), "3d");
});
