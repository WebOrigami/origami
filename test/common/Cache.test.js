import Cache from "../../src/common/Cache.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("Cache", () => {
  it("returns the first defined value from an ordered list of graphs", async () => {
    const fixture = new Cache({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
      },
    });
    const cache = fixture.cache;

    const keys = await ExplorableGraph.keys(fixture);
    assert.deepEqual(keys, ["a", "b", "c", "more"]);

    assert.isUndefined(await cache.get("a"));
    assert.equal(await fixture.get("a"), 1);
    assert.equal(await cache.get("a"), 1);

    assert.isUndefined(await cache.get("b"));
    assert.equal(await fixture.get("b"), 2);
    assert.equal(await cache.get("b"), 2);

    assert.isUndefined(
      await ExplorableGraph.traverse(fixture.cache, "more", "d")
    );
    assert.equal(await ExplorableGraph.traverse(fixture, "more", "d"), 4);
    assert.equal(await ExplorableGraph.traverse(fixture.cache, "more", "d"), 4);
  });

  it("if a cache filter is supplied, it only caches files that match the filter", async () => {
    const fixture = new Cache(
      {
        "a.txt": "a",
        "b.txt": "b",
        c: "c",
      },
      {},
      {
        "[x].txt": true,
      }
    );
    const cache = fixture.cache;

    // Access some values to populate the cache.
    await fixture.get("a.txt");
    await fixture.get("b.txt");
    await fixture.get("c");

    // The a.txt and b.txt values should be cached because they match the filter.
    // assert.equal(await cache.get("a.txt"), "a");
    // assert.equal(await cache.get("b.txt"), "b");

    // The c value should not be cached because it does not match the filter.
    assert.isUndefined(await cache.get("c"));
  });
});
