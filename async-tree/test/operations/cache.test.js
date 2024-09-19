import assert from "node:assert";
import { describe, test } from "node:test";
import { DeepObjectTree, ObjectTree, Tree } from "../../src/internal.js";
import cache from "../../src/operations/cache.js";

describe("cache", () => {
  test("caches reads of values from one tree into another", async () => {
    const objectCache = new ObjectTree({});
    const fixture = cache(
      new DeepObjectTree({
        a: 1,
        b: 2,
        c: 3,
        more: {
          d: 4,
        },
      }),
      objectCache
    );

    const keys = [...(await fixture.keys())];
    assert.deepEqual(keys, ["a", "b", "c", "more/"]);

    assert.equal(await objectCache.get("a"), undefined);
    assert.equal(await fixture.get("a"), 1);
    assert.equal(await objectCache.get("a"), 1); // Now in cache

    assert.equal(await objectCache.get("b"), undefined);
    assert.equal(await fixture.get("b"), 2);
    assert.equal(await objectCache.get("b"), 2);

    assert.equal(await objectCache.get("more"), undefined);
    const more = await fixture.get("more");
    assert.deepEqual([...(await more.keys())], ["d"]);
    assert.equal(await more.get("d"), 4);
    const moreCache = await objectCache.get("more");
    assert.equal(await moreCache.get("d"), 4);
  });

  test("if a cache filter is supplied, it only caches values whose keys match the filter", async () => {
    const objectCache = new ObjectTree({});
    const fixture = cache(
      Tree.from({
        "a.txt": "a",
        "b.txt": "b",
      }),
      objectCache,
      Tree.from({
        "a.txt": true,
      })
    );

    // Access some values to populate the cache.
    assert.equal(await fixture.get("a.txt"), "a");
    assert.equal(await fixture.get("b.txt"), "b");

    // The a.txt value should be cached because it matches the filter.
    assert.equal(await objectCache.get("a.txt"), "a");

    // The b.txt value should not be cached because it does not match the filter.
    assert.equal(await objectCache.get("b.txt"), undefined);
  });
});
