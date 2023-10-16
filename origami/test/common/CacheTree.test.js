import { Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import CacheTree from "../../src/common/CacheTree.js";

describe("CacheTree", () => {
  test("returns the first defined value from an ordered list of trees", async () => {
    const fixture = new CacheTree({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
      },
    });
    const cache = fixture.cache;

    const keys = Array.from(await fixture.keys());
    assert.deepEqual(keys, ["a", "b", "c", "more"]);

    assert.equal(await cache.get("a"), undefined);
    assert.equal(await fixture.get("a"), 1);
    assert.equal(await cache.get("a"), 1);

    assert.equal(await cache.get("b"), undefined);
    assert.equal(await fixture.get("b"), 2);
    assert.equal(await cache.get("b"), 2);

    assert.equal(await Tree.traverse(fixture.cache, "more", "d"), undefined);
    assert.equal(await Tree.traverse(fixture, "more", "d"), 4);
    assert.equal(await Tree.traverse(fixture.cache, "more", "d"), 4);
  });

  test("if a cache filter is supplied, it only caches files that match the filter", async () => {
    const fixture = new CacheTree(
      {
        "a.txt": "a",
        "b.txt": "b",
      },
      {},
      {
        "a.txt": true,
      }
    );
    const cache = fixture.cache;

    // Access some values to populate the cache.
    assert.equal(await fixture.get("a.txt"), "a");
    assert.equal(await fixture.get("b.txt"), "b");

    // The a.txt value should be cached because it matches the filter.
    assert.equal(await cache.get("a.txt"), "a");

    // The b.txt value should not be cached because it does not match the filter.
    assert.equal(await cache.get("b.txt"), undefined);
  });
});
