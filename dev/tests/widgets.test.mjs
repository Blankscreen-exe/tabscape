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

import { parseZones } from "../../widgets/core/worldclock/widget.js";
import { formatMs } from "../../widgets/core/stopwatch/widget.js";
import { moonPhase, litPath } from "../../widgets/core/moon/widget.js";
import { weekKey } from "../../widgets/signature/habits/widget.js";
import { makeBoard, neighbours } from "../../widgets/signature/minesweeper/widget.js";

test("worldclock: valid and invalid zones", () => {
  const z = parseZones("London | Europe/London\nMoon Base | Lunar/Crater\nUTC");
  assert.deepEqual(z.map(x => x.valid), [true, false, true]);
  assert.equal(z[2].zone, "UTC");
});

test("stopwatch: formatting", () => {
  assert.equal(formatMs(0), "00:00.00");
  assert.equal(formatMs(61_234), "01:01.23");
  assert.equal(formatMs(3_723_450), "1:02:03.45");
});

test("moon: known full and new moons", () => {
  // 2026-10-26 ~04:12 UTC full moon; 2026-10-10 ~15:50 UTC new moon
  assert.ok(moonPhase(new Date(Date.UTC(2026, 9, 26, 4))).illumination > .97);
  assert.ok(moonPhase(new Date(Date.UTC(2026, 9, 10, 16))).illumination < .03);
  assert.match(litPath(.3, 28, 32), /^M32 4 A28 28 0 0 1 32 60 A/);
});

test("habits: week key is the local Monday", () => {
  assert.equal(weekKey(new Date(2026, 9, 4, 23, 30)), "2026-09-28"); // Sunday late evening
  assert.equal(weekKey(new Date(2026, 9, 5, 0, 5)), "2026-10-05");   // Monday just after midnight
});

test("minesweeper: first click and its neighbours are never mines", () => {
  for (let t = 0; t < 50; t++) {
    const cells = makeBoard(9, 10, 40);
    assert.equal(cells.filter(c => c.mine).length, 10);
    for (const i of [40, ...neighbours(40, 9)]) assert.equal(cells[i].mine, false);
  }
  assert.equal(neighbours(0, 9).length, 3);
  assert.equal(neighbours(40, 9).length, 8);
});

import { iconUrl, normalizeIcon, normalizeUrl, parse as parseLinks, serialize as serializeLinks } from "../../widgets/core/links/widget.js";

test("links: only web URLs survive, everything else becomes a host name", () => {
  assert.equal(normalizeUrl("github.com"), "https://github.com");
  assert.equal(normalizeUrl("http://example.org/x"), "http://example.org/x");
  assert.equal(normalizeUrl("javascript://%0Aalert(1)"), "https://%0Aalert(1)");
  assert.ok(!normalizeUrl("javascript:alert(1)").startsWith("javascript:"));
});

test("links: favicon location and custom icons", () => {
  assert.equal(iconUrl({ name: "a", url: "https://mail.google.com/mail/u/0" }), "https://mail.google.com/favicon.ico");
  assert.equal(iconUrl({ name: "a", url: "https://x.com", icon: "https://cdn.x.com/i.png" }), "https://cdn.x.com/i.png");
  assert.equal(normalizeIcon("javascript:alert(1)"), undefined);
  assert.equal(normalizeIcon("/docs/icon.png"), "/docs/icon.png");
});

test("links: parse/serialize round trip with optional icon", () => {
  const items = parseLinks("GitHub | github.com\nNotes | https://notes.example | https://notes.example/logo.png\nbare.example");
  assert.deepEqual(items, [
    { name: "GitHub", url: "https://github.com" },
    { name: "Notes", url: "https://notes.example", icon: "https://notes.example/logo.png" },
    { name: "bare.example", url: "https://bare.example" },
  ]);
  assert.deepEqual(parseLinks(serializeLinks(items)), items);
});

import { searchUrl } from "../../widgets/core/search/widget.js";

test("search: engine URLs, custom engine and fallback", () => {
  assert.equal(searchUrl("duckduckgo", "", "a b"), "https://duckduckgo.com/?q=a%20b");
  assert.equal(searchUrl("custom", "https://kagi.com/search?q={q}", "x&y"), "https://kagi.com/search?q=x%26y");
  assert.equal(searchUrl("custom", "javascript:{q}", "x"), "https://www.google.com/search?q=x");
  assert.equal(searchUrl("custom", "https://no-placeholder.example", "x"), "https://www.google.com/search?q=x");
  assert.equal(searchUrl("nonsense", "", "x"), "https://www.google.com/search?q=x");
});
