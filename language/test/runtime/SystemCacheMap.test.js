import assert from "node:assert";
import { describe, test } from "node:test";
import SystemCacheMap from "../../src/runtime/SystemCacheMap.js";

describe("SystemCacheMap", () => {
  test("getOrInsertComputed tracks sync dependencies", async () => {
    const cache = new SystemCacheMap();
    let log;

    // Create cache entries for
    // { a = b + 1, b = 2 }
    let getB = () =>
      cache.getOrInsertComputed("b", () => {
        log.push("b");
        return 2;
      });
    let getA = () =>
      cache.getOrInsertComputed("a", () => {
        log.push("a");
        const b = getB();
        return b + 1;
      });

    log = [];
    const a1 = getA();
    assert.strictEqual(a1, 3);
    assert.deepEqual(log, ["a", "b"]);
    assert.deepEqual(cacheEntries(cache), [
      ["a", { value: 3, upstreams: ["b"] }],
      ["b", { value: 2, downstreams: ["a"] }],
    ]);

    log = [];
    const a2 = getA();
    assert.strictEqual(a2, 3);
    assert.deepEqual(log, []); // no recalculation

    // Delete a
    cache.delete("a");
    assert.deepEqual(cacheEntries(cache), [["b", { value: 2 }]]);
  });

  test("getOrInsertComputedAsync tracks async dependencies", async () => {
    const cache = new SystemCacheMap();
    let log;

    // Create cache entries for
    // { a = 2 * b, b = c + 1, c = 3 }
    let getC = async () =>
      await cache.getOrInsertComputedAsync("c", async () => {
        log.push("c");
        return 3;
      });
    let getB = async () =>
      await cache.getOrInsertComputedAsync("b", async () => {
        log.push("b");
        const c = await getC();
        return c + 1;
      });
    let getA = async () =>
      await cache.getOrInsertComputedAsync("a", async () => {
        log.push("a");
        const b = await getB();
        return 2 * b;
      });

    // Initial read of `a` populates cache
    log = [];
    const a1 = await getA();
    assert.strictEqual(a1, 8);
    assert.deepEqual(log, ["a", "b", "c"]);
    assert.deepEqual(cacheEntries(cache), [
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
    cache.delete("a");
    assert.deepEqual(cacheEntries(cache), [
      ["b", { value: 4, upstreams: ["c"] }],
      ["c", { value: 3, downstreams: ["b"] }],
    ]);

    // Replace formula for a
    // { a = 3 * b, b = c + 1, c = 3 }
    getA = async () =>
      await cache.getOrInsertComputedAsync("a", async () => {
        log.push("a");
        const b = await getB();
        return 3 * b;
      });
    log = [];
    const a3 = await getA();
    assert.strictEqual(a3, 12);
    assert.deepEqual(log, ["a"]); // recalc only a

    // Delete b, confirm it's removed as both upstream and downstream
    cache.delete("b");
    assert.deepEqual(cacheEntries(cache), [["c", { value: 3 }]]);

    // Replace formula for b
    // { a = 3 * b, b = c + 10, c = 3 }
    getB = async () =>
      await cache.getOrInsertComputedAsync("b", async () => {
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
      await cache.getOrInsertComputedAsync("c", async () => {
        log.push("c");
        return 100;
      });
    cache.delete("c");
    log = [];
    const a5 = await getA();
    assert.strictEqual(a5, 330);
    assert.deepEqual(log, ["a", "b", "c"]); // recalc all
  });

  test("async function can track sync dependency", async () => {
    const cache = new SystemCacheMap();

    // Create cache entries for
    // { a = b + 1, b = 2 }
    const getB = () =>
      cache.getOrInsertComputed("b", () => {
        return 2;
      });
    const getA = async () =>
      cache.getOrInsertComputedAsync("a", async () => {
        const b = getB();
        return b + 1;
      });

    const a1 = await getA();
    assert.strictEqual(a1, 3);
  });

  test("sync function can't have async dependency", async () => {
    const cache = new SystemCacheMap();

    // Create cache entries for
    // { a = b, b = 1 }
    const getB = async () =>
      await cache.getOrInsertComputedAsync("b", async () => {
        return 1;
      });
    const getA = () => cache.getOrInsertComputed("a", () => getB());

    // a is sync but b is async
    await assert.rejects(getA);
  });

  test("implicit dependency of child path on parent path", async () => {
    const cache = new SystemCacheMap();

    // Create cache entries
    // parent = 1, parent/child = 2, other = 3
    const getParent = () => cache.getOrInsertComputed("parent", () => 1);
    cache.getOrInsertComputed("parent/child", () => {
      // Force access of parent, no explicit dependency should be recorded
      getParent();
      return 2;
    });
    cache.getOrInsertComputed("other", () => 3);

    assert.deepEqual(cacheEntries(cache), [
      ["parent/child", { value: 2 }],
      ["parent", { value: 1 }],
      ["other", { value: 3 }],
    ]);

    // Deleting parent implicitly deletes all children
    cache.delete("parent");
    assert.deepEqual(cacheEntries(cache), [["other", { value: 3 }]]);
  });
});

export function cacheEntries(cache) {
  const entries = [...cache.entries()];
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
