import chai from "chai";
import Cache from "../src/Cache.js";
import ExplorableGraph from "../src/ExplorableGraph.js";
const { assert } = chai;

describe("Cache", () => {
  it("returns the first defined value from an ordered list of graphs", async () => {
    const cache = new ExplorableGraph({});
    const fixture = new Cache(cache, {
      a: 1,
      b: 2,
      c: 3,
    });

    const keys = await fixture.keys();
    assert.deepEqual(keys, ["a", "b", "c"]);

    assert.isUndefined(await cache.get("a"));
    assert.equal(await fixture.get("a"), 1);
    assert.equal(await cache.get("a"), 1);

    assert.isUndefined(await cache.get("b"));
    assert.equal(await fixture.get("b"), 2);
    assert.equal(await cache.get("b"), 2);
  });
});
