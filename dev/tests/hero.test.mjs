import { test } from "node:test";
import assert from "node:assert/strict";
import { goldFor, levelInfo } from "../../widgets/signature/hero/widget.js";

test("level thresholds: 100, then +50 per level", () => {
  assert.deepEqual(levelInfo(0), { lv: 1, cur: 0, max: 100 });
  assert.deepEqual(levelInfo(99), { lv: 1, cur: 99, max: 100 });
  assert.deepEqual(levelInfo(100), { lv: 2, cur: 0, max: 150 });
  assert.deepEqual(levelInfo(250), { lv: 3, cur: 0, max: 200 });
});

test("gold award and take-back are symmetric for every difficulty", () => {
  for (const xp of [10, 25, 50, 1, 3]) {
    const given = goldFor(xp);
    assert.equal(given + -goldFor(xp), 0, `xp ${xp}`);
  }
});
