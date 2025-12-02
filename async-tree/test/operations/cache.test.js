import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import SyncMap from "../../src/drivers/SyncMap.js";
import cache from "../../src/operations/cache.js";
import keys from "../../src/operations/keys.js";

describe("cache", () => {
  test("caches reads of values from one tree into another", async () => {
    const objectCache = new SyncMap();
    const fixture = await cache(
      new ObjectMap(
        {
          a: 1,
          b: 2,
          c: 3,
          more: {
            d: 4,
          },
        },
        { deep: true }
      ),
      objectCache
    );

    const treeKeys = await keys(fixture);
    assert.deepEqual(treeKeys, ["a", "b", "c", "more/"]);

    assert.equal(await objectCache.get("a"), undefined);
    assert.equal(await fixture.get("a"), 1);
    assert.equal(await objectCache.get("a"), 1); // Now in cache

    assert.equal(await objectCache.get("b"), undefined);
    assert.equal(await fixture.get("b"), 2);
    assert.equal(await objectCache.get("b"), 2);

    assert.equal(await objectCache.get("more"), undefined);
    const more = await fixture.get("more");
    assert.deepEqual([...(await keys(more))], ["d"]);
    assert.equal(await more.get("d"), 4);
    const moreCache = await objectCache.get("more");
    assert.equal(await moreCache.get("d"), 4);
  });
});
