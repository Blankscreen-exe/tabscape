// Feeling Lucky (dice) + The Useless Web provider. Fake fetch, no network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractSites, fetchSites, SOURCE_URL } from "../../providers/random-sites/theuselessweb.js";
import { SNAPSHOT } from "../../providers/random-sites/theuselessweb-snapshot.js";
import { parseSites, pickNext } from "../../widgets/signature/dice/widget.js";
import { hostLabel, safeWebUrl } from "../../core/url.js";

const many = n => Array.from({ length: n }, (_, i) => `    'https://site${i}.example/',`).join("\n");
const SCRIPT = `function uselessWebButton(button) {
  let sitelistName = 'sitelist-test-1'
  var sitesList = [
    'https://puginarug.com',
    // 'https://dead-site.example/',
    "https://double-quoted.example/",
${many(25)}
    'https://puginarug.com',
  ]
}`;

test("extract: active sites only, de-duplicated, version read", () => {
  const { version, sites } = extractSites(SCRIPT);
  assert.equal(version, "sitelist-test-1");
  assert.equal(sites[0], "https://puginarug.com");
  assert.ok(sites.includes("https://double-quoted.example/"));
  assert.ok(!sites.some(s => s.includes("dead-site")));
  assert.equal(sites.length, 27);
});

test("extract: refuses when the format changed", () => {
  assert.throws(() => extractSites("var somethingElse = []"), /not found/);
  assert.throws(() => extractSites("var sitesList = [ 'https://a.example' ]"), /format changed/);
});

test("fetch: uses the source URL and parses the text", async () => {
  const calls = [];
  const fake = async url => { calls.push(url); return { ok: true, status: 200, text: async () => SCRIPT }; };
  const r = await fetchSites(fake);
  assert.equal(calls[0], SOURCE_URL);
  assert.equal(r.sites.length, 27);
  await assert.rejects(fetchSites(async () => ({ ok: false, status: 404, text: async () => "" })), /404/);
});

test("bundled snapshot is a sane, web-only list", () => {
  assert.ok(SNAPSHOT.sites.length >= 50, `snapshot has ${SNAPSHOT.sites.length} sites`);
  assert.ok(SNAPSHOT.sites.every(u => /^https?:\/\//.test(u)));
  assert.equal(new Set(SNAPSHOT.sites).size, SNAPSHOT.sites.length);
});

test("no-repeat: every site once before anything repeats", () => {
  const pool = ["a", "b", "c", "d"].map(x => ({ url: `https://${x}.example` }));
  let seen = [];
  const firstRound = new Set();
  for (let i = 0; i < 4; i++) { const r = pickNext(pool, seen, true); firstRound.add(r.pick.url); seen = r.seen; }
  assert.equal(firstRound.size, 4);
  const next = pickNext(pool, seen, true);
  assert.equal(next.seen.length, 1); // cycle restarted
  assert.deepEqual(pickNext(pool, ["https://gone.example"], true).seen.length, 1); // stale history ignored
  assert.deepEqual(pickNext([], [], true), { pick: null, index: -1, seen: [] });
  assert.deepEqual(pickNext(pool, ["x"], false).seen, []); // repeats allowed: no history kept
});

test("my list: unsafe URLs neutralised, names default to the host", () => {
  const s = parseSites("Fun | javascript://%0Aalert(1)\nhttps://www.puginarug.com/\nRadio | radio.garden");
  assert.ok(s.every(x => x.url.startsWith("https://")));
  assert.equal(s[1].name, "puginarug.com");
  assert.deepEqual(s[2], { name: "Radio", url: "https://radio.garden" });
  assert.equal(safeWebUrl("http://a.example"), "http://a.example");
  assert.equal(hostLabel("not a url"), "not a url");
});
