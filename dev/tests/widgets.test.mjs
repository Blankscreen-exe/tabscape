// Pure helpers exported by widgets. Widget modules must stay importable in Node (rule A5).
import { test } from "node:test";
import assert from "node:assert/strict";
import { progress } from "../../widgets/core/progress/widget.js";
import { monthGrid } from "../../widgets/core/calendar/widget.js";
import { targetFor } from "../../widgets/core/countdown/widget.js";
import { interpret, parseBookmarks } from "../../widgets/signature/terminal/widget.js";

test("progress: noon on a Monday", () => {
  const p = progress(new Date(2026, 9, 5, 12, 0)); // Mon 5 Oct 2026
  assert.equal(p.day, 0.5);
  assert.ok(Math.abs(p.week - 0.5 / 7) < 1e-9);
  assert.equal(p.dayOfYear, 278);
  assert.equal(p.isoWeek, 41);
});

test("progress: ISO week edge cases", () => {
  assert.equal(progress(new Date(2027, 0, 1)).isoWeek, 53); // Fri 1 Jan 2027 belongs to 2026-W53
  assert.equal(progress(new Date(2026, 0, 1)).isoWeek, 1);
});

test("monthGrid: full weeks, correct lead days", () => {
  const weeks = monthGrid(2026, 9, true); // October 2026 starts on a Thursday
  assert.ok(weeks.every(w => w.length === 7));
  assert.deepEqual(weeks[0].slice(0, 4).map(c => c.month), [-1, -1, -1, 0]);
  assert.equal(weeks[0][3].day, 1);
  const sundayFirst = monthGrid(2026, 9, false);
  assert.equal(sundayFirst[0].findIndex(c => c.month === 0), 4);
});

test("countdown: weekend, end of day, custom date", () => {
  const wed = new Date(2026, 9, 7, 15, 0);
  assert.deepEqual(targetFor("weekend", "", wed), new Date(2026, 9, 10));
  assert.equal(targetFor("weekend", "", new Date(2026, 9, 10, 9)), null); // Saturday
  assert.deepEqual(targetFor("eod", "", wed), new Date(2026, 9, 8));
  assert.deepEqual(targetFor("custom", "2026-12-25", wed), new Date(2026, 11, 25)); // local midnight
  assert.equal(targetFor("custom", "not a date", wed), null);
});

test("terminal: bookmarks and commands", () => {
  const bm = parseBookmarks("gh | GitHub | github.com\nbroken line\nyt | YouTube | https://youtube.com");
  assert.deepEqual(bm.map(b => b.url), ["https://github.com", "https://youtube.com"]);
  assert.equal(interpret("gh", bm).go, "https://github.com");
  assert.equal(interpret("yt lofi beats", bm).go, "https://www.youtube.com/results?search_query=lofi%20beats");
  assert.equal(interpret("open example.org", bm).go, "https://example.org");
  assert.equal(interpret("clear", bm).clear, true);
  assert.match(interpret("help", bm).print ?? "", /commands/);
  assert.equal(interpret("what is love", bm).go, "https://www.google.com/search?q=what%20is%20love");
  assert.deepEqual(interpret("   ", bm), {});
});
