import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import systemCache from "../../src/runtime/systemCache.js";

describe("systemCache", () => {
  beforeEach(() => {
    systemCache.clear();
  });

  test("tracks dependencies made during get calls", async () => {
    let log;

    // Create cache entries for
    // { a = 2 * b, b = c + 1, c = 3 }
    let getC = async () =>
      await systemCache.getOrInsertComputedAsync("c", async () => {
        log.push("c");
        return 3;
      });
    let getB = async () =>
      await systemCache.getOrInsertComputedAsync("b", async () => {
        log.push("b");
        const c = await getC();
        return c + 1;
      });
    let getA = async () =>
      await systemCache.getOrInsertComputedAsync("a", async () => {
        log.push("a");
        const b = await getB();
        return 2 * b;
      });

    // Initial read of `a` populates cache
    log = [];
    const a1 = await getA();
    assert.strictEqual(a1, 8);
    assert.deepEqual(log, ["a", "b", "c"]);
    assert.deepEqual(cacheEntries(), [
      ["a", { value: 8, upstreams: ["b"] }],
      ["b", { value: 4, downstreams: ["a"], upstreams: ["c"] }],
      ["c", { value: 3, downstreams: ["b"] }],
    ]);

    // Subsequent read of `a` hits cache
    log = [];
    const a2 = await getA();
    assert.strictEqual(a2, 8);
    assert.deepEqual(log, []); // no recalculation

    // Delete a
    systemCache.delete("a");
    assert.deepEqual(cacheEntries(), [
      ["b", { value: 4, upstreams: ["c"] }],
      ["c", { value: 3, downstreams: ["b"] }],
    ]);

    // Replace formula for a
    // { a = 3 * b, b = c + 1, c = 3 }
    getA = async () =>
      await systemCache.getOrInsertComputedAsync("a", async () => {
        log.push("a");
        const b = await getB();
        return 3 * b;
      });
    log = [];
    const a3 = await getA();
    assert.strictEqual(a3, 12);
    assert.deepEqual(log, ["a"]); // recalc only a

    // Delete b, confirm it's removed as both upstream and downstream
    systemCache.delete("b");
    assert.deepEqual(cacheEntries(), [["c", { value: 3 }]]);

    // Replace formula for b
    // { a = 3 * b, b = c + 10, c = 3 }
    getB = async () =>
      await systemCache.getOrInsertComputedAsync("b", async () => {
        log.push("b");
        const c = await getC();
        return c + 10;
      });
    log = [];
    const a4 = await getA();
    assert.strictEqual(a4, 39);
    assert.deepEqual(log, ["a", "b"]); // recalc a and b

    // Replace formula for c
    // { a = 3 * b, b = c + 10, c = 100 }
    getC = async () =>
      await systemCache.getOrInsertComputedAsync("c", async () => {
        log.push("c");
        return 100;
      });
    systemCache.delete("c");
    log = [];
    const a5 = await getA();
    assert.strictEqual(a5, 330);
    assert.deepEqual(log, ["a", "b", "c"]); // recalc all
  });
});

export function cacheEntries() {
  const entries = [...systemCache.entries()];
  return entries.map(([key, entry]) => [key, cacheEntry(entry)]);
}

export function cacheEntry(entry) {
  const { downstreams, value } = entry;

  const result = { value };
  if (downstreams?.size > 0) {
    result.downstreams = [...downstreams];
  }

  if (entry.upstreams?.size > 0) {
    result.upstreams = [...entry.upstreams];
  }

  return result;
}
